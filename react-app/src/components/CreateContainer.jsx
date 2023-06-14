import React, { useState, useEffect, useRef } from "react";
import CreateConfirmation from "./CreateConfirmation";
import CreateForm from "./CreateForm";

/**
 * Factory component which chooses what component
 * to display, and passes the appropriate props
 * @param completed
 * @param submitting
 * @param surveyDetails
 * @param setSurveyDetails
 * @param setSubmitting
 * @param setCompleted
 * @returns {JSX.Element}
 * @constructor
 */
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

/**
 * Container which displays CreateForm and other modals
 * depending on progress through new survey submission.
 * @param onClose
 * @param createdCallback
 * @returns {JSX.Element}
 * @constructor
 */
function CreateContainer({ onClose, createdCallback }) {
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [surveyDetails, setSurveyDetails] = useState(null);
  const containerRef = useRef(null);

  // Handle window closure
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

  // Signal to parent that survey was created
  useEffect(() => {
    createdCallback(surveyDetails);
  }, [completed]);

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
