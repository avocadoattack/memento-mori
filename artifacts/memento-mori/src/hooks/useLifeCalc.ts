import { useState, useEffect, useMemo, useCallback } from 'react';
import { LIFE_EXPECTANCY } from '../lib/lifeExpectancy';
import { EDUCATION_LEVELS, DEFAULT_EDUCATION_LEVELS } from '../lib/educationLevels';

export type Gender = 'male' | 'female';

export function useLifeCalc() {
  const [currentAge, setCurrentAge] = useState(30);
  const [gender, setGender] = useState<Gender>('male');
  const [country, setCountry] = useState('World Average');
  const [overrideLifeExp, setOverrideLifeExp] = useState(false);
  const [customLifeExp, setCustomLifeExp] = useState(71.1);

  const [sleepHoursPerNight, setSleepHoursPerNight] = useState(8.0);
  const [workHoursPerWeek, setWorkHoursPerWeek] = useState(40);
  const [workStartAge, setWorkStartAge] = useState(22);
  const [retirementAge, setRetirementAge] = useState(65);
  const [selectedEducationLevels, setSelectedEducationLevels] = useState<string[]>(DEFAULT_EDUCATION_LEVELS);
  const [eatingHoursPerDay, setEatingHoursPerDay] = useState(1.5);
  const [groomingHoursPerDay, setGroomingHoursPerDay] = useState(0.58);
  const [choresHoursPerDay, setChoresHoursPerDay] = useState(1.5);
  const [commuteHoursPerDay, setCommuteHoursPerDay] = useState(0.87);
  const [socialMediaHoursPerDay, setSocialMediaHoursPerDay] = useState(2.3);
  const [tvHoursPerDay, setTvHoursPerDay] = useState(3.5);
  const [streamingHoursPerDay, setStreamingHoursPerDay] = useState(1.75);

  const [overrides, setOverrides] = useState<Record<string, boolean>>({});

  const markOverride = (key: string) => {
    setOverrides(prev => ({ ...prev, [key]: true }));
  };

  const getDynamicDefaults = useCallback((age: number, g: Gender) => {
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

    const workStartDef = age < 22 ? age + 4 : 22;
    const retireDef    = age >= 65 ? age : 65;

    let tvDef = 3.5;
    if (age <= 12) tvDef = 1.5;
    else if (age <= 24) tvDef = 1.5;
    else if (age <= 34) tvDef = 2.5;
    else if (age <= 44) tvDef = 3.0;
    else if (age <= 54) tvDef = 3.5;
    else if (age <= 64) tvDef = 4.5;
    else tvDef = 5.5;

    let streamingDef = 1.75;
    if (age <= 24) streamingDef = 2.0;
    else if (age <= 34) streamingDef = 1.75;
    else if (age <= 44) streamingDef = 1.5;
    else if (age <= 54) streamingDef = 1.25;
    else if (age <= 64) streamingDef = 1.0;
    else streamingDef = 0.75;

    return {
      socialMediaHoursPerDay: socialDef,
      workHoursPerWeek:       workHDef,
      workStartAge:           workStartDef,
      retirementAge:          retireDef,
      tvHoursPerDay:          tvDef,
      streamingHoursPerDay:   streamingDef,
      sleepHoursPerNight:     8.0,
      eatingHoursPerDay:      1.5,
      groomingHoursPerDay:    g === 'female' ? 1.0 : 0.58,
      choresHoursPerDay:      1.5,
      commuteHoursPerDay:     0.87,
    };
  }, []);

  useEffect(() => {
    const defs = getDynamicDefaults(currentAge, gender);
    if (!overrides.socialMediaHoursPerDay) setSocialMediaHoursPerDay(defs.socialMediaHoursPerDay);
    if (!overrides.workHoursPerWeek)       setWorkHoursPerWeek(defs.workHoursPerWeek);
    if (!overrides.workStartAge)           setWorkStartAge(defs.workStartAge);
    if (!overrides.retirementAge)          setRetirementAge(defs.retirementAge);
    if (!overrides.tvHoursPerDay)          setTvHoursPerDay(defs.tvHoursPerDay);
    if (!overrides.streamingHoursPerDay)   setStreamingHoursPerDay(defs.streamingHoursPerDay);
    if (!overrides.groomingHoursPerDay)    setGroomingHoursPerDay(defs.groomingHoursPerDay);
  }, [currentAge, gender, getDynamicDefaults, overrides]);

  const resetDefaults = useCallback(() => {
    setOverrides({});
    const defs = getDynamicDefaults(currentAge, gender);
    setSocialMediaHoursPerDay(defs.socialMediaHoursPerDay);
    setWorkHoursPerWeek(defs.workHoursPerWeek);
    setWorkStartAge(defs.workStartAge);
    setRetirementAge(defs.retirementAge);
    setTvHoursPerDay(defs.tvHoursPerDay);
    setStreamingHoursPerDay(defs.streamingHoursPerDay);
    setSleepHoursPerNight(defs.sleepHoursPerNight);
    setSelectedEducationLevels(DEFAULT_EDUCATION_LEVELS);
    setEatingHoursPerDay(defs.eatingHoursPerDay);
    setGroomingHoursPerDay(defs.groomingHoursPerDay);
    setChoresHoursPerDay(defs.choresHoursPerDay);
    setCommuteHoursPerDay(defs.commuteHoursPerDay);
  }, [currentAge, gender, getDynamicDefaults]);

  // Fix 5: country auto-detection — ipapi.co with 2s timeout, then timezone fallback
  useEffect(() => {
    const detectByTimezone = () => {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const tzCountryMap: Record<string, string> = {
        'Europe/Madrid': 'Spain', 'Europe/Barcelona': 'Spain',
        'America/New_York': 'United States', 'America/Chicago': 'United States',
        'America/Denver': 'United States', 'America/Los_Angeles': 'United States',
        'America/Phoenix': 'United States', 'America/Anchorage': 'United States',
        'Pacific/Honolulu': 'United States',
        'America/Toronto': 'Canada', 'America/Vancouver': 'Canada', 'America/Montreal': 'Canada',
        'Europe/London': 'United Kingdom',
        'Europe/Paris': 'France',
        'Europe/Berlin': 'Germany', 'Europe/Vienna': 'Austria',
        'Europe/Rome': 'Italy',
        'Europe/Amsterdam': 'Netherlands',
        'Europe/Brussels': 'Belgium',
        'Europe/Lisbon': 'Portugal',
        'Europe/Athens': 'Greece',
        'Europe/Warsaw': 'Poland',
        'Europe/Stockholm': 'Sweden',
        'Europe/Oslo': 'Norway',
        'Europe/Copenhagen': 'Denmark',
        'Europe/Helsinki': 'Finland',
        'Europe/Zurich': 'Switzerland',
        'Europe/Dublin': 'Ireland',
        'Europe/Bucharest': 'Romania',
        'Europe/Prague': 'Czech Republic',
        'Europe/Moscow': 'Russia', 'Europe/Kaliningrad': 'Russia',
        'Europe/Kiev': 'Ukraine',
        'Asia/Tokyo': 'Japan',
        'Asia/Seoul': 'South Korea',
        'Asia/Singapore': 'Singapore',
        'Asia/Shanghai': 'China', 'Asia/Hong_Kong': 'China',
        'Asia/Kolkata': 'India',
        'Asia/Bangkok': 'Thailand',
        'Asia/Jakarta': 'Indonesia',
        'Asia/Manila': 'Philippines',
        'Asia/Ho_Chi_Minh': 'Vietnam',
        'Asia/Karachi': 'Pakistan',
        'Asia/Dhaka': 'Bangladesh',
        'Asia/Dubai': 'UAE',
        'Asia/Riyadh': 'Saudi Arabia',
        'Asia/Tehran': 'Iran',
        'Asia/Istanbul': 'Turkey',
        'Asia/Jerusalem': 'Israel',
        'Australia/Sydney': 'Australia', 'Australia/Melbourne': 'Australia',
        'Pacific/Auckland': 'New Zealand',
        'America/Sao_Paulo': 'Brazil', 'America/Manaus': 'Brazil',
        'America/Argentina/Buenos_Aires': 'Argentina',
        'America/Santiago': 'Chile',
        'America/Bogota': 'Colombia',
        'America/Mexico_City': 'Mexico', 'America/Monterrey': 'Mexico',
        'America/Costa_Rica': 'Costa Rica',
        'America/Havana': 'Cuba',
        'Africa/Cairo': 'Egypt',
        'Africa/Casablanca': 'Morocco',
        'Africa/Johannesburg': 'South Africa',
        'Africa/Nairobi': 'Kenya',
        'Africa/Addis_Ababa': 'Ethiopia',
        'Africa/Lagos': 'Nigeria',
      };
      const detected = tzCountryMap[tz];
      setCountry(detected && LIFE_EXPECTANCY[detected] ? detected : 'World Average');
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    fetch('https://ipapi.co/json/', { signal: controller.signal })
      .then(r => r.json())
      .then(data => {
        clearTimeout(timeout);
        if (data.country_name && LIFE_EXPECTANCY[data.country_name]) {
          setCountry(data.country_name);
        } else {
          detectByTimezone();
        }
      })
      .catch(() => detectByTimezone());

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  const baseLifeExpectancy = useMemo(() => {
    const entry = LIFE_EXPECTANCY[country] || LIFE_EXPECTANCY['World Average'];
    return entry[gender];
  }, [country, gender]);

  const lifeExpectancy = overrideLifeExp ? customLifeExp : baseLifeExpectancy;

  const stats = useMemo(() => {
    const totalLifeHours       = lifeExpectancy * 365.25 * 24;
    const sleepHours_total     = sleepHoursPerNight   * 365.25 * lifeExpectancy;
    const workHours_total      = workHoursPerWeek     * 52     * Math.max(0, retirementAge - workStartAge);
    const schoolHours_total    = EDUCATION_LEVELS
      .filter(l => selectedEducationLevels.includes(l.id))
      .reduce((sum, l) => sum + l.years * l.daysPerYear * l.hoursPerDay, 0);
    const schoolCalendarYears  = EDUCATION_LEVELS
      .filter(l => selectedEducationLevels.includes(l.id))
      .reduce((sum, l) => sum + l.years, 0);
    const eatingHours_total    = eatingHoursPerDay    * 365.25 * lifeExpectancy;
    const groomingHours_total  = groomingHoursPerDay  * 365.25 * lifeExpectancy;
    const choresHours_total    = choresHoursPerDay    * 365.25 * lifeExpectancy;
    const commuteHours_total   = commuteHoursPerDay   * 260    * Math.max(0, retirementAge - workStartAge);
    const socialMediaHours_total = socialMediaHoursPerDay * 365.25 * lifeExpectancy;
    const tvHours_total        = tvHoursPerDay        * 365.25 * lifeExpectancy;
    const streamingHours_total = streamingHoursPerDay * 365.25 * lifeExpectancy;

    const totalTaken = sleepHours_total + workHours_total + schoolHours_total +
      eatingHours_total + groomingHours_total + choresHours_total +
      commuteHours_total + socialMediaHours_total + tvHours_total + streamingHours_total;

    const freeHours          = totalLifeHours - totalTaken;
    const freeHoursRemaining = freeHours * (1 - Math.min(1, currentAge / lifeExpectancy));
    const freeYears          = freeHours / 8760;
    const freeWeeks          = freeHours / 168;
    const freeMonths         = Math.floor(freeHours / 730);
    const pctLifeYours       = (freeHours / totalLifeHours) * 100;
    const pctLifeBehind      = Math.min(100, (currentAge / lifeExpectancy) * 100);

    const socialMediaYearsLost = socialMediaHours_total / 8760;
    const tvYearsLost          = tvHours_total          / 8760;
    const streamingYearsLost   = streamingHours_total   / 8760;

    return {
      totalLifeHours, sleepHours_total, workHours_total, schoolHours_total, schoolCalendarYears,
      eatingHours_total, groomingHours_total, choresHours_total, commuteHours_total,
      socialMediaHours_total, tvHours_total, streamingHours_total,
      totalTaken, freeHours, freeHoursRemaining, freeYears, freeWeeks, freeMonths, pctLifeYours,
      pctLifeBehind, socialMediaYearsLost, tvYearsLost, streamingYearsLost,
    };
  }, [
    lifeExpectancy, currentAge, sleepHoursPerNight, workHoursPerWeek,
    retirementAge, workStartAge, selectedEducationLevels,
    eatingHoursPerDay, groomingHoursPerDay, choresHoursPerDay,
    commuteHoursPerDay, socialMediaHoursPerDay, tvHoursPerDay, streamingHoursPerDay,
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

      selectedEducationLevels,
      setSelectedEducationLevels,
      toggleEducationLevel: (id: string) => {
        setSelectedEducationLevels(prev =>
          prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
      },

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
      streamingHoursPerDay,
      setStreamingHoursPerDay: (v: number) => { markOverride('streamingHoursPerDay'); setStreamingHoursPerDay(v); },

      overrides,
      resetDefaults,
    },
    lifeExpectancy,
    stats,
  };
}
