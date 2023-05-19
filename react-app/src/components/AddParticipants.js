import React, { useState, useRef } from 'react';
import axios from 'axios';

const AddParticipants = ({ onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const file = event.target.files[0];

    setIsLoading(true);
    setIsSuccess(false);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('institution', document.getElementById('institution').value);

      await axios.post('/api/participants/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setIsSuccess(true);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsLoading(false);
    }
  };


  const LoadingBar = () => (
    <div>
      <h4>Uploading new participants...</h4>
      <div className="loading-bar" />
    </div>
  );

  const SuccessMessage = () => (
    <div className="add-participants-success">
      <div className="success-icon">✓</div>
      <div className="success-text">New participants successfully added!</div>
      <button>View Participants</button>
    </div>
  );

  return (
    <div className="overlay">
      <div className="add-participants-container">
        {isSuccess ? (
          <SuccessMessage />
        ) : (
          <form onSubmit={handleSubmit}>
            <label htmlFor="institution">Institution:</label>
            <input type="text" id="institution" name="institution" /><br />
            <input
              type="file"
              accept=".xlsx, .xls"
              style={{ display: 'none' }}
              ref={fileInputRef}
            />
            {isLoading ? (
              <LoadingBar />
            ) : (
              <button onClick={handleFileUpload} className="add-participants-upload-button">
                Upload Participants File
              </button>
            )}
            <br />
            <input type="submit" value="Submit" /><br />
          </form>
        )}
        <button onClick={onClose} className="add-participants-close-button">
          Close
        </button>
      </div>
    </div>
  );
};

export default AddParticipants;
