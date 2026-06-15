import React from 'react';

const PasswordStrengthMeter = ({ password }) => {
  const calculateStrength = (password) => {
    let score = 0;
    if (!password) return score;

    // Check password length
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;

    // Check for lowercase letters
    if (/[a-z]/.test(password)) score++;

    // Check for uppercase letters
    if (/[A-Z]/.test(password)) score++;

    // Check for numbers
    if (/\d/.test(password)) score++;

    // Check for special characters
    if (/[^A-Za-z0-9]/.test(password)) score++;

    return score;
  };

  const getStrengthLabel = (score) => {
    if (score === 0) return 'Very Weak';
    if (score <= 2) return 'Weak';
    if (score <= 4) return 'Good';
    if (score <= 5) return 'Strong';
    return 'Very Strong';
  };

  const getStrengthColor = (score) => {
    if (score === 0) return 'bg-red-500';
    if (score <= 2) return 'bg-red-400';
    if (score <= 4) return 'bg-yellow-400';
    if (score <= 5) return 'bg-green-400';
    return 'bg-green-500';
  };

  const strength = calculateStrength(password);
  const strengthLabel = getStrengthLabel(strength);
  const strengthColor = getStrengthColor(strength);

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-600 dark:text-gray-400">
          Password Strength
        </span>
        <span className={`text-xs font-medium ${
          strength <= 2 ? 'text-red-500' : 
          strength <= 4 ? 'text-yellow-500' : 
          'text-green-500'
        }`}>
          {strengthLabel}
        </span>
      </div>
      <div className="flex space-x-1">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className={`h-1 w-full rounded-full ${
              index < strength ? strengthColor : 'bg-gray-200 dark:bg-gray-700'
            }`}
          />
        ))}
      </div>
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        <ul className="space-y-1">
          <li className={`flex items-center ${password.length >= 8 ? 'text-green-600' : ''}`}>
            <span className="mr-2">{password.length >= 8 ? '✓' : '○'}</span>
            At least 8 characters
          </li>
          <li className={`flex items-center ${/[a-z]/.test(password) ? 'text-green-600' : ''}`}>
            <span className="mr-2">{/[a-z]/.test(password) ? '✓' : '○'}</span>
            Lowercase letter
          </li>
          <li className={`flex items-center ${/[A-Z]/.test(password) ? 'text-green-600' : ''}`}>
            <span className="mr-2">{/[A-Z]/.test(password) ? '✓' : '○'}</span>
            Uppercase letter
          </li>
          <li className={`flex items-center ${/\d/.test(password) ? 'text-green-600' : ''}`}>
            <span className="mr-2">{/\d/.test(password) ? '✓' : '○'}</span>
            Number
          </li>
          <li className={`flex items-center ${/[^A-Za-z0-9]/.test(password) ? 'text-green-600' : ''}`}>
            <span className="mr-2">{/[^A-Za-z0-9]/.test(password) ? '✓' : '○'}</span>
            Special character
          </li>
        </ul>
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;