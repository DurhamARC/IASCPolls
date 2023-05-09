import React from 'react';

const CreateComplete = ({ statement, endDate, file, onReset }) => {
  return (
    <div className="next-step">
      <h1>Completed!</h1>
      <p>Confirmation of Survey</p>
      <p> Statement: {statement} </p>
      <p> End Date: {endDate} </p>
      <p> File: {file && file.name} </p>
      <button onClick={onReset}>Reset</button>
    </div>
  );
};

export default CreateComplete;