import { useState, useEffect } from 'react';

/**
 * Hook pro sledování pozice myši na stránce
 * @returns {object} Objekt s x, y souřadnicemi myši
 */
export const useMousePosition = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateMousePosition = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', updateMousePosition);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
    };
  }, []);


  return mousePosition;
};
