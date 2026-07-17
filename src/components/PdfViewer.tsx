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
} from 'lucide-react';
import { FilterConfig, applyPixelFilter } from '../utils/colorFilter';
import { MangaPanel } from './MangaPanel';

interface PdfViewerProps {
  pdfDoc: any; // PDF.js Document object
  config: FilterConfig;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  onShowInstallInstructions?: () => void;
}

export function PdfViewer({ 
  pdfDoc, 
  config, 
  currentPage, 
  setCurrentPage,
  onShowInstallInstructions 
}: PdfViewerProps) {
  const [zoom, setZoom] = useState<number>(1.0);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [prevPage, setPrevPage] = useState<number>(currentPage);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  useEffect(() => {
    if (currentPage > prevPage) {
      setDirection('forward');
    } else if (currentPage < prevPage) {
      setDirection('backward');
    }
    setPrevPage(currentPage);
  }, [currentPage, prevPage]);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasVisibleRef = useRef<HTMLCanvasElement>(null);
  const canvasHiddenRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);

  const stageRef = useRef<HTMLDivElement>(null);
  const [stageDimensions, setStageDimensions] = useState({ width: 0, height: 0 });
  const [pageAspectRatio, setPageAspectRatio] = useState<number>(0.75); // default aspect ratio (portrait)

  // Setup ResizeObserver for responsive canvas/stage sizing
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      setStageDimensions({ width, height });
    });

    observer.observe(stage);
    return () => {
      observer.disconnect();
    };
  }, []);

  // Cached original ImageData for instant slider updates
  const originalImageDataRef = useRef<ImageData | null>(null);

  const numPages = pdfDoc ? pdfDoc.numPages : 0;

  // 1. Initial Render of PDF to Hidden Canvas when page changes
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

        // Render at a high-quality fixed scale (1.5) for crispness at all zoom levels
        const renderScale = 1.5;
        const viewport = page.getViewport({ scale: renderScale });
        setPageAspectRatio(viewport.width / viewport.height);

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
  }, [pdfDoc, currentPage]); // REMOVED zoom from dependencies for lightning-fast instantaneous scaling!

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
  const resetZoom = () => setZoom(1.0);

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

  // Calculate baseline fitting width (100% zoom)
  let baseWidth = 350; // default fallback
  if (stageDimensions.width > 0) {
    const isMobile = window.innerWidth < 640;
    const margin = isMobile ? 16 : 48; // compact margin on mobile to maximize page real estate
    const targetWidth = stageDimensions.width - margin;
    
    // Scale to closely fill the width of the canvas stage
    baseWidth = targetWidth;

    // Safety checks: ensure it fits nicely but doesn't blow up on massive monitors
    baseWidth = Math.max(260, Math.min(950, baseWidth));
  }

  return (
    <MangaPanel
      ref={containerRef}
      noPadding
      variant="red"
      hasScreentone={true}
      noBorder={isFullscreen}
      noShadow={isFullscreen}
      noTransform={isFullscreen}
      className={`flex flex-col h-full overflow-hidden ${
        isFullscreen ? 'w-screen h-screen rounded-none z-50 fixed inset-0' : 'relative'
      }`}
    >
      {/* Hidden canvas for original PDF.js rendering */}
      <canvas ref={canvasHiddenRef} className="hidden" />

      {/* Viewer toolbar */}
      <div className="flex flex-wrap items-center justify-between px-5 py-3 bg-white border-b-3 border-black z-10 gap-3">
        {/* Title */}
        <div className="flex items-center gap-2">
          <div>
            <span className="text-xs font-display font-black text-black uppercase tracking-wider block leading-none">
              Live Preview Canvas
            </span>
            <span className="text-[10px] text-zinc-700 font-mono uppercase tracking-tight mt-1 block">
              Scale: {(zoom * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Page Nav controls */}
        <div className="flex items-center bg-zinc-100 px-3 py-1.5 rounded-xl border-2 border-black gap-2.5 shadow-inner">
          <button
            id="prev-page-btn"
            onClick={goToPrevPage}
            disabled={currentPage <= 1 || isRendering}
            className="p-1 rounded text-zinc-850 hover:text-[#FF003C] hover:bg-zinc-200 transition-colors disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer"
            title="Previous Page"
          >
            <ChevronLeft size={16} className="stroke-[2.5]" />
          </button>

          <span className="text-xs text-zinc-900 font-bold select-none flex items-center gap-1.5 min-w-[75px] justify-center">
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
              className="w-10 bg-white text-[#FF003C] text-center rounded border-2 border-black px-1 py-0.5 text-xs font-mono font-black focus:border-[#FF003C] focus:outline-none"
            />
            <span className="text-zinc-400 font-mono">/</span>
            <span className="font-mono text-zinc-800">{numPages}</span>
          </span>

          <button
            id="next-page-btn"
            onClick={goToNextPage}
            disabled={currentPage >= numPages || isRendering}
            className="p-1 rounded text-zinc-855 hover:text-[#FF003C] hover:bg-zinc-200 transition-colors disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer"
            title="Next Page"
          >
            <ChevronRight size={16} className="stroke-[2.5]" />
          </button>
        </div>

        {/* Zoom & View Options */}
        <div className="flex items-center gap-1.5">
          {/* Zoom Out */}
          <button
            id="zoom-out-btn"
            onClick={zoomOut}
            disabled={zoom <= 0.5}
            className="p-1.5 rounded-lg text-zinc-800 hover:text-black hover:bg-zinc-100 active:scale-90 transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
            title="Zoom Out"
          >
            <ZoomOut size={16} className="stroke-[2]" />
          </button>

          {/* Zoom Level Reset */}
          <button
            id="zoom-reset-btn"
            onClick={resetZoom}
            className="p-1.5 rounded-lg text-zinc-800 hover:text-black hover:bg-zinc-100 active:scale-90 transition-all cursor-pointer"
            title="Reset Zoom"
          >
            <RotateCcw size={15} className="stroke-[2]" />
          </button>

          {/* Zoom In */}
          <button
            id="zoom-in-btn"
            onClick={zoomIn}
            disabled={zoom >= 3.0}
            className="p-1.5 rounded-lg text-zinc-800 hover:text-black hover:bg-zinc-100 active:scale-90 transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
            title="Zoom In"
          >
            <ZoomIn size={16} className="stroke-[2]" />
          </button>

          <div className="w-0.5 h-5 bg-black mx-1.5" />

          {/* Fullscreen Toggle */}
          <button
            id="fullscreen-btn"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg text-zinc-800 hover:text-black hover:bg-zinc-100 transition-all cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={16} className="stroke-[2]" /> : <Maximize2 size={16} className="stroke-[2]" />}
          </button>
        </div>
      </div>

      {/* Main Container - Canvas Stage */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Preview Canvas Stage */}
        <div ref={stageRef} className="flex-1 bg-zinc-100 flex items-center justify-center p-6 overflow-auto min-h-0 relative">
          {/* Screentone background pattern on stage */}
          <div className="absolute inset-0 opacity-[0.05] screentone-bg pointer-events-none" />

          {/* Loading Indicator Overlay */}
          <AnimatePresence>
            {isRendering && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.95 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-zinc-100/90 flex flex-col items-center justify-center z-10"
              >
                <div className="w-12 h-12 border-4 border-[#FF003C] border-t-transparent rounded-full animate-spin mb-4" />
                <span className="text-xs font-display font-black uppercase tracking-widest text-black">
                  COMPILING PIXELS...
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actual Canvas rendering with snappy high-impact transition */}
          <div 
            className="flex items-center justify-center"
            style={{ perspective: 1200 }}
          >
            <motion.div
              key={currentPage}
              initial={{ 
                x: direction === 'forward' ? 120 : -120, 
                rotateY: direction === 'forward' ? 15 : -15, 
                opacity: 0.4,
                scale: 0.95 
              }}
              animate={{ 
                x: 0, 
                rotateY: 0, 
                opacity: 1,
                scale: 1 
              }}
              transition={{
                type: 'spring',
                stiffness: 350, // snappy fast-in
                damping: 24,    // quick solid stop
              }}
              className="rounded-lg border-6 border-black overflow-hidden bg-white manga-shadow-red"
              style={{ 
                transformStyle: 'preserve-3d',
                width: `${zoom * baseWidth}px`
              }}
            >
              <canvas ref={canvasVisibleRef} className="block w-full h-auto" />
            </motion.div>
          </div>
        </div>
      </div>
    </MangaPanel>
  );
}
