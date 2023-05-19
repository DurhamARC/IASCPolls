import React, { useState, useRef } from 'react';
import axios from 'axios';

const AddParticipants = ({ onClose }) => {
  const [institution, setInstitution] = useState('');
  const [file, setFile] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const handleInstitutionChange = (event) => {
    setInstitution(event.target.value);
  };

  const handleFileChange = (event) => {
    setFile(event.target.value);
  };


  const handleFileUpload = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (event) => {
    console.log(event)
    event.preventDefault();

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('institution', institution);

      await axios.post('/api/participants/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    } catch (error) {
      console.error('Error uploading file:', error);
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
            <input type="text" id="institution" name="institution" onChange={handleInstitutionChange}/><br />
            <input
              type="file"
              accept=".xlsx, .xls"
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={handleFileChange}
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
