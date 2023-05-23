import React, { useState } from "react";
import axios from "axios";

function getDatePlusMonth() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setMonth(date.getMonth() + 1);
  console.log(date.toISOString().substring(0, 10));
  return date.toISOString().substring(0, 10);
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

  const handleStatementChange = (event) => {
    setStatement(event.target.value);
  };

  const handleActiveChange = (event) => {
    setActive(event.target.checked);
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

    await axios
      .post("/api/survey/create/", data)
      .then(() => {
        setSurveyDetails(event);
        setSubmitting(false);
        setCompleted(true);
      })
      .catch((err) => {
        alert(err);
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
        <h3>Statement</h3>
        <textarea
          id="statement"
          value={statement}
          onChange={handleStatementChange}
          className="create--statement"
          placeholder="Enter the statement the participants will see"
        />
      </label>
      <div className="checkbox">
        <h3>Active</h3>
        <div className="create--checkbox">
          <label htmlFor="check_yes">
            <input
              type="checkbox"
              name="check_yes"
              checked={active}
              onChange={handleActiveChange}
            />
            Yes
          </label>
          <label htmlFor="check_no">
            <input
              type="checkbox"
              name="check_no"
              checked={!active}
              onChange={handleActiveChange}
            />
            No
          </label>
        </div>
      </div>
      <label htmlFor="endDate">
        <h3>End Date</h3>
        <input
          id="endDate"
          type="date"
          value={endDate}
          onChange={handleEndDateChange}
        />
      </label>
      <button type="submit">Submit</button>
    </form>
  );
}

export default CreateForm;
