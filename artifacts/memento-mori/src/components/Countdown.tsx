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

  const yearsRef = useRef<HTMLDivElement>(null);
  const saturdaysRef = useRef<HTMLDivElement>(null);
  const prevYears = useRef(freeHoursRemaining / 8760);
  const prevSaturdays = useRef(Math.floor(freeHoursRemaining / 8));

  useEffect(() => {
    const cancels: Array<() => void> = [];
    const y = freeHoursRemaining / 8760;
    const s = Math.floor(freeHoursRemaining / 8);

    if (yearsRef.current && parseFloat(prevYears.current.toFixed(1)) !== parseFloat(y.toFixed(1))) {
      cancels.push(countTo(prevYears.current, y, 0.6, (val) => {
        if (yearsRef.current) yearsRef.current.innerHTML = val.toFixed(1);
      }));
      prevYears.current = y;
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

  const units = [
    { key: 'years',  label: 'years',  value: timeLeft.years },
    { key: 'months', label: 'months', value: timeLeft.months },
    { key: 'weeks',  label: 'weeks',  value: timeLeft.weeks },
    { key: 'days',   label: 'days',   value: timeLeft.days },
    { key: 'hours',  label: 'hours',  value: timeLeft.hours },
    { key: 'mins',   label: 'mins',   value: timeLeft.minutes },
    { key: 'secs',   label: 'secs',   value: timeLeft.seconds },
  ];

  return (
    <div className="flex flex-col items-center gap-12 my-12 w-full max-w-4xl mx-auto">
      <div className="text-center">
        <h3 className="text-xs font-bold uppercase tracking-widest opacity-60 mb-6">Countdown to Expected Death</h3>
        <div
          className="text-[var(--accent)] font-mono font-bold tracking-tighter"
          style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'nowrap',
            alignItems: 'flex-end',
            justifyContent: 'center',
            gap: '0',
            width: '100%',
            overflowX: 'visible',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {units.map((u, i) => (
            <React.Fragment key={u.key}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flex: '0 0 auto',
                  minWidth: 0,
                  padding: '0 clamp(4px, 1vw, 16px)',
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    minWidth: u.key === 'secs' ? '2.2ch' : '2ch',
                    textAlign: 'center',
                    fontVariantNumeric: 'tabular-nums',
                    fontFeatureSettings: '"tnum" 1',
                    fontSize: 'clamp(28px, 5vw, 64px)',
                    fontWeight: 700,
                    lineHeight: 1,
                  }}
                >
                  {u.value}
                </span>
                <span
                  className="font-sans font-medium uppercase text-foreground"
                  style={{ fontSize: '10px', letterSpacing: '0.15em', opacity: 0.6, marginTop: '4px', whiteSpace: 'nowrap' }}
                >
                  {u.label}
                </span>
              </div>
              {i < units.length - 2 && (
                <span
                  className="text-foreground font-thin select-none"
                  style={{ alignSelf: 'center', opacity: 0.2, fontSize: 'clamp(16px, 2vw, 28px)', flex: '0 0 auto', lineHeight: 1, marginBottom: '18px' }}
                >|</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <div className="flex flex-col bg-card rounded-none border border-border shadow-sm text-center" style={{ padding: '32px', minHeight: '160px' }}>
          <div className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2">Free Years Remaining</div>
          <div ref={yearsRef} className="font-bold font-mono text-accent leading-none mb-3" style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
            {(Math.max(0, freeHoursRemaining) / 8760).toFixed(1)}
          </div>
          <div className="text-xs uppercase tracking-widest opacity-40 font-bold mt-auto pt-2 border-t border-border">Years of life that are truly yours</div>
        </div>

        <div className="flex flex-col bg-card rounded-none border border-border shadow-sm text-center" style={{ padding: '32px', minHeight: '160px' }}>
          <div className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2">Free Saturdays Remaining</div>
          <div ref={saturdaysRef} className="font-bold font-mono text-foreground leading-none mb-3" style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
            {Math.floor(Math.max(0, freeHoursRemaining) / 8).toLocaleString()}
          </div>
          <div className="text-xs uppercase tracking-widest opacity-40 font-bold mt-auto pt-2 border-t border-border">A full free day = 8 waking hours</div>
        </div>
      </div>
    </div>
  );
}
