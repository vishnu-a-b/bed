/**
 * Formats a number as currency
 * @param amount - The amount to format (in paise or smallest currency unit)
 * @param currency - Currency code (default: 'INR')
 * @param convertFromPaise - Whether to divide by 100 (for paise to rupees)
 * @returns Formatted currency string (e.g., "₹1,000.00")
 */
export const formatCurrency = (
  amount: number | string | undefined,
  currency: string = 'INR',
  convertFromPaise: boolean = true
): string => {
  if (amount === undefined || amount === null) return 'N/A';
  
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numericAmount)) return 'Invalid Amount';

  const displayAmount = convertFromPaise ? numericAmount  : numericAmount;

  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(displayAmount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    // Fallback formatting if Intl fails
    return `${currency} ${displayAmount.toFixed(2)}`;
  }
};

/**
 * Formats a number with commas as thousand separators
 * @param number - The number to format
 * @returns Formatted number string (e.g., "1,000")
 */
export const formatNumber = (number: number | string | undefined): string => {
  if (number === undefined || number === null) return 'N/A';
  
  const numericValue = typeof number === 'string' ? parseFloat(number) : number;
  if (isNaN(numericValue)) return 'Invalid Number';

  try {
    return new Intl.NumberFormat('en-IN').format(numericValue);
  } catch (error) {
    console.error('Error formatting number:', error);
    return numericValue.toString();
  }
};