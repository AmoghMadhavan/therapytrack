import React from 'react';

interface AIIndicatorProps {
  active: boolean;
  featureType: 'analysis' | 'treatment' | 'prediction' | 'transcription';
  compact?: boolean;
}

/**
 * AIIndicator component
 * 
 * Displays a visual indicator when AI features are being used, with information
 * about data handling for HIPAA compliance transparency.
 */
const AIIndicator: React.FC<AIIndicatorProps> = ({ 
  active, 
  featureType,
  compact = false
}) => {
  // Display text based on feature type
  const getFeatureText = (): string => {
    switch (featureType) {
      case 'analysis':
        return 'AI Session Analysis';
      case 'treatment':
        return 'AI Treatment Planning';
      case 'prediction':
        return 'AI Progress Prediction';
      case 'transcription':
        return 'AI Transcription';
      default:
        return 'AI Processing';
    }
  };
  
  // Get icon based on feature type
  const getIcon = (): React.ReactNode => {
    switch (featureType) {
      case 'analysis':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'treatment':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        );
      case 'prediction':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case 'transcription':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        );
    }
  };
  
  // If not active, don't render
  if (!active) return null;
  
  // Compact version (just icon and minimal info)
  if (compact) {
    return (
      <div className="inline-flex items-center px-2 py-1 text-xs bg-indigo-50 text-indigo-700 rounded">
        <div className={`mr-1 ${active ? 'animate-pulse' : ''}`}>
          {getIcon()}
        </div>
        <span>{getFeatureText()}</span>
        <div className="relative ml-1 group">
          <svg className="w-3.5 h-3.5 text-indigo-500 hover:text-indigo-700 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 hidden group-hover:block bg-white shadow-lg rounded-md p-2 text-xs text-gray-700 z-10">
            <p className="font-bold">HIPAA Compliant</p>
            <p className="text-xs mt-1">All patient data is de-identified before AI processing.</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Full version with more information
  return (
    <div className="bg-indigo-50 border border-indigo-100 rounded-md p-3 mb-4">
      <div className="flex items-center">
        <div className={`mr-3 bg-indigo-100 p-2 rounded-md ${active ? 'animate-pulse' : ''}`}>
          {getIcon()}
        </div>
        <div>
          <h4 className="font-medium text-indigo-800">{getFeatureText()}</h4>
          <p className="text-xs text-indigo-600">
            {active ? 'Processing your request with AI...' : 'AI processing complete'}
          </p>
        </div>
      </div>
      
      <div className="mt-2 text-xs text-indigo-700 border-t border-indigo-100 pt-2">
        <p className="flex items-center">
          <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>Patient data is de-identified before processing</span>
        </p>
        <p className="flex items-center mt-1">
          <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>HIPAA compliant & secure processing</span>
        </p>
        <a 
          href="/settings/ai" 
          className="text-indigo-600 hover:text-indigo-800 mt-1 inline-block"
        >
          Manage AI Settings
        </a>
      </div>
    </div>
  );
};

export default AIIndicator; 