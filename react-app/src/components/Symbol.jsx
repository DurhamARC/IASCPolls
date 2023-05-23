import React from "react";
import axios from "axios";

export default function Symbol({
  isActive,
  surveyId,
  activeSymbol,
  inactiveSymbol,
}) {
  const setActive = () => {
    // post this to a database
    console.log(surveyId);
    axios.post("/api/survey/close/", {
      survey: surveyId
    }).then(() => {
      alert("Survey closed, all active links deleted.")
    });
  };

  const handleClick = () => {
    if (isActive) {
      if (window.confirm("Are you sure you want to close the survey? All links will be deleted.")) {
        setActive(!isActive);
      }
    }
  };

  const style = {
    color: isActive ? "blue" : "red",
    cursor: isActive ? "pointer" : "default"
  };

  return (
    <span
      className="material-symbols-outlined"
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyUp={handleClick}
      style={style}
    >
      {isActive ? activeSymbol : inactiveSymbol}
    </span>
  );
}
