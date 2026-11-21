import React from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { CheckCircle2, HelpCircle, Sparkles } from 'lucide-react';

export default function ConfidenceSelector({ value, onChange }) {
  const { t } = useTranslation();

  const options = [
    {
      id: 'sure',
      label: t('quiz.sure'),
      desc: t('quiz.sureDesc'),
      icon: CheckCircle2,
    },
    {
      id: 'not_sure',
      label: t('quiz.notSure'),
      desc: t('quiz.notSureDesc'),
      icon: HelpCircle,
    },
    {
      id: 'guessing',
      label: t('quiz.guessing'),
      desc: t('quiz.guessingDesc'),
      icon: Sparkles,
    },
  ];

  return (
    <div className="space-y-3 pt-6 border-t border-[#E3DCD3]">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-[#0D0D0D] uppercase tracking-wider">{t('quiz.selectConfidence')}</span>
        <span className="text-[11px] text-[#6B6660]">Honesty helps detect true gaps</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = value === opt.id;

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={`p-3.5 rounded-[18px] border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-[#F26522] bg-[#F26522]/10 text-[#0D0D0D] ring-2 ring-[#F26522]/30 shadow-xs'
                  : 'border-[#E3DCD3] bg-[#FBF8F4] text-[#6B6660] hover:border-[#0D0D0D] hover:text-[#0D0D0D]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold text-sm text-[#0D0D0D]">{opt.label}</span>
                <Icon className={`w-4 h-4 ${isSelected ? 'text-[#F26522]' : 'text-[#6B6660]'}`} />
              </div>
              <span className="text-[11px] text-[#6B6660] mt-1.5 leading-snug">
                {opt.desc}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
