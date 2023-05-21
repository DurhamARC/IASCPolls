import React, { useState } from 'react';
import axios from 'axios';

const CreateForm = ({ onSubmit }) => {
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const data = {
        question: statement,
        active: active,
        kind: 'LI',
        expiry: endDate
      };

      await axios.post('/api/survey/create/', data);
      onSubmit();
    } catch (error) {
      console.error('Error creating survey:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Create a Survey</h1>
      <label htmlFor="statement"><h3>Statement</h3></label>
      <textarea
        id="statement"
        value={statement}
        onChange={handleStatementChange}
        className="create--statement"
        placeholder="Enter the statement the participants will see"
      />
      <div className="checkbox">
        <label htmlFor="active"><h3>Active</h3></label>
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
      <label htmlFor="endDate"><h3>End Date</h3></label>
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

export default CreateForm;
