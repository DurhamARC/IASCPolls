import React, { useState, useEffect, useRef, useContext } from "react";
import { Navigate } from "react-router-dom";
import "./dashboard.css";
import axios from "axios";
import NavBar from "../../components/nav/NavBar";
import Footer from "../../components/footer/Footer";
import Table from "../../components/DashboardTable";
import CreateContainer from "../../components/CreateContainer";
import AddParticipants from "../../components/addparticipants/AddParticipants";
import { AuthContext } from "../../components/AuthContext";
import { MessageContext } from "../../components/MessageHandler";

export default function Dashboard() {
  const [showCreateContainer, setShowCreateContainer] = useState(false);
  const [showAddParticipants, setShowAddParticipants] = useState(false);
  const [questionDatabase, setQuestionDatabase] = useState([]);
  const dashboardRef = useRef(null);

  const { isAuth } = useContext(AuthContext);
  const { raiseError } = useContext(MessageContext);
  const isLocal = process.env.NODE_ENV === "development";

  const fetchData = async () => {
    const response = await axios.get("/api/survey/");
    const questionData = response.data.results;
    setQuestionDatabase(questionData);
  };

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

  useEffect(() => {
    fetchData().catch((error) => {
      raiseError(error, "Error fetching survey data:");
    });
  }, []);

  const createNew = () => {
    setShowCreateContainer(true);
  };

  const closeCreateContainer = () => {
    setShowCreateContainer(false);
  };

  const openAddParticipants = () => {
    setShowAddParticipants(true);
  };

  const closeAddParticipants = () => {
    setShowAddParticipants(false);
  };

  const handleClickOutside = (event) => {
    if (dashboardRef.current && !dashboardRef.current.contains(event.target)) {
      closeCreateContainer();
      closeAddParticipants();
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
      <NavBar />
      <div className="dashboard" ref={dashboardRef}>
        <div className="dashboard--overview">
          <div>
            <button
              type="button"
              onClick={createNew}
              className="button dashboard--button"
            >
              <div>
                <span className="material-symbols-outlined">edit_square</span>
              </div>
              <div>Create</div>
            </button>
          </div>
          <div>
            <button
              type="button"
              onClick={openAddParticipants}
              className="button dashboard--button"
            >
              <div>
                <span className="material-symbols-outlined">contact_page</span>
              </div>
              <div>Add Participants</div>
            </button>
          </div>
        </div>
        <div className="dashboard--projects">
          {showCreateContainer && (
            <CreateContainer onClose={closeCreateContainer} />
          )}
          {showAddParticipants && (
            <AddParticipants onClose={closeAddParticipants} />
          )}
          <Table data={questionDatabase} updateData={updateData} />
        </div>
      </div>
      <Footer />
    </div>
  );
}
