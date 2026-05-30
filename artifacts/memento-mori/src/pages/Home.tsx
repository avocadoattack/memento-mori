import React, { useRef, useEffect } from 'react';
import { useLifeCalc } from '../hooks/useLifeCalc';
import { ThemeToggle } from '../components/ThemeToggle';
import { Countdown } from '../components/Countdown';
import { LifeGrid } from '../components/LifeGrid';
import { ControlsPanel } from '../components/ControlsPanel';
import { StatsPanel } from '../components/StatsPanel';
import gsap from 'gsap';

export default function Home() {
  const { state, lifeExpectancy, stats } = useLifeCalc();
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      if (heroRef.current) {
        gsap.fromTo(
          heroRef.current.children,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 2.5, ease: "power2.out", stagger: 0.2 }
        );
      }
    } catch (e) {
      // Graceful degradation
    }
  }, []);

  return (
    <div className="min-h-screen pb-24 font-sans bg-background text-foreground selection:bg-accent selection:text-white">
      <ThemeToggle />
      
      {/* Hero Section */}
      <div ref={heroRef} className="pt-16 pb-8 px-4 text-center max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-mono tracking-tighter mb-4">
          YOUR LIFE IN WEEKS
        </h1>
        <p className="text-lg md:text-xl opacity-70 mb-12 max-w-2xl mx-auto">
          After sleep, work, and everything else — here's what's actually left.
        </p>

        <Countdown 
          currentAge={state.currentAge} 
          lifeExpectancy={lifeExpectancy} 
          freeHoursRemaining={stats.freeHoursRemaining} 
        />
      </div>

      <div className="max-w-[1400px] mx-auto px-4 flex flex-col lg:flex-row gap-12 mt-8">
        {/* Grid Panel */}
        <div className="flex-1 order-2 lg:order-1 overflow-hidden min-w-0">
          <LifeGrid state={state} lifeExpectancy={lifeExpectancy} />
        </div>

        {/* Controls Panel */}
        <div className="w-full lg:w-[420px] order-1 lg:order-2 shrink-0">
          <ControlsPanel state={state} lifeExpectancy={lifeExpectancy} />
        </div>
      </div>

      {/* Stats Panel */}
      <div className="max-w-[1400px] mx-auto px-4 mt-20">
        <StatsPanel stats={stats} />
      </div>
    </div>
  );
}
