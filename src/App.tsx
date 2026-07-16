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
  Laptop,
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
import { InstallModal } from './components/InstallModal';
import { ImpactBurst, MangaSoundEffect } from './components/ImpactBurst';
import { MangaPanel } from './components/MangaPanel';
import { MangaBackground } from './components/MangaBackground';
import { BatchProcessingZone } from './components/BatchProcessingZone';

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
  const [isBatchMode, setIsBatchMode] = useState<boolean>(false);

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
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);

  const cancelExportRef = useRef<boolean>(false);

  // Manga Visual Sound Effects State
  const [mangaEffects, setMangaEffects] = useState<MangaSoundEffect[]>([]);

  const triggerMangaEffect = (text: string, size: 'sm' | 'md' | 'lg' | 'xl' = 'md', color?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    // Position within safe margins of the screen
    const x = 25 + Math.random() * 50; // 25% to 75%
    const y = 25 + Math.random() * 50; // 25% to 75%
    const rotation = -20 + Math.random() * 40; // -20 to +20 degrees
    setMangaEffects((prev) => [
      ...prev,
      { id, text, x, y, size, rotation, color }
    ]);
  };

  const handleRemoveEffect = (id: string) => {
    setMangaEffects((prev) => prev.filter((effect) => effect.id !== id));
  };

  // Monitor page changes for sound effect
  const lastPageRef = useRef<number>(currentPage);
  useEffect(() => {
    if (pdfDoc && lastPageRef.current !== currentPage) {
      lastPageRef.current = currentPage;
      triggerMangaEffect('SHHHP!', 'sm', '#FF003C');
    }
  }, [currentPage, pdfDoc]);

  // Monitor theme/mode switches
  const lastModeRef = useRef<string>(config.mode);
  useEffect(() => {
    if (lastModeRef.current !== config.mode) {
      lastModeRef.current = config.mode;
      triggerMangaEffect('ZAP!', 'sm', '#FFFFFF');
    }
  }, [config.mode]);

  // Monitor faq/logic toggle
  const lastFaqRef = useRef<boolean>(showFaq);
  useEffect(() => {
    if (lastFaqRef.current !== showFaq) {
      lastFaqRef.current = showFaq;
      triggerMangaEffect('SLAM!', 'sm', '#FF003C');
    }
  }, [showFaq]);

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
      triggerMangaEffect('BOOM!', 'lg', '#FF003C');
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

    triggerMangaEffect('KA-POW!', 'xl', '#FF003C');
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

  const isModeDark = 
    config.mode === 'invert_raw' || 
    config.mode === 'contrast_bw' || 
    (config.mode in PRESETS && PRESETS[config.mode as keyof typeof PRESETS]?.isDark);

  return (
    <div 
      className="min-h-screen transition-colors duration-300 flex flex-col font-sans selection:bg-[#FF003C] selection:text-white relative bg-white text-black screentone-bg"
    >
      {/* Infinite, non-repeating concentric halftone background with anti-cut protection */}
      <MangaBackground isDark={isModeDark} />
      {/* Top Header Navigation */}
      <header className="bg-white border-b-8 border-double border-black px-6 py-4 shrink-0 relative z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              onClick={pdfDoc ? handleCloseFile : undefined}
              className={`p-2 bg-white border-2 border-black text-[#FF003C] rounded-lg shadow-[2px_2px_0px_#000000] transition-all ${
                pdfDoc 
                  ? 'cursor-pointer hover:bg-zinc-100 active:scale-95' 
                  : ''
              }`}
              title={pdfDoc ? "Return to upload zone" : undefined}
            >
              <FileText size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-black text-black tracking-wider flex items-center gap-1.5 leading-none">
                INK<span className="text-[#FF003C] font-brush text-2xl lowercase font-normal leading-none rotate-[-2deg] inline-block">Shift</span>
              </h1>
              <p className="text-[10px] text-zinc-700 uppercase tracking-widest font-mono font-bold mt-0.5">"HIGH-CONTRAST PDF STYLE CONVERTER"</p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Install App button */}
            <button
              id="install-btn"
              onClick={() => {
                setShowInstallModal(true);
                triggerMangaEffect('STANDALONE!', 'md', '#FF003C');
              }}
              className="text-[10px] font-bold text-black hover:bg-zinc-50 transition-all flex items-center gap-1.5 cursor-pointer uppercase tracking-wider font-mono border-2 border-black rounded-lg px-2.5 py-1.5 bg-white shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              <Laptop size={13} className="text-[#FF003C] stroke-[2.5]" />
              <span>Install App</span>
            </button>

            {/* FAQ and Info toggle */}
            <button
              id="faq-btn"
              onClick={() => setShowFaq(!showFaq)}
              className="text-[10px] font-bold text-black hover:bg-zinc-50 transition-all flex items-center gap-1.5 cursor-pointer uppercase tracking-wider font-mono border-2 border-black rounded-lg px-2.5 py-1.5 bg-white shadow-[2px_2px_0px_#FF003C] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              <HelpCircle size={13} className="text-[#FF003C] stroke-[2.5]" />
              <span className="hidden sm:inline">The Screentone Logic</span>
            </button>

            {/* Engine loading status indicator */}
            <div className="hidden md:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-black font-mono bg-white border-2 border-black rounded-full px-3.5 py-1.5 shadow-[2px_2px_0px_#000000]">
              <span className="w-2 h-2 rounded-full bg-[#FF003C] animate-pulse" />
              <span>Engine Active</span>
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
              <MangaPanel variant="red" noPadding className="shadow-xl font-mono">
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-display font-black text-[#FF003C] text-lg uppercase tracking-wide mb-2 flex items-center gap-2">
                      <Sparkles size={16} className="stroke-[2.5]" />
                      PRESERVE THE SCREENTONES
                    </h3>
                    <p className="text-[11px] text-zinc-800 leading-relaxed uppercase tracking-wider font-bold">
                      Rather than crude negation which destroys color cover pages and muddies screentones, our custom matrices preserve details. Ink depths are re-mapped elegantly while original hues stand out.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-display font-black text-[#FF003C] text-lg uppercase tracking-wide mb-2 flex items-center gap-2">
                      <Check size={16} className="stroke-[2.5]" />
                      SECURED ON LOCAL DEVICE
                    </h3>
                    <p className="text-[11px] text-zinc-800 leading-relaxed uppercase tracking-wider font-bold">
                      Your PDF files are processed entirely in your browser sandbox. No chapters, pages, or files are ever sent to external cloud servers.
                    </p>
                  </div>
                </div>
              </MangaPanel>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 flex flex-col min-h-0">
          <AnimatePresence mode="wait">
            {!pdfDoc ? (
              // Dashboard / Upload Screen
              <motion.div
                key="dashboard-zone-wrapper"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col py-4"
              >
                {/* Tabs switcher */}
                <div className="flex justify-center mb-8">
                  <div className="inline-flex rounded-lg border-2 border-black p-1 bg-zinc-100 shadow-[3px_3px_0px_rgba(0,0,0,1)]">
                    <button
                      type="button"
                      onClick={() => {
                        setIsBatchMode(false);
                        triggerMangaEffect('SHING!', 'sm', '#FF003C');
                      }}
                      className={`px-6 py-2.5 text-xs font-display font-black uppercase tracking-wider transition-all cursor-pointer ${
                        !isBatchMode
                          ? 'bg-black text-white shadow-[2px_2px_0px_rgba(255,0,60,1)]'
                          : 'text-zinc-600 hover:text-black'
                      }`}
                    >
                      Single Document Reader
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsBatchMode(true);
                        triggerMangaEffect('CLANG!', 'sm', '#FF003C');
                      }}
                      className={`px-6 py-2.5 text-xs font-display font-black uppercase tracking-wider transition-all cursor-pointer ${
                        isBatchMode
                          ? 'bg-black text-white shadow-[2px_2px_0px_rgba(255,0,60,1)]'
                          : 'text-zinc-650 hover:text-black'
                      }`}
                    >
                      Batch Converter (ZIP)
                    </button>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {!isBatchMode ? (
                    <motion.div
                      key="single-upload"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex-1 flex items-center justify-center py-4"
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
                    <motion.div
                      key="batch-upload"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="w-full py-4"
                    >
                      <BatchProcessingZone
                        pdfJsLoaded={pdfJsLoaded}
                        pdfJsError={pdfJsError}
                        config={config}
                        onConfigChange={handleConfigChange}
                        triggerMangaEffect={triggerMangaEffect}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
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
                  <PdfViewer 
                    pdfDoc={pdfDoc} 
                    config={config} 
                    currentPage={currentPage} 
                    setCurrentPage={setCurrentPage} 
                    onShowInstallInstructions={() => {
                      setShowInstallModal(true);
                      triggerMangaEffect('STANDALONE!', 'md', '#FF003C');
                    }}
                  />
                </div>

                {/* Right side: Color Profiler & Export Panel (4 cols) */}
                <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-1">
                  {/* Document Card */}
                  <MangaPanel noPadding className="shrink-0 shadow-md">
                    <div className="p-4 flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2.5 bg-white border-2 border-black text-[#FF003C] rounded-lg shrink-0 shadow-[2px_2px_0px_#000000]">
                          <FileText size={18} className="stroke-[2.5]" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-black truncate" title={loadedFile?.name}>
                            {loadedFile?.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 text-[9px] font-mono uppercase tracking-widest text-zinc-700 font-bold">
                            <span>{pdfDoc ? pdfDoc.numPages : 0} Pages</span>
                            <span className="text-[#FF003C] font-black">•</span>
                            <span>{loadedFile ? formatBytes(loadedFile.size) : '0 KB'}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        id="close-file-btn"
                        onClick={handleCloseFile}
                        className="p-2 rounded-lg border-2 border-black bg-white hover:bg-red-50 text-zinc-800 hover:text-red-600 transition-all cursor-pointer shadow-[2px_2px_0px_#000000]"
                        title="Close File"
                      >
                        <Trash2 size={13} className="stroke-[2]" />
                      </button>
                    </div>
                  </MangaPanel>

                  {/* Core Theme Options */}
                  <MangaPanel className="shadow-md">
                    <ThemeSelector config={config} onChange={handleConfigChange} />
                  </MangaPanel>

                  {/* Sliders Panel */}
                  <AdjustmentPanel config={config} onChange={handleConfigChange} />

                  {/* Export Options & Actions */}
                  <MangaPanel className="shadow-md space-y-5">
                    {/* Header */}
                    <div className="flex items-center gap-2 pb-3 border-b-3 border-black">
                      <FileDown size={18} className="text-[#FF003C] stroke-[2.5]" />
                      <h4 className="text-sm font-display font-black text-black uppercase tracking-wider">
                        PDF Assembly Settings
                      </h4>
                    </div>

                    {/* Export Quality Selection */}
                    <div className="space-y-2.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-800 block font-mono">
                        Plate DPI Scale
                      </label>
                      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pb-2">
                        {/* Compact */}
                        <button
                          id="quality-standard"
                          type="button"
                          onClick={() => setQuality(1.5)}
                          className={`py-2.5 px-1 sm:p-3 rounded-none border-3 transition-all text-center cursor-pointer ${
                            quality === 1.5
                              ? 'border-black bg-black text-white manga-shadow-red font-black'
                              : 'border-black bg-zinc-50 text-zinc-700 hover:bg-zinc-100 manga-shadow font-bold'
                          }`}
                        >
                          <span className="text-[10px] sm:text-xs font-display uppercase tracking-wider block">Standard</span>
                          <span className={`text-[8px] sm:text-[9px] font-mono uppercase tracking-tight mt-0.5 block font-bold ${quality === 1.5 ? 'text-zinc-300' : 'text-zinc-600'}`}>
                            <span className="hidden sm:inline">1.5x / Fast</span>
                            <span className="inline sm:hidden">1.5x</span>
                          </span>
                        </button>
 
                        {/* High */}
                        <button
                          id="quality-high"
                          type="button"
                          onClick={() => setQuality(3.0)}
                          className={`py-2.5 px-1 sm:p-3 rounded-none border-3 transition-all text-center cursor-pointer ${
                            quality === 3.0
                              ? 'border-black bg-black text-white manga-shadow-red font-black'
                              : 'border-black bg-zinc-50 text-zinc-700 hover:bg-zinc-100 manga-shadow font-bold'
                          }`}
                        >
                          <span className="text-[10px] sm:text-xs font-display uppercase tracking-wider block">Retina</span>
                          <span className={`text-[8px] sm:text-[9px] font-mono uppercase tracking-tight mt-0.5 block font-bold ${quality === 3.0 ? 'text-zinc-300' : 'text-zinc-600'}`}>
                            <span className="hidden sm:inline">3.0x / Sharp</span>
                            <span className="inline sm:hidden">3.0x</span>
                          </span>
                        </button>
 
                        {/* Ultra */}
                        <button
                          id="quality-ultra"
                          type="button"
                          onClick={() => setQuality(4.0)}
                          className={`py-2.5 px-1 sm:p-3 rounded-none border-3 transition-all text-center cursor-pointer ${
                            quality === 4.0
                              ? 'border-black bg-black text-white manga-shadow-red font-black'
                              : 'border-black bg-zinc-50 text-zinc-700 hover:bg-zinc-100 manga-shadow font-bold'
                          }`}
                        >
                          <span className="text-[10px] sm:text-xs font-display uppercase tracking-wider block">Max</span>
                          <span className={`text-[8px] sm:text-[9px] font-mono uppercase tracking-tight mt-0.5 block font-bold ${quality === 4.0 ? 'text-zinc-300' : 'text-zinc-600'}`}>
                            <span className="hidden sm:inline">4.0x / Heavy</span>
                            <span className="inline sm:hidden">4.0x</span>
                          </span>
                        </button>
                      </div>
                    </div>
 
                    {/* Page Range Setting */}
                    <div className="space-y-2.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-800 block font-mono">
                        Pages to Assemble
                      </label>
                      <div className="grid grid-cols-3 gap-1 p-0.5 sm:p-1 bg-zinc-100 rounded-lg border-2 border-black">
                        <button
                          id="range-all"
                          type="button"
                          onClick={() => setPageRangeMode('all')}
                          className={`py-2 px-0.5 sm:px-1.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer text-center ${
                            pageRangeMode === 'all'
                              ? 'bg-white text-black border-2 border-black shadow-[2px_2px_0px_#FF003C]'
                              : 'text-zinc-600 hover:text-black'
                          }`}
                        >
                          <span className="hidden sm:inline">Whole Doc</span>
                          <span className="inline sm:hidden">All</span>
                        </button>
                        <button
                          id="range-current"
                          type="button"
                          onClick={() => setPageRangeMode('current')}
                          className={`py-2 px-0.5 sm:px-1.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer text-center ${
                            pageRangeMode === 'current'
                              ? 'bg-white text-black border-2 border-black shadow-[2px_2px_0px_#FF003C]'
                              : 'text-zinc-600 hover:text-black'
                          }`}
                        >
                          <span className="hidden sm:inline">Active Page</span>
                          <span className="inline sm:hidden">Current</span>
                        </button>
                        <button
                          id="range-custom"
                          type="button"
                          onClick={() => setPageRangeMode('custom')}
                          className={`py-2 px-0.5 sm:px-1.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer text-center ${
                            pageRangeMode === 'custom'
                              ? 'bg-white text-black border-2 border-black shadow-[2px_2px_0px_#FF003C]'
                              : 'text-zinc-600 hover:text-black'
                          }`}
                        >
                          <span className="hidden sm:inline">Select Range</span>
                          <span className="inline sm:hidden">Custom</span>
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
                            className="w-full text-xs font-mono bg-white border-2 border-black rounded-lg px-3 py-2 text-black placeholder:text-zinc-400 focus:border-[#FF003C] focus:outline-none focus:ring-0"
                          />
                          <span className="text-[9px] font-mono uppercase tracking-tight text-zinc-700 block mt-1.5 px-0.5 font-bold">
                            List pages with commas, ranges with dashes (e.g. 1-4, 7).
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
                        className="w-full bg-[#FF003C] text-white hover:bg-red-700 py-4 px-4 border-3 border-black rounded-none font-display font-black uppercase tracking-wider text-lg italic shadow-[4px_4px_0_rgba(0,0,0,1)] hover:shadow-[6px_6px_0_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Download size={16} className="stroke-[2.5]" />
                        <span>Assemble & Download PDF</span>
                      </button>
                    </div>
                  </MangaPanel>
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

      <InstallModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
        triggerMangaEffect={triggerMangaEffect}
      />

      {/* Manga Visual Sound Effects overlay */}
      <ImpactBurst effects={mangaEffects} onComplete={handleRemoveEffect} />
    </div>
  );
}
