import { useState, useEffect, useMemo } from 'react';
import { LIFE_EXPECTANCY } from '../lib/lifeExpectancy';

export type Gender = 'male' | 'female';

export function useLifeCalc() {
  const [currentAge, setCurrentAge] = useState(30);
  const [gender, setGender] = useState<Gender>('male');
  const [country, setCountry] = useState('World Average');
  const [overrideLifeExp, setOverrideLifeExp] = useState(false);
  const [customLifeExp, setCustomLifeExp] = useState(71.1);

  // Sleep
  const [sleepHoursPerNight, setSleepHoursPerNight] = useState(8.0);
  
  // Work
  const [workHoursPerWeek, setWorkHoursPerWeek] = useState(40);
  const [workStartAge, setWorkStartAge] = useState(22);
  const [retirementAge, setRetirementAge] = useState(65);
  
  // Education
  const [schoolYears, setSchoolYears] = useState(13);
  const [schoolHoursPerDay, setSchoolHoursPerDay] = useState(6.5);
  
  // Habits
  const [eatingHoursPerDay, setEatingHoursPerDay] = useState(1.5);
  const [groomingHoursPerDay, setGroomingHoursPerDay] = useState(0.75);
  const [choresHoursPerDay, setChoresHoursPerDay] = useState(1.5);
  
  // Commute
  const [commuteHoursPerDay, setCommuteHoursPerDay] = useState(0.87);
  
  // Time wasters
  const [socialMediaHoursPerDay, setSocialMediaHoursPerDay] = useState(2.3);
  const [tvHoursPerDay, setTvHoursPerDay] = useState(3.5);

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

  // Update default social media hours on age change
  useEffect(() => {
    let def = 2.3;
    if (currentAge <= 14) def = 4.3;
    else if (currentAge <= 17) def = 5.3;
    else if (currentAge <= 24) def = 3.1;
    else if (currentAge <= 34) def = 2.3;
    else if (currentAge <= 44) def = 2.1;
    else if (currentAge <= 54) def = 2.2;
    else if (currentAge <= 64) def = 2.1;
    else def = 1.7;
    setSocialMediaHoursPerDay(def);
  }, [currentAge]);

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
      sleepHoursPerNight, setSleepHoursPerNight,
      workHoursPerWeek, setWorkHoursPerWeek,
      workStartAge, setWorkStartAge,
      retirementAge, setRetirementAge,
      schoolYears, setSchoolYears,
      schoolHoursPerDay, setSchoolHoursPerDay,
      eatingHoursPerDay, setEatingHoursPerDay,
      groomingHoursPerDay, setGroomingHoursPerDay,
      choresHoursPerDay, setChoresHoursPerDay,
      commuteHoursPerDay, setCommuteHoursPerDay,
      socialMediaHoursPerDay, setSocialMediaHoursPerDay,
      tvHoursPerDay, setTvHoursPerDay
    },
    lifeExpectancy,
    stats
  };
}
