import React, { useContext, useState } from "react";

import { client } from "../Api";
import { MessageContext } from "./MessageHandler";

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
  const [statement, setStatement] = useState("");
  const [active, setActive] = useState(true);
  const [endDate, setEndDate] = useState(getDatePlusMonth());
  const { pushError } = useContext(MessageContext);

  const handleStatementChange = (event) => {
    setStatement(event.target.value);
  };

  const handleActiveChange = (event) => {
    setActive(event.target.value);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    const data = {
      question: statement,
      active,
      kind: "LI",
      expiry: endDate,
    };

    await client
      .post("/api/survey/create/", data)
      .then(() => {
        setSurveyDetails(event);
        setSubmitting(false);
        setCompleted(true);
      })
      .catch((err) => {
        pushError(err);
        setSubmitting(false);
      });

    if (typeof onSubmit === "function") {
      onSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Create a Survey</h1>

      <label htmlFor="statement">
        <p>Statement</p>
        <textarea
          id="statement"
          value={statement}
          onChange={handleStatementChange}
          className="create--statement"
          placeholder="Enter the statement the participants will see"
        />
      </label>

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

      <label htmlFor="endDate">
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
