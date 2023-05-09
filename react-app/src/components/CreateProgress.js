import React from 'react';

const Progress = ({ progress }) => {
  return (
    <div className="progress-bar" style={{ width: `${progress}%` }} />
  );
};

export default Progress;
