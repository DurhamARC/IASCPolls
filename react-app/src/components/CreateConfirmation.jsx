import React from "react";

function CreateConfirmation({ surveyDetails }) {
  return (
    <div className="next-step">
      <h1>Completed!</h1>
      <div className="create--receipt">
        <p className="padding">Confirmation of Survey</p>
        {surveyDetails && (
          <div className="padding">
            <p>
              Statement:
              {surveyDetails.statement}
            </p>
            <p>
              Active:
              {surveyDetails.active ? "Yes" : "No"}
            </p>
            <p>
              End Date:
              {surveyDetails.endDate}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CreateConfirmation;
