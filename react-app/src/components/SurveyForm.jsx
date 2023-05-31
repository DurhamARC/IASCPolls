import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { MessageContext } from "./MessageHandler";

export default function PollForm({ uniqueId }) {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState("");
  const [optionSelected, setOptionSelected] = useState(false);
  const { pushError } = useContext(MessageContext);

  const options = [
    { value: "5", label: "Strongly Disagree" },
    { value: "4", label: "Weakly Disagree" },
    { value: "3", label: "Neutral" },
    { value: "2", label: "Weakly Agree" },
    { value: "1", label: "Strongly Agree" },
  ];

  function handleOptionChange(event) {
    setSelectedOption(event.target.value);
    setOptionSelected(true);
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (selectedOption !== "") {
      try {
        const data = {
          unique_id: uniqueId,
          vote: parseInt(selectedOption, 10),
        };

        axios.post("/api/vote/", data).then(() => {
          navigate("/thankyou");
        });
      } catch (error) {
        console.error("Error submitting answer:", error);
        pushError(error);
      }
    } else {
      alert("Please select an option.");
    }
  }

  return (
    <div>
      <div className="poll--options-wrapper">
        <form onSubmit={handleSubmit}>
          <ul className="poll--options">
            {options.map((option) => (
              <li key={option.value}>
                <input
                  type="radio"
                  className="poll--checkbox"
                  id={`option-${option.value}`}
                  name="poll-option"
                  value={option.value}
                  checked={selectedOption === option.value}
                  onChange={handleOptionChange}
                />
                <label htmlFor={`option-${option.value}`}>{option.label}</label>
              </li>
            ))}
          </ul>
          <button
            type="submit"
            className={`button poll--submit ${
              optionSelected ? "button poll--submit-active" : ""
            }`}
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
