import React, { useEffect, useState } from 'react';

interface MangaBackgroundProps {
  isDark: boolean;
}

export function MangaBackground({ isDark }: MangaBackgroundProps) {
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { width, height } = dimensions;
  
  // Grid spacing for the halftone pattern - crisp and detailed
  const spacing = 18;
  const cols = Math.ceil(width / spacing) + 2;
  const rows = Math.ceil(height / spacing) + 2;
  
  // Perfectly centered concentric halftone
  const centerX = width / 2;
  const centerY = height / 2;
  
  // Distance from center to the furthest corner
  const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);
  
  // Create a beautiful, clean circular void in the center (no dots)
  const voidRadius = Math.min(width, height) * 0.22;

  const circles: React.ReactNode[] = [];

  for (let r = -1; r < rows; r++) {
    const cy = r * spacing;
    const isOdd = r % 2 === 1;
    for (let c = -1; c < cols; c++) {
      // Staggered hexagonal layout for an authentic organic screentone
      const cx = c * spacing + (isOdd ? spacing / 2 : 0);
      
      const dx = cx - centerX;
      const dy = cy - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      let radius = 0;
      
      if (dist > voidRadius) {
        // Map distance beyond the void radius to [0, 1]
        const t = Math.min(1, (dist - voidRadius) / (maxDist - voidRadius));
        
        const minRadius = 0.5;
        const maxRadius = spacing * 0.44; // Nice large dots near corners and edges
        
        // Beautiful curve for dot growth propagation
        radius = minRadius + (maxRadius - minRadius) * Math.pow(t, 1.2);
      }
      
      if (radius < 0.4) continue;

      // Clean boundary protection - subtle cushion so edge dots aren't brutally sliced
      const padding = 5;
      const distToLeft = cx;
      const distToRight = width - cx;
      const distToTop = cy;
      const distToBottom = height - cy;
      const minDistToEdge = Math.min(distToLeft, distToRight, distToTop, distToBottom);
      
      let finalRadius = radius;
      if (minDistToEdge < padding) {
        if (minDistToEdge <= 0) {
          finalRadius = 0;
        } else {
          finalRadius = radius * (minDistToEdge / padding);
        }
      }
      
      if (finalRadius > 0.3) {
        circles.push(
          <circle
            key={`${r}-${c}`}
            cx={cx}
            cy={cy}
            r={finalRadius.toFixed(2)}
          />
        );
      }
    }
  }

  return (
    <div className="fixed inset-0 w-screen h-screen pointer-events-none select-none overflow-hidden z-0">
      <svg
        className="w-full h-full transition-opacity duration-500"
        style={{ opacity: 0.85 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <g fill="#000000">
          {circles}
        </g>
      </svg>
    </div>
  );
}
