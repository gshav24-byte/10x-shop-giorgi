import { useEffect, useState } from "react";

interface PriceRangeSliderProps {
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  onChange: (newMin: number, newMax: number) => void;
}

export const PriceRangeSlider = ({
  min,
  max,
  valueMin,
  valueMax,
  onChange,
}: PriceRangeSliderProps) => {
  const [inputMin, setInputMin] = useState<string>(String(valueMin));
  const [inputMax, setInputMax] = useState<string>(String(valueMax));

  useEffect(() => {
    setInputMin(String(valueMin));
  }, [valueMin]);

  useEffect(() => {
    setInputMax(String(valueMax));
  }, [valueMax]);

  const range = max - min;
  const minPercent =
    range <= 0
      ? 0
      : Math.max(0, Math.min(100, ((valueMin - min) / range) * 100));
  const maxPercent =
    range <= 0
      ? 100
      : Math.max(0, Math.min(100, ((valueMax - min) / range) * 100));

  const handleMinSlider = (val: number) => {
    const clamped = Math.min(val, valueMax);
    onChange(clamped, valueMax);
  };

  const handleMaxSlider = (val: number) => {
    const clamped = Math.max(val, valueMin);
    onChange(valueMin, clamped);
  };

  const commitMinInput = () => {
    const parsed = Number(inputMin);
    if (Number.isNaN(parsed)) {
      setInputMin(String(valueMin));
      return;
    }
    const clamped = Math.max(min, Math.min(Math.floor(parsed), valueMax));
    setInputMin(String(clamped));
    onChange(clamped, valueMax);
  };

  const commitMaxInput = () => {
    const parsed = Number(inputMax);
    if (Number.isNaN(parsed)) {
      setInputMax(String(valueMax));
      return;
    }
    const clamped = Math.min(max, Math.max(Math.ceil(parsed), valueMin));
    setInputMax(String(clamped));
    onChange(valueMin, clamped);
  };

  return (
    <div className="w-full">
      <style>{`
        .dual-range-input {
          -webkit-appearance: none;
          appearance: none;
          pointer-events: none;
          background: transparent;
        }
        .dual-range-input::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          pointer-events: auto;
          height: 18px;
          width: 18px;
          border-radius: 9999px;
          background: #4f46e5;
          border: 3px solid #ffffff;
          box-shadow: 0 1px 4px rgba(15, 23, 42, 0.3);
          cursor: pointer;
          transition: transform 0.12s ease;
        }
        .dual-range-input::-webkit-slider-thumb:hover {
          transform: scale(1.15);
        }
        .dual-range-input::-moz-range-thumb {
          pointer-events: auto;
          height: 18px;
          width: 18px;
          border-radius: 9999px;
          background: #4f46e5;
          border: 3px solid #ffffff;
          box-shadow: 0 1px 4px rgba(15, 23, 42, 0.3);
          cursor: pointer;
          transition: transform 0.12s ease;
        }
        .dual-range-input::-moz-range-thumb:hover {
          transform: scale(1.15);
        }
      `}</style>

      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 w-28">
          <span className="text-xs text-slate-400 mr-1">$</span>
          <input
            type="number"
            min={min}
            max={valueMax}
            value={inputMin}
            onChange={(e) => setInputMin(e.target.value)}
            onBlur={commitMinInput}
            onKeyDown={(e) => e.key === "Enter" && commitMinInput()}
            aria-label="Minimum price"
            className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none"
          />
        </div>

        <span className="text-slate-300 text-xs font-bold">—</span>

        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 w-28">
          <span className="text-xs text-slate-400 mr-1">$</span>
          <input
            type="number"
            min={valueMin}
            max={max}
            value={inputMax}
            onChange={(e) => setInputMax(e.target.value)}
            onBlur={commitMaxInput}
            onKeyDown={(e) => e.key === "Enter" && commitMaxInput()}
            aria-label="Maximum price"
            className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none"
          />
        </div>
      </div>

      {/* სლაიდერის ხაზი და ორი მცოცავი წერტილი */}
      <div className="relative h-6 flex items-center">
        <div className="w-full h-1.5 bg-slate-200 rounded-full relative">
          <div
            className="absolute h-1.5 bg-indigo-600 rounded-full"
            style={{
              left: `${minPercent}%`,
              width: `${Math.max(0, maxPercent - minPercent)}%`,
            }}
          />
        </div>

        <input
          type="range"
          min={min}
          max={max}
          value={valueMin}
          disabled={range <= 0}
          onChange={(e) => handleMinSlider(Number(e.target.value))}
          aria-label="Minimum price slider"
          className="dual-range-input absolute w-full h-6 left-0 top-0 z-20"
        />

        <input
          type="range"
          min={min}
          max={max}
          value={valueMax}
          disabled={range <= 0}
          onChange={(e) => handleMaxSlider(Number(e.target.value))}
          aria-label="Maximum price slider"
          className="dual-range-input absolute w-full h-6 left-0 top-0 z-30"
        />
      </div>
    </div>
  );
};
