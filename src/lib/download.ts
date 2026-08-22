/**
 * Hands a generated file to the browser and releases the object URL afterwards.
 * Shared by every export path so the revoke is never forgotten.
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Safari needs the URL to outlive the click by a tick.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Characters Windows rejects outright in a filename.
const RESERVED = '<>:"/\\|?*';

/**
 * Turns a document title into a safe filename stem, dropping reserved and
 * control characters. Falls back to 'document' when nothing usable survives
 * (e.g. a title made entirely of slashes).
 */
export function toFilename(title: string, extension: string) {
  const stem =
    Array.from(title)
      .filter((ch) => ch.charCodeAt(0) > 31 && !RESERVED.includes(ch))
      .join('')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 100) || 'document';
  return `${stem}.${extension}`;
}
