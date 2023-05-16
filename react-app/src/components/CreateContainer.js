// CreateContainer.js
import React, { useState, useEffect, useRef } from 'react';
import StatementForm from './CreateForm';

const CreateContainer = ({ onClose }) => {
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Simulate API call or any async task
      await new Promise((resolve) => setTimeout(resolve, 1500));
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

  const Progress = () => {
    return (
    <div>
      <h4>Creating survery unique links...</h4>
      <div className="loading-bar" />
    </div>
    );
  };

  const Completed = () => {
    return (
      <div className="next-step">
        <h1>Completed!</h1>
        <p>Confirmation of Survey</p>
        <button onClick={handleReset}>Reset</button>
      </div>
    );
  };

  return (
    <div className="overlay">
      <div className="create-container" ref={containerRef}>
        {submitting ? (
          <Progress />
        ) : (
          <>
            {!completed && (
              <StatementForm onSubmit={handleSubmit} />
            )}
            {completed && (
              <Completed />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CreateContainer;
