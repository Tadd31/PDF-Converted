/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Upload,
  FileUp,
  FileText,
  Trash2,
  Sparkles,
  Download,
  AlertCircle,
  X,
  Check,
  Loader2,
  Shield,
  Zap,
  FolderOpen
} from 'lucide-react';
import { FilterConfig, applyPixelFilter, PRESETS } from '../utils/colorFilter';
import { ThemeSelector } from './ThemeSelector';
import { AdjustmentPanel } from './AdjustmentPanel';
import { MangaPanel } from './MangaPanel';

interface BatchFile {
  id: string;
  file: File;
  pages: number | null;
  status: 'pending' | 'ready' | 'processing' | 'done' | 'error';
}

interface BatchProcessingZoneProps {
  pdfJsLoaded: boolean;
  pdfJsError: string | null;
  config: FilterConfig;
  onConfigChange: (updates: Partial<FilterConfig>) => void;
  triggerMangaEffect: (text: string, size?: 'sm' | 'md' | 'lg' | 'xl', color?: string) => void;
}

export function BatchProcessingZone({
  pdfJsLoaded,
  pdfJsError,
  config,
  onConfigChange,
  triggerMangaEffect
}: BatchProcessingZoneProps) {
  const [batchFiles, setBatchFiles] = useState<BatchFile[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [quality, setQuality] = useState<1.5 | 3.0 | 4.0>(3.0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export State
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportCurrentFileIndex, setExportCurrentFileIndex] = useState(0);
  const [exportCurrentFileName, setExportCurrentFileName] = useState('');
  const [exportCurrentPage, setExportCurrentPage] = useState(0);
  const [exportTotalPages, setExportTotalPages] = useState(0);
  const [exportStatus, setExportStatus] = useState('');
  const cancelExportRef = useRef(false);

  // Automatically fetch page counts when files are added
  useEffect(() => {
    batchFiles.forEach((bf) => {
      if (bf.pages === null && bf.status === 'pending' && pdfJsLoaded && window.pdfjsLib) {
        // Mark as loading pages
        updateFilePages(bf.id, 0); // temp state
        
        const countPages = async () => {
          try {
            const arrayBuffer = await bf.file.arrayBuffer();
            const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
            const doc = await loadingTask.promise;
            setBatchFiles((prev) =>
              prev.map((f) =>
                f.id === bf.id
                  ? { ...f, pages: doc.numPages, status: 'ready' }
                  : f
              )
            );
          } catch (err) {
            console.error('Error counting pages for', bf.file.name, err);
            setBatchFiles((prev) =>
              prev.map((f) =>
                f.id === bf.id
                  ? { ...f, pages: 0, status: 'error' }
                  : f
              )
            );
          }
        };
        countPages();
      }
    });
  }, [batchFiles, pdfJsLoaded]);

  const updateFilePages = (id: string, pages: number) => {
    setBatchFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, pages } : f))
    );
  };

  // Drag and Drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const processFileList = (files: FileList | null) => {
    if (!files) return;
    const newFiles: BatchFile[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        newFiles.push({
          id: Math.random().toString(36).substring(2, 9),
          file,
          pages: null,
          status: 'pending'
        });
      }
    }

    if (newFiles.length > 0) {
      setBatchFiles((prev) => [...prev, ...newFiles]);
      triggerMangaEffect('GASP!', 'md', '#FF003C');
    } else {
      alert('Please select valid PDF files.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    processFileList(e.dataTransfer.files);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFileList(e.target.files);
  };

  const triggerSelectFiles = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (id: string) => {
    setBatchFiles((prev) => prev.filter((f) => f.id !== id));
    triggerMangaEffect('ZIP!', 'sm', '#000000');
  };

  const clearAllFiles = () => {
    setBatchFiles([]);
    triggerMangaEffect('CLEAN!', 'md', '#FF003C');
  };

  // Run full batch processing
  const handleBatchProcess = async () => {
    if (batchFiles.length === 0) return;
    
    triggerMangaEffect('MAX POWER!', 'xl', '#FF003C');
    setIsExporting(true);
    setExportProgress(0);
    setExportStatus('Initializing JSZip and PDF compiler modules...');
    cancelExportRef.current = false;

    try {
      // Dynamic imports for library bundles to optimize speed
      const { jsPDF } = await import('jspdf');
      const JSZip = (await import('jszip')).default;

      const zip = new JSZip();
      const qualityScale = quality;

      // Update file statuses for display
      setBatchFiles((prev) => prev.map((f) => ({ ...f, status: 'ready' })));

      for (let fIdx = 0; fIdx < batchFiles.length; fIdx++) {
        if (cancelExportRef.current) {
          throw new Error('Batch processing aborted by user.');
        }

        const currentBatchFile = batchFiles[fIdx];
        setExportCurrentFileIndex(fIdx);
        setExportCurrentFileName(currentBatchFile.file.name);
        setExportStatus(`Parsing PDF document structure: ${currentBatchFile.file.name}...`);

        // Mark file in list as processing
        setBatchFiles((prev) =>
          prev.map((f, i) => (i === fIdx ? { ...f, status: 'processing' } : f))
        );

        // Load document
        const arrayBuffer = await currentBatchFile.file.arrayBuffer();
        const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
        const pdfDoc = await loadingTask.promise;
        const totalPages = pdfDoc.numPages;

        setExportTotalPages(totalPages);

        let pdf: any = null;

        for (let pNum = 1; pNum <= totalPages; pNum++) {
          if (cancelExportRef.current) {
            throw new Error('Batch processing aborted by user.');
          }

          setExportCurrentPage(pNum);
          
          // Calculate high-fidelity granular progress
          const currentFileProgress = (pNum - 1) / totalPages;
          const overallBaseProgress = (fIdx / batchFiles.length) * 100;
          const fileContribution = (1 / batchFiles.length) * currentFileProgress * 100;
          setExportProgress(Math.round(overallBaseProgress + fileContribution));

          setExportStatus(`Rasterizing vector pathways for Page ${pNum}/${totalPages} of ${currentBatchFile.file.name}...`);

          const page = await pdfDoc.getPage(pNum);
          const viewport = page.getViewport({ scale: qualityScale });
          const origViewport = page.getViewport({ scale: 1.0 });

          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            throw new Error('Could not create 2D graphics context for canvas.');
          }

          // Fill canvas white first
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, viewport.width, viewport.height);

          // Render PDF to in-memory canvas
          const renderContext = {
            canvasContext: ctx,
            viewport: viewport,
          };
          await page.render(renderContext).promise;

          // Apply high-contrast pixel screen filters
          setExportStatus(`Applying color filters to Page ${pNum}...`);
          const imageData = ctx.getImageData(0, 0, viewport.width, viewport.height);
          applyPixelFilter(imageData, config);
          ctx.putImageData(imageData, 0, 0);

          // Standardize page dimensions & setup jsPDF
          const widthPts = origViewport.width;
          const heightPts = origViewport.height;
          const orientation = widthPts > heightPts ? 'landscape' : 'portrait';

          if (pNum === 1) {
            pdf = new jsPDF({
              orientation: orientation,
              unit: 'px',
              format: [widthPts, heightPts],
            });
          } else {
            pdf.addPage([widthPts, heightPts], orientation);
          }

          setExportStatus(`Compressing plates for Page ${pNum}...`);
          pdf.addImage(canvas, 'JPEG', 0, 0, widthPts, heightPts, undefined, 'FAST');
        }

        // Output customized PDF Blob
        setExportStatus(`Compiling optimized PDF for ${currentBatchFile.file.name}...`);
        const pdfBlob = pdf.output('blob');

        // Add to Zip
        const originalNameClean = currentBatchFile.file.name.replace(/\.[^/.]+$/, '');
        const outputFilename = `${originalNameClean}_${config.mode}_custom.pdf`;
        zip.file(outputFilename, pdfBlob);

        // Mark file in list as done
        setBatchFiles((prev) =>
          prev.map((f, i) => (i === fIdx ? { ...f, status: 'done' } : f))
        );
      }

      setExportProgress(98);
      setExportStatus('Assembling files into a zipped archive...');
      
      const zipContent = await zip.generateAsync({ type: 'blob' });
      
      setExportProgress(100);
      setExportStatus('Finished! Export download starting...');

      // Trigger browser zip download
      const downloadUrl = URL.createObjectURL(zipContent);
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = `inkshift_batch_${config.mode}.zip`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      triggerMangaEffect('TA-DAH!', 'lg', '#FF003C');
      setTimeout(() => {
        setIsExporting(false);
      }, 1500);

    } catch (err: any) {
      console.error('Batch process failed:', err);
      setExportStatus(`Error during batch: ${err.message || String(err)}`);
      
      // Mark file that failed
      setBatchFiles((prev) =>
        prev.map((f, i) => (i === exportCurrentFileIndex ? { ...f, status: 'error' } : f))
      );

      setTimeout(() => {
        setIsExporting(false);
      }, 4000);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: SELECTED FILE LIST & UPLOADER */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <MangaPanel variant="black" noPadding className="shadow-lg overflow-hidden relative">
            {/* Background Screentone Pattern */}
            <div className="absolute inset-0 opacity-[0.04] screentone-bg pointer-events-none" />

            <div className="p-6 relative z-10">
              <div className="flex flex-col md:flex-row items-center justify-between pb-4 border-b-3 border-black gap-4">
                <div>
                  <h3 className="text-xl font-display font-black text-black uppercase tracking-wider flex items-center gap-2">
                    <FolderOpen size={20} className="text-[#FF003C]" />
                    <span>Selected Batch Documents</span>
                  </h3>
                  <p className="text-[10px] text-zinc-700 uppercase tracking-widest font-mono font-bold mt-1">
                    All processed sequentially locally in-browser
                  </p>
                </div>
                {batchFiles.length > 0 && (
                  <button
                    onClick={clearAllFiles}
                    className="px-3 py-1.5 border-2 border-black bg-white hover:bg-[#FF003C] hover:text-white transition-all text-[10px] font-mono font-black uppercase tracking-wider shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer rounded-sm"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {batchFiles.length === 0 ? (
                /* Empty Drag and Drop Area */
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={triggerSelectFiles}
                  className={`mt-6 border-4 border-dashed rounded-none py-14 px-6 text-center cursor-pointer transition-all ${
                    isDragActive
                      ? 'border-[#FF003C] bg-red-50/50'
                      : 'border-zinc-300 hover:border-black hover:bg-zinc-50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,application/pdf"
                    onChange={handleChange}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <motion.div
                      animate={{ y: isDragActive ? -6 : 0 }}
                      transition={{ repeat: Infinity, repeatType: "reverse", duration: 1.2 }}
                      className="w-14 h-14 border-3 border-black bg-white flex items-center justify-center text-black shadow-[3px_3px_0px_rgba(0,0,0,1)]"
                    >
                      {/* Hands-on Ensō Brush Circle icon */}
                      <svg 
                        width="34" 
                        height="34" 
                        viewBox="0 0 100 100" 
                        className="fill-current" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M 78 32 C 84 15, 54 8, 35 18 C 12 30, 8 60, 24 78 C 42 96, 76 92, 85 70 C 90 58, 86 46, 75 44 C 65 42, 60 52, 66 60 C 70 66, 68 76, 54 78 C 38 80, 26 70, 24 54 C 22 34, 38 24, 55 24 C 70 24, 76 35, 71 42 C 67 46, 73 50, 78 32 Z" />
                      </svg>
                    </motion.div>
                    <div>
                      <h4 className="text-lg font-display font-black text-black uppercase tracking-wider">
                        Drop Multiple PDFs Here
                      </h4>
                      <p className="text-[11px] font-mono uppercase tracking-widest text-zinc-650 mt-1">
                        or click to browse local files
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Populated Files List */
                <div className="mt-4 space-y-3 max-h-[480px] overflow-y-auto pr-1">
                  {batchFiles.map((bf, idx) => (
                    <div
                      key={bf.id}
                      className={`p-3.5 border-3 border-black flex items-center justify-between gap-4 transition-all ${
                        bf.status === 'processing'
                          ? 'bg-red-50/50 border-[#FF003C] shadow-[3px_3px_0px_#FF003C]'
                          : bf.status === 'done'
                          ? 'bg-zinc-50 border-zinc-400 opacity-80'
                          : 'bg-white shadow-[3px_3px_0px_rgba(0,0,0,1)]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs font-mono font-black text-zinc-400 bg-zinc-150 px-1.5 py-0.5 rounded border border-zinc-300">
                          {idx + 1}
                        </span>
                        <div className="p-2 bg-white border-2 border-black rounded shadow-[1px_1px_0px_#000000] shrink-0 text-[#FF003C]">
                          <FileText size={15} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-mono font-bold text-black truncate" title={bf.file.name}>
                            {bf.file.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5 text-[9px] font-mono uppercase tracking-wider text-zinc-650 font-bold">
                            <span>{formatBytes(bf.file.size)}</span>
                            <span>•</span>
                            <span>
                              {bf.pages === null ? (
                                <span className="animate-pulse">Loading pages...</span>
                              ) : bf.pages === 0 ? (
                                <span className="text-red-600">Error reading pages</span>
                              ) : (
                                `${bf.pages} pages`
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        {/* File status indicators */}
                        {bf.status === 'done' && (
                          <div className="bg-[#FF003C] text-white p-1 rounded-sm border border-black shadow-[1.5px_1.5px_0px_#000000]">
                            <Check size={12} className="stroke-[3]" />
                          </div>
                        )}
                        {bf.status === 'processing' && (
                          <div className="animate-spin text-[#FF003C]">
                            <Loader2 size={14} className="stroke-[2.5]" />
                          </div>
                        )}
                        {bf.status === 'error' && (
                          <span className="text-[8px] font-mono font-black uppercase text-red-600 bg-red-100 border border-red-300 px-1 py-0.5 rounded">
                            FAIL
                          </span>
                        )}

                        <button
                          disabled={isExporting}
                          onClick={() => removeFile(bf.id)}
                          className="p-1.5 rounded border border-zinc-300 hover:border-red-600 hover:bg-red-50 text-zinc-650 hover:text-red-600 transition-colors cursor-pointer disabled:opacity-30"
                          title="Remove from batch"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add more files box */}
                  <button
                    onClick={triggerSelectFiles}
                    disabled={isExporting}
                    className="w-full py-3.5 border-3 border-dashed border-zinc-400 hover:border-black bg-zinc-50/50 hover:bg-white text-zinc-650 hover:text-black font-display font-black uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-4"
                  >
                    <Upload size={14} className="stroke-[2.5]" />
                    <span>Add More PDF Documents</span>
                  </button>
                </div>
              )}
            </div>
          </MangaPanel>

          {/* Quick Informational Guide */}
          <MangaPanel variant="red" className="p-5 font-mono">
            <h4 className="text-xs font-display font-black uppercase tracking-wider text-black flex items-center gap-2 mb-2">
              <Sparkles size={15} className="text-[#FF003C] stroke-[2.5]" />
              <span>How Batch Processing Works</span>
            </h4>
            <div className="space-y-1.5 text-[10px] text-zinc-800 uppercase tracking-tight leading-relaxed font-bold">
              <p>&gt; Drop multiple documents to stack them in the queue.</p>
              <p>&gt; Choose a screentone preset & fine-tune depth controls.</p>
              <p>&gt; Every page is filtered client-side sequentially.</p>
              <p>&gt; You get a single compressed ZIP file containing all tailored files.</p>
            </div>
          </MangaPanel>
        </div>

        {/* RIGHT COLUMN: CORE FILTER CONTROLS & COMPILATION ACTIONS */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Presets and Custom Mode Selectors */}
          <MangaPanel className="shadow-md">
            <ThemeSelector config={config} onChange={onConfigChange} />
          </MangaPanel>

          {/* Sliders panel */}
          <AdjustmentPanel config={config} onChange={onConfigChange} />

          {/* Assembly / Trigger Panel */}
          <MangaPanel className="shadow-md space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b-3 border-black">
              <Download size={18} className="text-[#FF003C] stroke-[2.5]" />
              <h4 className="text-sm font-display font-black text-black uppercase tracking-wider">
                Batch Assembly Configuration
              </h4>
            </div>

            {/* Quality Choice */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-800 block font-mono">
                Compilation Resolution Quality
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setQuality(1.5)}
                  className={`py-2 px-1 rounded-none border-3 transition-all text-center cursor-pointer ${
                    quality === 1.5
                      ? 'border-black bg-black text-white manga-shadow-red font-black'
                      : 'border-black bg-zinc-50 text-zinc-755 hover:bg-zinc-100 manga-shadow font-bold'
                  }`}
                >
                  <span className="text-[10px] font-display uppercase tracking-wider block">Standard</span>
                  <span className={`text-[8px] font-mono uppercase mt-0.5 block font-bold ${quality === 1.5 ? 'text-zinc-300' : 'text-zinc-650'}`}>
                    1.5x / Fast
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setQuality(3.0)}
                  className={`py-2 px-1 rounded-none border-3 transition-all text-center cursor-pointer ${
                    quality === 3.0
                      ? 'border-black bg-black text-white manga-shadow-red font-black'
                      : 'border-black bg-zinc-50 text-zinc-755 hover:bg-zinc-100 manga-shadow font-bold'
                  }`}
                >
                  <span className="text-[10px] font-display uppercase tracking-wider block">Retina</span>
                  <span className={`text-[8px] font-mono uppercase mt-0.5 block font-bold ${quality === 3.0 ? 'text-zinc-300' : 'text-zinc-650'}`}>
                    3.0x / Sharp
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setQuality(4.0)}
                  className={`py-2 px-1 rounded-none border-3 transition-all text-center cursor-pointer ${
                    quality === 4.0
                      ? 'border-black bg-black text-white manga-shadow-red font-black'
                      : 'border-black bg-zinc-50 text-zinc-755 hover:bg-zinc-100 manga-shadow font-bold'
                  }`}
                >
                  <span className="text-[10px] font-display uppercase tracking-wider block">Max</span>
                  <span className={`text-[8px] font-mono uppercase mt-0.5 block font-bold ${quality === 4.0 ? 'text-zinc-300' : 'text-zinc-650'}`}>
                    4.0x / Heavy
                  </span>
                </button>
              </div>
            </div>

            {/* Big Trigger Button */}
            <div className="pt-2">
              <button
                type="button"
                disabled={batchFiles.length === 0 || !pdfJsLoaded || isExporting}
                onClick={handleBatchProcess}
                className="w-full bg-[#FF003C] text-white hover:bg-red-700 py-4 px-4 border-3 border-black rounded-none font-display font-black uppercase tracking-wider text-lg italic shadow-[4px_4px_0_rgba(0,0,0,1)] hover:shadow-[6px_6px_0_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none"
              >
                <Download size={16} className="stroke-[2.5]" />
                <span>Batch Convert & Download ZIP</span>
              </button>
              {batchFiles.length === 0 && (
                <p className="text-[9px] text-zinc-550 font-mono text-center uppercase tracking-wider font-bold mt-2">
                  * Please add at least one PDF file to begin *
                </p>
              )}
            </div>
          </MangaPanel>
        </div>
      </div>

      {/* BATCH COMPILATION PROGRESS MODAL */}
      <AnimatePresence>
        {isExporting && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl border-8 border-double border-black max-w-md w-full p-8 relative overflow-hidden manga-shadow-red text-black font-mono"
            >
              <div className="flex flex-col items-center text-center space-y-6">
                {/* Handcrafted animated brush logo spinner */}
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-[#FF003C] border-3 border-black">
                    <Loader2 className="animate-spin text-[#FF003C] stroke-[2.5]" size={32} />
                  </div>
                  <div className="absolute -top-1 -right-1 bg-white border-2 border-black text-black rounded-full p-1 shadow-sm">
                    <Sparkles size={12} className="stroke-[2.5]" />
                  </div>
                </div>

                {/* Heading */}
                <div className="space-y-1.5">
                  <h3 className="text-3xl font-display font-black uppercase tracking-wider text-black">
                    Batch Style Shift
                  </h3>
                  <p className="text-[9px] text-[#FF003C] uppercase tracking-widest font-mono font-black block">
                    SEQUENTIALLY ASSEMBLING COMPRESSED ARCHIVE
                  </p>
                </div>

                {/* Progress Indicators */}
                <div className="w-full space-y-3 text-left">
                  {/* File index check */}
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wide text-zinc-700 bg-zinc-100 border-2 border-black p-2 rounded">
                    <span>Converting File:</span>
                    <span className="font-mono text-white bg-black px-2 py-0.5 rounded text-[10px] font-black">
                      {exportCurrentFileIndex + 1} / {batchFiles.length}
                    </span>
                  </div>

                  {/* Document Name */}
                  <div className="text-[10px] font-bold uppercase text-zinc-950 font-mono truncate border-b border-zinc-200 pb-1 flex items-center gap-1.5">
                    <FileText size={12} className="text-[#FF003C]" />
                    <span className="truncate">{exportCurrentFileName}</span>
                  </div>

                  {/* Granular Progress Bar */}
                  <div className="w-full space-y-1 pt-1">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-zinc-900">
                      <span>Total ZIP Progress</span>
                      <span className="text-[#FF003C] font-black">{exportProgress}%</span>
                    </div>
                    <div className="w-full bg-zinc-100 rounded-full h-4 overflow-hidden border-2 border-black p-[1px]">
                      <motion.div
                        className="bg-[#FF003C] h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${exportProgress}%` }}
                        transition={{ duration: 0.1 }}
                      />
                    </div>
                  </div>
                </div>

                {/* Page indicator & Status Log */}
                <div className="w-full bg-zinc-50 border-3 border-black rounded-xl p-4 text-left">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
                    <span className="font-mono font-bold">Log:</span>
                    <span className="font-mono text-white font-black bg-[#FF003C] px-2 py-0.5 rounded text-[9px]">
                      PAGE {exportCurrentPage} / {exportTotalPages || '?'}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-800 font-mono truncate font-bold animate-pulse">
                    &gt; {exportStatus}
                  </p>
                </div>

                {/* Cancel button */}
                <button
                  type="button"
                  onClick={() => {
                    cancelExportRef.current = true;
                    setExportStatus('Aborting compilation...');
                  }}
                  className="flex items-center gap-1.5 px-5 py-2.5 border-3 border-black hover:bg-[#FF003C] hover:text-white bg-white text-black rounded-none transition-all font-display font-black text-xs uppercase tracking-wider cursor-pointer active:scale-95 manga-shadow-red"
                >
                  <X size={12} className="stroke-[2.5]" />
                  <span>Abort Batch Assembly</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
