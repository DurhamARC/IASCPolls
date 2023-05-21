import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

export default function PollForm({ uniqueId, pollId }) {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState("");
  const [optionSelected, setOptionSelected] = useState(false);

  const options = [
    { value: "1", label: "Strongly Agree" },
    { value: "2", label: "Weakly Agree" },
    { value: "3", label: "Neutral" },
    { value: "4", label: "Weakly Disagree" },
    { value: "5", label: "Strongly Disagree" },
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
          vote: parseInt(selectedOption)
        };

        axios.post('/api/vote/', data);
        navigate("/thankyou");
      } catch (error) {
        console.error('Error submitting answer:', error);
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
            className={
              "button poll--submit " +
              (optionSelected ? "button poll--submit-active" : "")
            }
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
