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
      activeClass: 'border-emerald-500 bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/50',
      idleClass: 'border-slate-700 bg-slate-800/40 text-slate-300 hover:border-slate-600',
    },
    {
      id: 'not_sure',
      label: t('quiz.notSure'),
      desc: t('quiz.notSureDesc'),
      icon: HelpCircle,
      activeClass: 'border-amber-500 bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/50',
      idleClass: 'border-slate-700 bg-slate-800/40 text-slate-300 hover:border-slate-600',
    },
    {
      id: 'guessing',
      label: t('quiz.guessing'),
      desc: t('quiz.guessingDesc'),
      icon: Sparkles,
      activeClass: 'border-purple-500 bg-purple-500/15 text-purple-300 ring-1 ring-purple-500/50',
      idleClass: 'border-slate-700 bg-slate-800/40 text-slate-300 hover:border-slate-600',
    },
  ];

  return (
    <div className="space-y-2 pt-4 border-t border-slate-700/60">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-200">{t('quiz.selectConfidence')}</span>
        <span className="text-[11px] text-slate-400">Honesty helps detect gaps</span>
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
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                isSelected ? opt.activeClass : opt.idleClass
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 shrink-0" />
                <span className="text-xs font-bold">{opt.label}</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 pl-6 leading-tight">{opt.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
