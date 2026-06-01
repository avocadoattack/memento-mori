import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLifeCalc } from '../hooks/useLifeCalc';
import { ThemeToggle } from '../components/ThemeToggle';
import { Countdown } from '../components/Countdown';
import { LifeGrid } from '../components/LifeGrid';
import { ControlsPanel } from '../components/ControlsPanel';
import { StatsPanel } from '../components/StatsPanel';
import { Quiz } from '../components/Quiz';
import { EDUCATION_LEVELS } from '../lib/educationLevels';

export default function Home() {
  const calc = useLifeCalc();
  const { state, lifeExpectancy, stats } = calc;

  const [stage, setStage] = useState<'quiz' | 'app'>(() => {
    try {
      return sessionStorage.getItem('quiz_completed') === 'true' ? 'app' : 'quiz';
    } catch {
      return 'quiz';
    }
  });
  const [quizExiting, setQuizExiting] = useState(false);
  const [appVisible, setAppVisible] = useState(() => stage === 'app');
  const transitioningRef = useRef(false);

  const goToApp = (markCompleted: boolean) => {
    if (transitioningRef.current) return;
    transitioningRef.current = true;
    if (markCompleted) {
      try {
        sessionStorage.setItem('quiz_completed', 'true');
      } catch {
        // sessionStorage may be unavailable (private mode / blocked) — proceed without persistence
      }
    }
    setQuizExiting(true);
    setTimeout(() => setStage('app'), 400);
  };

  // Fade the main app in once the quiz has transitioned away.
  useEffect(() => {
    if (stage !== 'app' || appVisible) return;
    const id = requestAnimationFrame(() => setAppVisible(true));
    return () => cancelAnimationFrame(id);
  }, [stage, appVisible]);

  // Fix 4: --dvh tracks actual visible viewport height (excludes browser chrome, Replit banner, etc.)
  useEffect(() => {
    const set = () =>
      document.documentElement.style.setProperty('--dvh', `${window.innerHeight / 100}px`);
    set();
    window.addEventListener('resize', set);
    window.addEventListener('orientationchange', set);
    return () => {
      window.removeEventListener('resize', set);
      window.removeEventListener('orientationchange', set);
    };
  }, []);

  if (stage === 'quiz') {
    return (
      <Quiz
        calc={calc}
        exiting={quizExiting}
        onComplete={() => goToApp(true)}
        onSkip={() => goToApp(false)}
      />
    );
  }

  const schoolCalendarYears = EDUCATION_LEVELS
    .filter(l => state.selectedEducationLevels.includes(l.id))
    .reduce((sum, l) => sum + l.years, 0);

  const augmentedStats = { ...stats, schoolCalendarYears };

  return (
    <div
      className="min-h-[100dvh] font-sans bg-background text-foreground selection:bg-accent selection:text-white transition-colors duration-250 ease-out"
      style={{ opacity: appVisible ? 1 : 0, transition: 'opacity 0.5s ease' }}
    >
      <ThemeToggle />
      {/* Hero Section — full viewport height, flex column; chevron pinned to bottom in-flow */}
      <div
        className="px-4 w-full max-w-[1200px] mx-auto"
        style={{
          height: 'calc(var(--dvh, 1dvh) * 100)',
          minHeight: '-webkit-fill-available',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: 'clamp(40px, 7vh, 72px)',
          paddingBottom: '28px',
          boxSizing: 'border-box',
        }}
      >
        {/* Main content block — grows to fill space, content vertically centered; min-height:0 prevents overflow pushing chevron off-screen */}
        <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          <div className="text-center" style={{ marginBottom: 'clamp(20px, 3vh, 48px)' }}>
            <h1 className="font-bold font-mono tracking-tighter" style={{ fontSize: 'clamp(36px, 10vw, 120px)', marginBottom: '8px' }}>
              MEMENTO MORI
            </h1>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 'clamp(20px, 4vw, 48px)', opacity: 0.85 }}>
              Remember death
            </p>
          </div>

          <Countdown
            currentAge={state.currentAge}
            lifeExpectancy={lifeExpectancy}
            freeHoursRemaining={stats.freeHoursRemaining}
            pctLifeBehind={stats.pctLifeBehind}
          />
        </div>

        {/* Animated scroll indicator — in flow, always at bottom */}
        <button
          onClick={() => document.getElementById('life-grid')?.scrollIntoView({ behavior: 'smooth' })}
          aria-label="Scroll to grid"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            opacity: 0.6,
            padding: '8px',
            color: 'inherit',
            flexShrink: 0,
          }}
        >
          <ChevronDown size={28} className="animate-scroll-bounce" />
        </button>
      </div>
      {/* Grid Section — clear separation from hero */}
      <div
        id="life-grid"
        className="w-full max-w-[1400px] mx-auto box-border overflow-x-auto pt-16 pb-12 pl-12 pr-6 max-md:pt-10 max-md:pl-2 max-md:pr-2"
      >
        <LifeGrid state={state} lifeExpectancy={lifeExpectancy} />
      </div>
      {/* Two Column Layout */}
      <div className="max-w-[1400px] mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
        <div className="lg:col-span-7">
          <StatsPanel stats={augmentedStats} />
        </div>
        <div className="lg:col-span-5">
          <ControlsPanel state={state} lifeExpectancy={lifeExpectancy} />
        </div>
      </div>
      {/* Footer */}
      <footer style={{ backgroundColor: 'var(--footer-bg)', padding: '40px 60px' }}>
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-8">
            {/* Left column */}
            <div style={{ fontSize: '13px', opacity: 0.6, lineHeight: 1.7 }}>
              <p className="font-bold mb-1">Memento Mori — Time Audit</p>
              <p>All calculations are estimates based on population averages.</p>
              <p>Your individual experience will vary; and, hopefully, for the better.</p>
            </div>

            {/* Right column */}
            <div>
              <p className="font-bold uppercase tracking-widest mb-3" style={{ fontSize: '11px', opacity: 0.5 }}>Data Sources</p>
              <ul style={{ fontSize: '12px', lineHeight: 1.9 }} className="space-y-0.5">
                {[
                  { label: 'Life Expectancy', source: 'UN World Population Prospects 2024', url: 'https://population.un.org/wpp/' },
                  { label: 'Social Media Usage', source: 'DemandSage 2026', url: 'https://www.demandsage.com/average-time-spent-on-social-media/' },
                  { label: 'Teen Social Media', source: 'Gallup 2024', url: 'https://news.gallup.com/poll/512576/teens-spend-average-hours-social-media-per-day.aspx' },
                  { label: 'TV & Screen Time', source: 'BLS American Time Use Survey', url: 'https://www.bls.gov/tus/' },
                  { label: 'Streaming Data', source: 'Nielsen Gauge 2025, SQ Magazine', url: 'https://sqmagazine.co.uk/streaming-statistics/' },
                  { label: 'Commute Data', source: 'U.S. Census Bureau ACS', url: 'https://www.census.gov/topics/employment/commuting.html' },
                  { label: 'Grooming', source: 'BLS ATUS, Euromonitor Personal Care Survey', url: null },
                ].map(({ label, source, url }) => (
                  <li key={label} style={{ opacity: 0.65 }}>
                    <span className="font-bold">{label}:</span>{' '}
                    {url ? (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="no-underline hover:underline transition-colors"
                        style={{ color: 'inherit' }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'inherit')}
                      >{source}</a>
                    ) : source}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-foreground/10 pt-6 text-center">
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '16px', opacity: 0.55, maxWidth: '600px', margin: '0 auto', lineHeight: 1.5 }}>
              It is not that we have a short time to live, but that we waste a lot of it. Life is long enough, and a sufficiently generous amount has been given to us for the highest achievements if it were all well invested.
            </p>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '14px', opacity: 0.45, marginTop: '12px' }}>
              — Seneca
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
