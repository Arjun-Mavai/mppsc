export function parseExtendedData(data: unknown) {
  if (!data) return null;
  let parsed = data;
  
  if (typeof data === 'string') {
    try {
      parsed = JSON.parse(data);
    } catch {
      return null;
    }
  }
  
  // Handling array structure in case the db or parser wraps it
  if (Array.isArray(parsed) && parsed.length > 0) {
      if (parsed[0] && typeof parsed[0] === 'object' && 'explanation' in parsed[0]) {
          return (parsed[0] as any).explanation;
      }
      return parsed[0];
  }
  
  if (parsed && typeof parsed === 'object' && 'explanation' in parsed) {
    return (parsed as any).explanation;
  }
  
  return parsed; // Fallback to return the object directly if structured without wrapper
}
