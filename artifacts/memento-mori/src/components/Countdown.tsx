import React, { useState, useEffect, useRef } from 'react';
import { countTo } from '../lib/countTo';

interface Props {
  currentAge: number;
  lifeExpectancy: number;
  freeHoursRemaining: number;
}

export function Countdown({ currentAge, lifeExpectancy, freeHoursRemaining }: Props) {
  const [timeLeft, setTimeLeft] = useState({
    years: 0, months: 0, weeks: 0, days: 0, hours: 0, minutes: 0, seconds: 0
  });

  const weekendsRef = useRef<HTMLDivElement>(null);
  const saturdaysRef = useRef<HTMLDivElement>(null);
  const prevWeekends = useRef(Math.floor(freeHoursRemaining / 48));
  const prevSaturdays = useRef(Math.floor(freeHoursRemaining / 8));

  useEffect(() => {
    const cancels: Array<() => void> = [];
    const w = Math.floor(freeHoursRemaining / 48);
    const s = Math.floor(freeHoursRemaining / 8);

    if (weekendsRef.current && prevWeekends.current !== w) {
      cancels.push(countTo(prevWeekends.current, w, 0.6, (val) => {
        if (weekendsRef.current) {
          weekendsRef.current.innerHTML = Math.round(val).toLocaleString();
        }
      }));
      prevWeekends.current = w;
    }

    if (saturdaysRef.current && prevSaturdays.current !== s) {
      cancels.push(countTo(prevSaturdays.current, s, 0.6, (val) => {
        if (saturdaysRef.current) {
          saturdaysRef.current.innerHTML = Math.round(val).toLocaleString();
        }
      }));
      prevSaturdays.current = s;
    }

    return () => cancels.forEach(c => c());
  }, [freeHoursRemaining]);

  useEffect(() => {
    const ageInMs = currentAge * 365.25 * 24 * 3600 * 1000;
    const lifeInMs = lifeExpectancy * 365.25 * 24 * 3600 * 1000;
    const deathDate = new Date(Date.now() + (lifeInMs - ageInMs));

    let lastTime = performance.now();
    let animationFrameId: number;

    const compute = () => {
      const now = new Date().getTime();
      const diff = deathDate.getTime() - now;

      if (diff <= 0) {
        setTimeLeft({ years: 0, months: 0, weeks: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
      let d = diff - years * (1000 * 60 * 60 * 24 * 365.25);

      const months = Math.floor(d / (1000 * 60 * 60 * 24 * 30.44));
      d -= months * (1000 * 60 * 60 * 24 * 30.44);

      const weeks = Math.floor(d / (1000 * 60 * 60 * 24 * 7));
      d -= weeks * (1000 * 60 * 60 * 24 * 7);

      const days = Math.floor(d / (1000 * 60 * 60 * 24));
      d -= days * (1000 * 60 * 60 * 24);

      const hours = Math.floor(d / (1000 * 60 * 60));
      d -= hours * (1000 * 60 * 60);

      const minutes = Math.floor(d / (1000 * 60));
      d -= minutes * (1000 * 60);

      const seconds = Math.floor(d / 1000);

      setTimeLeft({ years, months, weeks, days, hours, minutes, seconds });
    };

    compute();

    const tick = (currentTime: number) => {
      if (currentTime - lastTime >= 1000) {
        lastTime = currentTime;
        compute();
      }
      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animationFrameId);
  }, [currentAge, lifeExpectancy]);

  return (
    <div className="flex flex-col items-center gap-12 my-12 w-full max-w-4xl mx-auto">
      <div className="text-center">
        <h3 className="text-xs font-bold uppercase tracking-widest opacity-60 mb-6">Countdown to Expected Death</h3>
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 text-[var(--accent)] font-mono font-bold text-3xl sm:text-4xl md:text-5xl lg:text-[64px] tracking-tighter">
          <div className="flex flex-col items-center"><span className="leading-none">{timeLeft.years}</span><span className="text-[10px] sm:text-xs tracking-widest font-sans font-medium uppercase mt-2 text-foreground opacity-50">years</span></div>
          <div className="flex flex-col items-center"><span className="leading-none">{timeLeft.months}</span><span className="text-[10px] sm:text-xs tracking-widest font-sans font-medium uppercase mt-2 text-foreground opacity-50">months</span></div>
          <div className="flex flex-col items-center"><span className="leading-none">{timeLeft.weeks}</span><span className="text-[10px] sm:text-xs tracking-widest font-sans font-medium uppercase mt-2 text-foreground opacity-50">weeks</span></div>
          <div className="flex flex-col items-center"><span className="leading-none">{timeLeft.days}</span><span className="text-[10px] sm:text-xs tracking-widest font-sans font-medium uppercase mt-2 text-foreground opacity-50">days</span></div>
          <div className="flex flex-col items-center"><span className="leading-none">{timeLeft.hours}</span><span className="text-[10px] sm:text-xs tracking-widest font-sans font-medium uppercase mt-2 text-foreground opacity-50">hours</span></div>
          <div className="flex flex-col items-center"><span className="leading-none">{timeLeft.minutes}</span><span className="text-[10px] sm:text-xs tracking-widest font-sans font-medium uppercase mt-2 text-foreground opacity-50">mins</span></div>
          <div className="flex flex-col items-center"><span className="leading-none inline-block min-w-[1.2em] text-center transition-opacity duration-200">{timeLeft.seconds}</span><span className="text-[10px] sm:text-xs tracking-widest font-sans font-medium uppercase mt-2 text-foreground opacity-50">secs</span></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <div className="flex flex-col bg-card px-6 py-6 md:py-8 rounded-none border border-border shadow-sm text-center">
          <div className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2">Free Weekends Remaining</div>
          <div ref={weekendsRef} className="text-4xl md:text-[56px] font-bold font-mono text-foreground leading-none mb-3">
            {Math.floor(Math.max(0, freeHoursRemaining) / 48).toLocaleString()}
          </div>
          <div className="text-xs uppercase tracking-widest opacity-40 font-bold mt-auto pt-2 border-t border-border">A weekend = 48 hours to yourself</div>
        </div>
        
        <div className="flex flex-col bg-card px-6 py-6 md:py-8 rounded-none border border-border shadow-sm text-center">
          <div className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2">Free Saturdays Remaining</div>
          <div ref={saturdaysRef} className="text-4xl md:text-[56px] font-bold font-mono text-foreground leading-none mb-3">
            {Math.floor(Math.max(0, freeHoursRemaining) / 8).toLocaleString()}
          </div>
          <div className="text-xs uppercase tracking-widest opacity-40 font-bold mt-auto pt-2 border-t border-border">A full free day = 8 waking hours</div>
        </div>
      </div>
    </div>
  );
}
