import React, { useMemo, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface Props {
  state: any;
  lifeExpectancy: number;
}

export function LifeGrid({ state, lifeExpectancy }: Props) {
  const gridRef = useRef<HTMLDivElement>(null);
  
  const totalWeeks = Math.ceil(lifeExpectancy * 52);
  const currentWeek = Math.floor(state.currentAge * 52);

  useEffect(() => {
    try {
      if (gridRef.current) {
        gsap.fromTo(
          gridRef.current.children,
          { opacity: 0, scale: 0.5 },
          { opacity: 1, scale: 1, duration: 0.5, stagger: 0.003, ease: "power2.out" }
        );
      }
    } catch (e) {}
  }, [totalWeeks]);

  useEffect(() => {
    try {
      if (gridRef.current && gridRef.current.children[currentWeek]) {
        gsap.to(gridRef.current.children[currentWeek], {
          scale: 1.5,
          yoyo: true,
          repeat: -1,
          duration: 1,
          ease: "power2.inOut",
          boxShadow: "0 0 8px 2px var(--accent)",
          zIndex: 10
        });
      }
    } catch (e) {}
  }, [currentWeek]);

  const squares = useMemo(() => {
    const arr = [];
    for (let i = 0; i < totalWeeks; i++) {
      const age = i / 52;
      
      // Calculate hours per week for this specific age
      const sleepH = state.sleepHoursPerNight * 7;
      let workH = 0;
      let schoolH = 0;
      let commuteH = 0;

      if (age >= 5 && age < 5 + state.schoolYears) {
        schoolH = state.schoolHoursPerDay * 5;
      }
      if (age >= state.workStartAge && age < state.retirementAge) {
        workH = state.workHoursPerWeek;
        commuteH = state.commuteHoursPerDay * 5;
      }

      const eatingH = state.eatingHoursPerDay * 7;
      const groomingH = state.groomingHoursPerDay * 7;
      const choresH = state.choresHoursPerDay * 7;
      
      let socialH = 1.7 * 7;
      if (age <= 14) socialH = 4.3 * 7;
      else if (age <= 17) socialH = 5.3 * 7;
      else if (age <= 24) socialH = 3.1 * 7;
      else if (age <= 34) socialH = 2.3 * 7;
      else if (age <= 44) socialH = 2.1 * 7;
      else if (age <= 54) socialH = 2.2 * 7;
      else if (age <= 64) socialH = 2.1 * 7;
      
      // Override with user's slider if it's their current age bracket roughly
      if (Math.abs(age - state.currentAge) < 5) {
        socialH = state.socialMediaHoursPerDay * 7;
      }

      const tvH = state.tvHoursPerDay * 7;

      const totalObligatory = sleepH + workH + schoolH + eatingH + groomingH + choresH + commuteH + socialH + tvH;
      const freeH = Math.max(0, 168 - totalObligatory);

      let dominantColor = 'var(--cat-sleep)';
      let maxH = sleepH;
      let category = 'Sleep';

      if (workH > maxH) { maxH = workH; dominantColor = 'var(--cat-work)'; category = 'Work'; }
      if (schoolH > maxH) { maxH = schoolH; dominantColor = 'var(--cat-school)'; category = 'School'; }
      if (eatingH > maxH) { maxH = eatingH; dominantColor = 'var(--cat-eating)'; category = 'Eating'; }
      if (groomingH > maxH) { maxH = groomingH; dominantColor = 'var(--cat-grooming)'; category = 'Grooming'; }
      if (choresH > maxH) { maxH = choresH; dominantColor = 'var(--cat-chores)'; category = 'Chores'; }
      if (commuteH > maxH) { maxH = commuteH; dominantColor = 'var(--cat-commute)'; category = 'Commute'; }
      if (socialH > maxH) { maxH = socialH; dominantColor = 'var(--cat-social)'; category = 'Social Media'; }
      if (tvH > maxH) { maxH = tvH; dominantColor = 'var(--cat-tv)'; category = 'TV'; }
      if (freeH > maxH) { maxH = freeH; dominantColor = 'var(--cat-free)'; category = 'Free Time'; }

      const isPast = i < currentWeek;
      const isCurrent = i === currentWeek;

      arr.push({ i, age, freeH, dominantColor, category, isPast, isCurrent });
    }
    return arr;
  }, [totalWeeks, currentWeek, state]);

  return (
    <div className="bg-card p-4 md:p-8 border border-border shadow-sm">
      <div 
        ref={gridRef}
        className="flex flex-wrap content-start gap-[1px] sm:gap-[1.5px] max-w-full"
      >
        {squares.map(sq => (
          <Tooltip key={sq.i}>
            <TooltipTrigger asChild>
              <div 
                className="w-[5px] h-[5px] sm:w-[7px] sm:h-[7px] transition-opacity hover:opacity-100 hover:scale-150 z-0 hover:z-20 relative"
                style={{
                  backgroundColor: sq.dominantColor,
                  filter: sq.isPast ? 'grayscale(1) opacity(0.25)' : 'none',
                  opacity: sq.isPast ? 0.25 : 1,
                  borderRadius: 0,
                }}
              />
            </TooltipTrigger>
            <TooltipContent className="font-mono text-xs font-bold px-3 py-2 border-none">
              <div>Week {sq.i + 1} · Age {Math.floor(sq.age)}</div>
              <div className="opacity-70 mt-1">{sq.freeH.toFixed(1)}h free this week</div>
              <div className="opacity-70">Dominated by: {sq.category}</div>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}
