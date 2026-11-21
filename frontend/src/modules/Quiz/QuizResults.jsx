import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../context/LanguageContext';
import { 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Sparkles, 
  ArrowRight, 
  RotateCcw, 
  GitFork, 
  ChevronDown, 
  ChevronUp,
  AlertTriangle
} from 'lucide-react';

export default function QuizResults({ results, onRetake }) {
  const { t } = useTranslation();
  const [expandedId, setExpandedId] = useState(null);

  const { score, totalQuestions, percentage, evaluatedAnswers = [], topicStats = [] } = results;

  // Identify weak topics (< 60%)
  const weakTopics = topicStats.filter((ts) => {
    const accuracy = ts.total > 0 ? (ts.correct / ts.total) * 100 : 0;
    return accuracy < 60;
  });

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 text-center space-y-4 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Diagnostic Evaluation Complete</span>
        </div>

        <h1 className="text-3xl font-extrabold text-white">
          {t('quiz.resultsTitle')}
        </h1>
        <p className="text-sm text-slate-300 max-w-md mx-auto">
          {t('quiz.resultsSubtitle')}
        </p>

        {/* Score & Percentage Display */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-2">
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 min-w-[130px]">
            <div className="text-xs text-slate-400">{t('quiz.score')}</div>
            <div className="text-3xl font-extrabold text-white mt-1">
              {score} <span className="text-base font-normal text-slate-400">/ {totalQuestions}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 min-w-[130px]">
            <div className="text-xs text-slate-400">{t('quiz.accuracy')}</div>
            <div className={`text-3xl font-extrabold mt-1 ${percentage >= 60 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {percentage}%
            </div>
          </div>
        </div>

        {/* Immediate CTA to Step 2: Gap Finder */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/gaps"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
          >
            <GitFork className="w-4 h-4" />
            <span>{t('quiz.viewGapsBtn')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            onClick={onRetake}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t('quiz.retakeBtn')}</span>
          </button>
        </div>
      </div>

      {/* Weak Topics Found Notice */}
      {weakTopics.length > 0 && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3.5">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h3 className="font-bold text-amber-300">
              {weakTopics.length} Focus Area(s) Below 60% Accuracy
            </h3>
            <p className="text-slate-300 leading-relaxed">
              Topics needing attention: <strong>{weakTopics.map((w) => w.topicName).join(', ')}</strong>.
              In the next step, LearnLens will trace these down to your foundational prerequisite gaps.
            </p>
          </div>
        </div>
      )}

      {/* Detailed Question Review List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Question-by-Question Breakdown</h2>

        <div className="space-y-3">
          {evaluatedAnswers.map((item, index) => {
            const isExpanded = expandedId === item.questionId;
            const isCorrect = item.isCorrect;

            return (
              <div
                key={item.questionId}
                className="rounded-2xl bg-slate-800/40 border border-slate-700/60 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : item.questionId)}
                  className="w-full p-4 flex items-center justify-between text-left gap-3 hover:bg-slate-800/60 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    {isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-400">Q{index + 1}</span>
                        <span className="text-xs text-indigo-300 font-semibold">{item.topicName}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          item.confidence === 'sure'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : item.confidence === 'not_sure'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-purple-500/20 text-purple-300'
                        }`}>
                          {item.confidence === 'sure' ? 'Sure' : item.confidence === 'not_sure' ? 'Not Sure' : 'Guessing'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-200 font-medium line-clamp-1 mt-0.5">
                        {item.questionText}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 text-slate-400">
                    <span className="text-xs">
                      Your Choice: <strong className={isCorrect ? 'text-emerald-400' : 'text-rose-400'}>{item.selectedOption || 'Skipped'}</strong>
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 text-xs border-t border-slate-700/40 bg-slate-900/40 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">Correct Answer:</span>
                      <strong className="text-emerald-400 font-mono text-sm">{item.correctOption}</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-800/60 text-slate-300 leading-relaxed">
                      <strong className="text-slate-200">Explanation: </strong>
                      {item.explanation}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
