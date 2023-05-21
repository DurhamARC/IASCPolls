import React, { useState, useEffect, useRef } from 'react';

const CreateContainer = ({ onClose }) => {
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [surveyDetails, setSurveyDetails] = useState(null);
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

  const handleSubmit = (surveyData) => {
    setSubmitting(true);

    // Simulate a delay for loading
    setTimeout(() => {
      setSurveyDetails(surveyData);
      setSubmitting(false);
      setCompleted(true);
    }, 1500);
  };

  const handleReset = () => {
    setCompleted(false);
    setSurveyDetails(null);
  };

  const Progress = () => {
    return (
      <div>
        <p className="padding">Creating survey unique links...</p>
        <div className="loading-bar" />
      </div>
    );
  };

  const CreateForm = () => {
    const [statement, setStatement] = useState('');
    const [active, setActive] = useState(false);
    const [endDate, setEndDate] = useState('');

    const handleStatementChange = (event) => {
      setStatement(event.target.value);
    };

    const handleActiveChange = (event) => {
      setActive(event.target.checked);
    };

    const handleEndDateChange = (event) => {
      setEndDate(event.target.value);
    };

    const handleSubmitForm = (event) => {
      event.preventDefault();

      const data = {
        statement: statement,
        active: active,
        endDate: endDate
      };

      handleSubmit(data);
    };

    return (
      <form onSubmit={handleSubmitForm}>
        <h1>Create a Survey</h1>
        <label htmlFor="statement">
          <h3>Statement</h3>
        </label>
        <textarea
          id="statement"
          value={statement}
          onChange={handleStatementChange}
          className="create--statement"
          placeholder="Enter the statement the participants will see"
        />
        <div className="checkbox">
          <label htmlFor="active">
            <h3>Active</h3>
          </label>
          <div className="create--checkbox">
            <label>
              <input
                type="checkbox"
                checked={active}
                onChange={handleActiveChange}
              />
              Yes
            </label>
            <label>
              <input
                type="checkbox"
                checked={!active}
                onChange={handleActiveChange}
              />
              No
            </label>
          </div>
        </div>
        <label htmlFor="endDate">
          <h3>End Date</h3>
        </label>
        <input
          id="endDate"
          type="date"
          value={endDate}
          onChange={handleEndDateChange}
        />
        <button type="submit">Submit</button>
      </form>
    );
  };

  return (
    <div className="overlay">
      <div className="create-container" ref={containerRef}>
        {!completed ? (
          submitting ? (
            <Progress />
          ) : (
            <CreateForm />
          )
        ) : (
          <div className="next-step">
            <h1>Completed!</h1>
            <div className="create--receipt">
            <p className="padding">Confirmation of Survey</p>
            {surveyDetails && (
              <div className="padding">
                <p>Statement: {surveyDetails.statement}</p>
                <p>Active: {surveyDetails.active ? 'Yes' : 'No'}</p>
                <p>End Date: {surveyDetails.endDate}</p>
              </div>
            )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateContainer;
