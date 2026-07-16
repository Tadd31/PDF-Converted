/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { FileUp, Shield, Zap, Sparkles, Upload } from 'lucide-react';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  pdfJsLoaded: boolean;
  pdfJsError: string | null;
  isParsing?: boolean;
  parsingFileName?: string;
}

export function UploadZone({
  onFileSelect,
  pdfJsLoaded,
  pdfJsError,
  isParsing = false,
  parsingFileName,
}: UploadZoneProps) {
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
      {/* App Header Tag - Styled as an authentic Manga dialogue/speech bubble */}
      <div className="relative mb-8 inline-block">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative bg-white text-black border-3 border-black px-5 py-2 text-xs font-display font-black tracking-widest uppercase manga-shadow-red z-10"
        >
          <Sparkles size={14} className="inline text-[#FF003C] animate-pulse mr-1.5 align-middle stroke-[2.5]" />
          <span>100% PRIVATE CLIENT-SIDE PDF ENGINE</span>
          {/* Speech bubble tail */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white border-r-3 border-b-3 border-black rotate-45"></div>
        </motion.div>
      </div>

      {/* Upload card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`w-full bg-white rounded-none border-8 border-double border-black p-8 md:p-14 text-center relative overflow-hidden group manga-shadow-red manga-panel transition-all ${
          isDragActive
            ? 'bg-zinc-100 scale-[1.01]'
            : 'hover:border-black'
        }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        {/* Screentone background pattern fill */}
        <div className="absolute inset-0 opacity-[0.06] screentone-bg pointer-events-none" />

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,application/pdf"
          onChange={handleChange}
        />

        <div className="flex flex-col items-center justify-center space-y-8 relative z-10 w-full">
          {isParsing ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center justify-center space-y-6 py-4 w-full"
            >
              <div className="relative w-24 h-24 flex items-center justify-center">
                {/* Outer spinning dashed ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                  className="absolute inset-0 border-4 border-dashed border-[#FF003C] rounded-full opacity-60"
                />
                {/* Inner spinning dotted ring */}
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  className="absolute inset-2 border-2 border-dotted border-black rounded-full opacity-80"
                />
                {/* Center pulsing core with active file icon */}
                <motion.div
                  animate={{ scale: [1, 1.12, 1] }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                  className="w-14 h-14 bg-white border-2 border-black rounded-full flex items-center justify-center text-[#FF003C] shadow-[0_0_15px_rgba(255,0,60,0.3)]"
                >
                  <FileUp size={24} className="stroke-[2.5] animate-bounce" />
                </motion.div>
              </div>

              <div className="space-y-2 text-center max-w-md">
                <h3 className="text-2xl font-display font-black uppercase tracking-wider text-[#FF003C] flex items-center justify-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF003C] animate-ping" />
                  ILLUMINATING PDF PAGES...
                </h3>
                {parsingFileName && (
                  <p className="text-xs font-mono text-black truncate max-w-xs md:max-w-md mx-auto bg-zinc-100 border-2 border-black rounded-none px-3 py-1.5 inline-block">
                    {parsingFileName}
                  </p>
                )}
                <p className="text-[10px] text-zinc-700 uppercase tracking-widest font-mono font-bold">
                  Gently converting vectors & pages locally inside your browser
                </p>
              </div>
            </motion.div>
          ) : (
            <>
              <motion.div
                animate={{ y: isDragActive ? -6 : 0 }}
                transition={{ repeat: Infinity, repeatType: "reverse", duration: 1.5, ease: "easeInOut" }}
                className={`w-20 h-20 border-3 border-black rounded-none flex items-center justify-center transition-all manga-shadow ${
                  isDragActive ? 'bg-[#FF003C] text-white' : 'border-black text-black bg-white'
                }`}
              >
                <svg 
                  width="48" 
                  height="48" 
                  viewBox="0 0 100 100" 
                  className="fill-current" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M 78 32 C 84 15, 54 8, 35 18 C 12 30, 8 60, 24 78 C 42 96, 76 92, 85 70 C 90 58, 86 46, 75 44 C 65 42, 60 52, 66 60 C 70 66, 68 76, 54 78 C 38 80, 26 70, 24 54 C 22 34, 38 24, 55 24 C 70 24, 76 35, 71 42 C 67 46, 73 50, 78 32 Z" />
                </svg>
              </motion.div>

              <div className="space-y-3">
                <h2 className="text-4xl font-display font-black uppercase tracking-tight text-black leading-none">
                  OPEN YOUR PDF DOCUMENT
                </h2>
                <p className="text-xs text-zinc-700 max-w-sm mx-auto font-mono uppercase tracking-widest leading-relaxed">
                  Drop your PDF here or click below to search your files
                </p>
                <p className="text-[10px] text-[#FF003C] font-mono font-bold uppercase tracking-wider bg-zinc-100 py-1 px-2.5 rounded-none border border-[#FF003C]/20 inline-block">
                  NOTE: WE ONLY RENDER PDF FILES LOCALLY
                </p>
              </div>

              <div className="pt-2 flex justify-center">
                <button
                  id="upload-button"
                  type="button"
                  onClick={onButtonClick}
                  disabled={!pdfJsLoaded}
                  className={`bg-[#FF003C] text-white hover:bg-red-700 py-4 px-8 border-3 border-black rounded-none font-display font-black uppercase tracking-wider text-lg italic shadow-[4px_4px_0_rgba(0,0,0,1)] hover:shadow-[6px_6px_0_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 ${
                    pdfJsLoaded ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
                  }`}
                >
                  {!pdfJsLoaded ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Loading PDF Render Engine...</span>
                    </div>
                  ) : (
                    <>
                      <Upload size={18} className="stroke-[2.5]" />
                      <span>SELECT PDF FROM SYSTEM</span>
                    </>
                  )}
                </button>
              </div>

              {pdfJsError && (
                <div className="p-3 bg-red-100 border-3 border-black text-red-700 text-xs rounded-xl mt-4 max-w-md font-mono text-left manga-shadow">
                  <p className="font-bold uppercase tracking-wider text-red-800">Engine Error:</p>
                  <p className="mt-1">{pdfJsError}</p>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>

      {/* Feature Badges */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full text-zinc-800"
      >
        <div className="flex items-start gap-4 p-5 bg-white border-6 border-double border-black manga-shadow text-left">
          <Shield className="text-[#FF003C] shrink-0 mt-0.5 stroke-[2.5]" size={20} />
          <div>
            <h4 className="text-xs font-display font-black uppercase tracking-wider text-black">100% Client Security</h4>
            <p className="text-[11px] text-zinc-800 mt-1 leading-relaxed">Your files never leave your browser. All tone-mapping runs locally inside your browser sandbox.</p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-5 bg-white border-6 border-double border-black manga-shadow text-left">
          <Zap className="text-[#FF003C] shrink-0 mt-0.5 stroke-[2.5]" size={20} />
          <div>
            <h4 className="text-xs font-display font-black uppercase tracking-wider text-black">Crisp Vector Rendering</h4>
            <p className="text-[11px] text-zinc-800 mt-1 leading-relaxed">Adjustable render scale up to 4.0x DPI for razor-sharp artwork and screentone preservation.</p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-5 bg-white border-6 border-double border-black manga-shadow text-left">
          <Sparkles className="text-[#FF003C] shrink-0 mt-0.5 stroke-[2.5]" size={20} />
          <div>
            <h4 className="text-xs font-display font-black uppercase tracking-wider text-black">Tone Preserving Filter</h4>
            <p className="text-[11px] text-zinc-800 mt-1 leading-relaxed">InkShift preserves full-color centerfolds and artwork while cleanly inverting paper backgrounds.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

