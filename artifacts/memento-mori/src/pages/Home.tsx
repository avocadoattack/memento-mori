import React from 'react';
import { useLifeCalc } from '../hooks/useLifeCalc';
import { ThemeToggle } from '../components/ThemeToggle';
import { Countdown } from '../components/Countdown';
import { LifeGrid } from '../components/LifeGrid';
import { ControlsPanel } from '../components/ControlsPanel';
import { StatsPanel } from '../components/StatsPanel';

export default function Home() {
  const { state, lifeExpectancy, stats } = useLifeCalc();

  return (
    <div className="min-h-[100dvh] pb-24 font-sans bg-background text-foreground selection:bg-accent selection:text-white transition-colors duration-250 ease-out">
      <ThemeToggle />
      
      {/* Hero Section */}
      <div className="pt-16 pb-12 px-4 w-full max-w-[1200px] mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-mono tracking-tighter mb-4">
            YOUR LIFE IN WEEKS
          </h1>
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
          <StatsPanel stats={stats} />
        </div>
        <div className="lg:col-span-5">
          <ControlsPanel state={state} lifeExpectancy={lifeExpectancy} />
        </div>
      </div>
    </div>
  );
}
