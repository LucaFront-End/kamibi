import React from 'react';
import { useMagnetic } from '../../hooks/useMagnetic';
import './MagneticButton.css';

export const MagneticButton = ({
  children,
  onClick,
  className = '',
  type = 'button',
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'text'
  ...props
}) => {
  const magneticRef = useMagnetic(0.3);

  return (
    <button
      ref={magneticRef}
      type={type}
      onClick={onClick}
      className={`magnetic-button btn-${variant} ${className}`}
      {...props}
    >
      <span className="btn-content">{children}</span>
      <span className="btn-glow-effect"></span>
    </button>
  );
};
