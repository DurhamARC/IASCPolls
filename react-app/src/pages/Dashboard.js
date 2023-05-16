import React, { useState, useEffect, useRef, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import Table from '../components/DashboardTable';
import CreateContainer from '../components/CreateContainer';
import AddParticipants from '../components/AddParticipants';
import axios from 'axios';
import { AuthContext } from "../components/AuthContext";

export default function Dashboard() {
  const [showCreateContainer, setShowCreateContainer] = useState(false);
  const [showAddParticipants, setShowAddParticipants] = useState(false);
  const [questionDatabase, setQuestionDatabase] = useState([]);
  const dashboardRef = useRef(null);

  const { isAuth, setAuth, currentUser, setCurrentUser } = useContext(AuthContext);
  const isLocal = process.env.NODE_ENV === 'development';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/survey');
        const questionData = response.data.results;
        setQuestionDatabase(questionData);
        console.log(questionData);
      } catch (error) {
        console.error('Error fetching survey data:', error);
      }
    };

    fetchData();
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
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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
            <button onClick={createNew} className="button dashboard--button">
              <div>
                <span className="material-symbols-outlined">edit_square</span>
              </div>
              <div>Create</div>
            </button>
          </div>
          <div>
            <button onClick={openAddParticipants} className="button dashboard--button">
              <div>
                <span className="material-symbols-outlined">contact_page</span>
              </div>
              <div>Add Participants</div>
            </button>
          </div>
        </div>
        <div className="dashboard--projects">
          {showCreateContainer && <CreateContainer onClose={closeCreateContainer} />}
          {showAddParticipants && <AddParticipants onClose={closeAddParticipants} />}
          <Table data={questionDatabase} />
        </div>
      </div>
      <Footer />
    </div>
  );
}
