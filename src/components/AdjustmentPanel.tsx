/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FilterConfig } from '../utils/colorFilter';
import { Sliders, Sun, Eye, Undo2, RotateCw } from 'lucide-react';
import { MangaPanel } from './MangaPanel';

interface AdjustmentPanelProps {
  config: FilterConfig;
  onChange: (updates: Partial<FilterConfig>) => void;
}

export function AdjustmentPanel({ config, onChange }: AdjustmentPanelProps) {
  const handleReset = () => {
    onChange({
      brightness: 0,
      contrast: 0,
      grayscale: false,
      hueRotate: 0,
    });
  };

  const isModified =
    config.brightness !== 0 ||
    config.contrast !== 0 ||
    config.grayscale ||
    config.hueRotate !== 0;

  return (
    <MangaPanel className="space-y-5 text-black">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b-3 border-black">
        <div className="flex items-center gap-2">
          <Sliders size={18} className="text-[#FF003C] stroke-[2.5]" />
          <h4 className="text-sm font-display font-black text-black uppercase tracking-wider manga-slanted">
            Screentone Ink Adjustments
          </h4>
        </div>
        {isModified && (
          <button
            id="reset-adjustments-btn"
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#FF003C] hover:text-black transition-colors cursor-pointer"
          >
            <Undo2 size={11} className="stroke-[2.5]" />
            <span>Restore Original</span>
          </button>
        )}
      </div>

      {/* Brightness Slider */}
      <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
          <span className="text-zinc-800 flex items-center gap-1.5">
            <Sun size={13} className="text-zinc-800 stroke-[2]" /> Luminance
          </span>
          <span className={`font-mono ${config.brightness !== 0 ? 'text-[#FF003C] font-bold' : 'text-zinc-400'}`}>
            {config.brightness > 0 ? `+${config.brightness}` : config.brightness}%
          </span>
        </div>
        <input
          id="brightness-slider"
          type="range"
          min="-60"
          max="60"
          value={config.brightness}
          onChange={(e) => onChange({ brightness: parseInt(e.target.value) })}
          className="w-full h-1.5 bg-zinc-200 border border-black rounded-none appearance-none cursor-pointer accent-[#FF003C]"
        />
        <div className="flex justify-between text-[9px] text-zinc-600 px-1 font-mono uppercase tracking-wider font-bold">
          <span>Darker</span>
          <span>Zero</span>
          <span>Brighter</span>
        </div>
      </div>

      {/* Contrast Slider */}
      <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
          <span className="text-zinc-800 flex items-center gap-1.5">
            <Eye size={13} className="text-zinc-800 stroke-[2]" /> Starkness
          </span>
          <span className={`font-mono ${config.contrast !== 0 ? 'text-[#FF003C] font-bold' : 'text-zinc-400'}`}>
            {config.contrast > 0 ? `+${config.contrast}` : config.contrast}%
          </span>
        </div>
        <input
          id="contrast-slider"
          type="range"
          min="-60"
          max="60"
          value={config.contrast}
          onChange={(e) => onChange({ contrast: parseInt(e.target.value) })}
          className="w-full h-1.5 bg-zinc-200 border border-black rounded-none appearance-none cursor-pointer accent-[#FF003C]"
        />
        <div className="flex justify-between text-[9px] text-zinc-600 px-1 font-mono uppercase tracking-wider font-bold">
          <span>Faded</span>
          <span>Zero</span>
          <span>Sharp</span>
        </div>
      </div>

      {/* Hue Rotate Slider */}
      <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
          <span className="text-zinc-800 flex items-center gap-1.5">
            <RotateCw size={13} className="text-zinc-800 stroke-[2]" /> Chroma Spectrum
          </span>
          <span className={`font-mono ${config.hueRotate > 0 ? 'text-[#FF003C] font-bold' : 'text-zinc-400'}`}>
            {config.hueRotate}°
          </span>
        </div>
        <input
          id="huerotate-slider"
          type="range"
          min="0"
          max="360"
          value={config.hueRotate}
          onChange={(e) => onChange({ hueRotate: parseInt(e.target.value) })}
          className="w-full h-1.5 bg-zinc-200 border border-black rounded-none appearance-none cursor-pointer accent-[#FF003C]"
          style={{
            background: 'linear-gradient(to right, #ef4444, #f59e0b, #10b981, #06b6d4, #3b82f6, #8b5cf6, #ef4444)'
          }}
        />
      </div>

      {/* Grayscale Toggle */}
      {config.mode !== 'grayscale' && config.mode !== 'contrast_bw' && (
        <div className="flex items-center justify-between pt-3 border-t-3 border-black">
          <label htmlFor="grayscale-toggle" className="text-[10px] font-bold uppercase tracking-wider text-zinc-800 cursor-pointer font-sans">
            Mono-tone Overlay (Screentone)
          </label>
          <div className="relative inline-flex items-center">
            <input
              id="grayscale-toggle"
              type="checkbox"
              checked={config.grayscale}
              onChange={(e) => onChange({ grayscale: e.target.checked })}
              className="text-[#FF003C] bg-white border-3 border-black w-5 h-5 rounded-none appearance-none checked:bg-[#FF003C] cursor-pointer"
            />
          </div>
        </div>
      )}
    </MangaPanel>
  );
}
