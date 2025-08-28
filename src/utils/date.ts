// utils/dateUtils.ts

export const formatDate = (dateString: string | null, withTime: boolean = true): string => {
  if (!dateString) {
    return ''; // Return an empty string or a default message if dateString is null or undefined
  }

  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return ''; // Return an empty string or a default message if the date is invalid
  }

  // Default options for date format (without time)
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  // Add time-related options only if withTime is true
  if (withTime) {
    options.hour = 'numeric';
    options.minute = 'numeric';
    options.second = 'numeric';
    options.hour12 = true;
  }

  // Formatting the date with the specified options
  return date.toLocaleString('en-US', options);
};