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

      await axios.post('/api/survey/create', data);
      onSubmit();
    } catch (error) {
      console.error('Error creating survey:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="statement">Statement:</label>
      <textarea
        id="statement"
        value={statement}
        onChange={handleStatementChange}
        className="create--statement"
        placeholder="Enter the statement the participants will see"
      />
      <div className="checkbox">
        <input type="checkbox" id="active" name="active" checked={active} onChange={handleActiveChange} />
        <label htmlFor="active">Active</label> 
      </div>
      <label htmlFor="endDate">Select End Date:</label>
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
