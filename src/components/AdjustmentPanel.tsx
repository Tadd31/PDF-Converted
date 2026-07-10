/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FilterConfig } from '../utils/colorFilter';
import { Sliders, Sun, Eye, Undo2, RotateCw } from 'lucide-react';

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
    <div className="space-y-5 bg-[#161616] p-5 rounded-xl border border-white/5 shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Sliders size={15} className="text-[#CCFF00]" />
          <h4 className="text-xs font-black text-white uppercase tracking-widest">
            Alchemical Refinements
          </h4>
        </div>
        {isModified && (
          <button
            id="reset-adjustments-btn"
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#CCFF00] hover:text-white transition-colors cursor-pointer"
          >
            <Undo2 size={11} />
            <span>Restore Original</span>
          </button>
        )}
      </div>

      {/* Brightness Slider */}
      <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
          <span className="text-zinc-400 flex items-center gap-1.5">
            <Sun size={13} className="text-zinc-400" /> Luminance
          </span>
          <span className={`font-mono ${config.brightness !== 0 ? 'text-[#CCFF00] font-bold' : 'text-zinc-500'}`}>
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
          className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#CCFF00]"
        />
        <div className="flex justify-between text-[9px] text-zinc-500 px-1 font-mono uppercase tracking-wider">
          <span>Darker</span>
          <span>Zero</span>
          <span>Brighter</span>
        </div>
      </div>

      {/* Contrast Slider */}
      <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
          <span className="text-zinc-400 flex items-center gap-1.5">
            <Eye size={13} className="text-zinc-400" /> Starkness
          </span>
          <span className={`font-mono ${config.contrast !== 0 ? 'text-[#CCFF00] font-bold' : 'text-zinc-500'}`}>
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
          className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#CCFF00]"
        />
        <div className="flex justify-between text-[9px] text-zinc-500 px-1 font-mono uppercase tracking-wider">
          <span>Faded</span>
          <span>Zero</span>
          <span>Sharp</span>
        </div>
      </div>

      {/* Hue Rotate Slider */}
      <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
          <span className="text-zinc-400 flex items-center gap-1.5">
            <RotateCw size={13} className="text-zinc-400" /> Chroma Alchemy
          </span>
          <span className={`font-mono ${config.hueRotate > 0 ? 'text-[#CCFF00] font-bold' : 'text-zinc-500'}`}>
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
          className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#CCFF00]"
          style={{
            background: 'linear-gradient(to right, #ef4444, #f59e0b, #10b981, #06b6d4, #3b82f6, #8b5cf6, #ef4444)'
          }}
        />
      </div>

      {/* Grayscale Toggle */}
      {config.mode !== 'grayscale' && config.mode !== 'contrast_bw' && (
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <label htmlFor="grayscale-toggle" className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 cursor-pointer font-sans">
            Dull All Hues (Monologue)
          </label>
          <div className="relative inline-flex items-center">
            <input
              id="grayscale-toggle"
              type="checkbox"
              checked={config.grayscale}
              onChange={(e) => onChange({ grayscale: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-zinc-900 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-500 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#CCFF00] peer-checked:after:bg-black cursor-pointer"></div>
          </div>
        </div>
      )}
    </div>
  );
}
