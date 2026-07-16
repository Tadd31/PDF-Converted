import React from 'react';

interface MangaPanelProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  title?: string;
  icon?: React.ReactNode;
  headerAction?: React.ReactNode;
  hasScreentone?: boolean;
  variant?: 'red' | 'black';
  noPadding?: boolean;
  noBorder?: boolean;
  noShadow?: boolean;
  noTransform?: boolean;
  noBorderRadius?: boolean;
}

export const MangaPanel = React.forwardRef<HTMLDivElement, MangaPanelProps>(({
  children,
  className = '',
  id,
  title,
  icon,
  headerAction,
  hasScreentone = true,
  variant = 'black',
  noPadding = false,
  noBorder = false,
  noShadow = false,
  noTransform = false,
  noBorderRadius = true,
}, ref) => {
  const shadowClass = noShadow ? '' : (variant === 'red' ? 'manga-shadow-red' : 'manga-shadow');
  const borderClass = noBorder ? '' : `border-6 border-double border-black ${noBorderRadius ? 'rounded-none' : 'rounded-xl'}`;
  const transformClass = noTransform ? '' : 'manga-panel';

  return (
    <div
      ref={ref}
      id={id}
      className={`bg-white relative overflow-hidden ${borderClass} ${transformClass} ${shadowClass} ${className}`}
    >
      {/* Halftone / Screentone Background Overlay */}
      {hasScreentone && (
        <div className="absolute inset-0 opacity-[0.045] screentone-bg pointer-events-none z-0" />
      )}

      {/* Optional Header Section */}
      {title && (
        <div className="flex items-center justify-between px-5 py-3 border-b-3 border-black bg-white relative z-10 shrink-0">
          <div className="flex items-center gap-2">
            {icon && <div className="text-[#FF003C] shrink-0">{icon}</div>}
            <h3 className="text-sm font-display font-black text-black uppercase tracking-wider manga-slanted">
              {title}
            </h3>
          </div>
          {headerAction && <div className="relative z-10">{headerAction}</div>}
        </div>
      )}

      {/* Main content area */}
      <div className={`relative z-10 h-full ${noPadding ? '' : 'p-3 sm:p-5'}`}>
        {children}
      </div>
    </div>
  );
});

MangaPanel.displayName = 'MangaPanel';

