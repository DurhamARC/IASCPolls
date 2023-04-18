import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PollForm() {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState("");
  const [optionSelected, setOptionSelected] = useState(false);

  function handleOptionChange(event) {
    setSelectedOption(event.target.value);
    setOptionSelected(true);
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (selectedOption !== "") {
      navigate("/thankyou");
    } else {
      alert("Please select an option.");
    }
  }

  return (
    <div>
      <div className="poll--options-wrapper">
        <form onSubmit={handleSubmit}>
          <ul className="poll--options">
            <li>
              <input
                type="radio"
                className="poll--checkbox"
                id="strongly-agree"
                name="poll-option"
                value="strongly-agree"
                checked={selectedOption === "strongly-agree"}
                onChange={handleOptionChange}
              />
              <label htmlFor="strongly-agree">Strongly Agree</label>
            </li>
            <li>
              <input
                type="radio"
                className="poll--checkbox"
                id="weakly-agree"
                name="poll-option"
                value="weakly-agree"
                checked={selectedOption === "weakly-agree"}
                onChange={handleOptionChange}
              />
              <label htmlFor="weakly-agree">Weakly Agree</label>
            </li>
            <li>
              <input
                type="radio"
                className="poll--checkbox"
                id="neutral"
                name="poll-option"
                value="neutral"
                checked={selectedOption === "neutral"}
                onChange={handleOptionChange}
              />
              <label htmlFor="neutral">Neutral</label>
            </li>
            <li>
              <input
                type="radio"
                className="poll--checkbox"
                id="weakly-disagree"
                name="poll-option"
                value="weakly-disagree"
                checked={selectedOption === "weakly-disagree"}
                onChange={handleOptionChange}
              />
              <label htmlFor="weakly-disagree">Weakly Disagree</label>
            </li>
            <li>
              <input
                type="radio"
                className="poll--checkbox"
                id="strongly-disagree"
                name="poll-option"
                value="strongly-disagree"
                checked={selectedOption === "strongly-disagree"}
                onChange={handleOptionChange}
              />
              <label htmlFor="strongly-disagree">Strongly Disagree</label>
            </li>
          </ul>
        </form>
      </div>
      <button type="submit" className={"button poll--submit " + (optionSelected ? "button poll--submit-active" : "")}>
            Submit
          </button>
    </div>
  );
}
