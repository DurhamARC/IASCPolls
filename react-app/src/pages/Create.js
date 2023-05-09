import React, { useState } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import StatementForm from '../components/CreateForm';
import Progress from '../components/CreateProgress';
import Completed from '../components/CreateCompleted';

const Create = () => {
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
    }, 10);

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
    const formData = { ...event.target.elements };
    handleSubmit(formData);
  };

  const handleReset = () => {
    setCompleted(false);
    setProgress(0);
    setFile(null);
  };

  return (
    <div className="container">
      <NavBar />
      <div className="create">
        {submitting && <Progress value={progress} />}
        {completed ? (
          <Completed
            statement={file && file.name}
            endDate={file && file.lastModifiedDate.toDateString()}
            onReset={handleReset}
          />
        ) : (
          <StatementForm
            onFormSubmit={handleFormSubmit}
            onFileUpload={handleFileUpload}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          />
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Create;
