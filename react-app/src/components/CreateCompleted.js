import React from 'react';

const Completed = ({ onReset }) => {
  return (
    <div className="next-step">
      <h1>Completed!</h1>
      <p>Confirmation of Survey</p>
      <button onClick={onReset}>Reset</button>
    </div>
  );
};

export default Completed;
