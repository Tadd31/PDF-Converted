/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Monitor,
  Chrome,
  Compass,
  ArrowRight,
  Sparkles,
  Laptop,
  Check,
  Copy,
  Info,
  ExternalLink,
  Share2
} from 'lucide-react';
import { MangaPanel } from './MangaPanel';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerMangaEffect: (text: string, size?: 'sm' | 'md' | 'lg' | 'xl', color?: string) => void;
}

type TabType = 'chrome' | 'safari' | 'firefox_edge';

export function InstallModal({ isOpen, onClose, triggerMangaEffect }: InstallModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('chrome');
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    triggerMangaEffect('COPY!', 'sm', '#FF003C');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleClose = () => {
    triggerMangaEffect('SHUT!', 'sm', '#000000');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="w-full max-w-2xl bg-white border-8 border-double border-black rounded-none p-6 relative overflow-hidden manga-shadow-red font-mono text-black"
          >
            {/* Screentone Background */}
            <div className="absolute inset-0 opacity-[0.03] screentone-bg pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-1.5 border-2 border-black bg-white hover:bg-[#FF003C] hover:text-white transition-all shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer z-20"
              title="Close modal"
            >
              <X size={16} className="stroke-[2.5]" />
            </button>

            {/* Header */}
            <div className="border-b-4 border-black pb-4 mb-6 relative z-10 pr-8">
              <div className="flex items-center gap-2">
                <Laptop size={24} className="text-[#FF003C] stroke-[2.5]" />
                <h2 className="text-2xl font-display font-black uppercase tracking-wider text-black">
                  Install on Desktop
                </h2>
              </div>
              <p className="text-[10px] text-zinc-700 uppercase tracking-widest font-bold mt-1">
                Run InkShift directly as a standalone app with its own dock icon
              </p>
            </div>

            {/* Explanatory callout */}
            <div className="mb-6 bg-red-50 border-3 border-black p-4 relative overflow-hidden">
              <div className="absolute -right-8 -bottom-8 opacity-10 text-[#FF003C] pointer-events-none">
                <Sparkles size={120} />
              </div>
              <div className="flex items-start gap-3 relative z-10">
                <Info size={18} className="text-[#FF003C] shrink-0 mt-0.5" />
                <div className="text-[11px] text-zinc-800 leading-relaxed uppercase tracking-wide font-bold">
                  InkShift is a full progressive client-side tool. By installing it on your desktop, you get an offline-capable, standalone screen without browser tabs getting in the way!
                </div>
              </div>
            </div>

            {/* OS / Browser Selector Tabs */}
            <div className="flex border-b-2 border-black mb-5 gap-1 overflow-x-auto pb-1">
              <button
                onClick={() => {
                  setActiveTab('chrome');
                  triggerMangaEffect('TAP!', 'sm', '#FF003C');
                }}
                className={`px-4 py-2 text-xs font-display font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'chrome'
                    ? 'bg-black text-white border-t-2 border-x-2 border-black'
                    : 'text-zinc-600 hover:text-black hover:bg-zinc-100 border-b-2 border-transparent'
                }`}
              >
                <Chrome size={14} />
                <span>Chrome & Edge</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('safari');
                  triggerMangaEffect('TAP!', 'sm', '#FF003C');
                }}
                className={`px-4 py-2 text-xs font-display font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'safari'
                    ? 'bg-black text-white border-t-2 border-x-2 border-black'
                    : 'text-zinc-600 hover:text-black hover:bg-zinc-100 border-b-2 border-transparent'
                }`}
              >
                <Compass size={14} />
                <span>Safari (macOS)</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('firefox_edge');
                  triggerMangaEffect('TAP!', 'sm', '#FF003C');
                }}
                className={`px-4 py-2 text-xs font-display font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'firefox_edge'
                    ? 'bg-black text-white border-t-2 border-x-2 border-black'
                    : 'text-zinc-600 hover:text-black hover:bg-zinc-100 border-b-2 border-transparent'
                }`}
              >
                <Monitor size={14} />
                <span>Other Methods</span>
              </button>
            </div>

            {/* Instruction Steps */}
            <div className="space-y-4 mb-6 min-h-[160px]">
              {activeTab === 'chrome' && (
                <div className="space-y-3 font-mono text-[11px] font-bold text-zinc-900 uppercase tracking-wide">
                  <p className="text-xs text-black font-extrabold pb-1">
                    On Chrome or Microsoft Edge (Windows, macOS, Linux):
                  </p>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 bg-black text-white text-[10px] font-black rounded-full flex items-center justify-center shrink-0">
                      1
                    </span>
                    <p className="pt-0.5">
                      Locate the browser menu by clicking the <span className="bg-zinc-150 border border-zinc-300 px-1.5 py-0.5 rounded text-black font-black">three vertical dots (⋮)</span> in the top-right corner of Chrome, or the <span className="bg-zinc-150 border border-zinc-300 px-1.5 py-0.5 rounded text-black font-black">three horizontal dots (⋯)</span> in Edge.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 bg-black text-white text-[10px] font-black rounded-full flex items-center justify-center shrink-0">
                      2
                    </span>
                    <p className="pt-0.5">
                      Hover over the <span className="bg-zinc-150 border border-zinc-300 px-1.5 py-0.5 rounded text-black font-black">"Save and share"</span> (or "Cast, save, and share") option in the menu list.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 bg-black text-white text-[10px] font-black rounded-full flex items-center justify-center shrink-0">
                      3
                    </span>
                    <p className="pt-0.5">
                      Select <span className="text-[#FF003C] font-black underline">"Install page as app..."</span> from the secondary context menu that pops up.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 bg-black text-white text-[10px] font-black rounded-full flex items-center justify-center shrink-0">
                      4
                    </span>
                    <p className="pt-0.5">
                      Confirm by clicking <span className="bg-black text-white px-2 py-0.5 rounded font-black">"Install"</span> on the browser prompt. The app will open in its own clean window and be added to your desktop!
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'safari' && (
                <div className="space-y-3 font-mono text-[11px] font-bold text-zinc-900 uppercase tracking-wide">
                  <p className="text-xs text-black font-extrabold pb-1">
                    On Apple Safari (macOS Sonoma and newer):
                  </p>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 bg-black text-white text-[10px] font-black rounded-full flex items-center justify-center shrink-0">
                      1
                    </span>
                    <p className="pt-0.5">
                      Look at Safari's top toolbar and click the <span className="bg-zinc-150 border border-zinc-300 px-1.5 py-0.5 rounded text-black font-black">Share Button</span> (the square box with an arrow pointing upwards <Share2 size={11} className="inline-block relative -top-[1px] stroke-[2.5]" />).
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 bg-black text-white text-[10px] font-black rounded-full flex items-center justify-center shrink-0">
                      2
                    </span>
                    <p className="pt-0.5">
                      Select <span className="text-[#FF003C] font-black underline">"Add to Dock..."</span> from the bottom of the Share list options.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 bg-black text-white text-[10px] font-black rounded-full flex items-center justify-center shrink-0">
                      3
                    </span>
                    <p className="pt-0.5">
                      (Optional) Customize the name and keep <span className="font-bold text-black">"InkShift"</span>, then click <span className="bg-black text-white px-2 py-0.5 rounded font-black">"Add"</span>.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 bg-black text-white text-[10px] font-black rounded-full flex items-center justify-center shrink-0">
                      4
                    </span>
                    <p className="pt-0.5">
                      Check your macOS Dock! The app now resides there with its own independent window, fully isolated from other web tabs.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'firefox_edge' && (
                <div className="space-y-3 font-mono text-[11px] font-bold text-zinc-900 uppercase tracking-wide">
                  <p className="text-xs text-black font-extrabold pb-1">
                    Other Desktop & Mobile browser installation options:
                  </p>
                  <div className="space-y-2 border-l-2 border-zinc-200 pl-3">
                    <h5 className="text-[10px] font-black text-[#FF003C] tracking-wide">MOBILE IOS & ANDROID</h5>
                    <p className="text-[10px] leading-relaxed">
                      Open this URL in Chrome (Android) or Safari (iOS). Choose "Add to Home Screen" from the menu or share menu to pin InkShift directly on your mobile device as an app.
                    </p>
                  </div>
                  <div className="space-y-2 border-l-2 border-zinc-200 pl-3">
                    <h5 className="text-[10px] font-black text-[#FF003C] tracking-wide">DIRECT SHORTCUT ADDRESS BUTTON</h5>
                    <p className="text-[10px] leading-relaxed">
                      In many modern desktop browsers (including standard Chrome and Brave), you will see an <span className="text-black font-black">"Install App"</span> icon (a monitor with a down arrow, or a small square plus sign) directly in the right side of the browser's top address bar. Simply click that address bar shortcut!
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Copy / Link actions */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-4 border-t-3 border-black">
              <button
                onClick={handleCopyLink}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-3 border-2 border-black bg-white hover:bg-zinc-50 font-display font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                {copiedLink ? (
                  <>
                    <Check size={14} className="text-green-600 stroke-[3]" />
                    <span className="text-green-600">Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} className="text-zinc-700" />
                    <span>Copy Application Link</span>
                  </>
                )}
              </button>

              <button
                onClick={handleClose}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-3 border-2 border-black bg-black hover:bg-[#FF003C] text-white font-display font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-[3px_3px_0px_rgba(255,0,60,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                <span>Got It! Let's Go</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
