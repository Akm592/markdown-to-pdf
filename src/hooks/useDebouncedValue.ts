import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Trails `value` by `delay` ms. Returns the delayed value plus a `flush` that
 * forces it to catch up immediately -- needed before an export, where reading
 * a stale copy of the document would be a correctness bug rather than just a
 * cosmetic lag.
 */
function useDebouncedValue<T>(value: T, delay: number): [T, () => void] {
  const [debounced, setDebounced] = useState(value);
  const latestRef = useRef(value);
  const timeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    latestRef.current = value;
    if (timeoutRef.current !== undefined) clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setDebounced(value), delay);
    return () => {
      if (timeoutRef.current !== undefined) clearTimeout(timeoutRef.current);
    };
  }, [value, delay]);

  const flush = useCallback(() => {
    if (timeoutRef.current !== undefined) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
    setDebounced(latestRef.current);
  }, []);

  return [debounced, flush];
}

export default useDebouncedValue;
