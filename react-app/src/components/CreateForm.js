import React from 'react';

const CreateForm = ({ statement, endDate, file, onStatementChange, onEndDateChange, onFileChange, onSubmit }) => {
  return (
    <form onSubmit={onSubmit}>
      <label htmlFor="title">Title:</label>
      <input
        id="title"
        type="text"
        placeholder="Enter your dashboard title"
      />
      <label htmlFor="statement">Statement:</label>
      <textarea
        id="statement"
        value={statement}
        onChange={onStatementChange}
        className="create--statement"
        placeholder="Enter the statement the participants will see"
        style={{
          width: '100%',
          height: '100px',
          resize: 'none',
          padding: '10px',
          boxSizing: 'border-box',
          fontSize: '1.5rem'
        }}
      />
      <label htmlFor="endDate">Select End Date:</label>
      <input
        id="endDate"
        type="date"
        value={endDate}
        onChange={onEndDateChange}
      />
      <label htmlFor="file">Upload File:</label>
      <input
        id="file"
        type="file"
        onChange={onFileChange}
      />
      <button type="submit">Submit</button>
    </form>
  );
};

export default CreateForm;
