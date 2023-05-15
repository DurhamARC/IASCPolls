import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import StatementForm from './CreateForm';
import Progress from './CreateProgress';
import Completed from './CreateCompleted';

const CreateContainer = () => {
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Simulate API call or any async task
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setCompleted(true);
    } catch (error) {
      console.log(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setCompleted(false);
  };

  return (
    <div className="overlay">
      <div className="create-container">
        {submitting ? (
          <Progress />
        ) : (
          <>
            {!completed && (
              <StatementForm onSubmit={handleSubmit} />
            )}
            {completed && (
              <Completed onReset={handleReset} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CreateContainer;
