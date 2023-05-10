import React from 'react';
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import questionData from '../databases/questions_overview.json';
import Table from '../components/DashboardTable';

export default function Dashboard() {
  const tableData = Object.entries(questionData).map(([key, value]) => ({
    statement: key,
    completed: value[0],
    active: value[2] === "True",
  }));

  return (
    <div className="container">
      <NavBar />
      <div className="dashboard">
        <div className="dashboard--overview">
          <div className="dashboard--overview--create">
            <a>
              <button className="button dashboard--button">
                <div>
                  <span class="material-symbols-outlined">
                    edit_square
                  </span>
                </div>
                <div>
                  Create
                </div>
              </button>
            </a>
          </div>
          <div className="dashboard--overview--content">
            <div>
              <h2>All</h2>
            </div>
            <div>
              <h2>Active</h2>
            </div>
            <div>
              <h2>Inactive</h2>
            </div>
          </div>
        </div>
        <div className="dashboard--projects">
          <div className="dashboard--overview--questions">
            <Table data={tableData} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
