
import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`bg-white/60 backdrop-blur-xl border border-white/30 rounded-2xl shadow-3d p-6 transition-all duration-300 ${className}`}
    >
      {children}
    </div>
  );
};

export default GlassCard;
