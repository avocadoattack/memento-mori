import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import { StepperSlider } from './StepperSlider';
import { CountryCombobox } from './CountryCombobox';
import { LIFE_EXPECTANCY } from '../lib/lifeExpectancy';
import { EDUCATION_LEVELS } from '../lib/educationLevels';
import type { Gender } from '../hooks/useLifeCalc';

interface Props {
  calc: ReturnType<typeof import('../hooks/useLifeCalc').useLifeCalc>;
  exiting: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export function Quiz({ calc, exiting, onComplete, onSkip }: Props) {
  const { state } = calc;
  const countries = Object.keys(LIFE_EXPECTANCY).sort();

  const [ageInput, setAgeInput] = useState('');
  const [genderSel, setGenderSel] = useState<Gender | null>(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const ageNum = parseInt(ageInput, 10);
  const ageValid = !isNaN(ageNum) && ageNum >= 1 && ageNum <= 99;
  const canSubmit = ageValid && genderSel !== null;

  const handleAgeChange = (raw: string) => {
    setAgeInput(raw);
    const v = parseInt(raw, 10);
    if (!isNaN(v) && v >= 1 && v <= 99) state.setCurrentAge(v);
  };

  const handleGender = (g: Gender) => {
    setGenderSel(g);
    state.setGender(g);
  };

  const AdvancedRow = (p: {
    name: string; label: string; value: number; min: number; max: number;
    step: number; onChange: (v: number) => void; color: string; unit?: string;
  }) => {
    const isOverridden = state.overrides[p.name];
    const isAuto = ['workHoursPerWeek', 'workStartAge', 'retirementAge', 'socialMediaHoursPerDay', 'tvHoursPerDay', 'streamingHoursPerDay', 'groomingHoursPerDay'].includes(p.name) && !isOverridden;
    return (
      <StepperSlider
        value={p.value} min={p.min} max={p.max} step={p.step}
        onChange={p.onChange} label={p.label}
        isAutoDefault={isAuto} isModified={isOverridden}
        categoryColor={p.color} unit={p.unit}
      />
    );
  };

  const GroupTitle = ({ children }: { children: React.ReactNode }) => (
    <h4 className="text-xs font-bold uppercase tracking-widest text-foreground/50 mt-6 mb-3">{children}</h4>
  );

  return (
    <div
      className="min-h-[100dvh] font-sans bg-background text-foreground selection:bg-accent selection:text-white flex flex-col items-center px-4 py-12"
      style={{
        opacity: exiting ? 0 : 1,
        transition: 'opacity 0.4s ease',
      }}
    >
      <div className="w-full max-w-[540px] flex flex-col">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-bold font-mono tracking-tighter" style={{ fontSize: 'clamp(64px, 10vw, 120px)', marginBottom: '12px' }}>
            MEMENTO MORI
          </h1>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 'clamp(24px, 3.5vw, 40px)', opacity: 0.85 }}>
            Remember death
          </p>
          <p style={{ fontSize: '14px', opacity: 0.6, marginTop: '12px' }}>
            Let's calculate how much of your life is truly yours.
          </p>
        </div>

        {/* FIELD 1 — AGE */}
        <div className="mb-8 text-center">
          <label className="text-xs font-bold uppercase tracking-widest opacity-50 block mb-3">
            How old are you?
          </label>
          <input
            type="number"
            inputMode="numeric"
            value={ageInput}
            onChange={e => handleAgeChange(e.target.value)}
            min={1}
            max={99}
            placeholder="00"
            autoFocus
            className="w-40 text-center bg-transparent border-0 border-b-2 border-border focus:border-accent focus:outline-none font-mono font-bold transition-colors mx-auto"
            style={{ fontSize: '48px', padding: '4px 0' }}
          />
        </div>

        {/* FIELD 2 — GENDER */}
        <div className="mb-8">
          <label className="text-xs font-bold uppercase tracking-widest opacity-50 block mb-3 text-center">
            Gender
          </label>
          <div className="grid grid-cols-2 gap-3">
            {(['male', 'female'] as Gender[]).map(g => (
              <button
                key={g}
                type="button"
                onClick={() => handleGender(g)}
                className={`py-4 text-sm font-bold uppercase tracking-widest border-2 transition-colors ${
                  genderSel === g
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-transparent border-border text-foreground/60 hover:border-foreground/40'
                }`}
              >
                {g === 'male' ? 'Male' : 'Female'}
              </button>
            ))}
          </div>
        </div>

        {/* FIELD 3 — COUNTRY */}
        <div className="mb-8">
          <label className="text-xs font-bold uppercase tracking-widest opacity-50 block mb-3 text-center">
            Where do you live?
          </label>
          <CountryCombobox countries={countries} value={state.country} onChange={state.setCountry} />
        </div>

        {/* ADVANCED SETTINGS TOGGLE */}
        <button
          type="button"
          onClick={() => setAdvancedOpen(o => !o)}
          className="flex items-center justify-center gap-1.5 mx-auto mb-2 transition-opacity hover:opacity-100"
          style={{ fontSize: '13px', opacity: 0.6 }}
        >
          <Settings className="w-3.5 h-3.5" />
          Advanced settings
        </button>

        <div
          className="grid transition-[grid-template-rows] duration-300 ease-in-out"
          style={{ gridTemplateRows: advancedOpen ? '1fr' : '0fr' }}
        >
          <div className="overflow-hidden">
            <div className="pt-4 pb-2">
              <p style={{ fontSize: '14px', opacity: 0.7, fontStyle: 'italic', lineHeight: 1.6 }} className="mb-2">
                These defaults are drawn from real research data — BLS American Time Use Survey, Gallup 2024,
                DemandSage 2026, and UN WPP 2024. They represent population averages for your age and country.
                Override any value if your life differs significantly from the average.
              </p>

              <GroupTitle>Sleep</GroupTitle>
              <AdvancedRow name="sleepHoursPerNight" label="Hours per night" value={state.sleepHoursPerNight} min={4} max={12} step={0.5} onChange={state.setSleepHoursPerNight} color="var(--cat-sleep)" unit="h/night" />

              <GroupTitle>Work</GroupTitle>
              <AdvancedRow name="workHoursPerWeek" label="Hours per week" value={state.workHoursPerWeek} min={0} max={80} step={1} onChange={state.setWorkHoursPerWeek} color="var(--cat-work)" unit="h/week" />
              <div className="grid grid-cols-2 gap-4">
                <AdvancedRow name="workStartAge" label="Start Age" value={state.workStartAge} min={16} max={40} step={1} onChange={state.setWorkStartAge} color="var(--cat-work)" />
                <AdvancedRow name="retirementAge" label="Retire Age" value={state.retirementAge} min={40} max={85} step={1} onChange={state.setRetirementAge} color="var(--cat-work)" />
              </div>

              <GroupTitle>Education</GroupTitle>
              <div className="flex flex-wrap gap-2">
                {EDUCATION_LEVELS.map(level => {
                  const isActive = state.selectedEducationLevels.includes(level.id);
                  return (
                    <button
                      key={level.id}
                      type="button"
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

              <GroupTitle>Daily Habits (Hours/Day)</GroupTitle>
              <AdvancedRow name="eatingHoursPerDay" label="Eating & Prep" value={state.eatingHoursPerDay} min={0.5} max={4} step={0.25} onChange={state.setEatingHoursPerDay} color="var(--cat-eating)" unit="h/day" />
              <AdvancedRow name="groomingHoursPerDay" label="Grooming & Hygiene" value={state.groomingHoursPerDay} min={0.25} max={2} step={0.25} onChange={state.setGroomingHoursPerDay} color="var(--cat-grooming)" unit="h/day" />
              <AdvancedRow name="choresHoursPerDay" label="Household Chores" value={state.choresHoursPerDay} min={0} max={4} step={0.25} onChange={state.setChoresHoursPerDay} color="var(--cat-chores)" unit="h/day" />

              <GroupTitle>Commute</GroupTitle>
              <AdvancedRow name="commuteHoursPerDay" label="Commuting" value={state.commuteHoursPerDay} min={0} max={4} step={0.25} onChange={state.setCommuteHoursPerDay} color="var(--cat-commute)" unit="h/day" />

              <GroupTitle>Time Wasters</GroupTitle>
              <AdvancedRow name="socialMediaHoursPerDay" label="Social Media & Doomscrolling" value={state.socialMediaHoursPerDay} min={0} max={8} step={0.25} onChange={state.setSocialMediaHoursPerDay} color="var(--cat-social)" unit="h/day" />
              <AdvancedRow name="tvHoursPerDay" label="Passive TV Watching" value={state.tvHoursPerDay} min={0} max={10} step={0.25} onChange={state.setTvHoursPerDay} color="var(--cat-tv)" unit="h/day" />
              <AdvancedRow name="streamingHoursPerDay" label="Streaming (Netflix, Hulu, Prime, etc.)" value={state.streamingHoursPerDay} min={0} max={6} step={0.25} onChange={state.setStreamingHoursPerDay} color="var(--cat-streaming)" unit="h/day" />
            </div>
          </div>
        </div>

        {/* CALCULATE BUTTON */}
        <button
          type="button"
          disabled={!canSubmit}
          onClick={onComplete}
          className={`w-full mt-6 py-4 font-bold uppercase tracking-widest text-sm transition-colors ${
            canSubmit
              ? 'bg-accent text-white hover:opacity-90 cursor-pointer'
              : 'bg-foreground/10 text-foreground/40 cursor-not-allowed'
          }`}
        >
          Calculate My Time
        </button>

        {/* SKIP LINK */}
        <button
          type="button"
          onClick={onSkip}
          className="mx-auto mt-5 transition-opacity hover:opacity-80"
          style={{ fontSize: '13px', opacity: 0.5 }}
        >
          Skip to app →
        </button>
      </div>
    </div>
  );
}
