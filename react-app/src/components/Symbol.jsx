import React, { useContext } from "react";
import axios from "axios";
import { MessageContext } from "./MessageHandler";

export default function Symbol({
  isActive,
  surveyId,
  activeSymbol,
  inactiveSymbol,
  onChange,
}) {
  const { pushMessage } = useContext(MessageContext);
  const setActive = (active) => {
    axios
      .post("/api/survey/close/", {
        survey: surveyId,
      })
      .then((result) => {
        console.log(result.data.message);
        pushMessage(
          "All active links deleted.",
          `Survey ${surveyId} closed`,
          "info"
        );
        onChange(active);
      });
  };

  const handleClick = () => {
    if (!isActive) return;
    const close = window.confirm(
      "Are you sure you want to close the survey? All links will be deleted."
    );
    if (close) setActive(!isActive);
  };

  const style = {
    color: isActive ? "blue" : "red",
    cursor: isActive ? "pointer" : "default",
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
