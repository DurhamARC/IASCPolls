import React, { useState } from 'react';
import Symbol from './isActive';

const Table = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

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
    <div>
      <table className="dashboard--question--table">
        <thead>
          <tr>
            <th>Statement</th>
            <th>Completed</th>
            <th>Participants</th>
            <th>Active</th>
            <th>Results</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((row, index) => (
            <tr key={index}>
              <td>{row.question}</td>
              <td>{row.voted * 100 / row.participants}%</td>
              <td>
                <span className="material-symbols-outlined">
                  groups
                </span>
              </td>
              <td>
                <Symbol
                  isActive={row.active}
                  activeSymbol="play_circle"
                  inactiveSymbol="stop_circle"
                />
              </td>
              <td>
               <span className="material-symbols-outlined">
                  download
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="dashboard--next--page">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>{`Page ${currentPage} of ${totalPages}`}</span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Table;
