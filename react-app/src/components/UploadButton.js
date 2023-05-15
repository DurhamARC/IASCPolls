import React, { useState, useRef } from 'react';

const UploadButton = () => {
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
    // Perform the file upload logic here
    // You can use libraries like react-dropzone or handle the file using JavaScript's FileReader API
    // Once the upload is complete, you can set the isUploaded state to true and hide the loading screen
    setTimeout(() => {
      setIsLoading(false);
      setIsUploaded(true);
    }, 2000);
  };

  return (
    <div>
      <input
        type="file"
        accept=".xlsx, .xls, .csv"
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={handleSelectedFile}
      />
      <button onClick={handleFileUpload} className="button dashboard--button">
        {isLoading ? (
          <div className="loading-bar" />
        ) : null}
        {isUploaded ? (
          <div>
          <div>
              <span className="material-symbols-outlined">check</span>
          </div>
          <div>File uploaded!</div>
            </div>
        ) : (
            <div>
                <div>
                    <span className="material-symbols-outlined">contact_page</span>
                </div>
                <div>Add Participants</div>
          </div>
        )}
      </button>
    </div>
  );
};

export default UploadButton;
