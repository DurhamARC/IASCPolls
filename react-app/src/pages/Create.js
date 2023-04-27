import React, { useState } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

const Create = () => {
  const [statement, setStatement] = useState('');
  const [endDate, setEndDate] = useState('');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleSubmit = async (data) => {
    setSubmitting(true);
    const intervalId = setInterval(() => {
      setProgress((prevProgress) => {
        const newProgress = prevProgress + 1;
        return newProgress > 100 ? 100 : newProgress;
      });
    }, 30);
    
    try {
      // simulate sending emails for 3 seconds
      await new Promise((resolve) => setTimeout(resolve, 3000));
      // simulate processing the data for 3 seconds
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setCompleted(true);
    } catch (error) {
      console.log(error);
    } finally {
      clearInterval(intervalId);
      setSubmitting(false);
    }
  };

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    setFile(uploadedFile);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const uploadedFile = event.dataTransfer.files[0];
    setFile(uploadedFile);
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    const formData = { statement, endDate }; // extract the fields you want to submit
    handleSubmit(formData); // pass the extracted data to the handleSubmit function
  };

  return (
    <div className="container">
      <NavBar />
      <div className="create">
        {submitting ? (
          <div className="progress-ring">Sending Emails...</div>
        ) : completed ? (
          <div className="tick"></div>
        ) : (
          <form onSubmit={handleFormSubmit}>
            <h1>Create</h1>
            <label htmlFor="statement">Statement:</label>
            <input
              id="statement"
              type="text"
              value={statement}
              onChange={(event) => setStatement(event.target.value)}
            />

            <label htmlFor="endDate">End Date:</label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
            
            <button type="submit">Submit</button>
          </form>
        )}

        {progress > 0 && progress < 100 && (
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        )}

        {completed && (
          <div className="next-step">
            <h1>Completed!</h1>
            <p>Confirmation of Survey</p>
            <p> Statement: {statement} </p>
            <p> End Date: {endDate} </p>
            <p> File: {file && file.name} </p>
            <button onClick={() => setCompleted(false)}>Reset</button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Create;
