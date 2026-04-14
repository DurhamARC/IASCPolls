import React, { useContext, useEffect, useState } from "react";

import { client } from "../Api";
import { MessageContext } from "./MessageHandler";
import { Institution } from "./Institution";
import { useSurveyDefinitions } from "./SurveyDefinitionsContext";

function getDatePlusMonth() {
  const date = new Date();
  const tzoffset = new Date().getTimezoneOffset() * 60000; // make timezone aware
  date.setHours(23, 59, 0, 0);
  date.setMonth(date.getMonth() + 1);
  return new Date(date - tzoffset).toISOString().slice(0, -1);
}

function CreateForm({
  onSubmit,
  setSurveyDetails,
  setSubmitting,
  setCompleted,
}) {
  const definitions = useSurveyDefinitions();
  const [kind, setKind] = useState("");
  const [statement, setStatement] = useState("");
  const [title, setTitle] = useState("");
  // Per-kind statement arrays, grown as definitions arrive
  const [questionsByKind, setQuestionsByKind] = useState({});
  const [active, setActive] = useState(true);
  const [hideTitle, setHideTitle] = useState(true);
  const [endDate, setEndDate] = useState(getDatePlusMonth());
  const [displayInst, setDisplayInst] = useState(false);
  const [institution, setInstitution] = useState(null);
  const { pushError } = useContext(MessageContext);

  // Populate kind and per-kind question arrays once definitions load.
  // Also extends questionsByKind if new slugs appear (e.g. after template creation).
  useEffect(() => {
    const slugs = Object.keys(definitions);
    if (slugs.length === 0) return;
    setKind((prev) => prev || slugs[0]);
    setQuestionsByKind((prev) => {
      const next = { ...prev };
      slugs.forEach((k) => {
        if (!next[k]) next[k] = Array(definitions[k].questions.length).fill("");
      });
      return next;
    });
  }, [definitions]);

  const slots = definitions[kind]?.questions ?? [];
  const multi = slots.length > 1;

  const handleQuestionChange = (index, value) => {
    setQuestionsByKind((prev) => {
      const updated = [...prev[kind]];
      updated[index] = value;
      return { ...prev, [kind]: updated };
    });
  };

  const handleActiveChange = (event) => {
    setActive(event.target.value);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };

  const showInstitution = (event) => {
    setDisplayInst(event.target.checked);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    const data = {
      question: multi ? title : statement,
      active,
      kind,
      expiry: endDate,
      hide_title: multi ? hideTitle : false,
    };

    if (multi) {
      data.questions = JSON.stringify(questionsByKind[kind]);
    }

    // If an institution is selected, append it to the data
    if (displayInst && institution !== null && institution !== "") {
      data.institution = institution.value;
    }

    // Make server API request
    await client
      .post("/api/survey/create/", data)
      .then(() => {
        setSurveyDetails({
          ...data,
          institution: institution ? institution.label : null,
        });
        setSubmitting(false);
        setCompleted(true);

        if (typeof onSubmit === "function") {
          onSubmit();
        }
      })
      .catch((err) => {
        pushError(err);
        setSubmitting(false);
      });
  };

  // Don't render until definitions have loaded
  if (!kind) return null;

  return (
    <form onSubmit={handleSubmit}>
      <h1>Create a Survey</h1>

      <label htmlFor="kind">
        <p>Template</p>
        <select
          id="kind"
          value={kind}
          onChange={(e) => setKind(e.target.value)}
          className="create--select"
        >
          {Object.entries(definitions).map(([value, def]) => (
            <option key={value} value={value}>
              {def.label}
            </option>
          ))}
        </select>
      </label>

      {!multi && (
        <label htmlFor="statement">
          <p>Statement</p>
          <textarea
            id="statement"
            rows={1}
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
            className="create--statement"
            placeholder={slots[0]?.placeholder ?? ""}
          />
        </label>
      )}

      {multi && (
        <div>
          <label htmlFor="title">
            <p>Title</p>
            <textarea
              id="title"
              rows={1}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="create--statement"
              placeholder="Enter a title for this survey"
            />
          </label>
          <div className="checkbox">
            <label htmlFor="hide_title">
              Hide title from participants? &nbsp;
              <input
                type="checkbox"
                name="hide_title"
                id="hide_title"
                checked={hideTitle}
                onChange={(e) => setHideTitle(e.target.checked)}
              />
            </label>
          </div>
          <div className="create--statements">
            <p>Statements</p>
            {slots.map((slot, i) => {
              const likertIndex =
                slots.slice(0, i).filter((s) => s.type === "likert").length + 1;
              const slotLabel =
                slot.type === "checkbox"
                  ? "Checkbox statement"
                  : `Statement ${likertIndex}`;
              return (
                <div key={`statement-${i + 1}`} className="create--slot">
                  <label
                    className="create--slot-label"
                    htmlFor={`statement-${i + 1}`}
                  >
                    {slotLabel} ({slot.type})
                  </label>
                  <textarea
                    id={`statement-${i + 1}`}
                    rows={1}
                    value={questionsByKind[kind][i]}
                    onChange={(e) => handleQuestionChange(i, e.target.value)}
                    className="create--statement"
                    placeholder={slot.placeholder}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="checkbox">
        <p>Active</p>
        <div className="create--checkbox">
          <label htmlFor="check_yes">
            <input
              type="radio"
              name="active"
              id="check_yes"
              value="true"
              onChange={handleActiveChange}
              defaultChecked
            />
            Yes
          </label>
          <label htmlFor="check_no">
            <input
              type="radio"
              name="active"
              id="check_no"
              value="false"
              onChange={handleActiveChange}
            />
            No
          </label>
        </div>
      </div>

      <div className="checkbox">
        <label htmlFor="set_institution">
          Specify Institution? &nbsp;
          <input
            type="checkbox"
            name="set_institution"
            id="set_institution"
            checked={displayInst}
            onChange={showInstitution}
          />
        </label>

        {displayInst && (
          <div>
            <Institution onChangeInstitution={setInstitution} hideTitle />
          </div>
        )}
      </div>

      <label htmlFor="endDate" className="checkbox">
        <p>End Date</p>
        <input
          id="endDate"
          type="datetime-local"
          value={endDate}
          onChange={handleEndDateChange}
        />
      </label>

      <button type="submit">Submit</button>
    </form>
  );
}

export default CreateForm;
