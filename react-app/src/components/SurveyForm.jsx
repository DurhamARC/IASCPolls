import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { client } from "../Api";
import { MessageContext } from "./MessageHandler";
import definitions from "../surveyDefinitions";

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

function CheckboxRow({ index, label, checked, onChange }) {
  return (
    <div className="l3c--expertise">
      <label htmlFor={`checkbox-${index}`}>
        <input
          type="checkbox"
          id={`checkbox-${index}`}
          className="poll--checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        {label}
      </label>
    </div>
  );
}

const QUESTION_RENDERERS = {
  likert: LikertRow,
  checkbox: CheckboxRow,
};

export default function PollForm({ uniqueId, kind, questions }) {
  const navigate = useNavigate();
  const { pushError } = useContext(MessageContext);

  const definition = definitions[kind] ?? definitions.LI;
  const slots = definition.questions;

  // Build initial state: likert slots get "" (unselected), checkbox slots get false
  const initialAnswers = Object.fromEntries(
    slots.map((slot, i) => [i, slot.type === "checkbox" ? false : ""])
  );
  const [answers, setAnswers] = useState(initialAnswers);

  const likertIndices = slots
    .map((slot, i) => (slot.type === "likert" ? i : null))
    .filter((i) => i !== null);
  const allLikertAnswered = likertIndices.every((i) => answers[i] !== "");

  // Map each slot to its display text: all slots pull from the DB questions array
  const statements = slots.map((slot, i) => {
    if (questions && questions[i] != null) {
      return questions[i];
    }
    return slot.placeholder ?? slot.label ?? "";
  });

  async function handleSubmit(event) {
    event.preventDefault();
    if (!allLikertAnswered) {
      alert("Please respond to all statements before submitting.");
      return;
    }

    let vote;
    if (slots.length === 1 && slots[0].type === "likert") {
      // Single-question (LI): submit as a plain integer for backward compatibility
      vote = parseInt(answers[0], 10);
    } else {
      // Multi-question: dict with numeric string keys for likert, "expertise" for checkbox
      vote = {};
      let likertIdx = 0;
      slots.forEach((slot, i) => {
        if (slot.type === "likert") {
          vote[String(likertIdx)] = parseInt(answers[i], 10);
          likertIdx += 1;
        } else if (slot.type === "checkbox") {
          vote.expertise = answers[i];
        }
      });
    }

    await client
      .post("/api/vote/", {
        unique_id: uniqueId,
        vote: typeof vote === "object" ? JSON.stringify(vote) : vote,
      })
      .then(() => {
        navigate("/thankyou");
      })
      .catch((error) => {
        pushError(error);
      });
  }

  return (
    <div className="poll--options-wrapper">
      <form onSubmit={handleSubmit}>
        {slots.map((slot) => {
          const slotKey = slot.id;
          const i = slots.indexOf(slot);
          const Renderer = QUESTION_RENDERERS[slot.type];
          if (!Renderer) return null;
          if (slot.type === "likert") {
            return (
              <Renderer
                key={slotKey}
                index={i}
                statement={statements[i]}
                selected={answers[i]}
                onChange={(val) =>
                  setAnswers((prev) => ({ ...prev, [i]: val }))
                }
              />
            );
          }
          return (
            <Renderer
              key={slotKey}
              index={i}
              label={statements[i]}
              checked={answers[i]}
              onChange={(val) => setAnswers((prev) => ({ ...prev, [i]: val }))}
            />
          );
        })}

        <button
          type="submit"
          className={`button poll--submit ${
            allLikertAnswered ? "button poll--submit-active" : ""
          }`}
        >
          Submit
        </button>
      </form>
    </div>
  );
}
