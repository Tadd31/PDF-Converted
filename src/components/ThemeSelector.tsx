/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PRESETS, FilterConfig, FilterMode, Preset } from '../utils/colorFilter';
import { Settings, RefreshCw } from 'lucide-react';

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
      <div className="flex flex-wrap items-center gap-2 pb-3 border-b-3 border-black">
        {/* Shirokuro (白黒) Symbol: Beautiful Zen Ensō circle */}
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 100 100" 
          className="shrink-0 text-black fill-current" 
          xmlns="http://www.w3.org/2000/svg"
          title="Shirokuro (白黒)"
        >
          {/* Handcrafted vector representation of a dynamic, tapering zen ink brush circle */}
          <path d="M 78 32 C 84 15, 54 8, 35 18 C 12 30, 8 60, 24 78 C 42 96, 76 92, 85 70 C 90 58, 86 46, 75 44 C 65 42, 60 52, 66 60 C 70 66, 68 76, 54 78 C 38 80, 26 70, 24 54 C 22 34, 38 24, 55 24 C 70 24, 76 35, 71 42 C 67 46, 73 50, 78 32 Z" />
        </svg>
        <h3 className="text-sm font-display font-black text-black uppercase tracking-wider manga-slanted">
          Screentone & PDF Presets
        </h3>
      </div>

      {/* Preset Theme Grid */}
      <div className="grid grid-cols-2 gap-4">
        {presetList.map((preset) => {
          const isActive = currentMode === preset.id;
          return (
            <button
              key={preset.id}
              id={`preset-${preset.id}`}
              onClick={() => handleModeChange(preset.id)}
              className={`group flex flex-col p-4 rounded-none border-3 transition-all duration-200 text-left relative cursor-pointer ${
                isActive
                  ? 'border-black bg-black text-white manga-shadow-red font-black'
                  : 'border-black hover:bg-zinc-100 bg-zinc-50 text-zinc-800 manga-shadow'
              }`}
            >
              {/* Palette indicators */}
              <div className="flex gap-1.5 items-center justify-between w-full">
                <span className={`text-xs font-display font-black uppercase tracking-wider transition-colors ${isActive ? 'text-[#FF003C]' : 'text-zinc-800 group-hover:text-black'}`}>
                  {preset.name}
                </span>
                <div className="flex -space-x-1 shrink-0">
                  <div
                    className="w-4 h-4 border-2 border-black shadow-sm shrink-0"
                    style={{ backgroundColor: preset.bg }}
                    title="Background"
                  />
                  <div
                    className="w-4 h-4 border-2 border-black shadow-sm shrink-0"
                    style={{ backgroundColor: preset.fg }}
                    title="Text"
                  />
                </div>
              </div>
            </button>
          );
        })}

        {/* Silent Manga Pane */}
        <button
          id="mode-grayscale"
          onClick={() => handleModeChange('grayscale')}
          className={`group flex flex-col p-4 rounded-none border-3 transition-all duration-200 text-left relative cursor-pointer ${
            currentMode === 'grayscale'
              ? 'border-black bg-black text-white manga-shadow-red'
              : 'border-black hover:bg-zinc-100 bg-zinc-50 text-zinc-800 manga-shadow'
          }`}
        >
          <div className="flex gap-1.5 items-center justify-between w-full">
            <span className={`text-xs font-display font-black uppercase tracking-wider transition-colors ${currentMode === 'grayscale' ? 'text-[#FF003C]' : 'text-zinc-800 group-hover:text-black'}`}>
              Shōnen Newsprint
            </span>
            <div className="flex -space-x-1 shrink-0">
              <div
                className="w-4 h-4 border-2 border-black shadow-sm bg-zinc-700 shrink-0"
                title="Background"
              />
              <div
                className="w-4 h-4 border-2 border-black shadow-sm bg-zinc-400 shrink-0"
                title="Text"
              />
            </div>
          </div>
        </button>

        {/* Glow Matrix */}
        <button
          id="mode-invert-raw"
          onClick={() => handleModeChange('invert_raw')}
          className={`group flex flex-col p-4 rounded-none border-3 transition-all duration-200 text-left relative cursor-pointer ${
            currentMode === 'invert_raw'
              ? 'border-black bg-black text-white manga-shadow-red'
              : 'border-black hover:bg-zinc-100 bg-zinc-50 text-zinc-800 manga-shadow'
          }`}
        >
          <div className="flex gap-1.5 items-center justify-between w-full">
            <span className={`text-xs font-display font-black uppercase tracking-wider transition-colors ${currentMode === 'invert_raw' ? 'text-[#FF003C]' : 'text-zinc-800 group-hover:text-black'}`}>
              Raw Ink Inversion
            </span>
            <div className="flex -space-x-1 shrink-0">
              <div
                className="w-4 h-4 border-2 border-black shadow-sm bg-indigo-600 shrink-0"
                title="Background"
              />
              <div
                className="w-4 h-4 border-2 border-black shadow-sm bg-amber-400 shrink-0"
                title="Text"
              />
            </div>
          </div>
        </button>
      </div>

      {/* Custom Theme Section */}
      <div
        className={`p-4 rounded-none border-6 border-double transition-all ${
          currentMode === 'custom'
            ? 'border-black bg-zinc-100 manga-shadow-red'
            : 'border-black bg-zinc-50 manga-shadow'
        }`}
      >
        <button
          id="mode-custom"
          onClick={() => handleModeChange('custom')}
          className="flex items-center justify-between w-full text-left font-display font-black uppercase tracking-wider text-xs text-black mb-4 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Settings size={14} className={currentMode === 'custom' ? 'text-[#FF003C] stroke-[2.5]' : 'text-zinc-500'} />
            <span className="manga-slanted">Custom Filter Palette</span>
          </div>
          <input
            type="radio"
            checked={currentMode === 'custom'}
            onChange={() => handleModeChange('custom')}
            className="text-[#FF003C] focus:ring-[#FF003C] bg-white border-black w-4 h-4 rounded-none appearance-none border-2 checked:bg-[#FF003C] cursor-pointer"
          />
        </button>

        {/* Custom Colors Inputs */}
        <div className={`space-y-4 transition-all duration-300 ${currentMode === 'custom' ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
          <div className="grid grid-cols-2 gap-4">
            {/* BG Color */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-800 block font-mono">Background</label>
              <div className="flex items-center gap-2">
                <input
                  id="custom-bg-input"
                  type="color"
                  value={config.customBg}
                  onChange={(e) => handleCustomColorChange('customBg', e.target.value)}
                  className="w-8 h-8 rounded-none border-2 border-black cursor-pointer p-0 shrink-0 bg-transparent"
                />
                <input
                  type="text"
                  value={config.customBg}
                  onChange={(e) => handleCustomColorChange('customBg', e.target.value)}
                  className="w-full text-xs font-mono uppercase bg-white border-2 border-black rounded-none px-2.5 py-1.5 text-black focus:border-[#FF003C] focus:outline-none"
                />
              </div>
            </div>

            {/* FG Color */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-800 block font-mono">Text / Fg</label>
              <div className="flex items-center gap-2">
                <input
                  id="custom-fg-input"
                  type="color"
                  value={config.customFg}
                  onChange={(e) => handleCustomColorChange('customFg', e.target.value)}
                  className="w-8 h-8 rounded-none border-2 border-black cursor-pointer p-0 shrink-0 bg-transparent"
                />
                <input
                  type="text"
                  value={config.customFg}
                  onChange={(e) => handleCustomColorChange('customFg', e.target.value)}
                  className="w-full text-xs font-mono uppercase bg-white border-2 border-black rounded-none px-2.5 py-1.5 text-black focus:border-[#FF003C] focus:outline-none"
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
              className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-700 hover:text-black transition-colors cursor-pointer"
            >
              <RefreshCw size={11} className="text-[#FF003C] stroke-[2]" />
              <span>Invert Canvas Hues</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

