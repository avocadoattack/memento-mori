import React from 'react';
import { CustomSlider } from './CustomSlider';
import { LIFE_EXPECTANCY } from '../lib/lifeExpectancy';
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
    label, value, min, max, step, onChange, color, tooltip, secondaryLabel, name
  }: any) => {
    const isOverridden = state.overrides[name];
    const isAuto = ['workHoursPerWeek', 'workStartAge', 'retirementAge', 'socialMediaHoursPerDay', 'tvHoursPerDay'].includes(name) && !isOverridden;

    return (
      <div className="mb-5">
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-semibold flex items-center gap-1.5">
            {isOverridden && <span className="text-[var(--accent)] text-[10px]">●</span>}
            {label}
            {isAuto && <span className="px-1.5 py-0.5 bg-foreground/10 text-foreground/70 text-[10px] uppercase font-bold rounded">Auto</span>}
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
          <span className="font-mono text-sm font-bold opacity-70">
            {value < 10 && step < 1 ? value.toFixed(1) : Math.round(value)}
          </span>
        </div>
        <CustomSlider value={value} min={min} max={max} step={step} onChange={onChange} color={color} isOverridden={isOverridden} />
        {secondaryLabel && (
          <div className="text-[10px] uppercase tracking-wide opacity-50 mt-1.5 font-bold">
            {secondaryLabel}
          </div>
        )}
      </div>
    );
  };

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
              >
                M
              </button>
              <button
                onClick={() => state.setGender('female')}
                className={`flex-1 text-xs font-bold uppercase py-1.5 transition-colors ${state.gender === 'female' ? 'bg-card shadow-sm text-foreground' : 'opacity-50'}`}
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
                  min={50}
                  max={120}
                  step={0.1}
                  onChange={e => state.setCustomLifeExp(parseFloat(e.target.value) || 50)}
                  className="w-20 bg-card border border-border px-2 py-1 text-sm font-mono font-bold text-accent text-right focus:outline-none focus:border-accent"
                />
              ) : (
                <div className="font-mono font-bold text-lg text-accent">{lifeExpectancy.toFixed(1)}</div>
              )}
              <button
                onClick={() => {
                  if (!state.overrideLifeExp) state.setCustomLifeExp(parseFloat(lifeExpectancy.toFixed(1)));
                  state.setOverrideLifeExp(!state.overrideLifeExp);
                }}
                className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 border transition-colors ${state.overrideLifeExp ? 'bg-accent text-white border-accent' : 'border-border opacity-60 hover:opacity-100'}`}
              >
                Override
              </button>
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
        <ControlRow name="schoolYears" label="Years of schooling" value={state.schoolYears} min={0} max={25} step={1} onChange={state.setSchoolYears} color="var(--cat-school)" tooltip="K–12 = 13 yrs · +College = 17 yrs" />
        <ControlRow name="schoolHoursPerDay" label="Hours per school day" value={state.schoolHoursPerDay} min={4} max={10} step={0.5} onChange={state.setSchoolHoursPerDay} color="var(--cat-school)" />

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
