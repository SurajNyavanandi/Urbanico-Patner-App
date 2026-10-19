import React from 'react';

interface LayoutContainerProps {
  children: React.ReactNode;
  isNightMode: boolean;
}

/**
 * Clean, Apple-style minimalist layout container.
 * Full-width responsive on mobile, centered max-w-lg on larger screens.
 * No fake phone frames, bezels, or artificial dynamic islands.
 */
export const DeviceFrameWrapper: React.FC<LayoutContainerProps> = ({
  children,
  isNightMode
}) => {
  return (
    <div className={`min-h-screen transition-colors ${
      isNightMode ? 'bg-[#0F172A] text-white' : 'bg-[#F8FAFC] text-[#18181B]'
    }`}>
      <div className="w-full max-w-lg mx-auto min-h-screen flex flex-col shadow-sm">
        {children}
      </div>
    </div>
  );
};
