import React, { useEffect, useState } from 'react';
import { useMousePosition } from '../hooks/useMousePosition';
import styles from './InteractiveParticles.module.css';

/**
 * Komponenta pro jednoduché interaktivní efekty:
 * 1. Plovoucí částice s plynulým pohybem
 * 2. Cursor trail (stopa za myší)
 */
const InteractiveParticles = () => {
  const mousePosition = useMousePosition();
  const [trailParticles, setTrailParticles] = useState([]);
  
  // Pevné pozice pro částice s různými animačními delay (generované jen jednou)
  const [fixedPositions] = useState(() => 
    [...Array(50)].map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      animationDelay: Math.random() * 20, // 0-20 sekund delay
      animationDuration: 15 + Math.random() * 10 // 15-25 sekund délka animace
    }))
  );

  // Vytvoření trail částic za myší (jemnější)
  useEffect(() => {
    if (mousePosition.x > 0 && mousePosition.y > 0) {
      const newTrailParticle = {
        id: Date.now() + Math.random(),
        x: mousePosition.x,
        y: mousePosition.y,
        life: 0.2 // Začínáme s menší průhledností
      };

      setTrailParticles(prev => [...prev.slice(-5), newTrailParticle]); // Max 5 částic
    }
  }, [mousePosition]);

  // Animace trail částic (postupné mizení)
  useEffect(() => {
    const interval = setInterval(() => {
      setTrailParticles(prev => 
        prev.map(particle => ({
          ...particle,
          life: particle.life - 0.08 // Rychlejší mizení
        })).filter(particle => particle.life > 0)
      );
    }, 80); // Pomalejší interval

    return () => clearInterval(interval);
  }, []);

  // Hover efekt odstraněn

  return (
    <div className={styles.particlesContainer}>
      {/* Plovoucí částice s pohybem */}
      {fixedPositions.map((position, index) => (
        <div
          key={`particle-${index}`}
          className={styles.particle}
          style={{
            left: `${position.left}%`,
            top: `${position.top}%`,
            animationDelay: `${position.animationDelay}s`,
            animationDuration: `${position.animationDuration}s`
          }}
        />
      ))}

      {/* Cursor trail částice */}
      {trailParticles.map(particle => (
        <div
          key={particle.id}
          className={styles.trailParticle}
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            opacity: particle.life,
            transform: `scale(${particle.life})`
          }}
        />
      ))}
    </div>
  );
};

export default InteractiveParticles;
