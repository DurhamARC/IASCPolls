import React, { useEffect, useContext, useState } from "react";
import Symbol from "./Symbol";
import { client } from "../Api";
import { MessageContext } from "./MessageHandler";

/**
 * Display the survey table in the dashboard and manage the data returned
 *
 * @returns {JSX.Element}
 * @constructor
 */
function Table({ reload }) {
  const itemsPerPage = 10;

  /* MessageContext allows raising errors and messages */
  const { pushError } = useContext(MessageContext);

  /* Table State */
  const [questionDatabase, setQuestionDatabase] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState(""); // Added state for the filter
  const [count, setCount] = useState(0);
  const [totalPages, _setTotalPages] = useState(0);

  const onError = (error) => {
    pushError(error, "Error fetching survey data");
  };

  /* Retrieve data from server */
  const fetchData = async () => {
    // Make request to the server
    const response = await client.get(
      `/api/survey/?page=${currentPage}&active=${filter}`
    );

    // Set data
    const questionData = response.data.results;
    setQuestionDatabase(questionData);
    setCount(response.data.count);
  };

  /* Make changes directly to live dataset attributes */
  /* Used (for example) when deactivating a survey */
  const updateData = (rowid, value) => {
    const newDatabase = [...questionDatabase];
    for (let row = 0; row < newDatabase.length; row += 1) {
      if (newDatabase[row].id === rowid) {
        newDatabase[row].active = value;
        break;
      }
    }
    setQuestionDatabase([...newDatabase]);
  };

  /* Navigate to next page */
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  /* Navigate to previous page */
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  /* Change the filter type */
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    // Reset the current page when the filter changes, which reloads the data.
    setCurrentPage(1);
  };

  /**
   * useEffect hooks, which run on changes to State...
   */

  /* Calculate total pages based on count of items whenever `count` changes */
  useEffect(() => {
    _setTotalPages(Math.ceil(count / itemsPerPage));
  }, [count]);

  /* When currentPage, filter, or reload changes... */
  useEffect(() => {
    fetchData().catch(onError);
  }, [currentPage, filter, reload]);

  /* React useEffect hook runs on first component render */
  useEffect(() => {
    fetchData().catch(onError);
  }, []);

  /* Render the component */
  return (
    <div className="dashboard--overview--questions">
      {/* Change filter mode */}
      <div className="dashboard--overview-active">
        <div className="dashboard--overview-active-box">
          <button
            type="button"
            className={`filter-button ${filter === "" ? "active" : ""}`}
            onClick={() => handleFilterChange("")}
          >
            all
          </button>
          <button
            type="button"
            className={`filter-button ${filter === "true" ? "active" : ""}`}
            onClick={() => handleFilterChange("true")}
          >
            active
          </button>
          <button
            type="button"
            className={`filter-button ${filter === "false" ? "active" : ""}`}
            onClick={() => handleFilterChange("false")}
          >
            inactive
          </button>
        </div>
      </div>

      {/* Display Table body by mapping questionDatabase */}
      <table className="dashboard--question--table">
        <thead>
          <tr>
            <th className="no-mobile">Statement</th>
            <th>ID</th>
            <th>Completed</th>
            <th className="no-mobile">Links</th>
            <th>Expiry</th>
            <th>Active</th>
            <th className="no-mobile">Results</th>
          </tr>
        </thead>
        <tbody>
          {questionDatabase.map((row) => (
            <tr key={row.id}>
              <td className="no-mobile">
                {row.question.substring(0, 50)}
                {row.question.length > 50 && "..."}
              </td>
              <td>{row.id}</td>
              <td>{Math.round((row.voted * 100) / row.participants)}%</td>
              <td className="no-mobile">
                <a href={`/download?pollId=${row.id}`}>
                  <span className="material-symbols-outlined">groups</span>
                </a>
              </td>
              <td>{row.expiry.slice(0, 10)}</td>
              <td>
                <Symbol
                  isActive={row.active}
                  surveyId={row.id}
                  activeSymbol="stop_circle"
                  inactiveSymbol="close"
                  onChange={(value) => {
                    console.log(row.id, value);
                    updateData(row.id, value);
                  }}
                />
              </td>
              <td className="no-mobile">
                <a href={`/api/result/xls/?survey=${row.id}`}>
                  <span className="material-symbols-outlined">download</span>
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination: navigate data by setting page */}
      <div className="dashboard--next--page">
        <button
          type="button"
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className="button dashboard--button--next"
        >
          Previous
        </button>
        <span>{`Page ${currentPage} of ${totalPages}`}</span>
        <button
          type="button"
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="button dashboard--button--next"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Table;
