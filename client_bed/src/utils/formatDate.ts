export const formatDate = (date: string) => {
  if (!date) return "";
  const d = new Date(date);
  const day = d.getDate();
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();

  return `${day}-${month}-${year}`; // Returns the formatted date as dd-MMM-yyyy
};

export const formatDateTime = (date: string) => {

  if (!date) return "";
  const d= new Date(date);
  const day = d.getDate();;
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = monthNames[day];
  const year = d.getFullYear();

  // Format time in 12-hour format
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12; // Convert 0 to 12 for midnight
  const time = `${hours}:${minutes} ${ampm}`;

  const formattedDate = `${day}-${month}-${year}`; // Format as dd-MMM-yyyy
  

  return `${formattedDate} ${time}`; // Combined date and time format
};

export const timeOnly = (date: string) => {
  if (!date) return "";
  const d = new Date(date);
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12; // Convert 0 to 12 for midnight
  const time = `${hours}:${minutes} ${ampm}`;
  return ` ${time}`; // Combined date and time format
};


/**
 * Formats a date string or Date object into a readable format
 * @param date - Date string or Date object
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string (e.g., "Jan 1, 2023" or "01/01/2023")
 */
export const formatDate1 = (
  date: string | Date | undefined,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
): string => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'Invalid Date';
    
    return new Intl.DateTimeFormat('en-US', options).format(dateObj);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

/**
 * Formats a date into ISO date string (YYYY-MM-DD)
 * Useful for date inputs
 */
export const formatISODate = (date: string | Date | undefined): string => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '';
    
    return dateObj.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting ISO date:', error);
    return '';
  }
};