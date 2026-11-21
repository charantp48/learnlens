import React from 'react';
import Card from '../../components/common/Card';
import ConfidenceSelector from './ConfidenceSelector';
import { Tag } from 'lucide-react';

export default function QuestionCard({ question, currentAnswer, onAnswerChange }) {
  if (!question) return null;

  const options = [
    { key: 'A', text: question.option_a },
    { key: 'B', text: question.option_b },
    { key: 'C', text: question.option_c },
    { key: 'D', text: question.option_d },
  ];

  const selectedOption = currentAnswer?.selectedOption;
  const confidence = currentAnswer?.confidence || 'sure';

  const handleSelectOption = (key) => {
    onAnswerChange({
      selectedOption: key,
      confidence: currentAnswer?.confidence || 'sure',
    });
  };

  const handleConfidenceChange = (conf) => {
    onAnswerChange({
      selectedOption: currentAnswer?.selectedOption || 'A',
      confidence: conf,
    });
  };

  return (
    <Card variant="surface" padding="lg" hoverLift={false} className="space-y-6">
      {/* Topic Badge & Difficulty */}
      <div className="flex items-center justify-between gap-2 pb-2">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5F0EA] border border-[#E3DCD3] text-[#0D0D0D] text-xs font-bold">
          <Tag className="w-3.5 h-3.5 text-[#F26522]" />
          <span>{question.topic_name}</span>
        </span>
        <span className="text-[11px] uppercase tracking-wider text-[#6B6660] font-bold px-2.5 py-0.5 rounded-full bg-[#F5F0EA] border border-[#E3DCD3]">
          {question.difficulty}
        </span>
      </div>

      {/* Question Text */}
      <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#0D0D0D] leading-snug tracking-tight">
        {question.question_text}
      </h3>

      {/* Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {options.map((opt) => {
          const isSelected = selectedOption === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => handleSelectOption(opt.key)}
              className={`flex items-start gap-3.5 p-4 rounded-[18px] border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'border-[#F26522] bg-[#F26522]/5 text-[#0D0D0D] ring-2 ring-[#F26522]/30 shadow-xs'
                  : 'border-[#E3DCD3] bg-white text-[#0D0D0D] hover:border-[#0D0D0D]'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-[#F26522] text-white'
                    : 'bg-[#F5F0EA] border border-[#E3DCD3] text-[#0D0D0D]'
                }`}
              >
                {opt.key}
              </div>
              <span className="text-sm font-medium leading-relaxed pt-0.5">
                {opt.text}
              </span>
            </button>
          );
        })}
      </div>

      {/* Confidence Selection */}
      <ConfidenceSelector
        value={confidence}
        onChange={handleConfidenceChange}
      />
    </Card>
  );
}
