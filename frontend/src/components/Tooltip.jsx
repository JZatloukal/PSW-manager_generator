import React, { useState } from 'react';
import styles from './Tooltip.module.css';

const Tooltip = ({ children, content, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className={styles.tooltipContainer}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={`${styles.tooltipBox} ${styles[position]}`}>
          {content}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
