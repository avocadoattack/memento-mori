import React, { useEffect, useRef, useState, useMemo } from 'react';
import { EDUCATION_LEVELS } from '../lib/educationLevels';

interface Props {
  state: any;
  lifeExpectancy: number;
}

interface EmojiPositions {
  babyY: number;
  coffinX: number;
  coffinY: number;
}

interface DecadeLabel {
  decade: number;
  y: number;
}

export function LifeGrid({ state, lifeExpectancy }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tooltipData, setTooltipData] = useState<{ x: number; y: number; weekIndex: number; totalSquares: number; isPast: boolean; isCurrent: boolean } | null>(null);
  const [emojiPositions, setEmojiPositions] = useState<EmojiPositions | null>(null);
  const [decadeLabels, setDecadeLabels] = useState<DecadeLabel[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const LABEL_COL_WIDTH = 40; // px reserved to the left of the canvas for HTML labels

  const totalWeeks = Math.ceil(lifeExpectancy * 52);
  const currentWeek = Math.floor(state.currentAge * 52);

  const squares = useMemo(() => {
    const totalLifeHours = lifeExpectancy * 365.25 * 24;
    const workYears = Math.max(0, state.retirementAge - state.workStartAge);

    const sleepHours       = state.sleepHoursPerNight  * 365.25 * lifeExpectancy;
    const workHours        = state.workHoursPerWeek    * 52     * workYears;
    const schoolHours      = EDUCATION_LEVELS
      .filter(l => (state.selectedEducationLevels as string[]).includes(l.id))
      .reduce((sum, l) => sum + l.years * l.daysPerYear * l.hoursPerDay, 0);
    const eatingHours      = state.eatingHoursPerDay    * 365.25 * lifeExpectancy;
    const groomingHours    = state.groomingHoursPerDay  * 365.25 * lifeExpectancy;
    const choresHours      = state.choresHoursPerDay    * 365.25 * lifeExpectancy;
    const commuteHours     = state.commuteHoursPerDay   * 260    * workYears;
    const socialMediaHours = state.socialMediaHoursPerDay * 365.25 * lifeExpectancy;
    const tvHours          = state.tvHoursPerDay          * 365.25 * lifeExpectancy;
    const streamingHours   = state.streamingHoursPerDay   * 365.25 * lifeExpectancy;

    const usedHours = sleepHours + workHours + schoolHours + eatingHours + groomingHours +
      choresHours + commuteHours + socialMediaHours + tvHours + streamingHours;
    const freeHours = totalLifeHours - usedHours;

    const totalSquares = totalWeeks;
    const cats = [
      { name: 'Sleep',        color: '#147df5', hours: sleepHours },
      { name: 'Work',         color: '#ff0000', hours: workHours },
      { name: 'Social Media', color: '#be0aff', hours: socialMediaHours },
      { name: 'TV',           color: '#580aff', hours: tvHours },
      { name: 'Streaming',    color: '#8B50FF', hours: streamingHours },
      { name: 'Eating',       color: '#0aff99', hours: eatingHours },
      { name: 'Chores',       color: '#a1ff0a', hours: choresHours },
      { name: 'Grooming',     color: '#deff0a', hours: groomingHours },
      { name: 'Commute',      color: '#ff8700', hours: commuteHours },
      { name: 'School',       color: '#ffd300', hours: schoolHours },
    ];

    const counts = cats.map(cat => Math.round((cat.hours / totalLifeHours) * totalSquares));
    let overflow = counts.reduce((a, b) => a + b, 0) - totalSquares;
    if (overflow > 0) {
      const byLargest = counts.map((_, idx) => idx).sort((a, b) => counts[b] - counts[a]);
      for (const idx of byLargest) {
        if (overflow <= 0) break;
        const trim = Math.min(counts[idx], overflow);
        counts[idx] -= trim;
        overflow -= trim;
      }
    }
    const freeCount = Math.max(0, totalSquares - counts.reduce((a, b) => a + b, 0));

    const arr: { i: number; color: string; category: string; hours: number; age: number; isPast: boolean; isCurrent: boolean }[] = [];
    const push = (color: string, category: string, hours: number) => {
      const i = arr.length;
      arr.push({ i, color, category, hours, age: i / 52, isPast: i < currentWeek, isCurrent: i === currentWeek });
    };
    cats.forEach((cat, ci) => {
      for (let k = 0; k < counts[ci]; k++) push(cat.color, cat.name, cat.hours);
    });
    for (let k = 0; k < freeCount; k++) push('#0aefff', 'Free Time', freeHours);

    return arr;
  }, [totalWeeks, currentWeek, lifeExpectancy, state]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const accent      = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#E63946';
    const isDark      = document.documentElement.classList.contains('dark');
    const futureColor = isDark ? '#2A2A2A' : '#D4CCBD';

    const DECADE_GAP = 4;

    let cols        = 1;
    let sqSize      = 9;
    let totalSqWidth = 11;
    let canvasWidth  = 800;
    let height       = 0;
    let rowsCount    = 0;
    let rafId: number | null = null;

    // y for a given row, accounting for accumulated decade gaps every 520 weeks
    const getRowY = (row: number): number => {
      const decadesPassed = Math.floor((row * cols) / 520);
      return Math.floor(row * totalSqWidth) + decadesPassed * DECADE_GAP;
    };

    // Canvas-relative coordinates (x starts at 0 — no label column offset in canvas space)
    const posOf = (idx: number) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      return {
        x: Math.floor(col * totalSqWidth),
        y: getRowY(row),
      };
    };

    const drawStaticSquare = (idx: number) => {
      const sq = squares[idx];
      if (!sq) return;
      const { x, y } = posOf(idx);
      ctx.globalAlpha = 1;
      ctx.fillStyle = futureColor;
      ctx.fillRect(x, y, sqSize, sqSize);
      if (sq.isPast) {
        ctx.save();
        ctx.strokeStyle = 'rgba(210, 40, 40, 0.55)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 2, y + 2);
        ctx.lineTo(x + sqSize - 2, y + sqSize - 2);
        ctx.moveTo(x + sqSize - 2, y + 2);
        ctx.lineTo(x + 2, y + sqSize - 2);
        ctx.stroke();
        ctx.restore();
      }
    };

    const drawAllStatic = () => {
      ctx.clearRect(0, 0, canvasWidth, height);
      for (let i = 0; i < totalWeeks; i++) drawStaticSquare(i);
    };

    const animatePulse = (time: number) => {
      if (currentWeek >= 0 && currentWeek < totalWeeks) {
        const pad   = sqSize + 12;
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

        const scale  = 1 + ((Math.sin(time / 300) + 1) / 2) * 0.25;
        const offset = (sqSize * scale - sqSize) / 2;
        ctx.save();
        ctx.globalAlpha = 1;
        ctx.shadowColor = accent;
        ctx.shadowBlur  = 8;
        ctx.fillStyle   = futureColor;
        ctx.fillRect(x - offset, y - offset, sqSize * scale, sqSize * scale);
        ctx.strokeStyle = accent;
        ctx.lineWidth   = 1;
        ctx.strokeRect(x - offset + 0.5, y - offset + 0.5, sqSize * scale - 1, sqSize * scale - 1);
        ctx.restore();
      }
      rafId = requestAnimationFrame(animatePulse);
    };

    const setup = () => {
      const fullWidth = containerRef.current?.clientWidth || 800;
      const isMobile  = window.innerWidth < 640;
      sqSize      = isMobile ? 5 : 9;
      const gap   = 2;
      totalSqWidth = sqSize + gap;

      // Canvas uses full width minus the HTML label column
      canvasWidth = fullWidth - LABEL_COL_WIDTH;
      const maxCols = Math.max(1, Math.floor(canvasWidth / totalSqWidth));
      const candidates = [130, 104, 65, 52, 40, 26, 20, 13, 10, 8, 5, 4, 2, 1];
      cols = candidates.find(c => c <= maxCols) ?? 52;
      rowsCount   = Math.ceil(totalWeeks / cols);
      height      = getRowY(rowsCount - 1) + totalSqWidth + DECADE_GAP;

      const dpr = window.devicePixelRatio || 1;
      canvas.width        = Math.round(canvasWidth * dpr);
      canvas.height       = Math.round(height     * dpr);
      canvas.style.width  = canvasWidth + 'px';
      canvas.style.height = height      + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;

      drawAllStatic();

      // Fix 7: decade labels centered vertically within each decade group
      const labels: DecadeLabel[] = [];
      const rowsPerDecade = 520 / cols;
      for (let d = 10; d <= 80; d += 10) {
        const weekIdx = d * 52;
        if (weekIdx >= totalWeeks) break;
        const firstRow = (d * 52) / cols;
        const midRow = firstRow + rowsPerDecade / 2;
        const floorMidRow = Math.floor(midRow);
        const frac = midRow - floorMidRow;
        const pixelY = Math.round(getRowY(floorMidRow) + frac * totalSqWidth);
        labels.push({ decade: d, y: pixelY });
      }
      setDecadeLabels(labels);

      // Fix 2 & 3: emoji positions (coffinX is canvas-relative, shifted by LABEL_COL_WIDTH for wrapper)
      if (totalWeeks > 0) {
        const babyPos  = posOf(0);
        const lastPos  = posOf(totalWeeks - 1);
        setEmojiPositions({
          babyY:    babyPos.y,
          coffinX:  lastPos.x + sqSize + 4,  // canvas-relative
          coffinY:  lastPos.y,
        });
      }
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
      const rect   = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const col = Math.floor(mouseX / totalSqWidth);
      if (col < 0 || col >= cols) { setTooltipData(null); return; }

      let hoveredRow = -1;
      for (let r = 0; r < rowsCount; r++) {
        const rowY = getRowY(r);
        if (mouseY >= rowY && mouseY < rowY + sqSize) { hoveredRow = r; break; }
      }
      if (hoveredRow === -1) { setTooltipData(null); return; }

      const index = hoveredRow * cols + col;
      if (index >= 0 && index < totalWeeks) {
        setTooltipData({
          x:            e.clientX,
          y:            e.clientY,
          weekIndex:    index,
          totalSquares: totalWeeks,
          isPast:       index < currentWeek,
          isCurrent:    index === currentWeek,
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

  const labelStyle: React.CSSProperties = {
    position: 'absolute',
    left: 8,
    fontSize: '11px',
    fontWeight: 700,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    lineHeight: 1,
    userSelect: 'none',
    pointerEvents: 'none',
    color: 'var(--foreground)',
    opacity: 0.4,
    width: '28px',
    textAlign: 'right',
  };

  return (
    <div className="w-full relative" ref={containerRef}>
      <div className="text-center font-bold uppercase tracking-widest text-sm opacity-50 mb-4">
        Each square = 1 week of your life
      </div>

      {/* Wrapper: left 40px column for HTML decade labels, canvas to the right */}
      <div style={{ position: 'relative', paddingLeft: LABEL_COL_WIDTH, display: 'block', marginLeft: 'auto', marginRight: 'auto', width: 'fit-content' }}>

        {/* Fix 1: decade labels as HTML — crisp on all DPR screens */}
        {decadeLabels.map(({ decade, y }) => (
          <span key={decade} style={{ ...labelStyle, top: y, transform: 'translateY(-50%)' }}>{decade}</span>
        ))}

        <canvas ref={canvasRef} className="block cursor-crosshair" />

        {/* Fix 3: coffin emoji replaces skull, positioned right of last square */}
        {emojiPositions && (
          <span style={{
            position: 'absolute',
            left: LABEL_COL_WIDTH + emojiPositions.coffinX,
            top: emojiPositions.coffinY,
            fontSize: '16px',
            lineHeight: 1,
            pointerEvents: 'none',
            userSelect: 'none',
          }}>⚰️</span>
        )}
      </div>

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
          <div style={{ fontSize: '11px', opacity: 0.7 }}>Week {tooltipData.weekIndex + 1} of {tooltipData.totalSquares}</div>
          <div className="font-bold mt-0.5">
            {tooltipData.isCurrent
              ? 'This is your week — right now'
              : tooltipData.isPast
                ? `${(tooltipData.weekIndex / tooltipData.totalSquares * 100).toFixed(1)}% of your life — already lived`
                : `${(tooltipData.weekIndex / tooltipData.totalSquares * 100).toFixed(1)}% of your life — yet to live`
            }
          </div>
        </div>
      )}

    </div>
  );
}
