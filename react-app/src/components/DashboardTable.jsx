import React, { useState } from "react";
import Symbol from "./Symbol";

function Table({ data, updateData }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [filter, setFilter] = useState("all"); // Added state for the filter

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  // Filter the data based on the selected filter
  let filteredData = data;
  if (filter === "active") {
    filteredData = data.filter((row) => row.active);
  } else if (filter === "inactive") {
    filteredData = data.filter((row) => !row.active);
  }

  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1); // Reset the current page when the filter changes
  };

  return (
    <div className="dashboard--overview--questions">
      <div className="dashboard--overview-active">
        <div className="dashboard--overview-active-box">
          <button
            type="button"
            className={`filter-button ${filter === "all" ? "active" : ""}`}
            onClick={() => handleFilterChange("all")}
          >
            all
          </button>
          <button
            type="button"
            className={`filter-button ${filter === "active" ? "active" : ""}`}
            onClick={() => handleFilterChange("active")}
          >
            active
          </button>
          <button
            type="button"
            className={`filter-button ${filter === "inactive" ? "active" : ""}`}
            onClick={() => handleFilterChange("inactive")}
          >
            inactive
          </button>
        </div>
      </div>
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
          {currentItems.map((row) => (
            <tr key={row.id}>
              <td className="no-mobile">{row.question}</td>
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
