import { useCallback, useEffect, useRef, useState } from 'react';

// Long enough that a fast typist produces one write instead of dozens, short
// enough that the work is durable almost immediately.
const WRITE_DELAY_MS = 500;

function useLocalStorage<T>(key: string, initialValue: T) {
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
    } catch (error) {
      // Most often QuotaExceededError on a very large document.
      console.error(error);
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
