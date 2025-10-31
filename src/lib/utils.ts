export function parseDuration(durationStr: string): number {
  const regex = /^(\d+)(ms|s|m|h)$/;
  const match = durationStr.match(regex);
  
  if (!match) {
    throw new Error(`Invalid duration format: ${durationStr}. Use format like 1s, 1m, 1h`);
  }
  
  const value = parseInt(match[1]);
  const unit = match[2];
  
  switch (unit) {
    case 'ms':
      return value;
    case 's':
      return value * 1000;
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    default:
      throw new Error(`Unknown time unit: ${unit}`);
  }
}

export function parseRSSDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  
  try {
    // Try parsing the date directly first
    const date = new Date(dateStr);
    
    // Check if the date is valid
    if (!isNaN(date.getTime())) {
      return date;
    }
    
    // If direct parsing fails, try to handle common RSS date formats
    // Common formats include RFC 2822 and ISO 8601
    const cleanedDateStr = dateStr.trim();
    
    // Handle RFC 2822 format (most common in RSS)
    // Example: "Mon, 06 Sep 2021 12:00:00 GMT"
    const rfc2822Date = new Date(cleanedDateStr);
    if (!isNaN(rfc2822Date.getTime())) {
      return rfc2822Date;
    }
    
    console.warn(`Could not parse date: ${dateStr}`);
    return null;
  } catch (error) {
    console.warn(`Error parsing date ${dateStr}:`, error);
    return null;
  }
}