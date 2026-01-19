import { useState } from 'react';

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
  '2xl': 'w-20 h-20 text-2xl',
  '3xl': 'w-32 h-32 text-4xl',
};

const statusSizeClasses = {
  xs: 'w-2 h-2 border',
  sm: 'w-2.5 h-2.5 border',
  md: 'w-3 h-3 border-2',
  lg: 'w-3.5 h-3.5 border-2',
  xl: 'w-4 h-4 border-2',
  '2xl': 'w-5 h-5 border-2',
  '3xl': 'w-6 h-6 border-[3px]',
};

const statusColors = {
  online: 'bg-emerald-500',
  offline: 'bg-slate-400',
  busy: 'bg-red-500',
  away: 'bg-amber-500',
};

export default function Avatar({
  src,
  alt = 'User',
  name,
  size = 'md',
  status,
  showRing = true,
  ringColor = 'slate',
  rounded = 'full',
  className = '',
  onClick,
  hoverable = false,
}) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return '?';
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

  const roundedClasses = {
    full: 'rounded-full',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    lg: 'rounded-lg',
    md: 'rounded-md',
  };

  const ringStyles = {
    slate: 'ring-2 ring-slate-200 dark:ring-slate-700',
    blue: 'ring-2 ring-blue-500',
    white: 'ring-2 ring-white dark:ring-slate-800',
    none: '',
  };

  const shouldShowFallback = !src || imageError;

  return (
    <div
      className={`relative inline-flex shrink-0 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar container */}
      <div
        className={`
          ${sizeClasses[size]}
          ${roundedClasses[rounded]}
          overflow-hidden
          bg-slate-100 dark:bg-slate-800
          ${showRing ? ringStyles[ringColor] : ''}
          ${hoverable ? 'transition-transform duration-300 hover:scale-110' : ''}
          ${onClick ? 'cursor-pointer' : ''}
        `}
        onClick={onClick}
      >
        {shouldShowFallback ? (
          // Fallback with initials
          <div
            className={`
              w-full h-full flex items-center justify-center
              bg-slate-200 dark:bg-slate-700
              text-slate-600 dark:text-slate-300 font-semibold
            `}
          >
            {getInitials(name)}
          </div>
        ) : (
          // Profile image
          <img
            src={src}
            alt={alt}
            className={`
              w-full h-full object-cover
              transition-transform duration-300
              ${hoverable && isHovered ? 'scale-110' : ''}
            `}
            onError={() => setImageError(true)}
          />
        )}
      </div>

      {/* Status indicator */}
      {status && (
        <span
          className={`
            absolute bottom-0 right-0
            ${statusSizeClasses[size]}
            ${statusColors[status]}
            rounded-full
            border-2 border-white dark:border-slate-900
          `}
        />
      )}
    </div>
  );
}

// Avatar Group Component
export function AvatarGroup({ children, max = 4, size = 'md' }) {
  const avatars = Array.isArray(children) ? children : [children];
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  return (
    <div className="flex -space-x-3">
      {visibleAvatars.map((avatar, index) => (
        <div key={index} className="relative" style={{ zIndex: visibleAvatars.length - index }}>
          {avatar}
        </div>
      ))}
      {remainingCount > 0 && (
        <div
          className={`
            ${sizeClasses[size]}
            rounded-full
            bg-slate-200 dark:bg-slate-700
            flex items-center justify-center
            text-slate-600 dark:text-slate-300
            font-medium
            ring-2 ring-white dark:ring-slate-900
          `}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}
