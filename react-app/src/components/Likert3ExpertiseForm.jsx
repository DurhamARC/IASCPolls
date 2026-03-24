import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { client } from "../Api";
import { MessageContext } from "./MessageHandler";

const LIKERT_OPTIONS = [
  { value: "5", label: "Strongly Disagree" },
  { value: "4", label: "Disagree" },
  { value: "3", label: "Neutral" },
  { value: "2", label: "Agree" },
  { value: "1", label: "Strongly Agree" },
];

function LikertRow({ index, statement, selected, onChange }) {
  return (
    <div className="l3c--row">
      <div className="l3c--statement">{statement}</div>
      <ul className="poll--options">
        {LIKERT_OPTIONS.map((option) => (
          <li key={option.value}>
            <input
              type="radio"
              className="poll--checkbox"
              id={`q${index}-option-${option.value}`}
              name={`q${index}`}
              value={option.value}
              checked={selected === option.value}
              onChange={() => onChange(option.value)}
            />
            <label htmlFor={`q${index}-option-${option.value}`}>
              {option.label}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Likert3ExpertiseForm({ uniqueId, questions }) {
  const navigate = useNavigate();
  const { pushError } = useContext(MessageContext);

  const [answers, setAnswers] = useState({ 0: "", 1: "", 2: "" });
  const [expertise, setExpertise] = useState(false);

  const allAnswered = Object.values(answers).every((v) => v !== "");

  function handleAnswerChange(index, value) {
    setAnswers((prev) => ({ ...prev, [index]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!allAnswered) {
      alert("Please respond to all statements before submitting.");
      return;
    }

    const vote = {
      0: parseInt(answers[0], 10),
      1: parseInt(answers[1], 10),
      2: parseInt(answers[2], 10),
      expertise,
    };

    await client
      .post("/api/vote/", { unique_id: uniqueId, vote: JSON.stringify(vote) })
      .then(() => {
        navigate("/thankyou");
      })
      .catch((error) => {
        pushError(error);
      });
  }

  const statements =
    questions && questions.length === 3
      ? questions
      : ["Statement 1", "Statement 2", "Statement 3"];

  return (
    <div className="poll--options-wrapper">
      <form onSubmit={handleSubmit}>
        {[0, 1, 2].map((i) => (
          <LikertRow
            key={i}
            index={i}
            statement={statements[i]}
            selected={answers[i]}
            onChange={(val) => handleAnswerChange(i, val)}
          />
        ))}

        <div className="l3c--expertise">
          <label htmlFor="expertise-checkbox">
            <input
              type="checkbox"
              id="expertise-checkbox"
              className="poll--checkbox"
              checked={expertise}
              onChange={(e) => setExpertise(e.target.checked)}
            />
            I have relevant expertise
          </label>
        </div>

        <button
          type="submit"
          className={`button poll--submit ${
            allAnswered ? "button poll--submit-active" : ""
          }`}
        >
          Submit
        </button>
      </form>
    </div>
  );
}
