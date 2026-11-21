import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import QuestionCard from './QuestionCard';
import QuizProgressBar from './QuizProgressBar';
import QuizResults from './QuizResults';
import { DIAGNOSTIC_QUESTIONS } from './quizData';
import { BookOpen, ArrowLeft, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';

export default function QuizContainer() {
  const { t } = useTranslation();
  const { currentUser } = useAuth();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionIndex]: { selectedOption, confidence } }
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(() => {
    const saved = localStorage.getItem('learnlens_last_quiz');
    return saved ? JSON.parse(saved) : null;
  });

  // Load questions (fetch from backend or use bundled diagnostic questions)
  useEffect(() => {
    async function loadQuestions() {
      try {
        const res = await fetch('http://localhost:5000/api/quiz/diagnostic');
        if (res.ok) {
          const data = await res.json();
          if (data.questions && data.questions.length > 0) {
            setQuestions(data.questions);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Backend not reachable, loading bundled offline questions');
      }

      // Fallback
      setQuestions(DIAGNOSTIC_QUESTIONS);
      setLoading(false);
    }

    loadQuestions();
  }, []);

  const handleAnswerChange = (answer) => {
    setAnswers((prev) => ({
      ...prev,
      [currentIndex]: answer,
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    const formattedAnswers = questions.map((q, idx) => {
      const userAns = answers[idx] || { selectedOption: 'A', confidence: 'not_sure' };
      return {
        questionId: q.id,
        selectedOption: userAns.selectedOption,
        confidence: userAns.confidence,
      };
    });

    try {
      const res = await fetch('http://localhost:5000/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: currentUser?.id || '00000000-0000-0000-0000-000000000001',
          answers: formattedAnswers,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setResults(data);
        localStorage.setItem('learnlens_last_quiz', JSON.stringify(data));
        setSubmitting(false);
        return;
      }
    } catch (err) {
      console.warn('Could not submit to backend, evaluating locally:', err.message);
    }

    // Local evaluation fallback if backend is offline
    let score = 0;
    const evaluated = questions.map((q, idx) => {
      const userAns = answers[idx] || { selectedOption: 'A', confidence: 'not_sure' };
      const isCorrect = userAns.selectedOption === q.correct_option;
      if (isCorrect) score += 1;
      return {
        questionId: q.id,
        topicId: q.topic_id,
        topicName: q.topic_name,
        questionText: q.question_text,
        selectedOption: userAns.selectedOption,
        correctOption: q.correct_option || 'C',
        isCorrect,
        confidence: userAns.confidence,
        explanation: q.explanation || 'Review topic rules in textbook.',
      };
    });

    const localResult = {
      score,
      totalQuestions: questions.length,
      percentage: Number(((score / questions.length) * 100).toFixed(1)),
      evaluatedAnswers: evaluated,
      topicStats: [
        { topicId: '10000000-0000-0000-0000-000000000004', topicName: 'Quadratic Equations', total: 1, correct: score > 5 ? 1 : 0 },
        { topicId: '10000000-0000-0000-0000-000000000003', topicName: 'Algebraic Identities & Factoring', total: 2, correct: 0 },
      ],
    };

    setResults(localResult);
    localStorage.setItem('learnlens_last_quiz', JSON.stringify(localResult));
    setSubmitting(false);
  };

  const handleRetake = () => {
    setResults(null);
    setAnswers({});
    setCurrentIndex(0);
    localStorage.removeItem('learnlens_last_quiz');
  };

  if (loading) {
    return (
      <div className="text-center py-24 space-y-3">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
        <p className="text-sm text-slate-400">{t('common.loading')}</p>
      </div>
    );
  }

  if (results) {
    return <QuizResults results={results} onRetake={handleRetake} />;
  }

  const currentQ = questions[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === questions.length - 1;
  const currentAnswer = answers[currentIndex];

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">{t('quiz.title')}</h1>
            <p className="text-xs text-slate-400">{t('quiz.subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <QuizProgressBar
        total={questions.length}
        current={currentIndex}
        answers={answers}
      />

      {/* Active Question Card */}
      <QuestionCard
        question={currentQ}
        currentAnswer={currentAnswer}
        onAnswerChange={handleAnswerChange}
      />

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={handlePrev}
          disabled={isFirst}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            isFirst
              ? 'opacity-40 cursor-not-allowed text-slate-500 bg-slate-800/40'
              : 'text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white cursor-pointer'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('quiz.prev')}</span>
        </button>

        {isLast ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all hover:scale-105 cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Evaluating...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>{t('quiz.submit')}</span>
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <span>{t('quiz.next')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
