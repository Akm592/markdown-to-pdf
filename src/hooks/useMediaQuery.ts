import { useCallback, useSyncExternalStore } from 'react';

// Subscribes to a CSS media query and returns whether it currently matches.
// Used to decide between the Monaco editor (desktop) and the textarea editor
// (mobile) so Monaco is not mounted on small screens at all.
//
// Implemented with useSyncExternalStore, the idiomatic way to read from an
// external source like matchMedia without synchronous setState in an effect.
function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (typeof window === 'undefined' || !window.matchMedia) return () => {};
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    [query]
  );

  const getSnapshot = () => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia(query).matches;
  };

  const getServerSnapshot = () => false;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export default useMediaQuery;
