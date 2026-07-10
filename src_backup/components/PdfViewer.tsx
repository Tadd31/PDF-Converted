/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCcw,
  Download,
  BookOpen,
  Image as ImageIcon,
} from 'lucide-react';
import { FilterConfig, applyPixelFilter } from '../utils/colorFilter';

interface PdfViewerProps {
  pdfDoc: any; // PDF.js Document object
  config: FilterConfig;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}

export function PdfViewer({ pdfDoc, config, currentPage, setCurrentPage }: PdfViewerProps) {
  const [zoom, setZoom] = useState<number>(1.25);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasVisibleRef = useRef<HTMLCanvasElement>(null);
  const canvasHiddenRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);

  // Cached original ImageData for instant slider updates
  const originalImageDataRef = useRef<ImageData | null>(null);

  const numPages = pdfDoc ? pdfDoc.numPages : 0;

  // 1. Initial Render of PDF to Hidden Canvas when page or zoom changes
  useEffect(() => {
    if (!pdfDoc) return;

    let isAborted = false;

    async function renderPage() {
      try {
        setIsRendering(true);

        // Cancel previous PDF.js render task if it's running
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }

        const page = await pdfDoc.getPage(currentPage);
        if (isAborted) return;

        const viewport = page.getViewport({ scale: zoom });

        const canvasHidden = canvasHiddenRef.current;
        if (!canvasHidden) return;

        const ctxHidden = canvasHidden.getContext('2d');
        if (!ctxHidden) return;

        // Set dimensions
        canvasHidden.width = viewport.width;
        canvasHidden.height = viewport.height;

        // Match visible canvas dimensions
        const canvasVisible = canvasVisibleRef.current;
        if (canvasVisible) {
          canvasVisible.width = viewport.width;
          canvasVisible.height = viewport.height;
        }

        // Fill white background in hidden canvas (PDF standard)
        ctxHidden.fillStyle = '#ffffff';
        ctxHidden.fillRect(0, 0, viewport.width, viewport.height);

        // Render PDF page to Hidden Canvas
        const renderContext = {
          canvasContext: ctxHidden,
          viewport: viewport,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;

        await renderTask.promise;
        if (isAborted) return;

        // Cache the original image pixels
        const originalData = ctxHidden.getImageData(0, 0, viewport.width, viewport.height);
        originalImageDataRef.current = originalData;

        // Apply visual filter immediately
        applyCurrentFilter();

        setIsRendering(false);
      } catch (err: any) {
        if (err.name !== 'RenderingCancelledException') {
          console.error('Error rendering page:', err);
          setIsRendering(false);
        }
      }
    }

    renderPage();

    return () => {
      isAborted = true;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [pdfDoc, currentPage, zoom]);

  // 2. Fast/Instant draw function when config (sliders/colors) change
  const applyCurrentFilter = () => {
    const canvasVisible = canvasVisibleRef.current;
    const originalData = originalImageDataRef.current;

    if (!canvasVisible || !originalData) return;

    const ctxVisible = canvasVisible.getContext('2d');
    if (!ctxVisible) return;

    // Create a fresh copy of the original pixel data so we don't degrade it
    const freshPixels = new Uint8ClampedArray(originalData.data);
    const freshImageData = new ImageData(freshPixels, originalData.width, originalData.height);

    // Run our blazing-fast pixel processing filter in-place!
    applyPixelFilter(freshImageData, config);

    // Write the transformed image data to the visible canvas
    ctxVisible.putImageData(freshImageData, 0, 0);
  };

  // Re-run filter on visible canvas instantly whenever filter configuration changes
  useEffect(() => {
    applyCurrentFilter();
  }, [config]);

  // Handle page transitions
  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((p) => p - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < numPages) {
      setCurrentPage((p) => p + 1);
    }
  };

  // Zoom helpers
  const zoomIn = () => setZoom((z) => Math.min(3, z + 0.25));
  const zoomOut = () => setZoom((z) => Math.max(0.5, z - 0.25));
  const resetZoom = () => setZoom(1.25);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error('Error enabling fullscreen:', err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Listen for escape button ending native fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Quick download active page as image
  const downloadActivePageImage = () => {
    const canvas = canvasVisibleRef.current;
    if (!canvas) return;

    // Save as PNG
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `pdf_page_${currentPage}_custom.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      ref={containerRef}
      className={`flex flex-col h-full bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden relative ${
        isFullscreen ? 'w-screen h-screen rounded-none border-none' : ''
      }`}
    >
      {/* Hidden canvas for original PDF.js rendering */}
      <canvas ref={canvasHiddenRef} className="hidden" />

      {/* Viewer toolbar */}
      <div className="flex flex-wrap items-center justify-between px-5 py-3 bg-zinc-900 border-b border-white/10 z-10 gap-3">
        {/* Toggle Sidebar & Title */}
        <div className="flex items-center gap-3">
          <button
            id="toggle-sidebar-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer ${
              sidebarOpen ? 'bg-zinc-800 text-[#CCFF00] border border-white/5' : 'border border-transparent'
            }`}
            title="Toggle Sidebar"
          >
            <BookOpen size={15} />
          </button>
          <div className="hidden sm:block">
            <span className="text-[10px] font-black text-white uppercase tracking-wider block">
              Live Preview Canvas
            </span>
            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-tight">
              Scale: {(zoom * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Page Nav controls */}
        <div className="flex items-center bg-zinc-950 px-3 py-1.5 rounded-xl border border-white/5 gap-2.5 shadow-inner">
          <button
            id="prev-page-btn"
            onClick={goToPrevPage}
            disabled={currentPage <= 1 || isRendering}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer"
            title="Previous Page"
          >
            <ChevronLeft size={16} />
          </button>

          <span className="text-xs text-zinc-300 font-bold select-none flex items-center gap-1.5 min-w-[75px] justify-center">
            <input
              type="number"
              value={currentPage}
              min={1}
              max={numPages}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (!isNaN(val) && val >= 1 && val <= numPages) {
                  setCurrentPage(val);
                }
              }}
              className="w-10 bg-zinc-900 text-[#CCFF00] text-center rounded-md border border-white/10 px-1 py-0.5 text-xs font-mono font-bold focus:border-[#CCFF00] focus:outline-none"
            />
            <span className="text-zinc-600 font-mono">/</span>
            <span className="font-mono text-zinc-400">{numPages}</span>
          </span>

          <button
            id="next-page-btn"
            onClick={goToNextPage}
            disabled={currentPage >= numPages || isRendering}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer"
            title="Next Page"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Zoom & View Options */}
        <div className="flex items-center gap-1.5">
          {/* Zoom Out */}
          <button
            id="zoom-out-btn"
            onClick={zoomOut}
            disabled={zoom <= 0.5}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut size={15} />
          </button>

          {/* Zoom Level Reset */}
          <button
            id="zoom-reset-btn"
            onClick={resetZoom}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
            title="Reset Zoom"
          >
            <RotateCcw size={14} />
          </button>

          {/* Zoom In */}
          <button
            id="zoom-in-btn"
            onClick={zoomIn}
            disabled={zoom >= 3.0}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn size={15} />
          </button>

          <div className="w-px h-5 bg-white/10 mx-1.5" />

          {/* Download active page image */}
          <button
            id="download-page-img-btn"
            onClick={downloadActivePageImage}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-[#CCFF00] hover:bg-zinc-800 transition-all cursor-pointer"
            title="Download This Page as PNG Image"
          >
            <ImageIcon size={15} />
          </button>

          {/* Fullscreen Toggle */}
          <button
            id="fullscreen-btn"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </div>

      {/* Main Container - Sidebar & Canvas */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Thumbnails/Sidebar Directory */}
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 140, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-full bg-zinc-900 border-r border-white/5 flex flex-col overflow-y-auto shrink-0 select-none hidden md:flex"
            >
              <div className="p-3 border-b border-white/5 text-[9px] text-zinc-500 uppercase tracking-widest font-black font-mono">
                Pages Directory
              </div>
              <div className="p-2 space-y-2">
                {Array.from({ length: numPages }).map((_, idx) => {
                  const pNum = idx + 1;
                  const isPageActive = currentPage === pNum;
                  return (
                    <button
                      key={idx}
                      id={`sidebar-page-${pNum}`}
                      onClick={() => setCurrentPage(pNum)}
                      className={`w-full group flex flex-col items-center p-2 rounded-xl text-center transition-all cursor-pointer border ${
                        isPageActive
                          ? 'bg-zinc-950 border-[#CCFF00] text-[#CCFF00]'
                          : 'hover:bg-zinc-800/40 border-transparent text-zinc-400 hover:text-white'
                      }`}
                    >
                      {/* Simple visual box */}
                      <div
                        className={`w-16 h-20 rounded-lg border mb-1.5 shadow-inner flex items-center justify-center text-[10px] font-mono font-bold select-none ${
                          isPageActive ? 'border-[#CCFF00]/50 bg-zinc-900' : 'border-white/5 bg-zinc-950'
                        }`}
                      >
                        {pNum}
                      </div>
                      <span className="text-[9px] uppercase font-bold tracking-wider font-mono">Page {pNum}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Preview Canvas Stage */}
        <div className="flex-1 bg-zinc-950 flex items-center justify-center p-6 overflow-auto min-h-0 relative grid-bg">
          {/* Loading Indicator Overlay */}
          <AnimatePresence>
            {isRendering && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.95 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-zinc-950/90 flex flex-col items-center justify-center z-10"
              >
                <div className="w-12 h-12 border-4 border-[#CCFF00] border-t-transparent rounded-full animate-spin mb-4" />
                <span className="text-xs font-black uppercase tracking-widest text-white font-mono">
                  Compiling Pixels...
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actual Canvas rendering */}
          <div className="shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-2xl border-4 border-[#1a1a1a] overflow-hidden bg-white max-w-full">
            <canvas ref={canvasVisibleRef} className="block max-w-full h-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}
