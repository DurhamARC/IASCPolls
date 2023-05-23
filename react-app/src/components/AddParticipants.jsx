import React, { useState, useEffect, useRef } from "react";
import axios from "axios";


function LoadingBar() {
  return (
    <div>
      <h4>Uploading new participants...</h4>
      <div className="loading-bar" />
    </div>
  );
}

function SuccessMessage() {
  return (
    <div className="add-participants-success">
      <div className="success-icon">✓</div>
      <div className="success-text">New participants successfully added!</div>
      <button type="button">View Participants</button>
    </div>
  );
}

function AddParticipants({ onClose }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const [institution, setInstitution] = useState("");
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [filename, setFilename] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleInstitutionChange = (event) => {
    setInstitution(event.target.value);
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setFilename(selectedFile.name);
  };

  const handleFileUpload = () => {
    fileInputRef.current.click();
  };

  const handleDragEnter = (event) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragOver(false);
    const selectedFile = event.dataTransfer.files[0];
    setFile(selectedFile);
    setFilename(selectedFile.name);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!institution || !file) {
      alert("Please enter an institution and select a file.");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("institution", institution);

      await axios.post("/api/participants/upload/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setIsSuccess(true);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload participants. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="overlay">
      <div
        className={`add-participants-container ${
          isDragOver ? "drag-over" : ""
        }`}
        ref={containerRef}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragEnter}
        onDrop={handleDrop}
      >
        <h1>Add Participants</h1>
        {isSuccess ? (
          <SuccessMessage />
        ) : (
          <form onSubmit={handleSubmit} className="add-participants-form">
            <div className="add-participants-inst">
              <label htmlFor="institution">
                <input
                  type="text"
                  id="institution"
                  name="institution"
                  value={institution}
                  onChange={handleInstitutionChange}
                  className="add-participants-input"
                />
                Institution Name
              </label>
            </div>
            <div
              className={`file-drop-area ${filename ? "file-selected" : ""}`}
              role="button"
              tabIndex={0}
              onClick={handleFileUpload}
              onKeyUp={handleFileUpload}
            >
              <div className="file-drop-text">
                {filename ? (
                  <>
                    <div className="file-drop-icon">✓</div>
                    <div className="file-drop-description">{filename}</div>
                  </>
                ) : (
                  <>
                    <div className="file-drop-icon">+</div>
                    <div className="file-drop-description">
                      Drag and drop file here or click to select
                    </div>
                  </>
                )}
              </div>
              <input
                type="file"
                accept=".xlsx, .xls"
                style={{ display: "none" }}
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </div>
            {isLoading ? (
              <LoadingBar />
            ) : (
              <button
                type="submit"
                className={`button ${filename ? "upload-active" : ""}`}
              >
                {filename ? "Upload Participants File" : "Submit"}
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

export default AddParticipants;
