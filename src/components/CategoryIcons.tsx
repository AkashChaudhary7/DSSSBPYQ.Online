import React from 'react';

interface CategoryIconProps {
  className?: string;
  size?: number;
}

/**
 * High-quality standardized vector-style icon for TGT Computer Science (Part B)
 */
export const TgtCsCategoryIcon: React.FC<CategoryIconProps> = ({ className = "w-12 h-12", size = 48 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} transform transition-all duration-300 hover:scale-105 shrink-0`}
      aria-label="TGT Computer Science 3D Icon"
    >
      <defs>
        {/* 3D Outer Container Gradient */}
        <linearGradient id="tgtCs3dBg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4338CA" />
          <stop offset="50%" stopColor="#312E81" />
          <stop offset="100%" stopColor="#1E1B4B" />
        </linearGradient>

        {/* 3D Metallic Laptop Base Gradient */}
        <linearGradient id="laptopBase3d" x1="8" y1="42" x2="56" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#CBD5E1" />
          <stop offset="40%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>

        {/* 3D Screen Frame Gradient */}
        <linearGradient id="screenFrame3d" x1="12" y1="12" x2="52" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>

        {/* Glowing 3D Screen Display Gradient */}
        <linearGradient id="screenDisplay3d" x1="14" y1="14" x2="50" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0284C7" />
          <stop offset="50%" stopColor="#0369A1" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>

        {/* Gloss Top Reflection */}
        <linearGradient id="glossTop" x1="0" y1="0" x2="0" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        <filter id="shadow3dComp" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.45" />
        </filter>
        <filter id="glow3dScreen" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#38BDF8" floodOpacity="0.75" />
        </filter>
      </defs>
      
      {/* 3D Glassmorphic Outer Card */}
      <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#tgtCs3dBg)" filter="url(#shadow3dComp)" />
      <rect x="2" y="2" width="60" height="60" rx="16" stroke="#818CF8" strokeWidth="1.2" strokeOpacity="0.6" />
      
      {/* Glossy Curved Highlight Overlay */}
      <path d="M2 18C2 9.16344 9.16344 2 18 2H46C54.8366 2 62 9.16344 62 18V26H2V18Z" fill="url(#glossTop)" />
      
      {/* 3D Perspective Shadow under Laptop Base */}
      <ellipse cx="32" cy="53" rx="22" ry="4" fill="#000000" fillOpacity="0.4" />

      {/* 3D Laptop Screen Outer Frame */}
      <rect x="13" y="11" width="38" height="28" rx="4" fill="url(#screenFrame3d)" stroke="#64748B" strokeWidth="1.2" filter="url(#shadow3dComp)" />
      
      {/* 3D Laptop Screen Active Display */}
      <rect x="15" y="13" width="34" height="24" rx="2.5" fill="url(#screenDisplay3d)" filter="url(#glow3dScreen)" />
      
      {/* Code / Computer Graphic Elements inside Screen */}
      <path d="M19 21L24 25L19 29" stroke="#38BDF8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="27" y1="29" x2="33" y2="29" stroke="#38BDF8" strokeWidth="2.2" strokeLinecap="round" />
      
      <line x1="19" y1="33" x2="38" y2="33" stroke="#34D399" strokeWidth="1.8" strokeLinecap="round" opacity="0.9" />
      <line x1="36" y1="21" x2="45" y2="21" stroke="#F472B6" strokeWidth="1.8" strokeLinecap="round" opacity="0.9" />
      <line x1="36" y1="25" x2="43" y2="25" stroke="#FBBF24" strokeWidth="1.8" strokeLinecap="round" opacity="0.9" />

      {/* Web Camera Dot */}
      <circle cx="32" cy="12" r="1" fill="#94A3B8" />

      {/* 3D Laptop Base Wedge (Keyboard Area) */}
      <path d="M7 42C7 40.8954 7.89543 40 9 40H55C56.1046 40 57 40.8954 57 42L59 48C59 49.6569 57.6569 51 56 51H8C6.34315 51 5 49.6569 5 48L7 42Z" fill="url(#laptopBase3d)" filter="url(#shadow3dComp)" />
      
      {/* Keyboard Indentation & Trackpad */}
      <polygon points="12,42 52,42 54,46 10,46" fill="#1E293B" opacity="0.7" />
      <rect x="27" y="47" width="10" height="3" rx="0.8" fill="#64748B" />
      
      {/* Front Notch Lip Highlight */}
      <path d="M26 40H38V41.5H26V40Z" fill="#E2E8F0" />

      {/* Floating 3D Tech Sparkle Badge */}
      <g transform="translate(44, 6)" filter="url(#shadow3dComp)">
        <circle cx="8" cy="8" r="7" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="1.5" />
        <path d="M8 4V12M4 8H12" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  );
};

/**
 * High-quality standardized vector-style icon for Common DSSSB Exam Hub (Part A)
 */
export const CommonDsssbCategoryIcon: React.FC<CategoryIconProps> = ({ className = "w-12 h-12", size = 48 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Common DSSSB Category Icon"
    >
      <defs>
        <linearGradient id="commonDsssbBg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#451A03" />
        </linearGradient>
        <linearGradient id="bookGrad" x1="16" y1="24" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
      
      {/* Outer Rounded Container */}
      <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#commonDsssbBg)" />
      
      {/* Glowing Accent Ring */}
      <rect x="2" y="2" width="60" height="60" rx="16" stroke="#FBBF24" strokeWidth="1.5" strokeOpacity="0.4" fill="none" />
      
      {/* Government Pillar / Monument Pedestal Base */}
      <path d="M14 48H50V51C50 51.5523 49.5523 52 49 52H15C14.4477 52 14 51.5523 14 51V48Z" fill="#78350F" />
      <path d="M18 45H46V48H18V45Z" fill="#B45309" />
      
      {/* Greek Classical Columns */}
      <rect x="20" y="28" width="4" height="17" rx="1" fill="#FDE68A" opacity="0.9" />
      <rect x="28" y="28" width="4" height="17" rx="1" fill="#FDE68A" opacity="0.9" />
      <rect x="36" y="28" width="4" height="17" rx="1" fill="#FDE68A" opacity="0.9" />
      <rect x="44" y="28" width="4" height="17" rx="1" fill="#FDE68A" opacity="0.9" />
      
      {/* Triangle Roof / Pediment */}
      <path d="M32 14L16 26H48L32 14Z" fill="url(#bookGrad)" />
      <circle cx="32" cy="20" r="2" fill="#78350F" />
      
      {/* Open Knowledge Book Overlay */}
      <path d="M18 36C22 34 28 34 32 37C36 34 42 34 46 36V46C42 44 36 44 32 47C28 44 22 44 18 46V36Z" fill="#FFFBEB" stroke="#D97706" strokeWidth="1.5" />
      <path d="M32 37V47" stroke="#D97706" strokeWidth="1.5" />
      
      {/* Book Lines */}
      <line x1="21" y1="39" x2="28" y2="38" stroke="#F59E0B" strokeWidth="1" />
      <line x1="21" y1="41" x2="28" y2="40" stroke="#F59E0B" strokeWidth="1" />
      <line x1="36" y1="38" x2="43" y2="39" stroke="#F59E0B" strokeWidth="1" />
      <line x1="36" y1="40" x2="43" y2="41" stroke="#F59E0B" strokeWidth="1" />
      
      {/* Floating Key / Crest Badge */}
      <circle cx="50" cy="14" r="5" fill="#F59E0B" />
      <path d="M48 14H52M50 12V16" stroke="#451A03" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
};

/**
 * High-quality standardized vector-style icon for Full-Length CBT Mock Tests
 */
export const FullMockCategoryIcon: React.FC<CategoryIconProps> = ({ className = "w-12 h-12", size = 48 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Full Mock CBT Category Icon"
    >
      <defs>
        <linearGradient id="fullMockBg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="100%" stopColor="#064E3B" />
        </linearGradient>
        <linearGradient id="trophyGrad" x1="20" y1="18" x2="44" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      
      {/* Outer Rounded Container */}
      <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#fullMockBg)" />
      
      {/* Glowing Accent Ring */}
      <rect x="2" y="2" width="60" height="60" rx="16" stroke="#34D399" strokeWidth="1.5" strokeOpacity="0.4" fill="none" />
      
      {/* Exam Scorecard / Target Circle Backdrop */}
      <circle cx="32" cy="32" r="22" fill="#047857" fillOpacity="0.4" stroke="#6EE7B7" strokeWidth="1" strokeDasharray="3 3" />
      
      {/* Stopwatch Ring Top */}
      <path d="M28 12H36M32 12V15" stroke="#A7F3D0" strokeWidth="2" strokeLinecap="round" />
      
      {/* Bullseye / Scorecard Target Dial */}
      <circle cx="32" cy="34" r="16" fill="#065F46" stroke="#A7F3D0" strokeWidth="2" />
      <circle cx="32" cy="34" r="11" fill="#047857" stroke="#34D399" strokeWidth="1.5" />
      <circle cx="32" cy="34" r="6" fill="#ECFDF5" />
      <circle cx="32" cy="34" r="2" fill="#059669" />
      
      {/* Clock Hand pointing to 100% success */}
      <line x1="32" y1="34" x2="32" y2="25" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
      <line x1="32" y1="34" x2="38" y2="34" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
      
      {/* Golden Target Arrow / Checkmark Emblem */}
      <path d="M23 34L29 40L42 25" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M23 34L29 40L42 25" stroke="#FEF3C7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      
      {/* Floating 200 Marks Star Badge */}
      <circle cx="48" cy="16" r="6" fill="#F59E0B" />
      <path d="M48 12.5L49.3 14.8L51.9 15.2L50 17.1L50.5 19.6L48 18.3L45.5 19.6L46 17.1L44.1 15.2L46.7 14.8L48 12.5Z" fill="#FFFBEB" />
    </svg>
  );
};

/**
 * Universal Category Icon switcher
 */
export const CategoryIcon: React.FC<{ category: string; className?: string; size?: number }> = ({ category, className, size }) => {
  const catLower = (category || '').toLowerCase();
  if (catLower.includes('cs') || catLower.includes('tgt') || catLower.includes('computer') || catLower.includes('part_b') || catLower.includes('part b')) {
    return <TgtCsCategoryIcon className={className} size={size} />;
  }
  if (catLower.includes('common') || catLower.includes('part_a') || catLower.includes('part a') || catLower.includes('general')) {
    return <CommonDsssbCategoryIcon className={className} size={size} />;
  }
  return <FullMockCategoryIcon className={className} size={size} />;
};
