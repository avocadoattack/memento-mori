import React, { useEffect, useRef, useState } from 'react';
import { countTo } from '../lib/countTo';
import type { LifeCalcStats } from '../hooks/useLifeCalc';

interface Props {
  stats: LifeCalcStats;
}

interface StatCardProps {
  title: string;
  value: number;
  color: string;
  large?: boolean;
  unit?: string;
  isPercent?: boolean;
  perspectiveLine?: string;
  secondaryPerspective?: string;
  showHours?: boolean;
}

const StatCard = ({ title, value, color, large = false, unit = "", isPercent = false, perspectiveLine = "", secondaryPerspective = "", showHours = false }: StatCardProps) => {
  const numRef = useRef<HTMLDivElement>(null);
  const prevValue = useRef(value);

  useEffect(() => {
    if (!numRef.current || prevValue.current === value) return;
    const cancel = countTo(prevValue.current, value, 0.6, (val) => {
      if (!numRef.current) return;
      if (isPercent || value < 1000) {
        numRef.current.innerHTML = val.toFixed(1) + (isPercent ? '%' : '');
      } else {
        numRef.current.innerHTML = val.toLocaleString(undefined, { maximumFractionDigits: 0 });
      }
    });
    prevValue.current = value;
    return cancel;
  }, [value, isPercent]);

  return (
    <div className={`bg-card border border-border p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group ${large ? 'col-span-2 bg-background' : ''}`}>
      <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: color }} />
      <h4 className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2">{title}</h4>
      <div className="flex items-baseline gap-2 mb-2">
        <div
          ref={numRef}
          className={`font-mono font-bold tracking-tighter ${large ? 'text-5xl md:text-6xl text-[var(--accent)]' : 'text-2xl md:text-3xl'}`}
          style={!large ? { color } : {}}
        >
          {isPercent ? value.toFixed(1) + '%' : value < 1000 ? value.toFixed(1) : value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </div>
        {showHours && (
          <span style={{ fontSize: '18px', color: color, opacity: 0.7, fontWeight: 600 }}>hours</span>
        )}
        {unit && <span className="text-xs font-bold uppercase opacity-50 tracking-widest">{unit}</span>}
      </div>

      {perspectiveLine && (
        <div className="mt-4 border-t border-border pt-3">
          <p className="font-bold text-sm md:text-base leading-snug">{perspectiveLine}</p>
          {secondaryPerspective && <p className="opacity-70 text-xs mt-1">{secondaryPerspective}</p>}
        </div>
      )}
    </div>
  );
};

export function StatsPanel({ stats }: Props) {
  const [barTooltip, setBarTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  const getMotivationalText = (pct: number) => {
    if (pct < 5) return "You are essentially living for everyone and everything except yourself.";
    if (pct < 10) return "Less than one hour in ten belongs to you. The clock is already running.";
    if (pct < 20) return `Only ${pct.toFixed(1)}% of your waking life is discretionary. Use it like it's scarce — because it is.`;
    if (pct < 35) return "You have more than most. The question is what you'll build with it.";
    return "You have unusual freedom. Most people don't. Treat that as the obligation it is.";
  };

  const onSegHover = (e: React.MouseEvent, name: string, hours: number) => {
    const pct = ((hours / stats.totalLifeHours) * 100).toFixed(1);
    setBarTooltip({
      x: e.clientX,
      y: e.clientY,
      text: `${name} · ${Math.round(hours).toLocaleString()} hrs · ${pct}% of life`,
    });
  };

  const onSegClick = (e: React.MouseEvent, name: string, hours: number) => {
    const pct = ((hours / stats.totalLifeHours) * 100).toFixed(1);
    const text = `${name} · ${Math.round(hours).toLocaleString()} hrs · ${pct}% of life`;
    setBarTooltip(prev => (prev && prev.text === text ? null : { x: e.clientX, y: e.clientY, text }));
  };

  return (
    <div>
      {stats.freeHours < 0 && (
        <div className="bg-[var(--accent)] text-white p-4 font-bold text-center mb-8 uppercase tracking-widest text-sm">
          Warning: Your habits leave you with no free time. Something has to give.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 max-md:grid-cols-2 gap-4 md:gap-6 mb-12">
        <StatCard
          title="FREE MONTHS REMAINING"
          value={stats.freeMonths}
          color="var(--accent)"
          large={true}
          perspectiveLine="Months with no obligations — after everything is subtracted"
        />

        <div className="col-span-1 sm:col-span-2 max-md:col-span-2 mb-4">
          <div className="text-xs font-bold uppercase tracking-widest opacity-50 mb-2">Where Your Life Goes</div>
          <div className="w-full h-6 flex rounded overflow-hidden shadow-sm">
            <div title="Sleep" className="h-full bg-[var(--cat-sleep)] transition-all hover:opacity-80 cursor-pointer" style={{ width: `${(stats.sleepHours_total/stats.totalTaken)*100}%` }} onMouseEnter={(e) => onSegHover(e, 'Sleep', stats.sleepHours_total)} onMouseLeave={() => setBarTooltip(null)} onClick={(e) => onSegClick(e, 'Sleep', stats.sleepHours_total)} />
            <div title="Work" className="h-full bg-[var(--cat-work)] transition-all hover:opacity-80 cursor-pointer" style={{ width: `${(stats.workHours_total/stats.totalTaken)*100}%` }} onMouseEnter={(e) => onSegHover(e, 'Work', stats.workHours_total)} onMouseLeave={() => setBarTooltip(null)} onClick={(e) => onSegClick(e, 'Work', stats.workHours_total)} />
            <div title="School" className="h-full bg-[var(--cat-school)] transition-all hover:opacity-80 cursor-pointer" style={{ width: `${(stats.schoolHours_total/stats.totalTaken)*100}%` }} onMouseEnter={(e) => onSegHover(e, 'School', stats.schoolHours_total)} onMouseLeave={() => setBarTooltip(null)} onClick={(e) => onSegClick(e, 'School', stats.schoolHours_total)} />
            <div title="Eating" className="h-full bg-[var(--cat-eating)] transition-all hover:opacity-80 cursor-pointer" style={{ width: `${(stats.eatingHours_total/stats.totalTaken)*100}%` }} onMouseEnter={(e) => onSegHover(e, 'Eating & Cooking', stats.eatingHours_total)} onMouseLeave={() => setBarTooltip(null)} onClick={(e) => onSegClick(e, 'Eating & Cooking', stats.eatingHours_total)} />
            <div title="Grooming" className="h-full bg-[var(--cat-grooming)] transition-all hover:opacity-80 cursor-pointer" style={{ width: `${(stats.groomingHours_total/stats.totalTaken)*100}%` }} onMouseEnter={(e) => onSegHover(e, 'Grooming', stats.groomingHours_total)} onMouseLeave={() => setBarTooltip(null)} onClick={(e) => onSegClick(e, 'Grooming', stats.groomingHours_total)} />
            <div title="Chores" className="h-full bg-[var(--cat-chores)] transition-all hover:opacity-80 cursor-pointer" style={{ width: `${(stats.choresHours_total/stats.totalTaken)*100}%` }} onMouseEnter={(e) => onSegHover(e, 'Chores', stats.choresHours_total)} onMouseLeave={() => setBarTooltip(null)} onClick={(e) => onSegClick(e, 'Chores', stats.choresHours_total)} />
            <div title="Commute" className="h-full bg-[var(--cat-commute)] transition-all hover:opacity-80 cursor-pointer" style={{ width: `${(stats.commuteHours_total/stats.totalTaken)*100}%` }} onMouseEnter={(e) => onSegHover(e, 'Commuting', stats.commuteHours_total)} onMouseLeave={() => setBarTooltip(null)} onClick={(e) => onSegClick(e, 'Commuting', stats.commuteHours_total)} />
            <div title="Social Media" className="h-full bg-[var(--cat-social)] transition-all hover:opacity-80 cursor-pointer" style={{ width: `${(stats.socialMediaHours_total/stats.totalTaken)*100}%` }} onMouseEnter={(e) => onSegHover(e, 'Social Media', stats.socialMediaHours_total)} onMouseLeave={() => setBarTooltip(null)} onClick={(e) => onSegClick(e, 'Social Media', stats.socialMediaHours_total)} />
            <div title="TV" className="h-full bg-[var(--cat-tv)] transition-all hover:opacity-80 cursor-pointer" style={{ width: `${(stats.tvHours_total/stats.totalTaken)*100}%` }} onMouseEnter={(e) => onSegHover(e, 'Passive TV', stats.tvHours_total)} onMouseLeave={() => setBarTooltip(null)} onClick={(e) => onSegClick(e, 'Passive TV', stats.tvHours_total)} />
            <div title="Streaming" className="h-full bg-[var(--cat-streaming)] transition-all hover:opacity-80 cursor-pointer" style={{ width: `${(stats.streamingHours_total/stats.totalTaken)*100}%` }} onMouseEnter={(e) => onSegHover(e, 'Streaming', stats.streamingHours_total)} onMouseLeave={() => setBarTooltip(null)} onClick={(e) => onSegClick(e, 'Streaming', stats.streamingHours_total)} />
          </div>
        </div>

        <StatCard
          title="Sleeping — cumulative lifetime" value={stats.sleepHours_total / 8760} color="var(--cat-sleep)"
          unit="yrs"
          perspectiveLine={`${stats.sleepPctOfLife.toFixed(1)}% of your life you're unconscious`}
        />
        <StatCard
          title="Working — cumulative lifetime" value={stats.workHours_total / 8760} color="var(--cat-work)"
          unit="yrs"
          perspectiveLine={`${stats.workMonths.toFixed(1)} months traded for a paycheck`}
        />
        <StatCard
          title="School — cumulative lifetime" value={stats.schoolHours_total / 8760} color="var(--cat-school)"
          unit="yrs"
          perspectiveLine={`${stats.schoolProjects.toLocaleString()} major 100-hour projects completed`}
        />
        <StatCard
          title="Eating & Cooking — cumulative lifetime" value={stats.eatingHours_total / 8760} color="var(--cat-eating)"
          unit="yrs"
          perspectiveLine={`${Math.round(stats.eatingHours_total / 24).toLocaleString()} days spent sitting at the table`}
        />
        <StatCard
          title="Grooming — cumulative lifetime" value={stats.groomingHours_total / 8760} color="var(--cat-grooming)"
          unit="yrs"
          perspectiveLine={`${Math.round(stats.groomingHours_total / 24).toLocaleString()} days in front of the mirror`}
        />
        <StatCard
          title="Chores — cumulative lifetime" value={stats.choresHours_total / 8760} color="var(--cat-chores)"
          unit="yrs"
          perspectiveLine={`${Math.round(stats.choresHours_total / 24).toLocaleString()} days fighting household entropy`}
        />
        <StatCard
          title="Commuting — cumulative lifetime" value={stats.commuteHours_total / 8760} color="var(--cat-commute)"
          unit="yrs"
          perspectiveLine={`${stats.podcastsFromCommute.toLocaleString()} educational podcasts listened to`}
        />
        <StatCard
          title="Social Media — cumulative lifetime" value={stats.socialMediaHours_total / 8760} color="var(--cat-social)"
          unit="yrs"
          perspectiveLine={`${Math.round(stats.socialMediaHours_total / 6).toLocaleString()} books you could have read`}
        />
        <StatCard
          title="Passive TV — cumulative lifetime" value={stats.tvHours_total / 8760} color="var(--cat-tv)"
          unit="yrs"
          perspectiveLine={`${Math.round(stats.tvHours_total).toLocaleString()} gym sessions you could've done`}
        />
        <StatCard
          title="Streaming — cumulative lifetime" value={stats.streamingHours_total / 8760} color="var(--cat-streaming)"
          unit="yrs"
          perspectiveLine={`${stats.languagesFluent.toLocaleString()} languages learned to fluent level`}
        />
      </div>

      {barTooltip && (
        <div
          className="fixed pointer-events-none font-mono text-xs"
          style={{
            left: barTooltip.x + 8,
            top: barTooltip.y - 44,
            zIndex: 9999,
            background: 'rgba(15,15,15,0.95)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            padding: '8px 12px',
            borderRadius: '6px',
            whiteSpace: 'nowrap',
          }}
        >
          {barTooltip.text}
        </div>
      )}

      <div className="text-center py-12 px-4 border-t border-border mt-8">
        <p className="text-xl md:text-3xl font-serif italic max-w-4xl mx-auto leading-relaxed text-foreground opacity-90">
          "{getMotivationalText(stats.pctLifeYours)}"
        </p>
      </div>
    </div>
  );
}
