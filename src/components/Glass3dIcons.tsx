import React from 'react';

interface Glass3dIconProps {
  type: 'telegram' | 'youtube' | 'calculator' | 'points' | 'bell' | 'target' | 'calendar' | 'lock' | 'wallet' | 'books' | 'trophy' | 'search' | 'shield' | 'flame' | 'fire' | 'star' | 'brain' | 'sparkles' | 'rocket' | 'code' | 'computer' | 'lightning';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  className?: string;
}

/**
 * 3D-styled glossy icons inside glassmorphic containers (Referencing Image 2 & Image 4)
 */
export const Glass3dIcon: React.FC<Glass3dIconProps> = ({ type, size = 'md', className = '' }) => {
  const sizeClasses: Record<string, string> = {
    xs: 'w-6 h-6 text-xs rounded-lg',
    sm: 'w-8 h-8 text-base rounded-xl',
    md: 'w-12 h-12 text-2xl rounded-2xl',
    lg: 'w-16 h-16 text-3xl rounded-2xl',
    xl: 'w-20 h-20 text-4xl rounded-3xl'
  };

  const isPresetSize = typeof size === 'string' && size in sizeClasses;
  const sizeClass = isPresetSize ? sizeClasses[size as string] : 'w-10 h-10 text-xl rounded-xl';
  const customInlineStyle = typeof size === 'number' ? { width: `${size}px`, height: `${size}px` } : {};

  const getGradientAndIcon = () => {
    switch (type) {
      case 'telegram':
        return {
          bg: 'from-sky-400 via-blue-500 to-indigo-600',
          shadow: 'shadow-sky-500/30',
          border: 'border-sky-200/60',
          icon: (
            <svg className="w-2/3 h-2/3 text-white drop-shadow-md transform -rotate-12 hover:rotate-0 transition-transform duration-300" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.67-.52.36-.99.53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.37-.49 1.02-.75 3.99-1.74 6.66-2.89 8.01-3.45 3.81-1.59 4.6-1.87 5.12-1.88.11 0 .37.03.54.17.14.12.18.28.2.45-.02.07-.02.21-.04.36z"/>
            </svg>
          )
        };
      case 'youtube':
        return {
          bg: 'from-rose-500 via-red-600 to-rose-700',
          shadow: 'shadow-rose-500/30',
          border: 'border-rose-200/60',
          icon: (
            <svg className="w-2/3 h-2/3 text-white drop-shadow-md hover:scale-105 transition-transform duration-300" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          )
        };
      case 'calculator':
        return {
          bg: 'from-cyan-400 via-teal-500 to-emerald-600',
          shadow: 'shadow-cyan-500/30',
          border: 'border-cyan-200/60',
          icon: '🧮'
        };
      case 'points':
        return {
          bg: 'from-amber-400 via-orange-500 to-rose-500',
          shadow: 'shadow-amber-500/30',
          border: 'border-amber-200/60',
          icon: '🅿️'
        };
      case 'bell':
        return {
          bg: 'from-yellow-300 via-amber-400 to-orange-500',
          shadow: 'shadow-yellow-500/30',
          border: 'border-yellow-200/60',
          icon: '🔔'
        };
      case 'target':
        return {
          bg: 'from-rose-400 via-red-500 to-pink-600',
          shadow: 'shadow-rose-500/30',
          border: 'border-rose-200/60',
          icon: '🎯'
        };
      case 'calendar':
        return {
          bg: 'from-blue-400 via-indigo-500 to-purple-600',
          shadow: 'shadow-blue-500/30',
          border: 'border-blue-200/60',
          icon: '📅'
        };
      case 'lock':
        return {
          bg: 'from-sky-400 via-indigo-500 to-blue-700',
          shadow: 'shadow-indigo-500/30',
          border: 'border-sky-200/60',
          icon: '🔒'
        };
      case 'wallet':
        return {
          bg: 'from-amber-400 via-yellow-500 to-orange-600',
          shadow: 'shadow-amber-500/30',
          border: 'border-amber-200/60',
          icon: '👛'
        };
      case 'books':
        return {
          bg: 'from-indigo-500 via-purple-600 to-violet-800',
          shadow: 'shadow-indigo-500/30',
          border: 'border-indigo-200/60',
          icon: '📚'
        };
      case 'trophy':
        return {
          bg: 'from-amber-300 via-amber-500 to-yellow-600',
          shadow: 'shadow-amber-500/40',
          border: 'border-amber-100/80',
          icon: '🏆'
        };
      case 'search':
        return {
          bg: 'from-emerald-400 via-teal-500 to-cyan-600',
          shadow: 'shadow-emerald-500/30',
          border: 'border-emerald-200/60',
          icon: '🔍'
        };
      case 'flame':
      case 'fire':
        return {
          bg: 'from-amber-400 via-orange-500 to-red-600',
          shadow: 'shadow-orange-500/40',
          border: 'border-amber-200/80',
          icon: '🔥'
        };
      case 'star':
        return {
          bg: 'from-yellow-300 via-amber-400 to-yellow-500',
          shadow: 'shadow-yellow-400/40',
          border: 'border-amber-100/80',
          icon: '⭐'
        };
      case 'brain':
        return {
          bg: 'from-pink-400 via-rose-500 to-purple-600',
          shadow: 'shadow-pink-500/30',
          border: 'border-pink-200/60',
          icon: '🧠'
        };
      case 'sparkles':
        return {
          bg: 'from-indigo-400 via-purple-500 to-pink-500',
          shadow: 'shadow-purple-500/30',
          border: 'border-indigo-200/60',
          icon: '✨'
        };
      case 'rocket':
        return {
          bg: 'from-blue-500 via-indigo-600 to-purple-700',
          shadow: 'shadow-indigo-500/40',
          border: 'border-blue-200/60',
          icon: '🚀'
        };
      case 'computer':
      case 'code':
        return {
          bg: 'from-indigo-600 via-blue-600 to-cyan-600',
          shadow: 'shadow-indigo-500/40',
          border: 'border-indigo-200/80',
          icon: '🖥️'
        };
      case 'lightning':
        return {
          bg: 'from-yellow-400 via-amber-500 to-amber-600',
          shadow: 'shadow-amber-500/40',
          border: 'border-amber-200/80',
          icon: '⚡'
        };
      case 'shield':
      default:
        return {
          bg: 'from-violet-500 via-purple-600 to-indigo-700',
          shadow: 'shadow-purple-500/30',
          border: 'border-purple-200/60',
          icon: '🛡️'
        };
    }
  };

  const styleConfig = getGradientAndIcon();

  return (
    <div
      className={`relative flex items-center justify-center bg-gradient-to-br ${styleConfig.bg} ${sizeClass} ${styleConfig.shadow} shadow-lg border ${styleConfig.border} transform transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 cursor-pointer shrink-0 overflow-hidden ${className}`}
      style={{
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), inset 0 2px 4px 0 rgba(255, 255, 255, 0.45)',
        ...customInlineStyle
      }}
    >
      {/* 3D Gloss Highlight Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/35 via-transparent to-black/20 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/20 rounded-t-2xl pointer-events-none backdrop-blur-[1px]" />
      
      {/* Icon Content */}
      <div className="relative z-10 flex items-center justify-center w-full h-full text-white font-extrabold drop-shadow-md">
        {typeof styleConfig.icon === 'string' ? (
          <span className="filter drop-shadow-md select-none">{styleConfig.icon}</span>
        ) : (
          styleConfig.icon
        )}
      </div>
    </div>
  );
};
