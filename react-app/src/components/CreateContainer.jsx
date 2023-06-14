import React, { useState, useEffect, useRef } from "react";
import CreateConfirmation from "./CreateConfirmation";
import CreateForm from "./CreateForm";

/* Choose what component to display */
function DisplayComponent({
  completed,
  submitting,
  surveyDetails,
  setSurveyDetails,
  setSubmitting,
  setCompleted,
}) {
  if (completed) return <CreateConfirmation surveyDetails={surveyDetails} />;

  if (submitting)
    return (
      <div>
        <p className="padding">Creating survey unique links...</p>
        <div className="loading-bar" />
      </div>
    );

  return (
    <CreateForm
      // onSubmit={}
      setSurveyDetails={setSurveyDetails}
      setSubmitting={setSubmitting}
      setCompleted={setCompleted}
    />
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
        <DisplayComponent
          completed={completed}
          submitting={submitting}
          surveyDetails={surveyDetails}
          setSurveyDetails={setSurveyDetails}
          setSubmitting={setSubmitting}
          setCompleted={setCompleted}
        />
      </div>
    </div>
  );
}

export default CreateContainer;
