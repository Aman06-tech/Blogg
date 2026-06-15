import React from 'react';
import { Alert } from 'flowbite-react';
import { HiInformationCircle, HiExclamation, HiCheckCircle, HiX } from 'react-icons/hi';

const SecurityAlert = ({ 
  type = 'info', 
  title, 
  message, 
  onClose, 
  className = "",
  showIcon = true 
}) => {
  const getAlertConfig = () => {
    switch (type) {
      case 'success':
        return {
          color: 'success',
          icon: HiCheckCircle,
          bgColor: 'bg-green-50 dark:bg-green-800/10',
          borderColor: 'border-green-200 dark:border-green-800',
          textColor: 'text-green-800 dark:text-green-200'
        };
      case 'warning':
        return {
          color: 'warning',
          icon: HiExclamation,
          bgColor: 'bg-yellow-50 dark:bg-yellow-800/10',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          textColor: 'text-yellow-800 dark:text-yellow-200'
        };
      case 'error':
        return {
          color: 'failure',
          icon: HiX,
          bgColor: 'bg-red-50 dark:bg-red-800/10',
          borderColor: 'border-red-200 dark:border-red-800',
          textColor: 'text-red-800 dark:text-red-200'
        };
      default:
        return {
          color: 'info',
          icon: HiInformationCircle,
          bgColor: 'bg-blue-50 dark:bg-blue-800/10',
          borderColor: 'border-blue-200 dark:border-blue-800',
          textColor: 'text-blue-800 dark:text-blue-200'
        };
    }
  };

  const config = getAlertConfig();

  return (
    <div className={`
      rounded-lg border p-4 mb-4 animate-in fade-in duration-300
      ${config.bgColor} ${config.borderColor} ${className}
    `}>
      <div className="flex items-start">
        {showIcon && (
          <div className="flex-shrink-0">
            <config.icon className={`h-5 w-5 ${config.textColor}`} />
          </div>
        )}
        <div className={`${showIcon ? 'ml-3' : ''} flex-1`}>
          {title && (
            <h3 className={`text-sm font-medium ${config.textColor} mb-1`}>
              {title}
            </h3>
          )}
          <div className={`text-sm ${config.textColor}`}>
            {typeof message === 'string' ? (
              <p>{message}</p>
            ) : (
              message
            )}
          </div>
        </div>
        {onClose && (
          <div className="flex-shrink-0 ml-auto pl-3">
            <button
              onClick={onClose}
              className={`
                inline-flex rounded-md p-1.5 
                ${config.textColor} 
                hover:bg-black/5 dark:hover:bg-white/5
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent
                transition-colors duration-200
              `}
            >
              <span className="sr-only">Dismiss</span>
              <HiX className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityAlert;