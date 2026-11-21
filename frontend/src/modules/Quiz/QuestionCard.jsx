import React from 'react';
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
    <div className="p-6 sm:p-8 rounded-3xl bg-slate-800/60 border border-slate-700/70 shadow-xl space-y-6">
      {/* Topic Badge */}
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
          <Tag className="w-3.5 h-3.5" />
          <span>{question.topic_name}</span>
        </span>
        <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-2 py-0.5 rounded bg-slate-800">
          {question.difficulty}
        </span>
      </div>

      {/* Question Text */}
      <h3 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
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
              className={`flex items-start gap-3 p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-600/20 text-white ring-2 ring-indigo-500/40 shadow-md'
                  : 'border-slate-700/70 bg-slate-900/40 text-slate-300 hover:border-slate-600 hover:bg-slate-800/50'
              }`}
            >
              <span
                className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {opt.key}
              </span>
              <span className="text-sm font-medium pt-0.5">{opt.text}</span>
            </button>
          );
        })}
      </div>

      {/* Confidence Segment (Always present) */}
      <ConfidenceSelector
        value={confidence}
        onChange={handleConfidenceChange}
      />
    </div>
  );
}
