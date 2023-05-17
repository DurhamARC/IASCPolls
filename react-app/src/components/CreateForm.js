import React, { useState } from 'react';

const CreateForm = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [statement, setStatement] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleTitleChange = (event) => {
    setTitle(event.target.value);
  };

  const handleStatementChange = (event) => {
    setStatement(event.target.value);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="title">Title:</label>
      <input
        id="title"
        type="text"
        value={title}
        onChange={handleTitleChange}
        placeholder="Enter your dashboard title"
      />
      <label htmlFor="statement">Statement:</label>
      <textarea
        id="statement"
        value={statement}
        onChange={handleStatementChange}
        className="create--statement"
        placeholder="Enter the statement the participants will see"
      />
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
