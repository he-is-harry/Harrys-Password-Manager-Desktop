import React from 'react';

interface SliderProps {
  minimumValue: number;
  maximumValue: number;
  value: number;
  onValueChange: (val: number) => void;
}

export default function Slider({
  minimumValue,
  maximumValue,
  value,
  onValueChange
}: SliderProps): React.JSX.Element {
  const percentage = ((value - minimumValue) / (maximumValue - minimumValue)) * 100;

  return (
    <input
      type="range"
      min={minimumValue}
      max={maximumValue}
      step={1}
      value={value}
      onChange={(e) => onValueChange(Number(e.target.value))}
      className="option-slider"
      style={{
        backgroundImage: `linear-gradient(to right, var(--color-white) ${percentage}%, transparent ${percentage}%)`,
        backgroundSize: '100% 4px',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center'
      }}
    />
  );
}
