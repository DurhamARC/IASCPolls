import React, { useState, useRef } from 'react';

const AddParticipants = ({ onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = () => {
    fileInputRef.current.click();
  };

  const handleSelectedFile = (event) => {
    const file = event.target.files[0];

    setIsLoading(true);
    setIsUploaded(false);

    // Simulating file upload progress
    setTimeout(() => {
      setIsLoading(false);

      // Simulating success message
      setTimeout(() => {
        setIsUploaded(true);
      }, 1000);
    }, 2000);
  };

  const Progress = () => {
    return (
    <div>
      <h4>Uploading new participants...</h4>
      <div className="loading-bar" />
    </div>
    );
  };

  const SuccessMessage = () => {
    return (
      <div className="add-participants-success">
        <div className="success-icon">✓</div>
        <div className="success-text">New participants successfully added!</div>
        <button>View Participants</button>
      </div>
    );
  };

  return (
    <div className="overlay">
      <div className="add-participants-container">
        {!isUploaded ? (
          <>
            <input
              type="file"
              accept=".xlsx, .xls"
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={handleSelectedFile}
            />
            <button onClick={handleFileUpload} className="add-participants-upload-button">
              {isLoading ? <div className="loading-bar" /> : 'Upload Participants File'}
            </button>
            {isLoading && <Progress />}
          </>
        ) : (
          <SuccessMessage />
        )}
        <button onClick={onClose} className="add-participants-close-button">Close</button>
      </div>
    </div>
  );
};

export default AddParticipants;
