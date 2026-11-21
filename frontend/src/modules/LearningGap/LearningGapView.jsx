import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import SectionLabel from '../../components/common/SectionLabel';
import { 
  GitFork, 
  AlertTriangle, 
  ArrowRight, 
  Calendar, 
  CheckCircle2, 
  Bot, 
  Lightbulb,
  Sparkles
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
    <div className="space-y-8 max-w-4xl mx-auto py-6">
      {/* Header Banner */}
      <Card padding="lg" className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <SectionLabel>DETERMINISTIC GRAPH TRAVERSAL</SectionLabel>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#0D0D0D] tracking-tight">
            Diagnosed <span className="text-[#F26522]">Learning Gaps</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6660] max-w-lg leading-relaxed">
            We don't just tell you that you lost marks. LearnLens traverses the curriculum DAG to uncover the root prerequisite concept holding you back.
          </p>
        </div>

        <div className="shrink-0">
          <Button to="/planner" variant="primary" size="md" showArrow icon={Calendar}>
            Plan Study Sessions
          </Button>
        </div>
      </Card>

      {/* Diagnosed Gaps List */}
      <div className="space-y-6">
        {gaps.map((gap, idx) => (
          <Card
            key={gap.id || idx}
            padding="lg"
            hoverLift={false}
            className="space-y-6"
          >
            {/* Visual Prerequisite Root Cause Graph */}
            <div>
              <div className="text-xs font-bold text-[#6B6660] uppercase tracking-wider mb-4">
                Pedagogical Curriculum Dependency Graph
              </div>

              <div className="grid grid-cols-1 md:grid-cols-11 items-center gap-3 p-5 rounded-[20px] bg-[#F5F0EA] border border-[#E3DCD3]">
                {/* 1. Target Topic (Weak) */}
                <div className="md:col-span-5 p-4 rounded-[16px] bg-white border border-[#E3DCD3] space-y-1 text-center md:text-left shadow-xs">
                  <div className="flex items-center justify-center md:justify-start gap-1.5 text-[11px] font-bold text-[#F26522]">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Target Weak Topic (&lt; 60%)</span>
                  </div>
                  <h3 className="font-heading text-base font-bold text-[#0D0D0D]">{gap.topicName}</h3>
                  <div className="text-xs text-[#F26522] font-bold font-mono">
                    Accuracy: {gap.accuracy}%
                  </div>
                </div>

                {/* Graph Traversal Directed Arrow */}
                <div className="md:col-span-1 flex flex-col items-center justify-center text-[#F26522] py-2 md:py-0">
                  <span className="text-[10px] uppercase font-bold text-[#6B6660] hidden md:block">Roots In</span>
                  <div className="hidden md:flex items-center justify-center w-full">
                    <ArrowRight className="w-5 h-5 text-[#F26522]" />
                  </div>
                  <div className="md:hidden flex items-center justify-center text-[#F26522]">
                    ▼
                  </div>
                </div>

                {/* 2. Root Prerequisite (The Real Culprit) */}
                <div className="md:col-span-5 p-4 rounded-[16px] bg-[#0D0D0D] text-white space-y-1 text-center md:text-left shadow-sm">
                  <div className="flex items-center justify-center md:justify-start gap-1.5 text-[11px] font-bold text-[#F26522]">
                    <GitFork className="w-3.5 h-3.5 shrink-0" />
                    <span>Foundational Prerequisite Cause</span>
                  </div>
                  <h3 className="font-heading text-base font-bold text-white">
                    {gap.rootPrerequisiteName}
                  </h3>
                  <div className="text-xs text-[#A8A29E] font-medium">
                    Origin: Class 8 Foundations
                  </div>
                </div>
              </div>
            </div>

            {/* Diagnostic Evidence & Explanation */}
            <div className="p-4 rounded-[18px] bg-white border border-[#E3DCD3] space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0D0D0D]">
                <Lightbulb className="w-4 h-4 text-[#F26522] shrink-0" />
                <span>Diagnostic Evidence Analysis</span>
              </div>
              <p className="text-xs text-[#6B6660] leading-relaxed">
                {gap.reason}
              </p>
            </div>

            {/* Next Steps Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-[#E3DCD3]">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#0D0D0D]">
                <CheckCircle2 className="w-4 h-4 text-[#F26522]" />
                <span>Target: 3 remedial sessions unblocks this chapter</span>
              </div>

              <div className="flex items-center gap-3">
                <Button to="/ai-tutor" variant="secondary" size="sm" icon={Bot}>
                  Ask AI Tutor
                </Button>
                <Button to="/planner" variant="primary" size="sm" showArrow>
                  Generate Plan
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
