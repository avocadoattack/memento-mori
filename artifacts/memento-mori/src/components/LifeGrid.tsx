import React, { useEffect, useRef, useState, useMemo } from 'react';
import { EDUCATION_LEVELS } from '../lib/educationLevels';

interface Props {
  state: any;
  lifeExpectancy: number;
}

interface EmojiPositions {
  coffinX: number;
  coffinY: number;
}

interface DecadeLabel {
  decade: number;
  y: number;
}

const COLS = 52;          // fixed: one column per week of the year
const SQ_GAP = 2;         // px gap between squares
const DECADE_GAP = 8;     // extra px gap between 10-year row groups
const LABEL_WIDTH = 40;   // px for the decade-label column to the left of canvas

export function LifeGrid({ state, lifeExpectancy }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltipData, setTooltipData] = useState<{
    x: number; y: number; weekIndex: number; totalSquares: number;
    isPast: boolean; isCurrent: boolean;
  } | null>(null);
  const [emojiPositions, setEmojiPositions] = useState<EmojiPositions | null>(null);
  const [decadeLabels, setDecadeLabels] = useState<DecadeLabel[]>([]);
  const [containerWidth, setContainerWidth] = useState(800);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(entries => {
      setContainerWidth(entries[0].contentRect.width);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const totalWeeks = Math.ceil(lifeExpectancy * COLS);
  const currentWeek = Math.floor(state.currentAge * COLS);

  const squares = useMemo(() => {
    const totalLifeHours = lifeExpectancy * 365.25 * 24;
    const workYears = Math.max(0, state.retirementAge - state.workStartAge);

    const sleepHours       = state.sleepHoursPerNight    * 365.25 * lifeExpectancy;
    const workHours        = state.workHoursPerWeek      * 52     * workYears;
    const schoolHours      = EDUCATION_LEVELS
      .filter(l => (state.selectedEducationLevels as string[]).includes(l.id))
      .reduce((sum, l) => sum + l.years * l.daysPerYear * l.hoursPerDay, 0);
    const eatingHours      = state.eatingHoursPerDay     * 365.25 * lifeExpectancy;
    const groomingHours    = state.groomingHoursPerDay   * 365.25 * lifeExpectancy;
    const choresHours      = state.choresHoursPerDay     * 365.25 * lifeExpectancy;
    const commuteHours     = state.commuteHoursPerDay    * 260    * workYears;
    const socialMediaHours = state.socialMediaHoursPerDay * 365.25 * lifeExpectancy;
    const tvHours          = state.tvHoursPerDay          * 365.25 * lifeExpectancy;
    const streamingHours   = state.streamingHoursPerDay   * 365.25 * lifeExpectancy;

    const usedHours = sleepHours + workHours + schoolHours + eatingHours + groomingHours +
      choresHours + commuteHours + socialMediaHours + tvHours + streamingHours;
    const freeHours = totalLifeHours - usedHours;

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

    const counts = cats.map(cat => Math.round((cat.hours / totalLifeHours) * totalWeeks));
    let overflow = counts.reduce((a, b) => a + b, 0) - totalWeeks;
    if (overflow > 0) {
      const byLargest = counts.map((_, idx) => idx).sort((a, b) => counts[b] - counts[a]);
      for (const idx of byLargest) {
        if (overflow <= 0) break;
        const trim = Math.min(counts[idx], overflow);
        counts[idx] -= trim;
        overflow -= trim;
      }
    }
    const freeCount = Math.max(0, totalWeeks - counts.reduce((a, b) => a + b, 0));

    const arr: { i: number; color: string; category: string; isPast: boolean; isCurrent: boolean }[] = [];
    const push = (color: string, category: string) => {
      const i = arr.length;
      arr.push({ i, color, category, isPast: i < currentWeek, isCurrent: i === currentWeek });
    };
    cats.forEach((cat, ci) => { for (let k = 0; k < counts[ci]; k++) push(cat.color, cat.name); });
    for (let k = 0; k < freeCount; k++) push('#0aefff', 'Free Time');

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

    let sqSize     = 1;
    let totalSqWidth = 1;
    let canvasWidth  = 0;
    let canvasHeight = 0;
    let rowsCount  = 0;
    let rafId: number | null = null;

    // y for a given row index (one row = one year of life)
    // every 10 rows there's an extra DECADE_GAP
    const getRowY = (row: number): number =>
      row * totalSqWidth + Math.floor(row / 10) * DECADE_GAP;

    const posOf = (idx: number) => ({
      x: (idx % COLS) * totalSqWidth,
      y: getRowY(Math.floor(idx / COLS)),
    });

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
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      for (let i = 0; i < totalWeeks; i++) drawStaticSquare(i);
    };

    const animatePulse = (time: number) => {
      if (currentWeek >= 0 && currentWeek < totalWeeks) {
        const pad   = sqSize + 12;
        const range = Math.ceil(pad / totalSqWidth) + 1;
        const { x, y } = posOf(currentWeek);

        ctx.clearRect(x - pad, y - pad, sqSize + pad * 2, sqSize + pad * 2);

        const cCol = currentWeek % COLS;
        const cRow = Math.floor(currentWeek / COLS);
        for (let r = cRow - range; r <= cRow + range; r++) {
          if (r < 0 || r >= rowsCount) continue;
          for (let c = cCol - range; c <= cCol + range; c++) {
            if (c < 0 || c >= COLS) continue;
            const idx = r * COLS + c;
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
      const isMobile = containerWidth < 640;
      sqSize       = isMobile ? 5 : 9;
      totalSqWidth = sqSize + SQ_GAP;
      rowsCount    = Math.ceil(lifeExpectancy);
      canvasWidth  = COLS * totalSqWidth;
      canvasHeight = getRowY(rowsCount) + totalSqWidth;

      const dpr = window.devicePixelRatio || 1;
      canvas.width        = Math.round(canvasWidth  * dpr);
      canvas.height       = Math.round(canvasHeight * dpr);
      canvas.style.width  = canvasWidth  + 'px';
      canvas.style.height = canvasHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;

      drawAllStatic();

      // 5-year labels: 5, 10, 15 … each vertically centered on the last row of its block
      const labels: DecadeLabel[] = [];
      const roundedLE = Math.round(lifeExpectancy);

      for (let age = 5; age < lifeExpectancy; age += 5) {
        const lastRow = age - 1; // last row (0-indexed) of this 5-year block
        if (lastRow >= rowsCount) break;
        const y = Math.round(getRowY(lastRow) + sqSize / 2) - 6;
        labels.push({ decade: age, y });
      }

      // Final label = rounded life expectancy at the very last row of the grid
      const finalLastRow = rowsCount - 1;
      const finalY = Math.round(getRowY(finalLastRow) + sqSize / 2) - 6;
      // Remove last regular label if it would duplicate the final label value
      if (labels.length > 0 && labels[labels.length - 1].decade === roundedLE) {
        labels.pop();
      }
      labels.push({ decade: roundedLE, y: finalY });

      setDecadeLabels(labels);

      // Coffin emoji: to the right of the last square
      if (totalWeeks > 0) {
        const lastPos = posOf(totalWeeks - 1);
        setEmojiPositions({
          coffinX: lastPos.x + sqSize + 4,
          coffinY: lastPos.y,
        });
      }
    };

    setup();

    if (currentWeek >= 0 && currentWeek < totalWeeks) {
      rafId = requestAnimationFrame(animatePulse);
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect   = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const col = Math.floor(mouseX / totalSqWidth);
      if (col < 0 || col >= COLS) { setTooltipData(null); return; }

      // Find hovered row by scanning getRowY values
      let hoveredRow = -1;
      for (let r = 0; r < rowsCount; r++) {
        const rowY = getRowY(r);
        if (mouseY >= rowY && mouseY < rowY + sqSize) { hoveredRow = r; break; }
      }
      if (hoveredRow === -1) { setTooltipData(null); return; }

      const index = hoveredRow * COLS + col;
      if (index >= 0 && index < totalWeeks) {
        setTooltipData({
          x: e.clientX, y: e.clientY,
          weekIndex: index, totalSquares: totalWeeks,
          isPast: index < currentWeek, isCurrent: index === currentWeek,
        });
      } else {
        setTooltipData(null);
      }
    };

    const handleMouseLeave = () => setTooltipData(null);

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [squares, totalWeeks, currentWeek, containerWidth, lifeExpectancy]);

  const labelStyle: React.CSSProperties = {
    position: 'absolute',
    right: 8,
    fontWeight: 700,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    lineHeight: 1,
    userSelect: 'none',
    pointerEvents: 'none',
    color: 'var(--foreground)',
    opacity: 0.4,
    textAlign: 'right',
  };

  return (
    <div className="w-full relative" ref={containerRef}>
      <div className="text-center font-bold uppercase tracking-widest text-sm opacity-50 mb-4">
        Each square = 1 week of your life
      </div>

      {/* Outer centering wrapper */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {/* Inner wrapper: label column + canvas side-by-side */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start' }}>

          {/* Decade label column — HTML spans, crisp on all DPR */}
          <div style={{ width: LABEL_WIDTH, position: 'relative', flexShrink: 0, alignSelf: 'stretch' }}>
            {decadeLabels.map(({ decade, y }) => (
              <span key={decade} className="text-[11px] max-md:text-[10px]" style={{ ...labelStyle, top: y }}>{decade}</span>
            ))}
          </div>

          {/* Canvas — display:block; no explicit margin needed since flex handles centering */}
          <div style={{ position: 'relative' }}>
            <canvas ref={canvasRef} className="block cursor-crosshair" />

            {/* Coffin emoji after last square */}
            {emojiPositions && (
              <span style={{
                position: 'absolute',
                left: emojiPositions.coffinX,
                top: emojiPositions.coffinY,
                fontSize: '16px',
                lineHeight: 1,
                pointerEvents: 'none',
                userSelect: 'none',
              }}>⚰️</span>
            )}
          </div>
        </div>
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
