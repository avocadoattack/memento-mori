import React, { useState } from 'react';
import { Settings, Minus, Plus } from 'lucide-react';
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

  const stepAge = (delta: number) => {
    const current = ageValid ? ageNum : 0;
    const next = Math.min(99, Math.max(1, current + delta));
    handleAgeChange(String(next));
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
    <h4 className="text-xs font-bold uppercase tracking-widest text-foreground/50 mt-5 mb-2">{children}</h4>
  );

  const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <p className="text-xs font-bold uppercase tracking-widest opacity-50 mb-2 text-center">{children}</p>
  );

  return (
    <div
      className="font-sans bg-background text-foreground selection:bg-accent selection:text-white min-h-screen flex flex-col items-center justify-center"
      style={{
        padding: '32px 24px',
        boxSizing: 'border-box',
        opacity: exiting ? 0 : 1,
        transition: 'opacity 0.4s ease',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '0',
        }}
      >
        {/* Header */}
        <div className="text-center w-full mb-6">
          <h1
            className="font-mono tracking-tighter"
            style={{
              whiteSpace: 'nowrap',
              fontSize: 'clamp(36px, 7vw, 80px)',
              fontWeight: 900,
              lineHeight: 1,
            }}
          >
            MEMENTO MORI
          </h1>
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: 'italic',
              fontSize: 'clamp(18px, 3vw, 28px)',
              opacity: 0.7,
              marginTop: '4px',
              lineHeight: 1.2,
            }}
          >
            Remember death
          </p>
          <p
            style={{
              fontSize: '13px',
              opacity: 0.45,
              marginTop: '8px',
              letterSpacing: '0.01em',
            }}
          >
            How much of your life is truly yours?
          </p>
        </div>

        {/* FIELD 1 — AGE */}
        <div className="w-full mb-5">
          <SectionLabel>How old are you?</SectionLabel>
          <div className="flex flex-col items-center gap-3">
            <div
              className="font-mono font-black leading-none select-none"
              style={{
                fontFamily: "'Space Grotesk', monospace",
                fontSize: 'clamp(72px, 14vw, 96px)',
                fontWeight: 900,
                letterSpacing: '-0.04em',
                opacity: ageValid ? 1 : 0.18,
                minWidth: '3ch',
                textAlign: 'center',
              }}
            >
              {ageValid ? String(ageNum).padStart(2, '0') : '00'}
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => stepAge(-1)}
                aria-label="Decrease age"
                className="flex items-center justify-center border-2 border-border hover:border-foreground/60 transition-colors"
                style={{ width: 44, height: 44 }}
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                inputMode="numeric"
                value={ageInput}
                onChange={e => handleAgeChange(e.target.value)}
                min={1}
                max={99}
                autoFocus
                className="sr-only"
                tabIndex={-1}
                aria-hidden="true"
              />
              <button
                type="button"
                onClick={() => stepAge(1)}
                aria-label="Increase age"
                className="flex items-center justify-center border-2 border-border hover:border-foreground/60 transition-colors"
                style={{ width: 44, height: 44 }}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs opacity-30" style={{ marginTop: '-4px' }}>
              tap + / − or type directly
            </p>
            {/* Hidden accessible numeric input so users can also type */}
            <input
              type="number"
              inputMode="numeric"
              value={ageInput}
              onChange={e => handleAgeChange(e.target.value)}
              min={1}
              max={99}
              placeholder="Type age…"
              className="w-24 text-center bg-transparent border-0 border-b border-border/40 focus:border-accent focus:outline-none font-mono font-bold transition-colors"
              style={{ fontSize: '16px', padding: '2px 0', opacity: 0.45 }}
            />
          </div>
        </div>

        {/* FIELD 2 — GENDER */}
        <div className="w-full mb-5">
          <SectionLabel>Gender</SectionLabel>
          <div className="flex justify-center gap-3">
            {(['male', 'female'] as Gender[]).map(g => (
              <button
                key={g}
                type="button"
                onClick={() => handleGender(g)}
                className={`py-3 text-sm font-bold uppercase tracking-widest border-2 transition-colors ${
                  genderSel === g
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-transparent border-border text-foreground/60 hover:border-foreground/40'
                }`}
                style={{ width: '140px' }}
              >
                {g === 'male' ? 'Male' : 'Female'}
              </button>
            ))}
          </div>
        </div>

        {/* FIELD 3 — COUNTRY */}
        <div className="w-full mb-5">
          <SectionLabel>Where do you live?</SectionLabel>
          <CountryCombobox countries={countries} value={state.country} onChange={state.setCountry} />
        </div>

        {/* ADVANCED SETTINGS TOGGLE */}
        <button
          type="button"
          onClick={() => setAdvancedOpen(o => !o)}
          className="flex items-center justify-center gap-1.5 mx-auto mb-1 transition-opacity hover:opacity-100"
          style={{ fontSize: '12px', opacity: 0.5 }}
        >
          <Settings className="w-3 h-3" />
          Advanced settings
        </button>

        <div
          className="w-full grid transition-[grid-template-rows] duration-300 ease-in-out"
          style={{ gridTemplateRows: advancedOpen ? '1fr' : '0fr' }}
        >
          <div className="overflow-hidden">
            <div className="pt-3 pb-2 text-left">
              <p style={{ fontSize: '13px', opacity: 0.6, fontStyle: 'italic', lineHeight: 1.5 }} className="mb-1">
                These defaults are drawn from real research data — BLS American Time Use Survey, Gallup 2024,
                DemandSage 2026, and UN WPP 2024. They represent population averages for your age and country.
                Override any value if your life differs significantly from the average.
              </p>

              <GroupTitle>Sleep</GroupTitle>
              <AdvancedRow name="sleepHoursPerNight" label="Hours per night" value={state.sleepHoursPerNight} min={4} max={12} step={0.1} onChange={state.setSleepHoursPerNight} color="var(--cat-sleep)" unit="h/night" />

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
              <AdvancedRow name="eatingHoursPerDay" label="Eating & Prep" value={state.eatingHoursPerDay} min={0.5} max={4} step={0.1} onChange={state.setEatingHoursPerDay} color="var(--cat-eating)" unit="h/day" />
              <AdvancedRow name="groomingHoursPerDay" label="Grooming & Hygiene" value={state.groomingHoursPerDay} min={0.25} max={2} step={0.1} onChange={state.setGroomingHoursPerDay} color="var(--cat-grooming)" unit="h/day" />
              <AdvancedRow name="choresHoursPerDay" label="Household Chores" value={state.choresHoursPerDay} min={0} max={4} step={0.1} onChange={state.setChoresHoursPerDay} color="var(--cat-chores)" unit="h/day" />

              <GroupTitle>Commute</GroupTitle>
              <AdvancedRow name="commuteHoursPerDay" label="Commuting" value={state.commuteHoursPerDay} min={0} max={4} step={0.1} onChange={state.setCommuteHoursPerDay} color="var(--cat-commute)" unit="h/day" />

              <GroupTitle>Time Wasters</GroupTitle>
              <AdvancedRow name="socialMediaHoursPerDay" label="Social Media & Doomscrolling" value={state.socialMediaHoursPerDay} min={0} max={8} step={0.1} onChange={state.setSocialMediaHoursPerDay} color="var(--cat-social)" unit="h/day" />
              <AdvancedRow name="tvHoursPerDay" label="Passive TV Watching" value={state.tvHoursPerDay} min={0} max={10} step={0.1} onChange={state.setTvHoursPerDay} color="var(--cat-tv)" unit="h/day" />
              <AdvancedRow name="streamingHoursPerDay" label="Streaming (Netflix, Hulu, Prime, etc.)" value={state.streamingHoursPerDay} min={0} max={6} step={0.1} onChange={state.setStreamingHoursPerDay} color="var(--cat-streaming)" unit="h/day" />
            </div>
          </div>
        </div>

        {/* CALCULATE BUTTON */}
        <button
          type="button"
          disabled={!canSubmit}
          onClick={onComplete}
          className={`w-full mt-4 py-4 font-bold uppercase tracking-widest text-sm transition-colors ${
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
          className="mx-auto mt-3 transition-opacity hover:opacity-80"
          style={{ fontSize: '12px', opacity: 0.45 }}
        >
          Skip to app →
        </button>
      </div>
    </div>
  );
}
