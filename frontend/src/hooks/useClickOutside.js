import { useEffect, useRef } from 'react';

export default function useClickOutside(onOutsideClick) {
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        onOutsideClick();
      }
    }

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onOutsideClick]);

  return ref;
}
