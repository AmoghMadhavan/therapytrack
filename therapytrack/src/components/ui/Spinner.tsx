import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ 
  size = 'md', 
  color = 'primary-600',
  className = ''
}) => {
  // Set size based on prop
  const sizeClass = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }[size];

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div className={`animate-spin rounded-full ${sizeClass} border-t-2 border-b-2 border-${color}`} />
    </div>
  );
};

export default Spinner; 