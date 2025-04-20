/**
 * Format a date string to a human-readable format
 * @param dateString - ISO date string to format
 * @param includeTime - Whether to include the time in the formatted string
 * @returns Formatted date string
 */
export const formatDate = (dateString: string, includeTime = false): string => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

  if (includeTime) {
    options.hour = 'numeric';
    options.minute = 'numeric';
  }

  return date.toLocaleDateString('en-US', options);
};

/**
 * Get a relative time string (e.g., "2 days ago", "in 3 hours")
 * @param dateString - ISO date string
 * @returns Relative time string
 */
export const getRelativeTimeString = (dateString: string): string => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }

  const now = new Date();
  const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);
  
  // Future date
  if (diffInSeconds > 0) {
    // Less than a minute
    if (diffInSeconds < 60) {
      return `in ${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''}`;
    }
    
    // Less than an hour
    const minutes = Math.floor(diffInSeconds / 60);
    if (minutes < 60) {
      return `in ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    
    // Less than a day
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `in ${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    
    // Less than a week
    const days = Math.floor(hours / 24);
    if (days < 7) {
      return `in ${days} day${days !== 1 ? 's' : ''}`;
    }
    
    // Default to formatted date for longer periods
    return formatDate(dateString);
  }
  
  // Past date
  const absDiff = Math.abs(diffInSeconds);
  
  // Less than a minute
  if (absDiff < 60) {
    return 'just now';
  }
  
  // Less than an hour
  const minutes = Math.floor(absDiff / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  }
  
  // Less than a day
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  }
  
  // Less than a week
  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }
  
  // Default to formatted date for longer periods
  return formatDate(dateString);
};

/**
 * Check if a date is in the past
 * @param dateString - ISO date string
 * @returns True if date is in the past
 */
export const isDatePast = (dateString: string): boolean => {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return false;
  }
  
  return date < new Date();
};

/**
 * Convert a date string to ISO format
 * @param dateString - Date string in any format
 * @returns ISO date string
 */
export const toISOString = (dateString: string): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return '';
  }
  
  return date.toISOString();
};

/**
 * Get today's date as an ISO string truncated to date only (YYYY-MM-DD)
 */
export const getTodayAsISODate = (): string => {
  return new Date().toISOString().slice(0, 10);
};

/**
 * Add days to a date and return the result as an ISO string
 * @param days - Number of days to add (can be negative)
 * @param startDate - Starting date (defaults to today)
 * @returns ISO date string
 */
export const addDaysToDate = (days: number, startDate?: Date | string): string => {
  const date = startDate ? new Date(startDate) : new Date();
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return '';
  }
  
  date.setDate(date.getDate() + days);
  return date.toISOString();
}; 