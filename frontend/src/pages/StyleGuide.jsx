import React from 'react';
import { useTranslation } from '../context/LanguageContext';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import SectionLabel from '../components/common/SectionLabel';
import StepList from '../components/common/StepList';
import CtaBanner from '../components/common/CtaBanner';
import LanguageToggle from '../components/common/LanguageToggle';
import { Sparkles, ArrowRight, Play, CheckCircle2, ShieldCheck, Layers, GitFork } from 'lucide-react';

export default function StyleGuide() {
  const { t, language } = useTranslation();

  const colorTokens = [
    { name: 'Background Base', hex: '#F5F0EA', bgClass: 'bg-[#F5F0EA]', textDark: true, desc: 'Canvas background for all pages' },
    { name: 'Surface (Cards)', hex: '#FBF8F4', bgClass: 'bg-[#FBF8F4]', textDark: true, desc: 'Component cards with soft shadow' },
    { name: 'Primary Text', hex: '#0D0D0D', bgClass: 'bg-[#0D0D0D]', textDark: false, desc: 'Near-black for titles and copy' },
    { name: 'Secondary Text', hex: '#6B6660', bgClass: 'bg-[#6B6660]', textDark: false, desc: 'Warm grey for subtitles and metadata' },
    { name: 'Accent Orange', hex: '#F26522', bgClass: 'bg-[#F26522]', textDark: false, desc: 'Vivid orange for buttons and highlights' },
    { name: 'Accent Hover', hex: '#D9531A', bgClass: 'bg-[#D9531A]', textDark: false, desc: 'Hover state for primary buttons' },
    { name: 'Dark Banner', hex: '#111111', bgClass: 'bg-[#111111]', textDark: false, desc: 'Dark rounded CTA blocks' },
    { name: 'Warm Border', hex: '#E3DCD3', bgClass: 'bg-[#E3DCD3]', textDark: true, desc: 'Hairline warm grey dividers' },
  ];

  const demoSteps = [
    {
      number: '01',
      title: 'Diagnose with Confidence',
      description: 'Take a short 5-minute diagnostic quiz tagging confidence as Sure, Not Sure, or Guessing.',
    },
    {
      number: '02',
      title: 'Trace Prerequisite DAG',
      description: 'Our engine walks the curriculum tree to diagnose the exact root-cause concept from earlier grades.',
    },
    {
      number: '03',
      title: 'Adaptive Study Sessions',
      description: 'Follow 25–30 minute bite-sized sessions planned strictly around your free hours.',
    },
  ];

  return (
    <div className="space-y-16 py-6 max-w-5xl mx-auto">
      {/* Style Guide Header */}
      <div className="space-y-4 pb-8 border-b border-[#E3DCD3]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <SectionLabel>DESIGN SYSTEM & STYLE GUIDE</SectionLabel>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#6B6660] font-medium">Active Language:</span>
            <LanguageToggle />
          </div>
        </div>

        <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-[#0D0D0D] tracking-tight">
          Warm Cream & Vivid <span className="text-[#F26522]">Orange</span> Tokens
        </h1>
        <p className="text-sm sm:text-base text-[#6B6660] max-w-2xl leading-relaxed">
          Inspired by the editorial minimalist aesthetic: warm parchment background, crisp near-black typography, generous 24px rounded corners, and energetic orange accents.
        </p>
      </div>

      {/* 1. Color Palette Tokens */}
      <section className="space-y-6">
        <SectionLabel>01 • COLOUR TOKENS</SectionLabel>
        <h2 className="font-heading text-2xl font-bold text-[#0D0D0D]">Palette Swatches</h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {colorTokens.map((c) => (
            <Card key={c.hex} padding="sm" className="space-y-3">
              <div
                className={`w-full h-16 rounded-xl border border-[#E3DCD3] ${c.bgClass} flex items-end p-2.5 shadow-xs`}
              >
                <span className={`text-[11px] font-mono font-bold ${c.textDark ? 'text-[#0D0D0D]' : 'text-white'}`}>
                  {c.hex}
                </span>
              </div>
              <div>
                <div className="text-xs font-bold text-[#0D0D0D]">{c.name}</div>
                <div className="text-[11px] text-[#6B6660] mt-0.5 leading-tight">{c.desc}</div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 2. Typography & Multilingual Support */}
      <section className="space-y-6">
        <SectionLabel>02 • TYPOGRAPHY & MULTILINGUAL STACKS</SectionLabel>
        <h2 className="font-heading text-2xl font-bold text-[#0D0D0D]">Font Hierarchy & Fallbacks</h2>

        <Card className="space-y-8">
          {/* Headings */}
          <div className="space-y-2">
            <div className="text-xs uppercase font-bold text-[#6B6660] tracking-wider">H1 — Inter Tight (800)</div>
            <div className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0D0D0D] tracking-tight">
              MAKE IDEAS <span className="text-[#F26522]">MOVE.</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs uppercase font-bold text-[#6B6660] tracking-wider">H2 — Inter Tight (700)</div>
            <div className="font-heading text-2xl sm:text-3xl font-bold text-[#0D0D0D]">
              A Simple Process. A Big <span className="text-[#F26522]">Impact.</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs uppercase font-bold text-[#6B6660] tracking-wider">Body — Inter (400, 500, 600)</div>
            <p className="text-sm text-[#0D0D0D] leading-relaxed max-w-2xl">
              LearnLens replaces opaque test scores with diagnostic prerequisite gap tracing, adaptive 25–30 min study planning fitted into free hours, and responsible Gemini AI tutoring.
            </p>
            <p className="text-xs text-[#6B6660] leading-relaxed max-w-2xl">
              Secondary text is set in warm grey (#6B6660), maintaining WCAG AA contrast while receding visually behind headings.
            </p>
          </div>

          {/* Tri-Lingual Specimens */}
          <div className="pt-4 border-t border-[#E3DCD3] space-y-4">
            <div className="text-xs uppercase font-bold text-[#6B6660] tracking-wider">Multilingual Font Rendering</div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white border border-[#E3DCD3] space-y-1">
                <span className="text-[10px] font-bold text-[#F26522] uppercase tracking-wider">English (Inter)</span>
                <div className="font-heading font-bold text-base text-[#0D0D0D]">Diagnostic Gap Tracing</div>
                <div className="text-xs text-[#6B6660]">Find the root prerequisite holding you back.</div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#E3DCD3] space-y-1 lang-hi" lang="hi">
                <span className="text-[10px] font-bold text-[#F26522] uppercase tracking-wider">हिंदी (Noto Sans Devanagari)</span>
                <div className="font-heading font-bold text-base text-[#0D0D0D]">बुनियादी कारण की खोज</div>
                <div className="text-xs text-[#6B6660]">कक्षा 9 के द्विघात समीकरण में कक्षा 8 के गुणनखंड की जांच।</div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#E3DCD3] space-y-1 lang-kn" lang="kn">
                <span className="text-[10px] font-bold text-[#F26522] uppercase tracking-wider">ಕನ್ನಡ (Noto Sans Kannada)</span>
                <div className="font-heading font-bold text-base text-[#0D0D0D]">ಮೂಲ ಕಾರಣದ ಶೋಧನೆ</div>
                <div className="text-xs text-[#6B6660]">8ನೇ ತರಗತಿಯ ಅಪವರ್ತನವೇ ಮೂಲ ತಡೆಗೋಡೆ ಎಂದು ಪತ್ತೆ ಮಾಡುತ್ತದೆ.</div>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* 3. Button Components */}
      <section className="space-y-6">
        <SectionLabel>03 • BUTTON VARIANTS</SectionLabel>
        <h2 className="font-heading text-2xl font-bold text-[#0D0D0D]">Pill-Shaped Action Buttons</h2>

        <Card className="space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="primary" size="md" showArrow>
              Primary Action
            </Button>

            <Button variant="secondary" size="md">
              Secondary Action
            </Button>

            <Button variant="dark" size="md">
              Dark Button
            </Button>

            <Button variant="ghost" size="md">
              Ghost Button
            </Button>
          </div>

          <div className="pt-4 border-t border-[#E3DCD3] flex flex-wrap items-center gap-4">
            <Button variant="primary" size="sm" showArrow>
              Small Pill
            </Button>

            <Button variant="primary" size="md" showArrow>
              Medium Pill (Default)
            </Button>

            <Button variant="primary" size="lg" showArrow>
              Large Hero Pill
            </Button>

            <Button variant="secondary" size="md" icon={Play}>
              Watch Story
            </Button>
          </div>
        </Card>
      </section>

      {/* 4. Card Components */}
      <section className="space-y-6">
        <SectionLabel>04 • CARD VARIANTS & RADIUS</SectionLabel>
        <h2 className="font-heading text-2xl font-bold text-[#0D0D0D]">24px Rounded Surfaces</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="surface" hoverLift>
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-[#0D0D0D] text-white flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5 text-[#F26522]" />
              </div>
              <h3 className="font-heading text-lg font-bold text-[#0D0D0D]">Surface Card (Default)</h3>
              <p className="text-xs text-[#6B6660] leading-relaxed">
                Warm linen (#FBF8F4) background with 24px rounded corners and smooth hover elevation.
              </p>
              <div className="pt-2">
                <Button variant="secondary" size="sm" showArrow>Learn More</Button>
              </div>
            </div>
          </Card>

          <Card variant="dark" hoverLift>
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-[#262626] text-[#F26522] flex items-center justify-center font-bold">
                <GitFork className="w-5 h-5" />
              </div>
              <h3 className="font-heading text-lg font-bold text-white">Dark Card (#111111)</h3>
              <p className="text-xs text-[#A8A29E] leading-relaxed">
                High-contrast dark surface for feature highlights, technical callouts, and dashboards.
              </p>
              <div className="pt-2">
                <Button variant="primary" size="sm" showArrow>Inspect</Button>
              </div>
            </div>
          </Card>

          <Card variant="outline" hoverLift={false}>
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-full border border-[#E3DCD3] text-[#0D0D0D] flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-heading text-lg font-bold text-[#0D0D0D]">Outlined Card</h3>
              <p className="text-xs text-[#6B6660] leading-relaxed">
                Transparent container with a clean hairline border for secondary groupings.
              </p>
              <div className="pt-2">
                <span className="text-xs font-bold text-[#F26522]">Active State</span>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* 5. Process StepList Component */}
      <section className="space-y-6">
        <SectionLabel>05 • PROCESS STEPLIST COMPONENT</SectionLabel>
        <h2 className="font-heading text-2xl font-bold text-[#0D0D0D]">Numbered Vertical Workflow</h2>

        <Card className="max-w-2xl">
          <StepList steps={demoSteps} />
        </Card>
      </section>

      {/* 6. Call To Action Banner */}
      <section className="space-y-6">
        <SectionLabel>06 • CALL TO ACTION BANNER</SectionLabel>
        <h2 className="font-heading text-2xl font-bold text-[#0D0D0D]">Dark Rounded CTA Banner</h2>

        <CtaBanner
          title="Ready to Master Foundational Mathematics?"
          accentWord="Foundational"
          subtitle="Join LearnLens today. Take the free 5-minute diagnostic assessment and unblock your learning."
          buttonText="Take Diagnostic Quiz"
          buttonTo="/quiz"
        />
      </section>
    </div>
  );
}
