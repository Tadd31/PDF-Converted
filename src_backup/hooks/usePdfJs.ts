/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';

// Declare pdfjsLib on window
declare global {
  interface Window {
    pdfjsLib: any;
  }
}

export function usePdfJs() {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if already loaded
    if (window.pdfjsLib) {
      setLoaded(true);
      return;
    }

    const scriptId = 'pdfjs-cdn-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    const initializeWorker = () => {
      try {
        if (window.pdfjsLib) {
          // Set the worker source to CDN worker
          window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          setLoaded(true);
        } else {
          setError('PDF.js loaded but pdfjsLib is not present on window.');
        }
      } catch (err) {
        setError(`Failed to initialize PDF.js worker: ${err instanceof Error ? err.message : String(err)}`);
      }
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.async = true;
      script.onload = initializeWorker;
      script.onerror = () => {
        setError('Failed to download PDF.js library. Please check your network connection.');
      };
      document.body.appendChild(script);
    } else {
      // Script exists but maybe not fully initialized yet
      if (window.pdfjsLib) {
        initializeWorker();
      } else {
        script.addEventListener('load', initializeWorker);
      }
    }

    return () => {
      if (script) {
        script.removeEventListener('load', initializeWorker);
      }
    };
  }, []);

  return { loaded, error };
}
