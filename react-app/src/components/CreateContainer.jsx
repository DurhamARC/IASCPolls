import React, { useState, useEffect, useRef } from "react";
import CreateConfirmation from "./CreateConfirmation";
import CreateForm from "./CreateForm";

function Submitting({
  submitting,
  setSurveyDetails,
  setSubmitting,
  setCompleted,
}) {
  return submitting ? (
    <Progress />
  ) : (
    <CreateForm
      // onSubmit={}
      setSurveyDetails={setSurveyDetails}
      setSubmitting={setSubmitting}
      setCompleted={setCompleted}
    />
  );
}

function Progress() {
  return (
    <div>
      <p className="padding">Creating survey unique links...</p>
      <div className="loading-bar" />
    </div>
  );
}

function CreateContainer({ onClose }) {
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [surveyDetails, setSurveyDetails] = useState(null);
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

  return (
    <div className="overlay">
      <div className="create-container" ref={containerRef}>
        {!completed ? (
          <Submitting
            submitting={submitting}
            setSurveyDetails={setSurveyDetails}
            setSubmitting={setSubmitting}
            setCompleted={setCompleted}
          />
        ) : (
          <CreateConfirmation surveyDetails={surveyDetails} />
        )}
      </div>
    </div>
  );
}

export default CreateContainer;
