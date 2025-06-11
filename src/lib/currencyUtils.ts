/**
 * Utility functions for Indian currency formatting and number conversion
 */

export interface CurrencyFormatOptions {
  showSymbol?: boolean;
  showDecimals?: boolean;
  useIndianNumbering?: boolean;
  compact?: boolean;
}

/**
 * Format number as Indian Rupees with proper INR symbol and formatting
 */
export function formatINR(
  amount: number,
  options: CurrencyFormatOptions = {}
): string {
  const {
    showSymbol = true,
    showDecimals = true,
    useIndianNumbering = true,
    compact = false,
  } = options;

  if (compact) {
    return formatCompactINR(amount, showSymbol);
  }

  const symbol = showSymbol ? '₹' : '';
  
  if (useIndianNumbering) {
    return symbol + formatIndianNumbering(amount, showDecimals);
  }

  const formatter = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  });

  return symbol + formatter.format(amount);
}

/**
 * Format number using Indian numbering system (lakhs, crores)
 */
export function formatIndianNumbering(amount: number, showDecimals: boolean = true): string {
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  
  if (absAmount >= 10000000) { // 1 crore
    const crores = absAmount / 10000000;
    return sign + crores.toFixed(showDecimals ? 2 : 0) + ' Cr';
  } else if (absAmount >= 100000) { // 1 lakh
    const lakhs = absAmount / 100000;
    return sign + lakhs.toFixed(showDecimals ? 2 : 0) + ' L';
  } else if (absAmount >= 1000) { // 1 thousand
    const thousands = absAmount / 1000;
    return sign + thousands.toFixed(showDecimals ? 1 : 0) + 'K';
  }

  return sign + absAmount.toFixed(showDecimals ? 2 : 0);
}

/**
 * Format large numbers in compact form (for market cap, etc.)
 */
export function formatCompactINR(amount: number, showSymbol: boolean = true): string {
  const symbol = showSymbol ? '₹' : '';
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (absAmount >= 1000000000000) { // 1 lakh crore
    const lakhCrores = absAmount / 1000000000000;
    return sign + symbol + lakhCrores.toFixed(2) + ' L Cr';
  } else if (absAmount >= 10000000) { // 1 crore
    const crores = absAmount / 10000000;
    return sign + symbol + crores.toFixed(2) + ' Cr';
  } else if (absAmount >= 100000) { // 1 lakh
    const lakhs = absAmount / 100000;
    return sign + symbol + lakhs.toFixed(2) + ' L';
  } else if (absAmount >= 1000) {
    const thousands = absAmount / 1000;
    return sign + symbol + thousands.toFixed(1) + 'K';
  }

  return sign + symbol + absAmount.toFixed(2);
}

/**
 * Format percentage with Indian locale
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  const sign = value >= 0 ? '+' : '';
  return sign + value.toFixed(decimals) + '%';
}

/**
 * Format volume numbers (shares traded)
 */
export function formatVolume(volume: number): string {
  if (volume >= 10000000) { // 1 crore
    return (volume / 10000000).toFixed(2) + ' Cr';
  } else if (volume >= 100000) { // 1 lakh
    return (volume / 100000).toFixed(2) + ' L';
  } else if (volume >= 1000) {
    return (volume / 1000).toFixed(1) + 'K';
  }
  return volume.toString();
}

/**
 * Parse Indian number format back to number
 */
export function parseIndianNumber(value: string): number {
  // Remove currency symbols and spaces
  const cleanValue = value.replace(/[₹,\s]/g, '');
  
  // Handle crore notation
  if (cleanValue.includes('Cr')) {
    const number = parseFloat(cleanValue.replace('Cr', ''));
    return number * 10000000;
  }
  
  // Handle lakh notation
  if (cleanValue.includes('L')) {
    const number = parseFloat(cleanValue.replace('L', ''));
    return number * 100000;
  }
  
  // Handle thousand notation
  if (cleanValue.includes('K')) {
    const number = parseFloat(cleanValue.replace('K', ''));
    return number * 1000;
  }
  
  return parseFloat(cleanValue) || 0;
}

/**
 * Get Indian market trading hours
 */
export function getIndianMarketHours(): {
  open: string;
  close: string;
  preOpen: string;
  timezone: string;
} {
  return {
    open: '09:15',
    close: '15:30',
    preOpen: '09:00',
    timezone: 'IST',
  };
}

/**
 * Check if Indian market is currently open
 */
export function isIndianMarketOpen(): boolean {
  const now = new Date();
  const istTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
  const hours = istTime.getHours();
  const minutes = istTime.getMinutes();
  const day = istTime.getDay();
  
  // Market is closed on weekends
  if (day === 0 || day === 6) {
    return false;
  }
  
  // Market hours: 9:15 AM to 3:30 PM IST
  const currentTime = hours * 60 + minutes;
  const marketOpen = 9 * 60 + 15; // 9:15 AM
  const marketClose = 15 * 60 + 30; // 3:30 PM
  
  return currentTime >= marketOpen && currentTime <= marketClose;
}

/**
 * Get next market open time
 */
export function getNextMarketOpen(): Date {
  const now = new Date();
  const istTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
  const nextOpen = new Date(istTime);
  
  // If it's weekend, set to next Monday
  if (istTime.getDay() === 0) { // Sunday
    nextOpen.setDate(istTime.getDate() + 1);
  } else if (istTime.getDay() === 6) { // Saturday
    nextOpen.setDate(istTime.getDate() + 2);
  } else if (istTime.getHours() >= 15 && istTime.getMinutes() >= 30) {
    // After market close, set to next day
    nextOpen.setDate(istTime.getDate() + 1);
  }
  
  nextOpen.setHours(9, 15, 0, 0);
  return nextOpen;
}

/**
 * Indian market holidays (2024) - simplified list
 */
export const INDIAN_MARKET_HOLIDAYS_2024 = [
  '2024-01-26', // Republic Day
  '2024-03-08', // Holi
  '2024-03-29', // Good Friday
  '2024-04-11', // Id-Ul-Fitr
  '2024-04-17', // Ram Navami
  '2024-05-01', // Maharashtra Day
  '2024-06-17', // Bakri Id
  '2024-08-15', // Independence Day
  '2024-08-26', // Janmashtami
  '2024-10-02', // Gandhi Jayanti
  '2024-10-12', // Dussehra
  '2024-11-01', // Diwali Laxmi Pujan
  '2024-11-15', // Guru Nanak Jayanti
];

/**
 * Check if a given date is a market holiday
 */
export function isMarketHoliday(date: Date): boolean {
  const dateString = date.toISOString().split('T')[0];
  return INDIAN_MARKET_HOLIDAYS_2024.includes(dateString);
}
