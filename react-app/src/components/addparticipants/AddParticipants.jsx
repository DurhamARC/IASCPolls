import React, { useState, useEffect, useRef, useContext } from "react";
import { client } from "../../Api";
import { MessageContext } from "../MessageHandler";
import { Institution } from "../Institution";

/**
 * Display loading bar while participants file uploading
 * @returns {JSX.Element}
 * @constructor
 */
function LoadingBar() {
  return (
    <div>
      <h4>Uploading new participants...</h4>
      <div className="loading-bar" />
    </div>
  );
}

/**
 * Display success message
 * @returns {JSX.Element}
 * @constructor
 */
function SuccessMessage() {
  return (
    <div className="add-participants-success">
      <div className="success-icon">✓</div>
      <div className="success-text">New participants successfully added!</div>
      <button type="button">View Participants</button>
    </div>
  );
}

/**
 * AddParticipants component renders the form to upload
 * participant Excel files to the server
 * @param onClose
 * @returns {JSX.Element}
 * @constructor
 */
function AddParticipants({ onClose }) {
  const { pushError } = useContext(MessageContext);

  const containerRef = useRef(null);
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [institution, setInstitution] = useState();
  const [ignoreConflicts, setIgnoreConflicts] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [filename, setFilename] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  /**
   * On container load, useEffect React handler runs
   */
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

  const handleIgnoreConflicts = (event) => {
    setIgnoreConflicts(event.target.value);
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
      pushError("Please enter an institution and select a file.");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("ignore_conflicts", ignoreConflicts);
      formData.append("institution", institution.label);

      await client.post("/api/participants/upload/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setIsSuccess(true);
    } catch (error) {
      console.error("Error uploading file:", error);
      pushError(error, "Failed to upload participants. Please try again.");
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
              <Institution
                createable
                className="add-participants-input"
                onChangeInstitution={setInstitution}
              />
            </div>

            <div className="ignore-conflicts">
              <p>Ignore Conflicts</p>

              <div className="ignore-conflicts-field">
                <label htmlFor="ignore-conflicts">
                  True
                  <input
                    type="radio"
                    id="ignore-conflicts-true"
                    className="poll--checkbox create--checkbox"
                    name="ignore_conflicts"
                    value="true"
                    onChange={handleIgnoreConflicts}
                  />
                </label>
              </div>

              <div className="ignore-conflicts-field">
                <label htmlFor="ignore-conflicts">
                  False
                  <input
                    type="radio"
                    id="ignore-conflicts-false"
                    className="poll--checkbox create--checkbox"
                    name="ignore_conflicts"
                    value="false"
                    onChange={handleIgnoreConflicts}
                    defaultChecked
                  />
                </label>
              </div>
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
                accept=".xlsx"
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
