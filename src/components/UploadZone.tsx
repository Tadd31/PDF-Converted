/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { FileUp, Shield, Zap, Sparkles } from 'lucide-react';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  pdfJsLoaded: boolean;
  pdfJsError: string | null;
}

export function UploadZone({ onFileSelect, pdfJsLoaded, pdfJsError }: UploadZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        onFileSelect(file);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center justify-center max-w-2xl w-full mx-auto p-4">
      {/* App Header Tag */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 px-4 py-1.5 bg-zinc-900 border border-white/10 rounded-full text-zinc-100 text-xs font-bold tracking-wider uppercase mb-8 shadow-md"
      >
        <Sparkles size={13} className="text-[#CCFF00] animate-pulse" />
        <span>100% Client-Side & Securely Kept</span>
      </motion.div>

      {/* Upload card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`w-full bg-[#111] rounded-[32px] border-4 border-dashed transition-all duration-300 p-8 md:p-14 text-center relative overflow-hidden group ${
          isDragActive
            ? 'border-[#CCFF00] bg-zinc-900/60 scale-[1.01]'
            : 'border-white/10 hover:border-white/20 bg-[#111111]'
        }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        {/* Subtle grid background */}
        <div className="absolute inset-0 opacity-[0.03] grid-bg pointer-events-none" />

        {/* Top bar accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#CCFF00] via-emerald-400 to-indigo-500" />

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,application/pdf"
          onChange={handleChange}
        />

        <div className="flex flex-col items-center justify-center space-y-8 relative z-10">
          <motion.div
            animate={{ y: isDragActive ? -6 : 0 }}
            transition={{ repeat: Infinity, repeatType: "reverse", duration: 1.5, ease: "easeInOut" }}
            className={`w-20 h-20 border-2 rounded-full flex items-center justify-center transition-all ${
              isDragActive ? 'border-[#CCFF00] bg-zinc-900 text-[#CCFF00]' : 'border-white/10 text-white/40 bg-zinc-950/60'
            }`}
          >
            <FileUp size={32} className="stroke-[1.5]" />
          </motion.div>

          <div className="space-y-3">
            <h2 className="text-3xl font-black uppercase tracking-tight text-white">
              Present Thy PDF Scroll
            </h2>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto font-mono uppercase tracking-widest leading-relaxed">
              Drop thy parchment here or click below to search thy keep
            </p>
          </div>

          <div className="pt-2">
            <button
              id="upload-button"
              type="button"
              onClick={onButtonClick}
              disabled={!pdfJsLoaded}
              className={`px-8 py-4 rounded-xl font-black uppercase tracking-wider text-sm italic transition-all flex items-center gap-2 shadow-[4px_4px_0_rgba(204,255,0,0.15)] hover:shadow-[6px_6px_0_rgba(204,255,0,0.25)] active:translate-x-1 active:translate-y-1 active:shadow-none ${
                pdfJsLoaded
                  ? 'bg-[#CCFF00] text-black hover:bg-[#b5e600] cursor-pointer'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed shadow-none'
              }`}
            >
              {!pdfJsLoaded ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
                  <span>Loading Alchemical Engine...</span>
                </div>
              ) : (
                <span>Select PDF Folio</span>
              )}
            </button>
          </div>

          {pdfJsError && (
            <div className="p-3 bg-red-950/40 border border-red-900/50 text-red-400 text-xs rounded-xl mt-4 max-w-md font-mono text-left">
              <p className="font-bold uppercase tracking-wider text-red-500">Engine Error:</p>
              <p className="mt-1">{pdfJsError}</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Feature Badges */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full text-zinc-400"
      >
        <div className="flex items-start gap-4 p-5 bg-[#111] rounded-2xl border border-white/5 shadow-md">
          <Shield className="text-[#CCFF00] shrink-0 mt-0.5" size={18} />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">100% Secure Keep</h4>
            <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">Thy scrolls never leave thy browser. All re-tinting is compiled local to thy own engine.</p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-5 bg-[#111] rounded-2xl border border-white/5 shadow-md">
          <Zap className="text-[#CCFF00] shrink-0 mt-0.5" size={18} />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Exquisite Inks</h4>
            <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">Adjustable DPI bounds up to 4.0x scale for perfectly legible lines of text.</p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-5 bg-[#111] rounded-2xl border border-white/5 shadow-md">
          <Sparkles className="text-[#CCFF00] shrink-0 mt-0.5" size={18} />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Smart Illumination</h4>
            <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">Midnight Hamlet preserves original figures and maps while gently shifts thy parchment.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
