import { useEffect, RefObject } from 'react';

const useClickOutside = (
  ref: RefObject<HTMLElement>,
  handler: () => void,
  excludeRefs: RefObject<HTMLElement>[] = []
) => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      
      // Check if click was outside the main ref
      if (!ref.current?.contains(target)) {
        // Check if click was inside any excluded refs
        const clickedExcluded = excludeRefs.some(
          excludeRef => excludeRef.current?.contains(target)
        );
        
        if (!clickedExcluded) {
          handler();
        }
      }
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler, excludeRefs]);
};

export default useClickOutside;