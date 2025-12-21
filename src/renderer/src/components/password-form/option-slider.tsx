import React from 'react';
import Slider from './slider';

interface OptionSliderProps {
  label: string;
  included: boolean;
  setIncluded: (val: boolean) => void;
  minCount: number;
  setMinCount: (val: number) => void;
}

export default function OptionSlider({
  label,
  included,
  setIncluded,
  minCount,
  setMinCount
}: OptionSliderProps): React.JSX.Element {
  return (
    <div className="option-row">
      <button
        className={`option-checkbox ${included ? 'checked' : ''}`}
        onClick={() => setIncluded(!included)}
        type="button"
      >
        {included && <span className="option-checkbox-text body1">{minCount}</span>}
      </button>

      <span className="option-label">{label}</span>

      {included && (
        <Slider minimumValue={1} maximumValue={10} value={minCount} onValueChange={setMinCount} />
      )}
    </div>
  );
}
