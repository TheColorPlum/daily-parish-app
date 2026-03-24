/**
 * Format scripture reference for display.
 * 
 * Handles pipe-separated references like "Malachi 3:1-4|Hebrews 2:14-18"
 * and converts them to "Malachi 3:1-4 & Hebrews 2:14-18"
 */
export function formatReference(reference: string): string {
  if (!reference) return '';
  
  // Replace pipe with " & " for readability
  return reference.replace(/\s*\|\s*/g, ' & ');
}

/**
 * Split a pipe-separated reference into individual parts.
 * Useful when you want to display each reference on its own line.
 */
export function splitReference(reference: string): string[] {
  if (!reference) return [];
  return reference.split('|').map(r => r.trim());
}
