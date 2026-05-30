import React from 'react';
import { ChevronDown } from 'lucide-react';
import { useLifeCalc } from '../hooks/useLifeCalc';
import { ThemeToggle } from '../components/ThemeToggle';
import { Countdown } from '../components/Countdown';
import { LifeGrid } from '../components/LifeGrid';
import { ControlsPanel } from '../components/ControlsPanel';
import { StatsPanel } from '../components/StatsPanel';
import { EDUCATION_LEVELS } from '../lib/educationLevels';

export default function Home() {
  const { state, lifeExpectancy, stats } = useLifeCalc();

  const schoolCalendarYears = EDUCATION_LEVELS
    .filter(l => state.selectedEducationLevels.includes(l.id))
    .reduce((sum, l) => sum + l.years, 0);

  const augmentedStats = { ...stats, schoolCalendarYears };

  return (
    <div className="min-h-[100dvh] pb-24 font-sans bg-background text-foreground selection:bg-accent selection:text-white transition-colors duration-250 ease-out">
      <ThemeToggle />

      {/* Hero Section — full viewport height, content vertically centered */}
      <div
        className="px-4 w-full max-w-[1200px] mx-auto flex flex-col justify-center"
        style={{ height: '100vh', position: 'relative' }}
      >
        <div className="text-center mb-6">
          <h1 className="text-5xl md:text-7xl lg:text-[85px] font-bold font-mono tracking-tighter mb-3">
            MEMENTO MORI
          </h1>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '28px', opacity: 0.85 }}>
            Remember death.
          </p>
        </div>

        <Countdown
          currentAge={state.currentAge}
          lifeExpectancy={lifeExpectancy}
          freeHoursRemaining={stats.freeHoursRemaining}
        />

        {/* Animated scroll indicator */}
        <button
          onClick={() => document.getElementById('life-grid')?.scrollIntoView({ behavior: 'smooth' })}
          aria-label="Scroll to grid"
          style={{
            position: 'absolute',
            bottom: '32px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            opacity: 0.6,
            padding: 0,
            color: 'inherit',
          }}
        >
          <ChevronDown size={28} className="animate-scroll-bounce" />
        </button>
      </div>

      {/* Grid Section */}
      <div id="life-grid" className="w-full max-w-[1400px] mx-auto px-4 mb-20">
        <LifeGrid state={state} lifeExpectancy={lifeExpectancy} />
      </div>

      {/* Two Column Layout */}
      <div className="max-w-[1400px] mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7">
          <StatsPanel stats={augmentedStats} />
        </div>
        <div className="lg:col-span-5">
          <ControlsPanel state={state} lifeExpectancy={lifeExpectancy} />
        </div>
      </div>
    </div>
  );
}
