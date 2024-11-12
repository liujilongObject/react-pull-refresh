import React from 'react';
import './style.scss';

const LoadingSpinner = ({ size = 20, color = '#4caf50' }) => (
  <div 
    className="loading-spinner"
    style={{ 
      width: `${size}px`, 
      height: `${size}px`,
      borderColor: color,
      borderTopColor: 'transparent' 
    }}
  />
);

export default LoadingSpinner; 