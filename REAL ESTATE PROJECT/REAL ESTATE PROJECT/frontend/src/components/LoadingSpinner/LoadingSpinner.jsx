import React from 'react';
import './LoadingSpinner.css';

export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="spinner-wrapper">
      <div className="spinner-circle"></div>
      <p className="spinner-text">{message}</p>
    </div>
  );
}
