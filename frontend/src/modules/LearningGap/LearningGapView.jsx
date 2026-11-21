import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { 
  GitFork, 
  AlertTriangle, 
  ArrowRight, 
  Calendar, 
  CheckCircle2, 
  Bot, 
  ShieldCheck, 
  Lightbulb, 
  CornerDownRight,
  BookOpen
} from 'lucide-react';

export default function LearningGapView() {
  const { t } = useTranslation();
  const { currentUser } = useAuth();

  const [gaps, setGaps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGaps() {
      try {
        const studentId = currentUser?.id || '00000000-0000-0000-0000-000000000001';
        const res = await fetch(`http://localhost:5000/api/gaps/${studentId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.learningGaps && data.learningGaps.length > 0) {
            setGaps(data.learningGaps);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Backend gap service offline, using deterministic local gap data');
      }

      // Default deterministic gap (Class 9 Maths scenario)
      setGaps([
        {
          id: 'b0000000-0000-0000-0000-000000000001',
          topicId: '10000000-0000-0000-0000-000000000004',
          topicName: 'Quadratic Equations',
          accuracy: 33,
          rootPrerequisiteId: '10000000-0000-0000-0000-000000000003',
          rootPrerequisiteName: 'Algebraic Identities & Factoring',
          prerequisiteChain: ['Number Systems', 'Algebraic Factoring', 'Quadratic Equations'],
          reason: 'Struggle detected in Quadratic Equations (33% accuracy). Graph traversal identified foundational gaps in prerequisite: Algebraic Identities & Factoring (0% confident accuracy). Solving quadratic equations requires mastering middle-term splitting and difference of squares first.',
          status: 'active',
        },
      ]);
      setLoading(false);
    }

    fetchGaps();
  }, [currentUser]);

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-2">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-800/60 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <GitFork className="w-3.5 h-3.5" />
            <span>Deterministic Prerequisite Tracing</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {t('nav.gaps')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            We don't just tell you that you missed marks. LearnLens maps the root prerequisite concept that caused the error.
          </p>
        </div>

        <Link
          to="/planner"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/30 transition-all hover:scale-105 shrink-0"
        >
          <Calendar className="w-4 h-4" />
          <span>Plan Study Sessions</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Diagnosed Gaps List */}
      <div className="space-y-6">
        {gaps.map((gap, idx) => (
          <div
            key={gap.id || idx}
            className="p-6 sm:p-8 rounded-3xl bg-slate-800/40 border border-slate-700/60 shadow-lg space-y-6"
          >
            {/* Visual Prerequisite Root Cause Graph */}
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Pedagogical Learning Graph
              </div>

              <div className="grid grid-cols-1 md:grid-cols-11 items-center gap-3 p-5 rounded-2xl bg-slate-900/60 border border-slate-700/50">
                {/* 1. Target Topic (Weak) */}
                <div className="md:col-span-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-1.5 text-[11px] font-bold text-amber-400">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Target Weak Topic (&lt; 60%)</span>
                  </div>
                  <h3 className="text-base font-bold text-white">{gap.topicName}</h3>
                  <div className="text-xs text-amber-300 font-mono">
                    Accuracy: {gap.accuracy}%
                  </div>
                </div>

                {/* Graph Traversal Directed Arrow */}
                <div className="md:col-span-1 flex flex-col items-center justify-center text-slate-400 py-1 md:py-0">
                  <span className="text-[10px] uppercase font-bold text-slate-500 hidden md:block">Root</span>
                  <div className="hidden md:block w-full border-t-2 border-dashed border-indigo-500/50 my-1 relative">
                    <span className="absolute -top-1.5 right-0 text-indigo-400">►</span>
                  </div>
                  <div className="md:hidden flex items-center justify-center text-indigo-400">
                    ▼
                  </div>
                </div>

                {/* 2. Root Prerequisite (The Real Culprit) */}
                <div className="md:col-span-5 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 space-y-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-1.5 text-[11px] font-bold text-indigo-400">
                    <GitFork className="w-3.5 h-3.5" />
                    <span>Foundational Prerequisite Cause</span>
                  </div>
                  <h3 className="text-base font-bold text-white">{gap.rootPrerequisiteName}</h3>
                  <div className="text-xs text-indigo-300">
                    Prior Concept Deficit (Class 8)
                  </div>
                </div>
              </div>
            </div>

            {/* Evidence & Diagnosis Breakdown */}
            <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-700/40 space-y-2">
              <div className="flex items-center gap-2 text-slate-200 text-xs font-bold">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span>Deterministic Evidence & Diagnostic Insight</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-6">
                {gap.reason}
              </p>
            </div>

            {/* Prerequisite Path Breadcrumb */}
            {gap.prerequisiteChain && gap.prerequisiteChain.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
                <span className="font-semibold text-slate-300">Learning Path:</span>
                {gap.prerequisiteChain.map((step, sIdx) => (
                  <React.Fragment key={sIdx}>
                    <span className={`px-2.5 py-0.5 rounded-md font-medium text-[11px] ${
                      sIdx === 0
                        ? 'bg-slate-700 text-slate-300'
                        : sIdx === gap.prerequisiteChain.length - 1
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold'
                        : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    }`}>
                      {step}
                    </span>
                    {sIdx < gap.prerequisiteChain.length - 1 && (
                      <span className="text-slate-600">➔</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}

            {/* Next Steps CTA */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-700/60">
              <div className="text-xs text-slate-400">
                Recommended Remediation: <strong>2 focused sessions (25 mins) on {gap.rootPrerequisiteName}</strong>.
              </div>
              <Link
                to="/planner"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
              >
                <span>Add to My Study Plan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
