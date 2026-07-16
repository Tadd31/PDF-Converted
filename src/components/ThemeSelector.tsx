/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { PRESETS, FilterConfig, FilterMode, Preset } from '../utils/colorFilter';
import { Settings, RefreshCw, Bookmark, Trash2, Check, Save, Sparkles } from 'lucide-react';
import { getUserPresets, saveUserPreset, deleteUserPreset, UserPreset } from '../utils/savedPresets';

interface ThemeSelectorProps {
  config: FilterConfig;
  onChange: (updates: Partial<FilterConfig>) => void;
}

export function ThemeSelector({ config, onChange }: ThemeSelectorProps) {
  const currentMode = config.mode;
  const [userPresets, setUserPresets] = useState<UserPreset[]>([]);
  const [presetName, setPresetName] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Load user presets on component mount
  useEffect(() => {
    setUserPresets(getUserPresets());
  }, []);

  const handleModeChange = (mode: FilterMode) => {
    onChange({ mode });
  };

  const handleCustomColorChange = (key: 'customBg' | 'customFg', value: string) => {
    onChange({ [key]: value });
  };

  const handleSavePreset = () => {
    const trimmedName = presetName.trim();
    const finalName = trimmedName || 'Custom Preset';
    
    const newPreset: UserPreset = {
      id: 'user_' + Date.now(),
      name: finalName,
      customBg: config.customBg,
      customFg: config.customFg,
      brightness: config.brightness,
      contrast: config.contrast,
      grayscale: config.grayscale,
      hueRotate: config.hueRotate,
    };

    const updated = saveUserPreset(newPreset);
    setUserPresets(updated);
    setPresetName('');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleDeleteUserPreset = (id: string) => {
    const updated = deleteUserPreset(id);
    setUserPresets(updated);
  };

  const handleSelectUserPreset = (p: UserPreset) => {
    onChange({
      mode: 'custom',
      customBg: p.customBg,
      customFg: p.customFg,
      brightness: p.brightness,
      contrast: p.contrast,
      grayscale: p.grayscale,
      hueRotate: p.hueRotate,
    });
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

          {/* Save Custom Preset block */}
          <div className="mt-4 pt-4 border-t-2 border-dashed border-black/20">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-black block">
                Save as Custom Preset
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Neon Mint, Dark Gold..."
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  className="flex-1 text-xs font-mono bg-white border-2 border-black rounded-none px-2.5 py-1.5 text-black focus:border-[#FF003C] focus:outline-none placeholder-zinc-400"
                />
                <button
                  type="button"
                  onClick={handleSavePreset}
                  className="px-3 py-1.5 bg-[#FF003C] hover:bg-red-700 text-white font-display font-black text-xs uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Save size={12} />
                  <span>Save</span>
                </button>
              </div>
              {saveSuccess && (
                <span className="text-[9px] text-green-600 font-bold uppercase tracking-wider flex items-center gap-1 mt-0.5">
                  <Check size={10} className="stroke-[3]" />
                  Preset Saved!
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* User's Saved Custom Presets */}
      {userPresets.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 pb-2 border-b-2 border-dashed border-black/20">
            <Bookmark size={14} className="text-[#FF003C] stroke-[2.5]" />
            <h4 className="text-xs font-display font-black text-black uppercase tracking-wider">
              My Saved Presets
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {userPresets.map((p) => {
              const isActive = currentMode === 'custom' && 
                config.customBg.toLowerCase() === p.customBg.toLowerCase() &&
                config.customFg.toLowerCase() === p.customFg.toLowerCase() &&
                config.brightness === p.brightness &&
                config.contrast === p.contrast &&
                config.grayscale === p.grayscale &&
                config.hueRotate === p.hueRotate;

              return (
                <div
                  key={p.id}
                  className={`group relative flex items-center justify-between border-2 rounded-none p-2.5 transition-all duration-200 text-left ${
                    isActive
                      ? 'border-black bg-black text-white shadow-[2px_2px_0px_#FF003C]'
                      : 'border-black hover:bg-zinc-100 bg-white text-zinc-800 shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                  }`}
                >
                  {/* Clickable Preset Area */}
                  <button
                    type="button"
                    onClick={() => handleSelectUserPreset(p)}
                    className="flex-1 flex items-center justify-between pr-2 text-left cursor-pointer overflow-hidden"
                  >
                    <div className="flex flex-col min-w-0 pr-1">
                      <span className={`text-[11px] font-mono font-black uppercase tracking-wide truncate ${isActive ? 'text-[#FF003C]' : 'text-black'}`}>
                        {p.name}
                      </span>
                      <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider font-mono">
                        {p.customBg} / {p.customFg}
                      </span>
                    </div>
                    
                    {/* Swatch info */}
                    <div className="flex -space-x-1 shrink-0">
                      <div
                        className="w-3.5 h-3.5 border border-black shadow-sm shrink-0"
                        style={{ backgroundColor: p.customBg }}
                      />
                      <div
                        className="w-3.5 h-3.5 border border-black shadow-sm shrink-0"
                        style={{ backgroundColor: p.customFg }}
                      />
                    </div>
                  </button>

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteUserPreset(p.id);
                    }}
                    className={`p-1 border border-transparent hover:border-black transition-all cursor-pointer rounded-none shrink-0 ${
                      isActive ? 'text-zinc-400 hover:text-white hover:bg-red-800' : 'text-zinc-400 hover:text-[#FF003C] hover:bg-red-50'
                    }`}
                    title="Delete preset"
                  >
                    <Trash2 size={12} className="stroke-[2.5]" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

