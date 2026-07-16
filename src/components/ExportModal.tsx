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
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl border-8 border-double border-black max-w-md w-full p-8 relative overflow-hidden manga-shadow-red text-black"
      >
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Animated spinner/loader icon */}
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-[#FF003C] border-3 border-black">
              <Loader2 className="animate-spin text-[#FF003C] stroke-[2.5]" size={32} />
            </div>
            {/* Sparkle badge */}
            <div className="absolute -top-1 -right-1 bg-white border-2 border-black text-black rounded-full p-1 shadow-sm">
              <Sparkles size={12} className="stroke-[2.5]" />
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-1.5">
            <h3 className="text-3xl font-display font-black uppercase tracking-wider text-black">
              Generating PDF Plates
            </h3>
            <p className="text-[10px] text-[#FF003C] uppercase tracking-widest font-mono font-bold">
              COMPILING FULLY CLIENT-SIDE ON YOUR DEVICE
            </p>
          </div>

          {/* Progress Circle or Bar */}
          <div className="w-full space-y-2">
            <div className="flex justify-between text-xs font-black uppercase tracking-widest text-zinc-800 font-mono px-0.5">
              <span>Progress</span>
              <span className="text-[#FF003C] font-black">{progress}%</span>
            </div>
            <div className="w-full bg-zinc-100 rounded-full h-5 overflow-hidden border-3 border-black p-[2px]">
              <motion.div
                className="bg-[#FF003C] h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </div>

          {/* Page indicator & Status Log */}
          <div className="w-full bg-zinc-50 border-3 border-black rounded-xl p-4 text-left">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
              <span className="font-mono font-bold uppercase">Plate Status:</span>
              <span className="font-mono text-white font-black bg-[#FF003C] px-2.5 py-1 rounded text-[10px]">
                PAGE {currentPage} / {totalPages}
              </span>
            </div>
            <p className="text-xs text-zinc-800 font-mono truncate animate-pulse">
              &gt; {status}
            </p>
          </div>

          {/* Security info disclaimer */}
          <div className="flex items-start gap-2.5 text-[10px] text-zinc-600 text-left leading-relaxed font-mono uppercase tracking-tight">
            <AlertCircle size={13} className="shrink-0 text-[#FF003C] mt-0.5 stroke-[2.5]" />
            <span>
              Rendering high-resolution vector frames is hardware intensive. Re-assembling plates may take a few seconds.
            </span>
          </div>

          {/* Cancel button */}
          <button
            id="cancel-export-btn"
            type="button"
            onClick={onCancel}
            className="flex items-center gap-1.5 px-6 py-3 border-3 border-black hover:bg-[#FF003C] hover:text-white bg-white text-black rounded-xl transition-all font-display font-black text-sm uppercase tracking-wider cursor-pointer active:scale-95 manga-shadow-red"
          >
            <X size={14} className="stroke-[2.5]" />
            <span>Abort Assembly</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
