import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface StepperSliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  label: string;
  sublabel?: string;
  isAutoDefault?: boolean;
  isModified?: boolean;
  categoryColor?: string;
  tooltip?: string;
  unit?: string;
}

export function StepperSlider({
  value, min, max, step = 0.1, onChange,
  label, sublabel, isAutoDefault, isModified,
  categoryColor = 'var(--accent)', tooltip, unit,
}: StepperSliderProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef  = useRef<ReturnType<typeof setTimeout>  | null>(null);

  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  const fmt = (v: number) => v < 10 && step < 1 ? v.toFixed(1) : String(Math.round(v));

  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  const snap  = (v: number) => parseFloat((Math.round(v / step) * step).toFixed(10));

  const applyStep = useCallback((direction: 1 | -1) => {
    const raw = value + direction * step;
    onChange(Math.min(max, Math.max(min, Math.round(raw * 10) / 10)));
  }, [value, step, min, max, onChange]);

  const stopHold = useCallback(() => {
    if (timeoutRef.current)  { clearTimeout(timeoutRef.current);   timeoutRef.current  = null; }
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }, []);

  const startHold = useCallback((direction: 1 | -1) => {
    stopHold();
    applyStep(direction);
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => applyStep(direction), 180);
    }, 450);
  }, [applyStep, stopHold]);

  useEffect(() => {
    return () => stopHold();
  }, [stopHold]);

  const startEdit = () => { setEditValue(String(value)); setEditing(true); };
  const commitEdit = () => {
    const parsed = parseFloat(editValue);
    if (!isNaN(parsed)) onChange(clamp(snap(parsed)));
    setEditing(false);
  };

  return (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-semibold flex items-center gap-1.5">
          {isModified && <span className="text-[var(--accent)] text-[10px]">●</span>}
          {label}
          {isAutoDefault && (
            <span className="px-1.5 py-0.5 bg-foreground/10 text-foreground/70 text-[10px] uppercase font-bold rounded">Auto</span>
          )}
          {tooltip && (
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-3.5 h-3.5 opacity-40 hover:opacity-100 transition-opacity" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[200px] text-xs">{tooltip}</TooltipContent>
            </Tooltip>
          )}
        </label>
        {editing ? (
          <input
            type="number"
            autoFocus
            className="w-16 text-right font-mono text-sm font-bold bg-card border border-accent px-1 py-0.5 focus:outline-none"
            style={{ color: categoryColor }}
            value={editValue}
            min={min} max={max} step={step}
            onChange={e => setEditValue(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={e => {
              if (e.key === 'Enter') commitEdit();
              if (e.key === 'Escape') setEditing(false);
            }}
          />
        ) : (
          <span
            className="font-mono text-sm font-bold cursor-pointer select-none flex items-baseline gap-1 max-md:min-w-[56px] max-md:justify-end"
            style={{ color: isModified ? categoryColor : undefined, opacity: isModified ? 1 : 0.7 }}
            onClick={startEdit}
            title="Click to type a value"
            role="spinbutton"
            aria-label={label}
            aria-valuenow={value}
            aria-valuemin={min}
            aria-valuemax={max}
          >
            {fmt(value)}
            {unit && <span style={{ fontSize: '11px', opacity: 0.5, fontWeight: 400 }}>{unit}</span>}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          className="flex-none w-8 h-8 max-md:min-h-[44px] max-md:min-w-[44px] flex items-center justify-center rounded font-bold text-base max-md:text-lg select-none border transition-colors hover:opacity-80 active:scale-95"
          style={{ borderColor: categoryColor, color: categoryColor }}
          onPointerDown={e => { e.preventDefault(); startHold(-1); }}
          onPointerUp={stopHold}
          onPointerLeave={stopHold}
          aria-label={`Decrease ${label}`}
        >−</button>

        <div className="relative flex-1 h-1.5 bg-foreground/10 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-75"
            style={{ width: `${pct}%`, backgroundColor: categoryColor }}
          />
        </div>

        <button
          className="flex-none w-8 h-8 max-md:min-h-[44px] max-md:min-w-[44px] flex items-center justify-center rounded font-bold text-base max-md:text-lg select-none border transition-colors hover:opacity-80 active:scale-95"
          style={{ borderColor: categoryColor, color: categoryColor }}
          onPointerDown={e => { e.preventDefault(); startHold(1); }}
          onPointerUp={stopHold}
          onPointerLeave={stopHold}
          aria-label={`Increase ${label}`}
        >+</button>
      </div>

      {sublabel && (
        <div className="text-[11px] opacity-50 mt-1.5">{sublabel}</div>
      )}
    </div>
  );
}
