import React from 'react';
import { StepperSlider } from './StepperSlider';
import { LIFE_EXPECTANCY } from '../lib/lifeExpectancy';
import { EDUCATION_LEVELS } from '../lib/educationLevels';
import { Info, User, Moon, Briefcase, GraduationCap, Coffee, Car, Smartphone } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface Props {
  state: any;
  lifeExpectancy: number;
}

export function ControlsPanel({ state, lifeExpectancy }: Props) {
  const countries = Object.keys(LIFE_EXPECTANCY).sort();

  const SectionTitle = ({ children, icon: Icon }: { children: React.ReactNode; icon?: React.ComponentType<{ className?: string }> }) => (
    <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/50 mt-8 mb-4 flex items-center">
      {Icon && <Icon className="w-4 h-4 mr-2 opacity-80" />}
      {children}
    </h3>
  );

  const ControlRow = ({
    label, value, min, max, step, onChange, color, tooltip, name, sublabel
  }: any) => {
    const isOverridden = state.overrides[name];
    const isAuto = ['workHoursPerWeek', 'workStartAge', 'retirementAge', 'socialMediaHoursPerDay', 'tvHoursPerDay', 'streamingHoursPerDay'].includes(name) && !isOverridden;

    return (
      <StepperSlider
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={onChange}
        label={label}
        sublabel={sublabel}
        isAutoDefault={isAuto}
        isModified={isOverridden}
        categoryColor={color}
        tooltip={tooltip}
      />
    );
  };

  const eduTotalHours = EDUCATION_LEVELS
    .filter((l: typeof EDUCATION_LEVELS[0]) => state.selectedEducationLevels.includes(l.id))
    .reduce((sum: number, l: typeof EDUCATION_LEVELS[0]) => sum + l.years * l.daysPerYear * l.hoursPerDay, 0);

  const eduCalendarYears = EDUCATION_LEVELS
    .filter((l: typeof EDUCATION_LEVELS[0]) => state.selectedEducationLevels.includes(l.id))
    .reduce((sum: number, l: typeof EDUCATION_LEVELS[0]) => sum + l.years, 0);

  return (
    <div className="bg-card border border-border p-5 md:p-6 shadow-sm overflow-hidden h-full flex flex-col">
      <div className="overflow-y-auto pr-2 -mr-2">
        <h2 className="text-xl font-bold font-mono tracking-tight mb-4">PARAMETERS</h2>

        <div className="bg-accent/10 border border-accent/20 p-3 rounded text-sm text-foreground/80 mb-6">
          <p className="font-medium mb-1">Data-backed Defaults</p>
          <p className="opacity-80 text-xs">All defaults are drawn from real research data — BLS American Time Use Survey, Gallup 2024, DemandSage 2026, UN WPP 2024. Adjust any value to model your own life. Changed values are highlighted.</p>
        </div>

        <SectionTitle icon={User}>Your Profile</SectionTitle>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest opacity-50 block mb-1">Age</label>
            <input
              type="number"
              value={state.currentAge}
              onChange={e => { const v = parseInt(e.target.value); if (!isNaN(v) && v >= 1 && v <= 100) state.setCurrentAge(v); }}
              className="w-full bg-background border border-border px-3 py-2 text-sm font-mono font-bold focus:outline-none focus:border-accent"
              min={1} max={100}
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest opacity-50 block mb-1">Sex</label>
            <div className="flex bg-background border border-border p-1">
              <button
                onClick={() => state.setGender('male')}
                className={`flex-1 text-xs font-bold uppercase py-1.5 transition-colors ${state.gender === 'male' ? 'bg-card shadow-sm text-foreground' : 'opacity-50'}`}
              >M</button>
              <button
                onClick={() => state.setGender('female')}
                className={`flex-1 text-xs font-bold uppercase py-1.5 transition-colors ${state.gender === 'female' ? 'bg-card shadow-sm text-foreground' : 'opacity-50'}`}
              >F</button>
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

        <div className="mb-2 p-3 bg-background border border-border">
          <div className="flex justify-between items-center">
            <div className="text-xs font-bold uppercase tracking-widest opacity-50 flex items-center gap-1">
              Life Expectancy
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3.5 h-3.5 opacity-40 hover:opacity-100 transition-opacity" />
                </TooltipTrigger>
                <TooltipContent className="max-w-[200px] text-xs">
                  Set automatically from UN WPP 2024 data for your country and sex. Click Override to set manually.
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex items-center gap-2">
              {state.overrideLifeExp ? (
                <input
                  type="number"
                  value={state.customLifeExp}
                  min={50} max={120} step={0.1}
                  onChange={e => state.setCustomLifeExp(parseFloat(e.target.value) || 50)}
                  className="w-20 bg-card border border-border px-2 py-1 text-sm font-mono font-bold text-right focus:outline-none focus:border-accent"
                  style={{ color: 'var(--life-exp-color)' }}
                />
              ) : (
                <div className="font-mono font-bold text-lg" style={{ color: 'var(--life-exp-color)' }}>{lifeExpectancy.toFixed(1)}</div>
              )}
              <button
                onClick={() => {
                  if (!state.overrideLifeExp) state.setCustomLifeExp(parseFloat(lifeExpectancy.toFixed(1)));
                  state.setOverrideLifeExp(!state.overrideLifeExp);
                }}
                className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 border transition-colors ${state.overrideLifeExp ? 'bg-accent text-white border-accent' : 'border-border opacity-60 hover:opacity-100'}`}
              >Override</button>
            </div>
          </div>
          <div className="text-[10px] uppercase tracking-widest opacity-40 font-bold mt-2">Source: UN WPP 2024</div>
        </div>

        <SectionTitle icon={Moon}>Sleep</SectionTitle>
        <ControlRow name="sleepHoursPerNight" label="Hours per night" value={state.sleepHoursPerNight} min={4} max={12} step={0.5} onChange={state.setSleepHoursPerNight} color="var(--cat-sleep)" />

        <SectionTitle icon={Briefcase}>Work</SectionTitle>
        <ControlRow name="workHoursPerWeek" label="Hours per week" value={state.workHoursPerWeek} min={0} max={80} step={1} onChange={state.setWorkHoursPerWeek} color="var(--cat-work)" />
        <div className="grid grid-cols-2 gap-4 mt-2 mb-2">
          <ControlRow name="workStartAge" label="Start Age" value={state.workStartAge} min={16} max={40} step={1} onChange={state.setWorkStartAge} color="var(--cat-work)" />
          <ControlRow name="retirementAge" label="Retire Age" value={state.retirementAge} min={40} max={85} step={1} onChange={state.setRetirementAge} color="var(--cat-work)" />
        </div>

        <SectionTitle icon={GraduationCap}>Education</SectionTitle>
        <div className="flex flex-wrap gap-2 mb-3">
          {EDUCATION_LEVELS.map((level: typeof EDUCATION_LEVELS[0]) => {
            const isActive = state.selectedEducationLevels.includes(level.id);
            return (
              <button
                key={level.id}
                onClick={() => state.toggleEducationLevel(level.id)}
                className={`flex flex-col items-start px-3 py-2 text-xs font-bold border transition-colors ${
                  isActive
                    ? 'bg-[#ffd300] text-[#1A1A1A] border-[#ffd300]'
                    : 'bg-transparent border-border text-foreground/60 hover:border-foreground/40'
                }`}
              >
                <span>{level.label}</span>
                <span className={`text-[10px] font-normal ${isActive ? 'opacity-70' : 'opacity-50'}`}>{level.sublabel}</span>
              </button>
            );
          })}
        </div>
        <div className="text-xs font-bold opacity-50 mb-4">
          Total education time: {Math.round(eduTotalHours).toLocaleString()} instruction hours across {eduCalendarYears} calendar years
        </div>

        <SectionTitle icon={Coffee}>Daily Habits (Hours/Day)</SectionTitle>
        <ControlRow name="eatingHoursPerDay" label="Eating & Prep" value={state.eatingHoursPerDay} min={0.5} max={4} step={0.25} onChange={state.setEatingHoursPerDay} color="var(--cat-eating)" tooltip="US avg ~67min eating + ~30min food prep" />
        <ControlRow name="groomingHoursPerDay" label="Grooming & Hygiene" value={state.groomingHoursPerDay} min={0.25} max={2} step={0.25} onChange={state.setGroomingHoursPerDay} color="var(--cat-grooming)" tooltip="Shower, dressing, bathroom" />
        <ControlRow name="choresHoursPerDay" label="Household Chores" value={state.choresHoursPerDay} min={0} max={4} step={0.25} onChange={state.setChoresHoursPerDay} color="var(--cat-chores)" tooltip="BLS American Time Use Survey avg: ~1.5h/day" />

        <SectionTitle icon={Car}>Commute</SectionTitle>
        <ControlRow name="commuteHoursPerDay" label="Commuting" value={state.commuteHoursPerDay} min={0} max={4} step={0.25} onChange={state.setCommuteHoursPerDay} color="var(--cat-commute)" tooltip="US Census avg: ~52 min/day round trip. Applied only during working years." />

        <SectionTitle icon={Smartphone}>Time Wasters</SectionTitle>
        <ControlRow
          name="socialMediaHoursPerDay"
          label="Social Media & Doomscrolling"
          value={state.socialMediaHoursPerDay} min={0} max={8} step={0.25}
          onChange={state.setSocialMediaHoursPerDay} color="var(--cat-social)"
          tooltip="Source: Gallup 2024. Global avg: 2h 21min. US avg: 2h 9min. Teen avg: 4.8h/day"
        />
        <ControlRow
          name="tvHoursPerDay"
          label="Passive TV Watching"
          value={state.tvHoursPerDay} min={0} max={10} step={0.25}
          onChange={state.setTvHoursPerDay} color="var(--cat-tv)"
          tooltip="Source: BLS American Time Use Survey — TV watching increases significantly with age."
        />
        <ControlRow
          name="streamingHoursPerDay"
          label="Streaming (Netflix, Hulu, Prime, etc.)"
          value={state.streamingHoursPerDay} min={0} max={6} step={0.25}
          onChange={state.setStreamingHoursPerDay} color="var(--cat-streaming)"
          tooltip="Source: Nielsen 2025, SQ Magazine H1 2025 · North America VOD avg: ~1.15h/day · Streaming now captures ~47% of total TV time. Excludes YouTube."
        />

        <button
          onClick={state.resetDefaults}
          className="w-full mt-8 py-3 px-4 bg-transparent border border-accent text-accent font-bold uppercase tracking-widest text-sm hover:bg-accent hover:text-white transition-colors"
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  );
}
