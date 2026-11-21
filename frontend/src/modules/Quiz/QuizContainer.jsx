import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import QuestionCard from './QuestionCard';
import QuizProgressBar from './QuizProgressBar';
import QuizResults from './QuizResults';
import SectionLabel from '../../components/common/SectionLabel';
import Button from '../../components/common/Button';
import { DIAGNOSTIC_QUESTIONS } from './quizData';
import { 
  BookOpen, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  Loader2, 
  Filter,
  Sparkles,
  Zap
} from 'lucide-react';

export default function QuizContainer() {
  const { t } = useTranslation();
  const { currentUser } = useAuth();

  // Filters: Subject and Level
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('all'); // 'all' | 'basic' | 'puzzle' | 'interactive'
  const [adaptedLevelNotice, setAdaptedLevelNotice] = useState('');

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionIndex]: { selectedOption, confidence } }
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(() => {
    const saved = localStorage.getItem('learnlens_last_quiz');
    return saved ? JSON.parse(saved) : null;
  });

  // Filter questions by subject and level
  const filteredQuestions = DIAGNOSTIC_QUESTIONS.filter((q) => {
    const matchSubject = selectedSubject === 'All' || q.subject === selectedSubject;
    const matchLevel = selectedLevel === 'all' || q.level === selectedLevel;
    return matchSubject && matchLevel;
  });

  const activeQuestions = filteredQuestions.length > 0 ? filteredQuestions : DIAGNOSTIC_QUESTIONS;
  const currentQuestion = activeQuestions[currentIndex];

  // Automatic level adaptation simulation
  useEffect(() => {
    // If student has answered last 2 questions with 'sure' and chosen correct option
    if (currentIndex >= 2) {
      const prevAns = answers[currentIndex - 1];
      if (prevAns && prevAns.confidence === 'sure') {
        setAdaptedLevelNotice('Automatic Adaptation: Advancing to higher conceptual complexity based on high confidence!');
        setTimeout(() => setAdaptedLevelNotice(''), 4000);
      }
    }
  }, [currentIndex]);

  const handleAnswerChange = (answer) => {
    setAnswers((prev) => ({
      ...prev,
      [currentIndex]: answer,
    }));
  };

  const handleNext = () => {
    if (currentIndex < activeQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleRetake = () => {
    setResults(null);
    setAnswers({});
    setCurrentIndex(0);
    localStorage.removeItem('learnlens_last_quiz');
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    const submissionAnswers = activeQuestions.map((q, idx) => ({
      questionId: q.id,
      selectedOption: answers[idx]?.selectedOption || null,
      confidence: answers[idx]?.confidence || 'not_sure',
    }));

    try {
      const res = await fetch('http://localhost:5000/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: currentUser?.id || '00000000-0000-0000-0000-000000000001',
          studentName: currentUser?.full_name || 'Student',
          studentEmail: currentUser?.email || '',
          className: currentUser?.class_name || 'Class 11-A',
          subject: selectedSubject !== 'All' ? selectedSubject : 'Mathematics',
          answers: submissionAnswers,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setResults(data);
        localStorage.setItem('learnlens_last_quiz', JSON.stringify(data));
      } else {
        console.error('Quiz submit failed:', data.message);
      }
    } catch (err) {
      console.error('Network error during quiz submit:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (results) {
    return <QuizResults results={results} onRetake={handleRetake} />;
  }

  const subjects = ['All', 'Mathematics', 'Physics', 'Chemistry', 'Computer Science'];
  const levels = [
    { id: 'all', label: 'All Levels' },
    { id: 'basic', label: 'Level 1: Basic' },
    { id: 'puzzle', label: 'Level 2: Puzzle' },
    { id: 'interactive', label: 'Level 3: Interactive' },
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto py-4 sm:py-8">
      {/* Header Banner */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <SectionLabel text="UNTIMED DIAGNOSTIC" />
          <span className="text-[11px] font-semibold text-[#6B6660] px-3 py-1 rounded-full bg-[#F5F0EA] border border-[#E3DCD3]">
            No Timer • JEE & KCET Track
          </span>
        </div>

        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#0D0D0D] tracking-tight">
          Class 11 & 12 Diagnostic Assessment
        </h1>
      </div>

      {/* Subject Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {subjects.map((sub) => (
          <button
            key={sub}
            type="button"
            onClick={() => {
              setSelectedSubject(sub);
              setCurrentIndex(0);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedSubject === sub
                ? 'bg-[#0D0D0D] text-white shadow-xs'
                : 'bg-[#FBF8F4] text-[#6B6660] border border-[#E3DCD3] hover:text-[#0D0D0D]'
            }`}
          >
            {sub}
          </button>
        ))}
      </div>

      {/* Level Selector Tabs (Manual Level Choice) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-xs font-semibold text-[#6B6660] pr-1">Level:</span>
        {levels.map((lvl) => (
          <button
            key={lvl.id}
            type="button"
            onClick={() => {
              setSelectedLevel(lvl.id);
              setCurrentIndex(0);
            }}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
              selectedLevel === lvl.id
                ? 'bg-[#F26522] text-white'
                : 'bg-[#F5F0EA] text-[#6B6660] border border-[#E3DCD3] hover:text-[#0D0D0D]'
            }`}
          >
            {lvl.label}
          </button>
        ))}
      </div>

      {/* Automatic Level Adaptation Notice */}
      {adaptedLevelNotice && (
        <div className="p-3.5 rounded-2xl bg-[#FFF3EC] border border-[#F26522]/30 flex items-center gap-2.5 text-xs text-[#0D0D0D] transition-all">
          <Zap className="w-4 h-4 text-[#F26522] shrink-0" />
          <span>{adaptedLevelNotice}</span>
        </div>
      )}

      {/* Progress Bar (Strictly untimed) */}
      <QuizProgressBar
        current={currentIndex + 1}
        total={activeQuestions.length}
        answers={answers}
      />

      {/* Question Card */}
      {currentQuestion && (
        <QuestionCard
          question={currentQuestion}
          currentAnswer={answers[currentIndex]}
          onAnswerChange={handleAnswerChange}
        />
      )}

      {/* Navigation Controls */}
      <div className="flex items-center justify-between pt-4">
        <Button
          variant="secondary"
          size="md"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          icon={<ArrowLeft className="w-4 h-4" />}
        >
          {t('quiz.prev') || 'Previous'}
        </Button>

        {currentIndex === activeQuestions.length - 1 ? (
          <Button
            variant="primary"
            size="md"
            onClick={handleSubmit}
            disabled={submitting}
            icon={submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
          >
            {submitting ? 'Submitting...' : t('quiz.submit') || 'Submit Assessment'}
          </Button>
        ) : (
          <Button
            variant="primary"
            size="md"
            onClick={handleNext}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            {t('quiz.next') || 'Next'}
          </Button>
        )}
      </div>
    </div>
  );
}
