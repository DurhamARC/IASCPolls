import React from "react";
import { useNavigate } from "react-router-dom";

export default function ReturnNotice() {
  const navigate = useNavigate();

  return (
    <div
      className="alert--linkable alert--block alert--info alert"
      role="button"
      tabIndex={0}
      onClick={() => {
        navigate(-1);
      }}
      onKeyUp={() => {
        navigate(-1);
      }}
    >
      <div className="alert--symbol">
        <span className="material-symbols-outlined">arrow_back</span>
      </div>
      <div className="alert--body">
        <h4 className="alert--title">Return to Poll?</h4>
        <span className="alert--message">
          It looks like you were responding to a survey. <br />
          Click here to return and respond to the statement.
        </span>
      </div>
    </div>
  );
}
