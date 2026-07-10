/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PRESETS, FilterConfig, FilterMode, Preset } from '../utils/colorFilter';
import { Palette, Eye, Contrast, Settings, RefreshCw } from 'lucide-react';

interface ThemeSelectorProps {
  config: FilterConfig;
  onChange: (updates: Partial<FilterConfig>) => void;
}

export function ThemeSelector({ config, onChange }: ThemeSelectorProps) {
  const currentMode = config.mode;

  const handleModeChange = (mode: FilterMode) => {
    onChange({ mode });
  };

  const handleCustomColorChange = (key: 'customBg' | 'customFg', value: string) => {
    onChange({ [key]: value });
  };

  const presetList = Object.values(PRESETS);

  return (
    <div className="space-y-6">
      {/* Modes Title */}
      <div className="flex items-center gap-2 pb-3 border-b border-white/10">
        <Palette size={16} className="text-[#CCFF00]" />
        <h3 className="text-xs font-black text-white uppercase tracking-widest">
          Color Profiles
        </h3>
      </div>

      {/* Preset Theme Grid */}
      <div className="grid grid-cols-2 gap-3">
        {presetList.map((preset) => {
          const isActive = currentMode === preset.id;
          return (
            <button
              key={preset.id}
              id={`preset-${preset.id}`}
              onClick={() => handleModeChange(preset.id)}
              className={`group flex flex-col p-4 rounded-xl border transition-all duration-200 text-left relative cursor-pointer ${
                isActive
                  ? 'border-[#CCFF00] bg-zinc-900 text-white shadow-[0_0_15px_rgba(204,255,0,0.1)]'
                  : 'border-white/5 hover:border-white/15 hover:bg-zinc-900/40 bg-[#161616] text-zinc-300'
              }`}
            >
              {/* Palette indicators */}
              <div className="flex gap-1.5 items-center justify-between mb-3 w-full">
                <span className={`text-xs font-bold uppercase tracking-wider group-hover:text-white transition-colors ${isActive ? 'text-[#CCFF00]' : 'text-zinc-200'}`}>
                  {preset.name}
                </span>
                <div className="flex -space-x-1.5 shrink-0">
                  <div
                    className="w-4 h-4 rounded-full border border-white/10 shadow-sm"
                    style={{ backgroundColor: preset.bg }}
                    title="Background"
                  />
                  <div
                    className="w-4 h-4 rounded-full border border-white/10 shadow-sm"
                    style={{ backgroundColor: preset.fg }}
                    title="Text"
                  />
                </div>
              </div>

              <span className="text-[10px] text-zinc-500 line-clamp-2 leading-relaxed uppercase font-mono tracking-tight">
                {preset.description}
              </span>
            </button>
          );
        })}
      </div>

      {/* Special/Utility Modes Grid */}
      <div className="grid grid-cols-3 gap-3">
        {/* Grayscale */}
        <button
          id="mode-grayscale"
          onClick={() => handleModeChange('grayscale')}
          className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer ${
            currentMode === 'grayscale'
              ? 'border-[#CCFF00] bg-zinc-900 text-white'
              : 'border-white/5 hover:border-white/15 bg-[#161616] text-zinc-300'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider">Grayscale</span>
          <div className="flex gap-1 mt-2">
            <div className="w-3 h-3 rounded-full bg-zinc-400 border border-white/10" />
            <div className="w-3 h-3 rounded-full bg-zinc-700 border border-white/10" />
          </div>
        </button>

        {/* Contrast B&W */}
        <button
          id="mode-contrast-bw"
          onClick={() => handleModeChange('contrast_bw')}
          className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer ${
            currentMode === 'contrast_bw'
              ? 'border-[#CCFF00] bg-zinc-900 text-white'
              : 'border-white/5 hover:border-white/15 bg-[#161616] text-zinc-300'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-center">B&W Stark</span>
          <div className="flex gap-1 mt-2">
            <div className="w-3 h-3 rounded-full bg-white border border-white/10" />
            <div className="w-3 h-3 rounded-full bg-black border border-white/10" />
          </div>
        </button>

        {/* Raw Inversion */}
        <button
          id="mode-invert-raw"
          onClick={() => handleModeChange('invert_raw')}
          className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer ${
            currentMode === 'invert_raw'
              ? 'border-[#CCFF00] bg-zinc-900 text-white'
              : 'border-white/5 hover:border-white/15 bg-[#161616] text-zinc-300'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-center">Raw Inv</span>
          <div className="flex gap-1 mt-2">
            <div className="w-3 h-3 rounded-full bg-amber-400 border border-white/10" />
            <div className="w-3 h-3 rounded-full bg-indigo-600 border border-white/10" />
          </div>
        </button>
      </div>

      {/* Custom Theme Section */}
      <div
        className={`p-4 rounded-xl border transition-all ${
          currentMode === 'custom'
            ? 'border-[#CCFF00] bg-[#1a1a1a]'
            : 'border-white/5 hover:border-white/15 bg-[#161616]'
        }`}
      >
        <button
          id="mode-custom"
          onClick={() => handleModeChange('custom')}
          className="flex items-center justify-between w-full text-left font-bold uppercase tracking-wider text-xs text-white mb-4 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Settings size={14} className={currentMode === 'custom' ? 'text-[#CCFF00]' : 'text-zinc-500'} />
            <span>Custom Color Palette</span>
          </div>
          <input
            type="radio"
            checked={currentMode === 'custom'}
            onChange={() => handleModeChange('custom')}
            className="text-[#CCFF00] focus:ring-[#CCFF00] bg-zinc-900 border-white/10 w-4 h-4"
          />
        </button>

        {/* Custom Colors Inputs */}
        <div className={`space-y-4 transition-all duration-300 ${currentMode === 'custom' ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
          <div className="grid grid-cols-2 gap-4">
            {/* BG Color */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block font-mono">Background</label>
              <div className="flex items-center gap-2">
                <input
                  id="custom-bg-input"
                  type="color"
                  value={config.customBg}
                  onChange={(e) => handleCustomColorChange('customBg', e.target.value)}
                  className="w-8 h-8 rounded-lg border border-white/10 cursor-pointer p-0 shrink-0 bg-transparent"
                />
                <input
                  type="text"
                  value={config.customBg}
                  onChange={(e) => handleCustomColorChange('customBg', e.target.value)}
                  className="w-full text-xs font-mono uppercase bg-zinc-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-zinc-300 focus:border-[#CCFF00] focus:outline-none"
                />
              </div>
            </div>

            {/* FG Color */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block font-mono">Text / Fg</label>
              <div className="flex items-center gap-2">
                <input
                  id="custom-fg-input"
                  type="color"
                  value={config.customFg}
                  onChange={(e) => handleCustomColorChange('customFg', e.target.value)}
                  className="w-8 h-8 rounded-lg border border-white/10 cursor-pointer p-0 shrink-0 bg-transparent"
                />
                <input
                  type="text"
                  value={config.customFg}
                  onChange={(e) => handleCustomColorChange('customFg', e.target.value)}
                  className="w-full text-xs font-mono uppercase bg-zinc-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-zinc-300 focus:border-[#CCFF00] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Quick swaps */}
          <div className="flex justify-end pt-1">
            <button
              id="swap-colors-btn"
              type="button"
              onClick={() => {
                if (currentMode === 'custom') {
                  onChange({
                    customBg: config.customFg,
                    customFg: config.customBg,
                  });
                }
              }}
              className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw size={11} className="text-[#CCFF00]" />
              <span>Swap Colors</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
