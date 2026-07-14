/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  Home,
  Sparkles,
  Download,
  Trash2,
  RefreshCcw,
  Check,
  HelpCircle,
  FileDown,
  ExternalLink,
} from 'lucide-react';

import { usePdfJs } from './hooks/usePdfJs';
import { FilterConfig, FilterMode, applyPixelFilter, PRESETS } from './utils/colorFilter';
import { parsePageRange } from './utils/pageRange';

// Import components
import { UploadZone } from './components/UploadZone';
import { PdfViewer } from './components/PdfViewer';
import { ThemeSelector } from './components/ThemeSelector';
import { AdjustmentPanel } from './components/AdjustmentPanel';
import { ExportModal } from './components/ExportModal';

const defaultConfig: FilterConfig = {
  mode: 'invert_smart',
  customBg: '#1e293b',
  customFg: '#f8fafc',
  brightness: 0,
  contrast: 0,
  grayscale: false,
  hueRotate: 0,
};

function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export default function App() {
  const { loaded: pdfJsLoaded, error: pdfJsError } = usePdfJs();

  // App States
  const [loadedFile, setLoadedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [pdfDoc, setPdfDoc] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [config, setConfig] = useState<FilterConfig>(defaultConfig);

  // Export States
  const [quality, setQuality] = useState<1.5 | 3.0 | 4.0>(3.0);
  const [pageRangeMode, setPageRangeMode] = useState<'all' | 'current' | 'custom'>('all');
  const [customRangeStr, setCustomRangeStr] = useState<string>('');

  // Compilation Modal States
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportCurrentPage, setExportCurrentPage] = useState<number>(0);
  const [exportTotalPages, setExportTotalPages] = useState<number>(0);
  const [exportStatus, setExportStatus] = useState<string>('');
  const [showFaq, setShowFaq] = useState<boolean>(false);

  const cancelExportRef = useRef<boolean>(false);

  // Parse uploaded file with PDF.js
  const handleFileSelect = async (file: File) => {
    try {
      setLoadedFile(file);
      setIsParsing(true);
      const arrayBuffer = await file.arrayBuffer();

      // Load with window.pdfjsLib
      if (!window.pdfjsLib) {
        throw new Error('PDF.js library is not loaded in window context.');
      }

      const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
      const doc = await loadingTask.promise;
      setPdfDoc(doc);
      setCurrentPage(1);
    } catch (err: any) {
      console.error('Error parsing PDF file:', err);
      alert(`Could not parse PDF. It might be corrupted or encrypted. Error: ${err.message || String(err)}`);
      setLoadedFile(null);
      setPdfDoc(null);
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfigChange = (updates: Partial<FilterConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  const handleResetConfig = () => {
    setConfig(defaultConfig);
  };

  const handleCloseFile = () => {
    setLoadedFile(null);
    setPdfDoc(null);
    setCurrentPage(1);
  };

  // Perform PDF color conversion and compilation loop
  const handleExportPdf = async () => {
    if (!pdfDoc) return;

    setIsExporting(true);
    setExportProgress(0);
    setExportStatus('Initializing compiler session...');
    cancelExportRef.current = false;

    try {
      // Dynamic import of jsPDF to optimize initial bundle size
      const { jsPDF } = await import('jspdf');

      // Determine page indexes to process
      let pageIndices: number[] = [];
      if (pageRangeMode === 'all') {
        pageIndices = Array.from({ length: pdfDoc.numPages }, (_, i) => i + 1);
      } else if (pageRangeMode === 'current') {
        pageIndices = [currentPage];
      } else {
        pageIndices = parsePageRange(customRangeStr, pdfDoc.numPages);
      }

      setExportTotalPages(pageIndices.length);

      let pdf: any = null;
      const qualityScale = quality; // 1.5, 3.0, 4.0

      for (let i = 0; i < pageIndices.length; i++) {
        // Allow user to cancel
        if (cancelExportRef.current) {
          setExportStatus('Export cancelled by user.');
          setIsExporting(false);
          return;
        }

        const pNum = pageIndices[i];
        setExportCurrentPage(i + 1);
        setExportProgress(Math.round((i / pageIndices.length) * 100));
        setExportStatus(`Opening page ${pNum}...`);

        const page = await pdfDoc.getPage(pNum);
        const viewport = page.getViewport({ scale: qualityScale });
        const origViewport = page.getViewport({ scale: 1.0 });

        // Create an offline in-memory canvas
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Could not create 2D graphics rendering context');
        }

        // Fill background white
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, viewport.width, viewport.height);

        // Render PDF page to memory canvas
        setExportStatus(`Rasterizing vector paths for Page ${pNum} at ${qualityScale}x scale...`);
        const renderContext = {
          canvasContext: ctx,
          viewport: viewport,
        };
        await page.render(renderContext).promise;

        if (cancelExportRef.current) {
          setIsExporting(false);
          return;
        }

        // Run pixel filtering loop
        setExportStatus(`Applying color mapping filter to Page ${pNum}...`);
        const imageData = ctx.getImageData(0, 0, viewport.width, viewport.height);
        applyPixelFilter(imageData, config);
        ctx.putImageData(imageData, 0, 0);

        // Add page to PDF document
        const widthPts = origViewport.width;
        const heightPts = origViewport.height;
        const orientation = widthPts > heightPts ? 'landscape' : 'portrait';

        if (i === 0) {
          pdf = new jsPDF({
            orientation: orientation,
            unit: 'px',
            format: [widthPts, heightPts],
          });
        } else {
          pdf.addPage([widthPts, heightPts], orientation);
        }

        setExportStatus(`Encoding and compressing Page ${pNum}...`);
        // We pass the canvas object directly to jsPDF for fast memory handling
        pdf.addImage(canvas, 'JPEG', 0, 0, widthPts, heightPts, undefined, 'FAST');
      }

      if (cancelExportRef.current) {
        setIsExporting(false);
        return;
      }

      setExportProgress(100);
      setExportStatus('Compiling files and writing output...');

      // Generate customized name
      const origName = loadedFile?.name.replace(/\.[^/.]+$/, '') || 'document';
      const outputFilename = `${origName}_${config.mode}_custom.pdf`;

      pdf.save(outputFilename);
      setExportStatus('Finished! Download started.');

      // Delay modal closing so they see success status
      setTimeout(() => {
        setIsExporting(false);
      }, 1000);
    } catch (err: any) {
      console.error('Export failed:', err);
      setExportStatus(`Critical error: ${err.message || String(err)}`);
      setTimeout(() => {
        setIsExporting(false);
      }, 4000);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 flex flex-col font-sans selection:bg-[#CCFF00] selection:text-black">
      {/* Top Header Navigation */}
      <header className="bg-black border-b border-white/10 px-6 py-4 shrink-0 relative z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              onClick={pdfDoc ? handleCloseFile : undefined}
              className={`p-2 bg-zinc-900 border border-white/10 text-[#CCFF00] rounded-xl shadow-md transition-all ${
                pdfDoc 
                  ? 'cursor-pointer hover:bg-zinc-800 hover:border-[#CCFF00]/40 active:scale-95 hover:text-white' 
                  : ''
              }`}
              title={pdfDoc ? "Return to upload zone" : undefined}
            >
              <FileText size={22} className="stroke-[2]" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tighter uppercase italic flex items-center gap-2">
                Kelly's <span className="text-[#CCFF00]">Folio Illuminator</span>
              </h1>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">"To read, or not to read, that is no longer a question of eye strain."</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Home Icon navigation button (Active when document loaded) */}
            {pdfDoc && (
              <button
                id="home-nav-btn"
                onClick={handleCloseFile}
                className="text-[10px] font-bold text-zinc-400 hover:text-white hover:border-[#CCFF00]/30 transition-all flex items-center gap-1.5 cursor-pointer uppercase tracking-wider font-mono border border-white/10 rounded-lg px-2.5 py-1.5 bg-zinc-900/60"
                title="Return to upload zone"
              >
                <Home size={13} className="text-[#CCFF00]" />
                <span className="hidden sm:inline">Home</span>
              </button>
            )}

            {/* FAQ and Info toggle */}
            <button
              id="faq-btn"
              onClick={() => setShowFaq(!showFaq)}
              className="text-[10px] font-bold text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer uppercase tracking-wider font-mono border border-white/10 rounded-lg px-2.5 py-1.5 bg-zinc-900/60"
            >
              <HelpCircle size={13} className="text-[#CCFF00]" />
              <span className="hidden sm:inline">The Bard's Logic</span>
            </button>

            {/* Engine loading status indicator */}
            <div className="hidden md:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 font-mono bg-zinc-900/40 border border-white/5 rounded-full px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00] animate-pulse" />
              <span>Local Keep Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Sandbox Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col min-h-0 relative z-10">
        {/* FAQ Area (Slide out banner) */}
        <AnimatePresence>
          {showFaq && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="bg-[#111111] rounded-2xl border border-white/10 p-6 shadow-xl grid grid-cols-1 md:grid-cols-2 gap-6 font-mono">
                <div>
                  <h3 className="font-black text-white text-xs uppercase tracking-wider mb-2.5 flex items-center gap-2 text-[#CCFF00]">
                    <Sparkles size={14} />
                    Preserve the Bard's Print
                  </h3>
                  <p className="text-[11px] text-zinc-400 leading-relaxed uppercase tracking-wide">
                    Rather than crude negation which tarnisheth illustrations and plates, our alchemical math preserves hue and contrast. Pure inks are re-mapped gracefully to eye-soothing tones.
                  </p>
                </div>
                <div>
                  <h3 className="font-black text-white text-xs uppercase tracking-wider mb-2.5 flex items-center gap-2 text-[#CCFF00]">
                    <Check size={14} />
                    Secured Within Thy Keep
                  </h3>
                  <p className="text-[11px] text-zinc-400 leading-relaxed uppercase tracking-wide">
                    Thy documents are loaded locally in thy browser's own library. No parchment or scroll is sent to servers beyond the seas. The alchemy runs entirely upon thy own engine.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 flex flex-col min-h-0">
          <AnimatePresence mode="wait">
            {!pdfDoc ? (
              // Dashboard / Upload Screen
              <motion.div
                key="upload-zone-wrapper"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex items-center justify-center py-8"
              >
                <UploadZone
                  onFileSelect={handleFileSelect}
                  pdfJsLoaded={pdfJsLoaded}
                  pdfJsError={pdfJsError}
                  isParsing={isParsing}
                  parsingFileName={loadedFile?.name}
                />
              </motion.div>
            ) : (
              // Active Editor Layout (Split view)
              <motion.div
                key="editor-stage-wrapper"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0"
              >
                {/* Left side: Interactive Viewer Stage (8 cols) */}
                <div className="lg:col-span-8 flex flex-col min-h-[450px] lg:min-h-0">
                  <PdfViewer pdfDoc={pdfDoc} config={config} currentPage={currentPage} setCurrentPage={setCurrentPage} />
                </div>

                {/* Right side: Color Profiler & Export Panel (4 cols) */}
                <div className="lg:col-span-4 flex flex-col gap-5 overflow-y-auto pr-1">
                  {/* Document Card */}
                  <div className="bg-[#111] rounded-2xl border border-white/5 p-4 shadow-md shrink-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2.5 bg-zinc-900 border border-white/10 text-[#CCFF00] rounded-xl shrink-0">
                          <FileText size={18} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-white truncate" title={loadedFile?.name}>
                            {loadedFile?.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 text-[9px] font-mono uppercase tracking-widest text-zinc-500">
                            <span>{pdfDoc ? pdfDoc.numPages : 0} Pages</span>
                            <span className="text-[#CCFF00]">•</span>
                            <span>{loadedFile ? formatBytes(loadedFile.size) : '0 KB'}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        id="close-file-btn"
                        onClick={handleCloseFile}
                        className="p-2 rounded-xl border border-white/5 hover:border-red-900/50 hover:bg-red-950/20 text-zinc-500 hover:text-red-400 transition-all cursor-pointer"
                        title="Close File"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Core Theme Options */}
                  <div className="bg-[#111] rounded-2xl border border-white/5 p-5 shadow-md">
                    <ThemeSelector config={config} onChange={handleConfigChange} />
                  </div>

                  {/* Sliders Panel */}
                  <AdjustmentPanel config={config} onChange={handleConfigChange} />

                  {/* Export Options & Actions */}
                  <div className="bg-[#111] rounded-2xl border border-white/5 p-5 shadow-md space-y-5">
                    {/* Header */}
                    <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                      <FileDown size={15} className="text-[#CCFF00]" />
                      <h4 className="text-xs font-black text-white uppercase tracking-widest">
                        Folio Binding Settings
                      </h4>
                    </div>

                    {/* Export Quality Selection */}
                    <div className="space-y-2.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block font-mono">
                        Illumination Resolution
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {/* Compact */}
                        <button
                          id="quality-standard"
                          type="button"
                          onClick={() => setQuality(1.5)}
                          className={`p-3 rounded-xl border transition-all text-center cursor-pointer ${
                            quality === 1.5
                              ? 'border-[#CCFF00] bg-zinc-900 text-[#CCFF00]'
                              : 'border-white/5 bg-[#161616] text-zinc-400 hover:border-white/15'
                          }`}
                        >
                          <span className="text-xs font-black uppercase tracking-wider block">Standard</span>
                          <span className="text-[9px] font-mono uppercase tracking-tight opacity-80 mt-0.5 block">1.5x / Fast</span>
                        </button>

                        {/* High */}
                        <button
                          id="quality-high"
                          type="button"
                          onClick={() => setQuality(3.0)}
                          className={`p-3 rounded-xl border transition-all text-center cursor-pointer ${
                            quality === 3.0
                              ? 'border-[#CCFF00] bg-zinc-900 text-[#CCFF00]'
                              : 'border-white/5 bg-[#161616] text-zinc-400 hover:border-white/15'
                          }`}
                        >
                          <span className="text-xs font-black uppercase tracking-wider block">Retina</span>
                          <span className="text-[9px] font-mono uppercase tracking-tight opacity-80 mt-0.5 block">3.0x / Sharp</span>
                        </button>

                        {/* Ultra */}
                        <button
                          id="quality-ultra"
                          type="button"
                          onClick={() => setQuality(4.0)}
                          className={`p-3 rounded-xl border transition-all text-center cursor-pointer ${
                            quality === 4.0
                              ? 'border-[#CCFF00] bg-zinc-900 text-[#CCFF00]'
                              : 'border-white/5 bg-[#161616] text-zinc-400 hover:border-white/15'
                          }`}
                        >
                          <span className="text-xs font-black uppercase tracking-wider block">Max</span>
                          <span className="text-[9px] font-mono uppercase tracking-tight opacity-80 mt-0.5 block">4.0x / Heavy</span>
                        </button>
                      </div>
                    </div>

                    {/* Page Range Setting */}
                    <div className="space-y-2.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block font-mono">
                        Folio Pages to Bind
                      </label>
                      <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-950 rounded-xl border border-white/5">
                        <button
                          id="range-all"
                          type="button"
                          onClick={() => setPageRangeMode('all')}
                          className={`py-2 px-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer text-center ${
                            pageRangeMode === 'all'
                              ? 'bg-zinc-900 text-[#CCFF00] border border-white/5'
                              : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          Whole Folio
                        </button>
                        <button
                          id="range-current"
                          type="button"
                          onClick={() => setPageRangeMode('current')}
                          className={`py-2 px-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer text-center ${
                            pageRangeMode === 'current'
                              ? 'bg-zinc-900 text-[#CCFF00] border border-white/5'
                              : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          Active Sheet
                        </button>
                        <button
                          id="range-custom"
                          type="button"
                          onClick={() => setPageRangeMode('custom')}
                          className={`py-2 px-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer text-center ${
                            pageRangeMode === 'custom'
                              ? 'bg-zinc-900 text-[#CCFF00] border border-white/5'
                              : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          Select Leaves
                        </button>
                      </div>

                      {/* Custom Range Input */}
                      {pageRangeMode === 'custom' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="pt-1.5"
                        >
                          <input
                            id="custom-range-input"
                            type="text"
                            placeholder="e.g. 1-4, 7, 10-15"
                            value={customRangeStr}
                            onChange={(e) => setCustomRangeStr(e.target.value)}
                            className="w-full text-xs font-mono bg-zinc-950 border border-white/10 rounded-lg px-3 py-2 text-zinc-200 placeholder:text-zinc-600 focus:border-[#CCFF00] focus:outline-none"
                          />
                          <span className="text-[9px] font-mono uppercase tracking-tight text-zinc-500 block mt-1.5 px-0.5">
                            List leaves with commas, ranges with dashes (e.g. 1-4, 7).
                          </span>
                        </motion.div>
                      )}
                    </div>

                    {/* Massive Convert & Compile CTA */}
                    <div className="pt-2">
                      <button
                        id="download-full-pdf-btn"
                        type="button"
                        onClick={handleExportPdf}
                        className="w-full bg-[#CCFF00] text-black hover:bg-[#b5e600] py-4 px-4 rounded-xl font-black uppercase tracking-wider italic shadow-[4px_4px_0_rgba(204,255,0,0.15)] hover:shadow-[6px_6px_0_rgba(204,255,0,0.25)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Download size={15} />
                        <span>Bind & Deliver Folio</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Compiler Execution Overlays */}
      <ExportModal
        isOpen={isExporting}
        progress={exportProgress}
        currentPage={exportCurrentPage}
        totalPages={exportTotalPages}
        status={exportStatus}
        onCancel={() => {
          cancelExportRef.current = true;
          setExportStatus('Sending cancellation request...');
        }}
      />
    </div>
  );
}
