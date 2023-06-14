import React, { useState, useEffect, useRef, useContext } from "react";
import { Navigate } from "react-router-dom";
import "./dashboard.css";
import DashboardTable from "../../components/DashboardTable";
import CreateContainer from "../../components/CreateContainer";
import AddParticipants from "../../components/addparticipants/AddParticipants";
// import PieChart from "../../components/PieChart";
import { AuthContext } from "../../components/AuthContext";

/**
 * Create Dashboard React component to contain page
 * @returns {JSX.Element}
 * @constructor
 */
export default function Dashboard() {
  const [showCreateContainer, setShowCreateContainer] = useState(false);
  const [showAddParticipants, setShowAddParticipants] = useState(false);
  const [reloadCtr, setReloadCtr] = useState(0);
  const dashboardRef = useRef(null);

  const { isAuth } = useContext(AuthContext);
  const isLocal = process.env.NODE_ENV === "development";

  const handleClickOutside = (event) => {
    if (dashboardRef.current && !dashboardRef.current.contains(event.target)) {
      setShowCreateContainer(false);
      setShowAddParticipants(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!isAuth && !isLocal) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="container">
      <div className="dashboard" ref={dashboardRef}>
        <div className="dashboard--overview">
          <div className="create-add-container">
            <div>
              <button
                type="button"
                onClick={() => {
                  setShowAddParticipants(true);
                }}
                className="button dashboard--button"
              >
                <div>
                  <span className="material-symbols-outlined">
                    contact_page
                  </span>
                </div>
                <div>Add Participants</div>
              </button>
            </div>

            <div>
              <button
                type="button"
                onClick={() => {
                  setShowCreateContainer(true);
                }}
                className="button dashboard--button"
              >
                <div>
                  <span className="material-symbols-outlined">edit_square</span>
                </div>
                <div>Create</div>
              </button>
            </div>
          </div>
          <div className="pie-chart">{/* <PieChart surveyId={1} /> */}</div>
        </div>
        <div className="dashboard--projects">
          {showCreateContainer && (
            <CreateContainer
              onClose={() => {
                setShowCreateContainer(false);
              }}
              createdCallback={() => {
                setReloadCtr(reloadCtr + 1);
              }}
            />
          )}
          {showAddParticipants && (
            <AddParticipants
              onClose={() => {
                setShowAddParticipants(false);
              }}
            />
          )}
          <DashboardTable reload={reloadCtr} />
        </div>
      </div>
    </div>
  );
}
