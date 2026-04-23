import { useState, useEffect } from 'react';

/**
 * Returns true when the viewport width is at or below the given breakpoint.
 * Updates reactively on window resize.
 */
export function useIsMobile(breakpoint = 767) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= breakpoint);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [breakpoint]);

  return isMobile;
}
