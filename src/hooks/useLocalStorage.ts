import { useCallback, useEffect, useRef, useState } from 'react';

// Long enough that a fast typist produces one write instead of dozens, short
// enough that the work is durable almost immediately.
const WRITE_DELAY_MS = 500;

/**
 * @param onWriteError Called when persisting fails -- in practice
 * QuotaExceededError on a large document, or a browser with site data blocked.
 * The failure is otherwise invisible: the app keeps working from memory and the
 * user has no way to know their work stopped being saved.
 */
function useLocalStorage<T>(key: string, initialValue: T, onWriteError?: () => void) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const timeoutRef = useRef<number | undefined>(undefined);
  const pendingRef = useRef<{ key: string; value: T } | null>(null);
  // Writes are debounced, so a document that no longer fits would otherwise
  // report on every pause in typing. Report the transition, not each attempt.
  const failingRef = useRef(false);
  const onErrorRef = useRef(onWriteError);
  useEffect(() => {
    onErrorRef.current = onWriteError;
  }, [onWriteError]);

  const flush = useCallback(() => {
    if (timeoutRef.current !== undefined) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
    const pending = pendingRef.current;
    if (!pending) return;
    pendingRef.current = null;
    try {
      window.localStorage.setItem(pending.key, JSON.stringify(pending.value));
      failingRef.current = false;
    } catch (error) {
      // Most often QuotaExceededError on a very large document.
      console.error(error);
      if (!failingRef.current) {
        failingRef.current = true;
        onErrorRef.current?.();
      }
    }
  }, []);

  // Serialising the whole document on every keystroke was a measurable part of
  // the typing cost; debounce it instead.
  useEffect(() => {
    pendingRef.current = { key, value: storedValue };
    if (timeoutRef.current !== undefined) clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(flush, WRITE_DELAY_MS);
  }, [key, storedValue, flush]);

  // A debounced write must never lose the last edit, so force it out whenever
  // the page is going away or being backgrounded.
  useEffect(() => {
    const handleHide = () => {
      if (document.visibilityState === 'hidden') flush();
    };
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', handleHide);
    return () => {
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', handleHide);
      flush();
    };
  }, [flush]);

  return [storedValue, setStoredValue] as const;
}

export default useLocalStorage;
