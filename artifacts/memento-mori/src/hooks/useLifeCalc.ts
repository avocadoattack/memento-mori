import { useState, useEffect, useMemo, useCallback } from 'react';
import { LIFE_EXPECTANCY } from '../lib/lifeExpectancy';

export type Gender = 'male' | 'female';

export function useLifeCalc() {
  const [currentAge, setCurrentAge] = useState(30);
  const [gender, setGender] = useState<Gender>('male');
  const [country, setCountry] = useState('World Average');
  const [overrideLifeExp, setOverrideLifeExp] = useState(false);
  const [customLifeExp, setCustomLifeExp] = useState(71.1);

  // States
  const [sleepHoursPerNight, setSleepHoursPerNight] = useState(8.0);
  const [workHoursPerWeek, setWorkHoursPerWeek] = useState(40);
  const [workStartAge, setWorkStartAge] = useState(22);
  const [retirementAge, setRetirementAge] = useState(65);
  const [schoolYears, setSchoolYears] = useState(13);
  const [schoolHoursPerDay, setSchoolHoursPerDay] = useState(6.5);
  const [eatingHoursPerDay, setEatingHoursPerDay] = useState(1.5);
  const [groomingHoursPerDay, setGroomingHoursPerDay] = useState(0.75);
  const [choresHoursPerDay, setChoresHoursPerDay] = useState(1.5);
  const [commuteHoursPerDay, setCommuteHoursPerDay] = useState(0.87);
  const [socialMediaHoursPerDay, setSocialMediaHoursPerDay] = useState(2.3);
  const [tvHoursPerDay, setTvHoursPerDay] = useState(3.5);

  // Track overrides
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});

  const markOverride = (key: string) => {
    setOverrides(prev => ({ ...prev, [key]: true }));
  };

  const getDynamicDefaults = useCallback((age: number) => {
    let socialDef = 2.3;
    if (age <= 14) socialDef = 4.3;
    else if (age <= 17) socialDef = 5.3;
    else if (age <= 24) socialDef = 3.1;
    else if (age <= 34) socialDef = 2.3;
    else if (age <= 44) socialDef = 2.1;
    else if (age <= 54) socialDef = 2.2;
    else if (age <= 64) socialDef = 2.1;
    else socialDef = 1.7;

    let workHDef = 40;
    if (age < 16) workHDef = 0;
    else if (age <= 17) workHDef = 10;
    else if (age <= 21) workHDef = 20;
    else if (age <= 64) workHDef = 40;
    else workHDef = 0;

    let workStartDef = age < 22 ? age + 4 : 22;
    let retireDef = age >= 65 ? age : 65;

    let tvDef = 3.5;
    if (age <= 12) tvDef = 1.5; // fallback
    else if (age <= 24) tvDef = 1.5;
    else if (age <= 34) tvDef = 2.5;
    else if (age <= 44) tvDef = 3.0;
    else if (age <= 54) tvDef = 3.5;
    else if (age <= 64) tvDef = 4.5;
    else tvDef = 5.5;

    return {
      socialMediaHoursPerDay: socialDef,
      workHoursPerWeek: workHDef,
      workStartAge: workStartDef,
      retirementAge: retireDef,
      tvHoursPerDay: tvDef,
      sleepHoursPerNight: 8.0,
      schoolYears: 13,
      schoolHoursPerDay: 6.5,
      eatingHoursPerDay: 1.5,
      groomingHoursPerDay: 0.75,
      choresHoursPerDay: 1.5,
      commuteHoursPerDay: 0.87
    };
  }, []);

  // Update defaults on age change if not overridden
  useEffect(() => {
    const defs = getDynamicDefaults(currentAge);
    
    if (!overrides.socialMediaHoursPerDay) setSocialMediaHoursPerDay(defs.socialMediaHoursPerDay);
    if (!overrides.workHoursPerWeek) setWorkHoursPerWeek(defs.workHoursPerWeek);
    if (!overrides.workStartAge) setWorkStartAge(defs.workStartAge);
    if (!overrides.retirementAge) setRetirementAge(defs.retirementAge);
    if (!overrides.tvHoursPerDay) setTvHoursPerDay(defs.tvHoursPerDay);
    
  }, [currentAge, getDynamicDefaults, overrides]);

  const resetDefaults = useCallback(() => {
    setOverrides({});
    const defs = getDynamicDefaults(currentAge);
    setSocialMediaHoursPerDay(defs.socialMediaHoursPerDay);
    setWorkHoursPerWeek(defs.workHoursPerWeek);
    setWorkStartAge(defs.workStartAge);
    setRetirementAge(defs.retirementAge);
    setTvHoursPerDay(defs.tvHoursPerDay);
    setSleepHoursPerNight(defs.sleepHoursPerNight);
    setSchoolYears(defs.schoolYears);
    setSchoolHoursPerDay(defs.schoolHoursPerDay);
    setEatingHoursPerDay(defs.eatingHoursPerDay);
    setGroomingHoursPerDay(defs.groomingHoursPerDay);
    setChoresHoursPerDay(defs.choresHoursPerDay);
    setCommuteHoursPerDay(defs.commuteHoursPerDay);
  }, [currentAge, getDynamicDefaults]);

  // Default IP-based country loading
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    
    fetch('https://ipapi.co/json/', { signal: controller.signal })
      .then(res => res.json())
      .then(data => {
        if (data && data.country_name && LIFE_EXPECTANCY[data.country_name]) {
          setCountry(data.country_name);
        }
      })
      .catch(() => { /* silent fallback */ })
      .finally(() => clearTimeout(timeout));
      
    return () => clearTimeout(timeout);
  }, []);

  const baseLifeExpectancy = useMemo(() => {
    const entry = LIFE_EXPECTANCY[country] || LIFE_EXPECTANCY["World Average"];
    return entry[gender];
  }, [country, gender]);

  const lifeExpectancy = overrideLifeExp ? customLifeExp : baseLifeExpectancy;

  const stats = useMemo(() => {
    const totalLifeHours = lifeExpectancy * 365.25 * 24;
    const sleepHours_total = sleepHoursPerNight * 365.25 * lifeExpectancy;
    const workHours_total = workHoursPerWeek * 52 * Math.max(0, retirementAge - workStartAge);
    const schoolHours_total = schoolYears * 180 * schoolHoursPerDay;
    const eatingHours_total = eatingHoursPerDay * 365.25 * lifeExpectancy;
    const groomingHours_total = groomingHoursPerDay * 365.25 * lifeExpectancy;
    const choresHours_total = choresHoursPerDay * 365.25 * lifeExpectancy;
    const commuteHours_total = commuteHoursPerDay * 260 * Math.max(0, retirementAge - workStartAge);
    const socialMediaHours_total = socialMediaHoursPerDay * 365.25 * lifeExpectancy;
    const tvHours_total = tvHoursPerDay * 365.25 * lifeExpectancy;

    const totalTaken = sleepHours_total + workHours_total + schoolHours_total + 
      eatingHours_total + groomingHours_total + choresHours_total + 
      commuteHours_total + socialMediaHours_total + tvHours_total;
      
    const freeHours = totalLifeHours - totalTaken;
    const freeHoursRemaining = freeHours * (1 - Math.min(1, currentAge / lifeExpectancy));
    const freeYears = freeHours / 8760;
    const freeWeeks = freeHours / 168;
    const pctLifeYours = (freeHours / totalLifeHours) * 100;

    const socialMediaYearsLost = socialMediaHours_total / 8760;
    const tvYearsLost = tvHours_total / 8760;

    return {
      totalLifeHours,
      sleepHours_total,
      workHours_total,
      schoolHours_total,
      eatingHours_total,
      groomingHours_total,
      choresHours_total,
      commuteHours_total,
      socialMediaHours_total,
      tvHours_total,
      totalTaken,
      freeHours,
      freeHoursRemaining,
      freeYears,
      freeWeeks,
      pctLifeYours,
      socialMediaYearsLost,
      tvYearsLost
    };
  }, [
    lifeExpectancy, currentAge, sleepHoursPerNight, workHoursPerWeek, 
    retirementAge, workStartAge, schoolYears, schoolHoursPerDay, 
    eatingHoursPerDay, groomingHoursPerDay, choresHoursPerDay, 
    commuteHoursPerDay, socialMediaHoursPerDay, tvHoursPerDay
  ]);

  return {
    state: {
      currentAge, setCurrentAge,
      gender, setGender,
      country, setCountry,
      overrideLifeExp, setOverrideLifeExp,
      customLifeExp, setCustomLifeExp,
      
      sleepHoursPerNight, 
      setSleepHoursPerNight: (v: number) => { markOverride('sleepHoursPerNight'); setSleepHoursPerNight(v); },
      workHoursPerWeek, 
      setWorkHoursPerWeek: (v: number) => { markOverride('workHoursPerWeek'); setWorkHoursPerWeek(v); },
      workStartAge, 
      setWorkStartAge: (v: number) => { markOverride('workStartAge'); setWorkStartAge(v); },
      retirementAge, 
      setRetirementAge: (v: number) => { markOverride('retirementAge'); setRetirementAge(v); },
      schoolYears, 
      setSchoolYears: (v: number) => { markOverride('schoolYears'); setSchoolYears(v); },
      schoolHoursPerDay, 
      setSchoolHoursPerDay: (v: number) => { markOverride('schoolHoursPerDay'); setSchoolHoursPerDay(v); },
      eatingHoursPerDay, 
      setEatingHoursPerDay: (v: number) => { markOverride('eatingHoursPerDay'); setEatingHoursPerDay(v); },
      groomingHoursPerDay, 
      setGroomingHoursPerDay: (v: number) => { markOverride('groomingHoursPerDay'); setGroomingHoursPerDay(v); },
      choresHoursPerDay, 
      setChoresHoursPerDay: (v: number) => { markOverride('choresHoursPerDay'); setChoresHoursPerDay(v); },
      commuteHoursPerDay, 
      setCommuteHoursPerDay: (v: number) => { markOverride('commuteHoursPerDay'); setCommuteHoursPerDay(v); },
      socialMediaHoursPerDay, 
      setSocialMediaHoursPerDay: (v: number) => { markOverride('socialMediaHoursPerDay'); setSocialMediaHoursPerDay(v); },
      tvHoursPerDay, 
      setTvHoursPerDay: (v: number) => { markOverride('tvHoursPerDay'); setTvHoursPerDay(v); },

      overrides,
      resetDefaults
    },
    lifeExpectancy,
    stats
  };
}
