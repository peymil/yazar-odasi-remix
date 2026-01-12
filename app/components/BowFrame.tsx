import { ReactNode } from 'react';

interface BowFrameProps {
  children: ReactNode;
  className?: string;
}

export function BowFrame({ children, className = '' }: BowFrameProps) {
  return (
    <div className={`relative ${className}`}>
      {/* The decorative bow frame border using the actual Figma asset */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="rotate-90 w-full h-full flex items-center justify-center">
          <img
            src="https://www.figma.com/api/mcp/asset/f538f803-cbb7-4277-a50f-b7dc4e0e5209"
            alt=""
            className="w-full h-full object-contain"
            style={{ minHeight: '100%' }}
          />
        </div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 p-16">
        {children}
      </div>
    </div>
  );
}
