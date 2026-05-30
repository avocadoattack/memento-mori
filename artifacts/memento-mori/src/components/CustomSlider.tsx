import React from 'react';

interface CustomSliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (val: number) => void;
  color: string;
  isOverridden?: boolean;
}

export function CustomSlider({ value, min, max, step = 1, onChange, color, isOverridden }: CustomSliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;
  
  const bgStyle = {
    background: `linear-gradient(to right, ${color} 0%, ${color} ${percentage}%, var(--track-bg, #ddd) ${percentage}%, var(--track-bg, #ddd) 100%)`
  };

  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className={`custom-slider ${isOverridden ? 'ring-1 ring-accent ring-offset-1 ring-offset-background' : ''}`}
      style={bgStyle}
    />
  );
}
