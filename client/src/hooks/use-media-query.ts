import { useState, useEffect } from 'react';

/**
 * Hook that returns a boolean depending on if the window matches the media query
 * @param query Media query string
 * @returns Boolean indicating if the query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    // Create media query list
    const mediaQuery = window.matchMedia(query);
    
    // Set the initial state
    setMatches(mediaQuery.matches);
    
    // Define handler for query changes
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };
    
    // Add event listener
    mediaQuery.addEventListener('change', handler);
    
    // Clean up
    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }, [query]);
  
  return matches;
}