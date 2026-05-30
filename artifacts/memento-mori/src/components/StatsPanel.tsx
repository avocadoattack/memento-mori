import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface Props {
  stats: any;
}

const StatCard = ({ title, value, color, large = false, unit = "", isPercent = false }: any) => {
  const numRef = useRef<HTMLDivElement>(null);
  const prevValue = useRef(value);

  useEffect(() => {
    try {
      if (numRef.current && prevValue.current !== value) {
        gsap.to(numRef.current, {
          innerHTML: value,
          duration: 0.6,
          snap: { innerHTML: isPercent || value < 1000 ? 0.1 : 1 },
          ease: "power2.out",
          onUpdate: function() {
            const val = Number(this.targets()[0].innerHTML);
            if (isPercent || value < 1000) {
              numRef.current!.innerHTML = val.toFixed(1) + (isPercent ? '%' : '');
            } else {
              numRef.current!.innerHTML = val.toLocaleString(undefined, { maximumFractionDigits: 0 });
            }
          }
        });
        prevValue.current = value;
      } else if (numRef.current && prevValue.current === value) {
        if (isPercent || value < 1000) {
          numRef.current.innerHTML = value.toFixed(1) + (isPercent ? '%' : '');
        } else {
          numRef.current.innerHTML = value.toLocaleString(undefined, { maximumFractionDigits: 0 });
        }
      }
    } catch (e) {}
  }, [value, isPercent]);

  return (
    <div 
      className={`bg-card border border-border p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group ${large ? 'col-span-2 md:col-span-4 bg-background' : ''}`}
      onMouseEnter={(e) => {
        gsap.to(e.currentTarget, { y: -4, duration: 0.2 });
      }}
      onMouseLeave={(e) => {
        gsap.to(e.currentTarget, { y: 0, duration: 0.2 });
      }}
    >
      <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: color }} />
      <h4 className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2">{title}</h4>
      <div className="flex items-baseline gap-1">
        <div 
          ref={numRef} 
          className={`font-mono font-bold tracking-tighter ${large ? 'text-5xl md:text-7xl text-[var(--accent)]' : 'text-2xl md:text-3xl'}`}
          style={!large ? { color } : {}}
        >
          {isPercent ? value.toFixed(1) + '%' : value < 1000 ? value.toFixed(1) : value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </div>
        {unit && <span className="text-xs font-bold uppercase opacity-50 tracking-widest">{unit}</span>}
      </div>
    </div>
  );
};

export function StatsPanel({ stats }: Props) {
  const getMotivationalText = (pct: number) => {
    if (pct < 5) return "You are essentially living for everyone and everything except yourself.";
    if (pct < 10) return "Less than one hour in ten belongs to you. The clock is already running.";
    if (pct < 20) return `Only ${pct.toFixed(1)}% of your waking life is discretionary. Use it like it's scarce — because it is.`;
    if (pct < 35) return "You have more than most. The question is what you'll build with it.";
    return "You have unusual freedom. Most people don't. Treat that as the obligation it is.";
  };

  const freeHoursRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    try {
      if (stats.pctLifeYours < 10 && freeHoursRef.current) {
        gsap.to(freeHoursRef.current, {
          boxShadow: "0 0 20px 2px rgba(230, 57, 70, 0.4)",
          repeat: -1,
          yoyo: true,
          duration: 1
        });
      } else if (freeHoursRef.current) {
        gsap.killTweensOf(freeHoursRef.current);
        gsap.to(freeHoursRef.current, { boxShadow: "none", duration: 0.2 });
      }
    } catch(e) {}
  }, [stats.pctLifeYours]);

  return (
    <div>
      {stats.freeHours < 0 && (
        <div className="bg-[var(--accent)] text-white p-4 font-bold text-center mb-8 uppercase tracking-widest text-sm">
          Warning: Your habits leave you with no free time. Something has to give.
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
        <StatCard title="Total Life Hours" value={stats.totalLifeHours} color="var(--foreground)" />
        <StatCard title="Sleeping" value={stats.sleepHours_total} color="var(--cat-sleep)" />
        <StatCard title="Working" value={stats.workHours_total} color="var(--cat-work)" />
        <StatCard title="In School" value={stats.schoolHours_total} color="var(--cat-school)" />
        
        <StatCard title="Eating & Cooking" value={stats.eatingHours_total} color="var(--cat-eating)" />
        <StatCard title="Grooming" value={stats.groomingHours_total} color="var(--cat-grooming)" />
        <StatCard title="Chores" value={stats.choresHours_total} color="var(--cat-chores)" />
        <StatCard title="Commuting" value={stats.commuteHours_total} color="var(--cat-commute)" />
        
        <StatCard title="Social Media" value={stats.socialMediaHours_total} color="var(--cat-social)" />
        <StatCard title="Passive TV" value={stats.tvHours_total} color="var(--cat-tv)" />
        <StatCard title="TOTAL TAKEN" value={stats.totalTaken} color="var(--accent)" />
        <StatCard title="% Life That's Yours" value={stats.pctLifeYours} color="var(--accent)" isPercent={true} />

        <div ref={freeHoursRef} className="col-span-2 md:col-span-4">
          <StatCard title="FREE HOURS" value={stats.freeHours} color="var(--accent)" large={true} />
        </div>
        
        <StatCard title="FREE YEARS" value={stats.freeYears} color="var(--accent)" unit="years" />
        <StatCard title="FREE WEEKS" value={stats.freeWeeks} color="var(--accent)" unit="weeks" />
      </div>

      <div className="text-center py-12 px-4 border-t border-border mt-8">
        <p className="text-xl md:text-3xl font-serif italic max-w-4xl mx-auto leading-relaxed text-foreground opacity-90">
          "{getMotivationalText(stats.pctLifeYours)}"
        </p>
      </div>
    </div>
  );
}
