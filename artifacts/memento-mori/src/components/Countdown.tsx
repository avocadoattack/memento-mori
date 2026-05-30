import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

interface Props {
  currentAge: number;
  lifeExpectancy: number;
  freeHoursRemaining: number;
}

export function Countdown({ currentAge, lifeExpectancy, freeHoursRemaining }: Props) {
  const [timeLeft, setTimeLeft] = useState({
    years: 0, months: 0, weeks: 0, days: 0, hours: 0, minutes: 0, seconds: 0
  });
  
  const secondsRef = useRef<HTMLSpanElement>(null);
  const freeHoursRef = useRef<HTMLDivElement>(null);
  const prevHours = useRef(freeHoursRemaining);

  useEffect(() => {
    try {
      if (freeHoursRef.current && prevHours.current !== freeHoursRemaining) {
        gsap.to(freeHoursRef.current, {
          innerHTML: freeHoursRemaining,
          duration: 0.6,
          snap: { innerHTML: 1 },
          ease: "power2.out",
          onUpdate: function() {
            freeHoursRef.current!.innerHTML = Number(this.targets()[0].innerHTML).toLocaleString(undefined, { maximumFractionDigits: 0 });
          }
        });
        prevHours.current = freeHoursRemaining;
      } else if (freeHoursRef.current && prevHours.current === freeHoursRemaining) {
        freeHoursRef.current.innerHTML = freeHoursRemaining.toLocaleString(undefined, { maximumFractionDigits: 0 });
      }
    } catch (e) {}
  }, [freeHoursRemaining]);

  useEffect(() => {
    const ageInMs = currentAge * 365.25 * 24 * 3600 * 1000;
    const lifeInMs = lifeExpectancy * 365.25 * 24 * 3600 * 1000;
    const deathDate = new Date(Date.now() + (lifeInMs - ageInMs));

    const interval = setInterval(() => {
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

      setTimeLeft(prev => {
        if (prev.seconds !== seconds && secondsRef.current) {
          try {
            gsap.fromTo(secondsRef.current, 
              { opacity: 1, y: 0 }, 
              { opacity: 0, y: -10, duration: 0.15, yoyo: true, repeat: 1 }
            );
          } catch(e) {}
        }
        return { years, months, weeks, days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentAge, lifeExpectancy]);

  return (
    <div className="flex flex-col items-center gap-8 my-8">
      <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 text-[var(--accent)] font-mono font-bold text-3xl sm:text-4xl md:text-5xl lg:text-[64px] tracking-tighter">
        <div className="flex flex-col items-center"><span className="leading-none">{timeLeft.years}</span><span className="text-[10px] sm:text-xs tracking-widest font-sans font-medium uppercase mt-2 text-foreground opacity-50">years</span></div>
        <div className="flex flex-col items-center"><span className="leading-none">{timeLeft.months}</span><span className="text-[10px] sm:text-xs tracking-widest font-sans font-medium uppercase mt-2 text-foreground opacity-50">months</span></div>
        <div className="flex flex-col items-center"><span className="leading-none">{timeLeft.weeks}</span><span className="text-[10px] sm:text-xs tracking-widest font-sans font-medium uppercase mt-2 text-foreground opacity-50">weeks</span></div>
        <div className="flex flex-col items-center"><span className="leading-none">{timeLeft.days}</span><span className="text-[10px] sm:text-xs tracking-widest font-sans font-medium uppercase mt-2 text-foreground opacity-50">days</span></div>
        <div className="flex flex-col items-center"><span className="leading-none">{timeLeft.hours}</span><span className="text-[10px] sm:text-xs tracking-widest font-sans font-medium uppercase mt-2 text-foreground opacity-50">hours</span></div>
        <div className="flex flex-col items-center"><span className="leading-none">{timeLeft.minutes}</span><span className="text-[10px] sm:text-xs tracking-widest font-sans font-medium uppercase mt-2 text-foreground opacity-50">mins</span></div>
        <div className="flex flex-col items-center"><span ref={secondsRef} className="leading-none inline-block min-w-[1.2em] text-center">{timeLeft.seconds}</span><span className="text-[10px] sm:text-xs tracking-widest font-sans font-medium uppercase mt-2 text-foreground opacity-50">secs</span></div>
      </div>

      <div className="mt-2 flex flex-col items-center bg-card px-8 py-4 rounded-lg border border-border shadow-sm">
        <div className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">Free Hours Remaining</div>
        <div ref={freeHoursRef} className="text-4xl md:text-[48px] font-bold font-mono text-foreground leading-none">
          {Math.max(0, freeHoursRemaining).toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </div>
      </div>
    </div>
  );
}
