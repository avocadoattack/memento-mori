import React, { useEffect, useRef, useState, useMemo } from 'react';

interface Props {
  state: any;
  lifeExpectancy: number;
}

export function LifeGrid({ state, lifeExpectancy }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tooltipData, setTooltipData] = useState<{ x: number; y: number; week: number; age: number; freeH: number; category: string } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalWeeks = Math.ceil(lifeExpectancy * 52);
  const currentWeek = Math.floor(state.currentAge * 52);

  const squares = useMemo(() => {
    const arr = [];
    for (let i = 0; i < totalWeeks; i++) {
      const age = i / 52;
      
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
      
      if (Math.abs(age - state.currentAge) < 5) {
        socialH = state.socialMediaHoursPerDay * 7;
      }

      // Age-adjusted TV hours (same lookup table as getDynamicDefaults)
      let tvH: number;
      if (age <= 24) tvH = 1.5 * 7;
      else if (age <= 34) tvH = 2.5 * 7;
      else if (age <= 44) tvH = 3.0 * 7;
      else if (age <= 54) tvH = 3.5 * 7;
      else if (age <= 64) tvH = 4.5 * 7;
      else tvH = 5.5 * 7;
      if (Math.abs(age - state.currentAge) < 5) tvH = state.tvHoursPerDay * 7;

      const totalObligatory = sleepH + workH + schoolH + eatingH + groomingH + choresH + commuteH + socialH + tvH;
      const freeH = Math.max(0, 168 - totalObligatory);

      // Dominant = biggest WAKING obligation (sleep excluded — at 56h/week it
      // always wins, conveying no life-stage info). Start from freeH so free
      // time shows when nothing else beats it.
      let dominantColorHex = '#00F5D4';
      let maxH = freeH;
      let category = 'Free Time';

      if (workH > maxH) { maxH = workH; dominantColorHex = '#FF006E'; category = 'Work'; }
      if (schoolH > maxH) { maxH = schoolH; dominantColorHex = '#FFBE0B'; category = 'School'; }
      if (eatingH > maxH) { maxH = eatingH; dominantColorHex = '#06D6A0'; category = 'Eating'; }
      if (groomingH > maxH) { maxH = groomingH; dominantColorHex = '#8338EC'; category = 'Grooming'; }
      if (choresH > maxH) { maxH = choresH; dominantColorHex = '#4CC9F0'; category = 'Chores'; }
      if (commuteH > maxH) { maxH = commuteH; dominantColorHex = '#FB5607'; category = 'Commute'; }
      if (socialH > maxH) { maxH = socialH; dominantColorHex = '#F72585'; category = 'Social Media'; }
      if (tvH > maxH) { maxH = tvH; dominantColorHex = '#9B5DE5'; category = 'TV'; }

      const isPast = i < currentWeek;
      const isCurrent = i === currentWeek;

      arr.push({ i, age, freeH, dominantColorHex, category, isPast, isCurrent });
    }
    return arr;
  }, [totalWeeks, currentWeek, state]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const accent = getComputedStyle(document.documentElement)
      .getPropertyValue('--accent').trim() || '#E63946';
    const fgColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--foreground').trim() || '#1A1A1A';
    const isDark = document.documentElement.classList.contains('dark');
    const pastColor = isDark ? '#4A4A4A' : '#BBBBBB';

    const LABEL_WIDTH = 24;
    const DECADE_GAP = 4;

    let cols = 1;
    let sqSize = 7;
    let totalSqWidth = 9;
    let width = 800;
    let height = 0;
    let rowsCount = 0;
    let rafId: number | null = null;

    // y for a given row, accounting for accumulated decade gaps every 520 weeks
    const getRowY = (row: number): number => {
      const decadesPassed = Math.floor((row * cols) / 520);
      return Math.floor(row * totalSqWidth) + decadesPassed * DECADE_GAP;
    };

    const posOf = (idx: number) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      return {
        x: LABEL_WIDTH + Math.floor(col * totalSqWidth),
        y: getRowY(row),
      };
    };

    // Change 6: flat neutral gray for past weeks — no category color at reduced opacity
    const drawStaticSquare = (idx: number) => {
      const sq = squares[idx];
      if (!sq) return;
      const { x, y } = posOf(idx);
      ctx.globalAlpha = 1;
      ctx.fillStyle = sq.isPast ? pastColor : sq.dominantColorHex;
      ctx.fillRect(x, y, sqSize, sqSize);
    };

    // Change 5: age decade labels + birth/death emojis in the left margin
    const drawLabels = () => {
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = fgColor;

      ctx.font = '10px serif';
      ctx.textAlign = 'center';
      ctx.fillText('👶', LABEL_WIDTH / 2, getRowY(0) + sqSize);

      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'right';
      for (let decade = 1; decade <= 8; decade++) {
        const weekIdx = decade * 520;
        if (weekIdx >= totalWeeks) break;
        const row = Math.floor(weekIdx / cols);
        ctx.fillText(String(decade * 10), LABEL_WIDTH - 3, getRowY(row) + sqSize - 1);
      }

      if (totalWeeks > 0) {
        const lastSq = posOf(totalWeeks - 1);
        ctx.font = '10px serif';
        ctx.textAlign = 'left';
        ctx.fillText('☠️', lastSq.x + sqSize + 4, lastSq.y + sqSize);
      }

      ctx.restore();
    };

    const drawAllStatic = () => {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < totalWeeks; i++) drawStaticSquare(i);
      drawLabels();
    };

    // Animate ONLY the current-week cell. Each frame we clear a small padded
    // region around it, redraw the static neighbours, then draw the pulsing
    // cell on top. Keeps per-frame work to ~a dozen cells instead of ~4,000.
    const animatePulse = (time: number) => {
      if (currentWeek >= 0 && currentWeek < totalWeeks) {
        const pad = sqSize + 12;
        const range = Math.ceil(pad / totalSqWidth) + 1;
        const { x, y } = posOf(currentWeek);

        ctx.clearRect(x - pad, y - pad, sqSize + pad * 2, sqSize + pad * 2);

        const cCol = currentWeek % cols;
        const cRow = Math.floor(currentWeek / cols);
        for (let r = cRow - range; r <= cRow + range; r++) {
          if (r < 0) continue;
          for (let c = cCol - range; c <= cCol + range; c++) {
            if (c < 0 || c >= cols) continue;
            const idx = r * cols + c;
            if (idx < 0 || idx >= totalWeeks || idx === currentWeek) continue;
            drawStaticSquare(idx);
          }
        }

        // Redraw labels — for first-column cells the clear region overlaps the margin
        drawLabels();

        const scale = 1 + ((Math.sin(time / 300) + 1) / 2) * 0.25;
        const offset = (sqSize * scale - sqSize) / 2;
        ctx.save();
        ctx.shadowColor = accent;
        ctx.shadowBlur = 8;
        ctx.fillStyle = squares[currentWeek].dominantColorHex;
        ctx.fillRect(x - offset, y - offset, sqSize * scale, sqSize * scale);
        ctx.restore();
      }
      rafId = requestAnimationFrame(animatePulse);
    };

    const setup = () => {
      width = containerRef.current?.clientWidth || 800;
      const isMobile = window.innerWidth < 640;
      sqSize = isMobile ? 5 : 7;
      const gap = 2;
      totalSqWidth = sqSize + gap;
      // Reserve LABEL_WIDTH pixels on left for decade labels
      cols = Math.max(1, Math.floor((width - LABEL_WIDTH) / totalSqWidth));
      rowsCount = Math.ceil(totalWeeks / cols);
      height = getRowY(rowsCount - 1) + totalSqWidth + DECADE_GAP;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      drawAllStatic();
    };

    setup();

    if (currentWeek >= 0 && currentWeek < totalWeeks) {
      rafId = requestAnimationFrame(animatePulse);
    }

    let resizeTimer: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(setup, 150);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (mouseX < LABEL_WIDTH) { setTooltipData(null); return; }
      const col = Math.floor((mouseX - LABEL_WIDTH) / totalSqWidth);
      if (col < 0 || col >= cols) { setTooltipData(null); return; }

      // Row lookup uses decade-aware y positions (non-linear)
      let hoveredRow = -1;
      for (let r = 0; r < rowsCount; r++) {
        const rowY = getRowY(r);
        if (mouseY >= rowY && mouseY < rowY + sqSize) { hoveredRow = r; break; }
      }
      if (hoveredRow === -1) { setTooltipData(null); return; }

      const index = hoveredRow * cols + col;
      if (index >= 0 && index < totalWeeks) {
        setTooltipData({
          x: e.clientX,
          y: e.clientY,
          week: index + 1,
          age: squares[index].age,
          freeH: squares[index].freeH,
          category: squares[index].category,
        });
      } else {
        setTooltipData(null);
      }
    };

    const handleMouseLeave = () => setTooltipData(null);

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      clearTimeout(resizeTimer);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, [squares, totalWeeks, currentWeek]);

  return (
    <div className="w-full relative" ref={containerRef}>
      <div className="text-center font-bold uppercase tracking-widest text-sm opacity-50 mb-4">
        Each square = 1 week of your life
      </div>
      <canvas ref={canvasRef} className="block mx-auto cursor-crosshair" />
      
      {tooltipData && (
        <div
          className="fixed pointer-events-none font-mono text-xs transform -translate-x-1/2 -translate-y-full"
          style={{
            left: tooltipData.x,
            top: tooltipData.y,
            marginTop: '-10px',
            zIndex: 9999,
            background: 'rgba(15,15,15,0.95)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            padding: '8px 12px',
            borderRadius: '6px',
          }}
        >
          <div className="font-bold">Week {tooltipData.week} · Age {Math.floor(tooltipData.age)}</div>
          <div className="opacity-80">{tooltipData.freeH.toFixed(1)}h free this week</div>
          <div className="opacity-80">Dominated by: {tooltipData.category}</div>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-4 mt-6 text-xs font-bold uppercase tracking-widest opacity-80">
        <div className="flex items-center gap-1"><span className="w-2 h-2 inline-block bg-[#3A86FF]"></span> Sleep</div>
        <div className="flex items-center gap-1"><span className="w-2 h-2 inline-block bg-[#FF006E]"></span> Work</div>
        <div className="flex items-center gap-1"><span className="w-2 h-2 inline-block bg-[#FFBE0B]"></span> School</div>
        <div className="flex items-center gap-1"><span className="w-2 h-2 inline-block bg-[#06D6A0]"></span> Eating</div>
        <div className="flex items-center gap-1"><span className="w-2 h-2 inline-block bg-[#8338EC]"></span> Grooming</div>
        <div className="flex items-center gap-1"><span className="w-2 h-2 inline-block bg-[#4CC9F0]"></span> Chores</div>
        <div className="flex items-center gap-1"><span className="w-2 h-2 inline-block bg-[#FB5607]"></span> Commute</div>
        <div className="flex items-center gap-1"><span className="w-2 h-2 inline-block bg-[#F72585]"></span> Social Media</div>
        <div className="flex items-center gap-1"><span className="w-2 h-2 inline-block bg-[#9B5DE5]"></span> TV</div>
        <div className="flex items-center gap-1"><span className="w-2 h-2 inline-block bg-[#00F5D4]"></span> Free Time</div>
      </div>
    </div>
  );
}
