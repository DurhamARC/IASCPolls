import React, { useState } from "react";
import Symbol from "./Symbol";

function Table({ data }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(data.length / itemsPerPage);

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

  return (
    <div className="dashboard--overview--questions">
      <table className="dashboard--question--table">
        <thead>
          <tr>
            <th>Statement</th>
            <th> ID </th>
            <th>Completed</th>
            <th>Participants</th>
            <th>Expiry</th>
            <th>Active</th>
            <th>Results</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((row) => (
            <tr key={row.id}>
              <td>{row.question}</td>
              <td>{row.id}</td>
              <td>{Math.round((row.voted * 100) / row.participants)}%</td>
              <td>
                <a href={`/download?pollId=${row.id}`}>
                  <span className="material-symbols-outlined">groups</span>
                </a>
              </td>
              <td>{row.expiry.slice(0, 10)}</td>
              <td>
                <Symbol
                  isActive={row.active}
                  surveyId={row.id}
                  activeSymbol="play_circle"
                  inactiveSymbol="stop_circle"
                />
              </td>
              <td>
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
