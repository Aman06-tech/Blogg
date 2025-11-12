import React from 'react';
import { Spinner } from 'flowbite-react';

const LoadingButton = ({ 
  loading, 
  children, 
  loadingText = "Loading...", 
  className = "", 
  disabled = false,
  type = "button",
  ...props 
}) => {
  return (
    <button
      type={type}
      disabled={loading || disabled}
      className={`
        relative inline-flex items-center justify-center px-6 py-3 
        bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 
        text-white font-semibold rounded-lg 
        transition-all duration-200 
        hover:shadow-lg hover:scale-[1.02] 
        focus:outline-none focus:ring-4 focus:ring-purple-500/25
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none
        ${className}
      `}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Spinner size="sm" color="white" />
          <span className="ml-2 text-sm">{loadingText}</span>
        </div>
      )}
      <span className={loading ? 'invisible' : 'visible'}>
        {children}
      </span>
    </button>
  );
};

export default LoadingButton;