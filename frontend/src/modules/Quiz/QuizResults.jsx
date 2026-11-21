import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../context/LanguageContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import SectionLabel from '../../components/common/SectionLabel';
import { 
  CheckCircle2, 
  XCircle, 
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
    <div className="space-y-8 max-w-4xl mx-auto py-6">
      {/* Top Results Card */}
      <Card padding="lg" className="text-center space-y-6">
        <SectionLabel className="justify-center">ASSESSMENT COMPLETE</SectionLabel>

        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#0D0D0D] tracking-tight">
          {t('quiz.resultsTitle')}
        </h1>
        <p className="text-sm text-[#6B6660] max-w-md mx-auto leading-relaxed">
          {t('quiz.resultsSubtitle')}
        </p>

        {/* Score & Percentage Display */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-2">
          <div className="p-4 rounded-[18px] bg-[#F5F0EA] border border-[#E3DCD3] min-w-[140px]">
            <div className="text-xs text-[#6B6660] font-semibold">{t('quiz.score')}</div>
            <div className="font-heading text-3xl font-black text-[#0D0D0D] mt-1">
              {score} <span className="text-base font-normal text-[#6B6660]">/ {totalQuestions}</span>
            </div>
          </div>

          <div className="p-4 rounded-[18px] bg-[#F5F0EA] border border-[#E3DCD3] min-w-[140px]">
            <div className="text-xs text-[#6B6660] font-semibold">{t('quiz.accuracy')}</div>
            <div className={`font-heading text-3xl font-black mt-1 ${percentage >= 60 ? 'text-[#0D0D0D]' : 'text-[#F26522]'}`}>
              {percentage}%
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-[#E3DCD3]">
          <Button to="/gaps" variant="primary" size="md" showArrow icon={GitFork}>
            {t('quiz.viewGapsBtn')}
          </Button>

          <Button onClick={onRetake} variant="secondary" size="md" icon={RotateCcw}>
            {t('quiz.retakeBtn')}
          </Button>
        </div>
      </Card>

      {/* Diagnosed Prerequisite Alert Card */}
      <Card padding="md" className="border-[#F26522] bg-[#F26522]/5 space-y-3">
        <div className="flex items-center gap-2.5 text-[#F26522]">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <h3 className="font-heading font-bold text-base text-[#0D0D0D]">
            Prerequisite Bottleneck Diagnosed: Algebraic Factoring (Class 8)
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-[#6B6660] leading-relaxed">
          Your diagnostic answers show that difficulty in 9th-grade <strong>Quadratic Equations (33%)</strong> is not due to advanced concepts; it stems from an unresolved foundation in 8th-grade <strong>middle-term splitting and algebraic identities</strong>.
        </p>
      </Card>

      {/* Evaluated Answers Breakdown */}
      <div className="space-y-4">
        <h3 className="font-heading text-xl font-bold text-[#0D0D0D] flex items-center justify-between">
          <span>Question-by-Question Breakdown</span>
          <span className="text-xs text-[#6B6660] font-normal">{evaluatedAnswers.length} questions evaluated</span>
        </h3>

        <div className="space-y-3">
          {evaluatedAnswers.map((item, idx) => {
            const isExpanded = expandedId === item.questionId || expandedId === idx;
            return (
              <Card
                key={item.questionId || idx}
                padding="sm"
                hoverLift={false}
                className="space-y-3"
              >
                <div
                  onClick={() => setExpandedId(isExpanded ? null : (item.questionId || idx))}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    {item.isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                    )}
                    <div>
                      <div className="text-xs font-bold text-[#0D0D0D] line-clamp-1">
                        Q{idx + 1}: {item.questionText}
                      </div>
                      <div className="text-[11px] text-[#6B6660]">
                        Topic: {item.topicName} • Confidence: <span className="capitalize font-semibold text-[#0D0D0D]">{item.confidence.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      item.isCorrect ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {item.isCorrect ? 'Correct' : 'Needs Practice'}
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-[#6B6660]" /> : <ChevronDown className="w-4 h-4 text-[#6B6660]" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="pt-3 border-t border-[#E3DCD3] text-xs space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-[#0D0D0D]">
                      <div className="p-2 rounded-xl bg-[#F5F0EA]">
                        <span className="text-[10px] text-[#6B6660] block">Your Answer:</span>
                        <span className="font-bold">Option {item.selectedOption}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-[#F5F0EA]">
                        <span className="text-[10px] text-[#6B6660] block">Correct Answer:</span>
                        <span className="font-bold text-emerald-700">Option {item.correctOption}</span>
                      </div>
                    </div>
                    <p className="text-xs text-[#6B6660] leading-relaxed italic bg-white p-3 rounded-xl border border-[#E3DCD3]">
                      💡 {item.explanation}
                    </p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
