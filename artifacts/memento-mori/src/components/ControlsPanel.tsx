import React from 'react';
import { CustomSlider } from './CustomSlider';
import { LIFE_EXPECTANCY } from '../lib/lifeExpectancy';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface Props {
  state: any;
  lifeExpectancy: number;
}

export function ControlsPanel({ state, lifeExpectancy }: Props) {
  const countries = Object.keys(LIFE_EXPECTANCY).sort();

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/50 mt-8 mb-4">{children}</h3>
  );

  const ControlRow = ({ 
    label, value, min, max, step, onChange, color, tooltip, secondaryLabel
  }: any) => (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-semibold flex items-center gap-1.5">
          {label}
          {tooltip && (
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-3.5 h-3.5 opacity-40 hover:opacity-100 transition-opacity" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[200px] text-xs">
                {tooltip}
              </TooltipContent>
            </Tooltip>
          )}
        </label>
        <span className="font-mono text-sm font-bold opacity-70">{value}</span>
      </div>
      <CustomSlider value={value} min={min} max={max} step={step} onChange={onChange} color={color} />
      {secondaryLabel && (
        <div className="text-[10px] uppercase tracking-wide opacity-50 mt-1.5 font-bold">
          {secondaryLabel}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-card border border-border p-5 md:p-6 shadow-sm overflow-hidden h-full flex flex-col">
      <div className="overflow-y-auto pr-2 -mr-2">
        <h2 className="text-xl font-bold font-mono tracking-tight mb-6">PARAMETERS</h2>
        
        <SectionTitle>Your Profile</SectionTitle>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest opacity-50 block mb-1">Age</label>
            <input 
              type="number" 
              value={state.currentAge} 
              onChange={e => state.setCurrentAge(parseInt(e.target.value) || 0)}
              className="w-full bg-background border border-border px-3 py-2 text-sm font-mono font-bold focus:outline-none focus:border-accent"
              min={1} max={100}
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest opacity-50 block mb-1">Sex</label>
            <div className="flex bg-background border border-border p-1">
              <button 
                onClick={() => state.setGender('male')}
                className={`flex-1 text-xs font-bold uppercase py-1.5 ${state.gender === 'male' ? 'bg-card shadow-sm text-foreground' : 'opacity-50'}`}
              >
                M
              </button>
              <button 
                onClick={() => state.setGender('female')}
                className={`flex-1 text-xs font-bold uppercase py-1.5 ${state.gender === 'female' ? 'bg-card shadow-sm text-foreground' : 'opacity-50'}`}
              >
                F
              </button>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="text-xs font-bold uppercase tracking-widest opacity-50 block mb-1">Country</label>
          <select 
            value={state.country} 
            onChange={e => state.setCountry(e.target.value)}
            className="w-full bg-background border border-border px-3 py-2 text-sm font-bold focus:outline-none focus:border-accent"
          >
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="mb-2 p-3 bg-background border border-border flex justify-between items-center">
          <div className="text-xs font-bold uppercase tracking-widest opacity-50">Life Expectancy</div>
          <div className="font-mono font-bold text-lg text-accent">{lifeExpectancy.toFixed(1)}</div>
        </div>
        <p className="text-[10px] opacity-40 uppercase tracking-widest text-right">Source: UN WPP 2024</p>

        <SectionTitle>Sleep</SectionTitle>
        <ControlRow label="Hours per night" value={state.sleepHoursPerNight} min={4} max={12} step={0.5} onChange={state.setSleepHoursPerNight} color="var(--cat-sleep)" />

        <SectionTitle>Work</SectionTitle>
        <ControlRow label="Hours per week" value={state.workHoursPerWeek} min={0} max={80} step={1} onChange={state.setWorkHoursPerWeek} color="var(--cat-work)" />
        <div className="grid grid-cols-2 gap-4 mt-2 mb-2">
          <ControlRow label="Start Age" value={state.workStartAge} min={16} max={40} step={1} onChange={state.setWorkStartAge} color="var(--cat-work)" />
          <ControlRow label="Retire Age" value={state.retirementAge} min={40} max={85} step={1} onChange={state.setRetirementAge} color="var(--cat-work)" />
        </div>

        <SectionTitle>Education</SectionTitle>
        <ControlRow label="Years of schooling" value={state.schoolYears} min={0} max={25} step={1} onChange={state.setSchoolYears} color="var(--cat-school)" tooltip="K–12 = 13 yrs · +College = 17 yrs" />
        <ControlRow label="Hours per school day" value={state.schoolHoursPerDay} min={4} max={10} step={0.5} onChange={state.setSchoolHoursPerDay} color="var(--cat-school)" />

        <SectionTitle>Daily Habits (Hours/Day)</SectionTitle>
        <ControlRow label="Eating & Prep" value={state.eatingHoursPerDay} min={0.5} max={4} step={0.25} onChange={state.setEatingHoursPerDay} color="var(--cat-eating)" tooltip="US avg ~67min eating + ~30min food prep" />
        <ControlRow label="Grooming & Hygiene" value={state.groomingHoursPerDay} min={0.25} max={2} step={0.25} onChange={state.setGroomingHoursPerDay} color="var(--cat-grooming)" tooltip="Shower, dressing, bathroom" />
        <ControlRow label="Household Chores" value={state.choresHoursPerDay} min={0} max={4} step={0.25} onChange={state.setChoresHoursPerDay} color="var(--cat-chores)" tooltip="BLS American Time Use Survey avg: ~1.5h/day" />
        <ControlRow label="Commuting" value={state.commuteHoursPerDay} min={0} max={4} step={0.25} onChange={state.setCommuteHoursPerDay} color="var(--cat-commute)" tooltip="US Census avg: ~52 min/day round trip. Applied only during working years." />

        <SectionTitle>Time Wasters</SectionTitle>
        <ControlRow 
          label="Social Media & Doomscrolling" 
          value={state.socialMediaHoursPerDay} min={0} max={8} step={0.25} 
          onChange={state.setSocialMediaHoursPerDay} color="var(--cat-social)" 
          tooltip="Source: Gallup 2024. Global avg: 2h 21min. US avg: 2h 9min. Teen avg: 4.8h/day"
          secondaryLabel={`Estimated years of your life: ${((state.socialMediaHoursPerDay * 365.25 * lifeExpectancy) / 8760).toFixed(1)} years`}
        />
        <ControlRow 
          label="Passive TV Watching" 
          value={state.tvHoursPerDay} min={0} max={10} step={0.25} 
          onChange={state.setTvHoursPerDay} color="var(--cat-tv)" 
          tooltip="BLS American Time Use Survey: US avg ~3.5h/day"
          secondaryLabel={`Estimated years of your life: ${((state.tvHoursPerDay * 365.25 * lifeExpectancy) / 8760).toFixed(1)} years`}
        />
      </div>
    </div>
  );
}
