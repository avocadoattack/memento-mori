import React from 'react';
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
      
      {/* Hero Section */}
      <div className="pt-16 pb-12 px-4 w-full max-w-[1200px] mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-5xl md:text-7xl lg:text-[85px] font-bold font-mono tracking-tighter mb-3">
            MEMENTO MORI
          </h1>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '22px', opacity: 0.7 }} className="mb-3">
            Remember, you will die.
          </p>
          <p className="text-lg md:text-xl opacity-70 max-w-2xl mx-auto">
            After sleep, work, and everything else — here's what's actually left.
          </p>
        </div>

        <Countdown 
          currentAge={state.currentAge} 
          lifeExpectancy={lifeExpectancy} 
          freeHoursRemaining={stats.freeHoursRemaining} 
        />
      </div>

      {/* Grid Section */}
      <div className="w-full max-w-[1400px] mx-auto px-4 mb-20">
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
