import React from "react";

export default function Symbol({
  isActive,
  surveyId,
  activeSymbol,
  inactiveSymbol,
}) {
  const setActive = () => {
    // post this to a database
    console.log(surveyId);
  };

  const handleClick = () => {
    console.log(isActive);
    if (!isActive) {
      if (window.confirm("Are you sure you want to stop the survey?")) {
        setActive(!isActive);
      }
    } else if (
      window.confirm("Are you sure you want to open the survey again?")
    ) {
      setActive(!isActive);
    }
  };

  const style = {
    color: isActive ? "green" : "red",
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
