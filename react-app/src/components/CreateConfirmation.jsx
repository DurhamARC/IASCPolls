import React from "react";

function CreateConfirmation({ surveyDetails }) {
  return (
    <div className="next-step">
      <h1>Completed!</h1>
      <div className="create--receipt">
        {surveyDetails && (
          <dl className="">
            <dt>Statement:</dt>
            <dd>{surveyDetails.question}</dd>
            <dt>Active:</dt>
            <dd>{surveyDetails.active ? "Yes" : "No"}</dd>
            <dt>End Date:</dt>
            <dd>{surveyDetails.expiry}</dd>
            <dt>Institution:</dt>
            {"institution" in surveyDetails ? (
              <dd>{surveyDetails.institution}</dd>
            ) : (
              <dd>All Institutions</dd>
            )}
          </dl>
        )}
      </div>
    </div>
  );
}

export default CreateConfirmation;
