import React, { useEffect, useRef } from 'react';
import { countTo } from '../lib/countTo';

interface Props {
  stats: any;
}

const StatCard = ({ title, value, color, large = false, unit = "", isPercent = false, perspectiveLine = "", secondaryPerspective = "" }: any) => {
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
      <div className="flex items-baseline gap-1 mb-2">
        <div 
          ref={numRef} 
          className={`font-mono font-bold tracking-tighter ${large ? 'text-5xl md:text-6xl text-[var(--accent)]' : 'text-2xl md:text-3xl'}`}
          style={!large ? { color } : {}}
        >
          {isPercent ? value.toFixed(1) + '%' : value < 1000 ? value.toFixed(1) : value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </div>
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
  const getMotivationalText = (pct: number) => {
    if (pct < 5) return "You are essentially living for everyone and everything except yourself.";
    if (pct < 10) return "Less than one hour in ten belongs to you. The clock is already running.";
    if (pct < 20) return `Only ${pct.toFixed(1)}% of your waking life is discretionary. Use it like it's scarce — because it is.`;
    if (pct < 35) return "You have more than most. The question is what you'll build with it.";
    return "You have unusual freedom. Most people don't. Treat that as the obligation it is.";
  };

  const weekends = Math.round(stats.freeHours / 48);
  const saturdayYears = (stats.freeHours / (52 * 8)).toFixed(1);

  return (
    <div>
      {stats.freeHours < 0 && (
        <div className="bg-[var(--accent)] text-white p-4 font-bold text-center mb-8 uppercase tracking-widest text-sm">
          Warning: Your habits leave you with no free time. Something has to give.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-12">
        <StatCard 
          title="FREE HOURS" 
          value={stats.freeHours} 
          color="var(--accent)" 
          large={true} 
          perspectiveLine={`That's ${weekends.toLocaleString()} free weekends — ${saturdayYears} years of Saturdays`}
        />
        
        <div className="col-span-1 sm:col-span-2 mb-4">
          <div className="text-xs font-bold uppercase tracking-widest opacity-50 mb-2">Taken Time Breakdown</div>
          <div className="w-full h-6 flex rounded overflow-hidden shadow-sm">
            <div title="Sleep" className="h-full bg-[var(--cat-sleep)] transition-all hover:opacity-80" style={{ width: `${(stats.sleepHours_total/stats.totalTaken)*100}%` }}></div>
            <div title="Work" className="h-full bg-[var(--cat-work)] transition-all hover:opacity-80" style={{ width: `${(stats.workHours_total/stats.totalTaken)*100}%` }}></div>
            <div title="School" className="h-full bg-[var(--cat-school)] transition-all hover:opacity-80" style={{ width: `${(stats.schoolHours_total/stats.totalTaken)*100}%` }}></div>
            <div title="Eating" className="h-full bg-[var(--cat-eating)] transition-all hover:opacity-80" style={{ width: `${(stats.eatingHours_total/stats.totalTaken)*100}%` }}></div>
            <div title="Grooming" className="h-full bg-[var(--cat-grooming)] transition-all hover:opacity-80" style={{ width: `${(stats.groomingHours_total/stats.totalTaken)*100}%` }}></div>
            <div title="Chores" className="h-full bg-[var(--cat-chores)] transition-all hover:opacity-80" style={{ width: `${(stats.choresHours_total/stats.totalTaken)*100}%` }}></div>
            <div title="Commute" className="h-full bg-[var(--cat-commute)] transition-all hover:opacity-80" style={{ width: `${(stats.commuteHours_total/stats.totalTaken)*100}%` }}></div>
            <div title="Social Media" className="h-full bg-[var(--cat-social)] transition-all hover:opacity-80" style={{ width: `${(stats.socialMediaHours_total/stats.totalTaken)*100}%` }}></div>
            <div title="TV" className="h-full bg-[var(--cat-tv)] transition-all hover:opacity-80" style={{ width: `${(stats.tvHours_total/stats.totalTaken)*100}%` }}></div>
          </div>
        </div>

        <StatCard 
          title="Sleeping" value={stats.sleepHours_total} color="var(--cat-sleep)" 
          perspectiveLine={`${stats.sleepHours_total.toLocaleString(undefined, {maximumFractionDigits:0})} hours sleeping = ${(stats.sleepHours_total/8760).toFixed(1)} years unconscious`}
        />
        <StatCard 
          title="Working" value={stats.workHours_total} color="var(--cat-work)" 
          perspectiveLine={`${stats.workHours_total.toLocaleString(undefined, {maximumFractionDigits:0})} hours = ${Math.round(stats.workHours_total/2080)} full-time work-years (at 2,080h/yr)`}
          secondaryPerspective={`That's ${(stats.workHours_total/(2080*40)).toFixed(1)} entire careers' worth of time`}
        />
        <StatCard 
          title="In School" value={stats.schoolHours_total} color="var(--cat-school)" 
          perspectiveLine={`${stats.schoolHours_total.toLocaleString(undefined, {maximumFractionDigits:0})} hours = ${(stats.schoolHours_total/3500).toFixed(1)} PhD programs worth of study time (PhD ≈ 3,500 hrs)`}
        />
        <StatCard 
          title="Eating & Cooking" value={stats.eatingHours_total} color="var(--cat-eating)" 
          perspectiveLine={`${stats.eatingHours_total.toLocaleString(undefined, {maximumFractionDigits:0})} hours eating = ${(stats.eatingHours_total/8760).toFixed(1)} years at the table`}
        />
        <StatCard 
          title="Grooming" value={stats.groomingHours_total} color="var(--cat-grooming)" 
          perspectiveLine={`${stats.groomingHours_total.toLocaleString(undefined, {maximumFractionDigits:0})} hours grooming = ${Math.round(stats.groomingHours_total/24).toLocaleString()} days in front of the mirror`}
        />
        <StatCard 
          title="Chores" value={stats.choresHours_total} color="var(--cat-chores)" 
          perspectiveLine={`${stats.choresHours_total.toLocaleString(undefined, {maximumFractionDigits:0})} hours on chores = ${Math.round(stats.choresHours_total/8760)} years of domestic labor`}
        />
        <StatCard 
          title="Commuting" value={stats.commuteHours_total} color="var(--cat-commute)" 
          perspectiveLine={`${stats.commuteHours_total.toLocaleString(undefined, {maximumFractionDigits:0})} hours commuting = ${Math.round(stats.commuteHours_total/40).toLocaleString()} round trips from New York to Los Angeles by car (approx 40 hrs each)`}
        />
        
        <StatCard 
          title="Social Media" value={stats.socialMediaHours_total} color="var(--cat-social)" 
          perspectiveLine={`${stats.socialMediaHours_total.toLocaleString(undefined, {maximumFractionDigits:0})} hours = ${Math.round(stats.socialMediaHours_total/6).toLocaleString()} books you could have read`}
          secondaryPerspective={`Or ${Math.round(stats.socialMediaHours_total/700).toLocaleString()} languages learned to conversational level`}
        />
        <StatCard 
          title="Passive TV" value={stats.tvHours_total} color="var(--cat-tv)" 
          perspectiveLine={`${stats.tvHours_total.toLocaleString(undefined, {maximumFractionDigits:0})} hours = ${Math.round(stats.tvHours_total/1).toLocaleString()} gym sessions you could have done`}
          secondaryPerspective={`Or ${Math.round(stats.tvHours_total/49).toLocaleString()} complete rewatches of Breaking Bad`}
        />
      </div>

      <div className="text-center py-12 px-4 border-t border-border mt-8">
        <p className="text-xl md:text-3xl font-serif italic max-w-4xl mx-auto leading-relaxed text-foreground opacity-90">
          "{getMotivationalText(stats.pctLifeYours)}"
        </p>
      </div>
    </div>
  );
}
