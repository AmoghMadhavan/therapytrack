import React from 'react';

interface ToggleProps {
  enabled: boolean;
  onChange: () => void;
  disabled?: boolean;
  label?: string;
}

const Toggle: React.FC<ToggleProps> = ({ enabled, onChange, disabled = false, label }) => {
  return (
    <div className="flex items-center">
      {label && (
        <span className="mr-2 text-xs text-gray-500 w-20 text-right">
          {label}
        </span>
      )}
      <button
        type="button"
        className={`${
          enabled ? 'bg-primary-600' : 'bg-gray-200'
        } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        aria-pressed={enabled}
        onClick={disabled ? undefined : onChange}
        disabled={disabled}
      >
        <span className="sr-only">{enabled ? 'Enabled' : 'Disabled'}</span>
        <span
          aria-hidden="true"
          className={`${
            enabled ? 'translate-x-5' : 'translate-x-0'
          } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
        />
      </button>
    </div>
  );
};

export default Toggle; 