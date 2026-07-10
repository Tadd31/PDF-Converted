/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Loader2, AlertCircle, Sparkles, X } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  progress: number;
  currentPage: number;
  totalPages: number;
  status: string;
  onCancel: () => void;
}

export function ExportModal({
  isOpen,
  progress,
  currentPage,
  totalPages,
  status,
  onCancel,
}: ExportModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-[#111111] rounded-[32px] shadow-[0_0_50px_rgba(0,0,0,0.8)] border-2 border-white/10 max-w-md w-full p-8 relative overflow-hidden"
      >
        {/* Glow accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#CCFF00] via-emerald-400 to-indigo-500" />

        <div className="flex flex-col items-center text-center space-y-6">
          {/* Animated spinner/loader icon */}
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center text-[#CCFF00] border border-white/5">
              <Loader2 className="animate-spin text-[#CCFF00]" size={32} />
            </div>
            {/* Sparkle badge */}
            <div className="absolute -top-1 -right-1 bg-[#CCFF00] text-black rounded-full p-1 shadow-sm">
              <Sparkles size={12} />
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-1.5">
            <h3 className="text-xl font-black uppercase tracking-tight text-white">
              Inverting PDF Pixels
            </h3>
            <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono">
              COMPILING FULLY CLIENT-SIDE ON YOUR DEVICE
            </p>
          </div>

          {/* Progress Circle or Bar */}
          <div className="w-full space-y-2">
            <div className="flex justify-between text-xs font-black uppercase tracking-widest text-zinc-300 font-mono px-0.5">
              <span>Progress</span>
              <span className="text-[#CCFF00]">{progress}%</span>
            </div>
            <div className="w-full bg-zinc-950 rounded-full h-3.5 overflow-hidden border border-white/5 p-[2px]">
              <motion.div
                className="bg-[#CCFF00] h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </div>

          {/* Page indicator & Status Log */}
          <div className="w-full bg-zinc-950 border border-white/5 rounded-2xl p-4 text-left">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
              <span>Status Log:</span>
              <span className="font-mono text-black font-black bg-[#CCFF00] px-2 py-0.5 rounded text-[10px]">
                PAGE {currentPage} / {totalPages}
              </span>
            </div>
            <p className="text-xs text-zinc-300 font-mono truncate animate-pulse">
              &gt; {status}
            </p>
          </div>

          {/* Security info disclaimer */}
          <div className="flex items-start gap-2.5 text-[10px] text-zinc-500 text-left leading-relaxed font-mono uppercase tracking-tight">
            <AlertCircle size={13} className="shrink-0 text-[#CCFF00] mt-0.5" />
            <span>
              Converting high-resolution pages is CPU intensive. For complex docs, compression parameters may take some seconds.
            </span>
          </div>

          {/* Cancel button */}
          <button
            id="cancel-export-btn"
            type="button"
            onClick={onCancel}
            className="flex items-center gap-1.5 px-6 py-3 border border-white/10 hover:border-white/20 rounded-xl text-zinc-400 hover:text-white transition-all font-black text-xs uppercase tracking-wider cursor-pointer active:scale-95"
          >
            <X size={13} className="text-[#CCFF00]" />
            <span>Cancel Task</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
