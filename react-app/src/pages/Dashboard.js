import React, { useState, useEffect, useRef } from 'react';
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import Table from '../components/DashboardTable';
import UploadButton from '../components/UploadButton';
import CreateContainer from '../components/CreateContainer';
import { useNavigate } from "react-router-dom";
import axios from 'axios';

export default function Dashboard() {
  const navigate = useNavigate();
  const [showCreateContainer, setShowCreateContainer] = useState(false);
  const [questionDatabase, setQuestionDatabase] = useState([]);
  const dashboardRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/survey`);
        const questionData = response.data.results;
        setQuestionDatabase(questionData);
        console.log(questionData);
      } catch (error) {
        console.error('Error fetching survey data:', error);
        navigate('/error');
      }
    };
    fetchData();
  }, [navigate]);

  const createNew = () => {
    setShowCreateContainer(true);
  };

  const closeCreateContainer = () => {
    setShowCreateContainer(false);
  };

  const handleClickOutside = (event) => {
    if (dashboardRef.current && !dashboardRef.current.contains(event.target)) {
      closeCreateContainer();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="container">
      <NavBar />
      <div className="dashboard" ref={dashboardRef}>
        <div className="dashboard--overview">
          <div>
            <button onClick={createNew} className="button dashboard--button">
              <div>
                <span className="material-symbols-outlined">
                  edit_square
                </span>
              </div>
              <div>Create</div>
            </button>
          </div>

          {showCreateContainer && (
            <CreateContainer onClose={closeCreateContainer} />
          )}

          <div>
            <UploadButton />
          </div>

          <div className="dashboard--overview--content">
            <div className="button dashboard--button">
              <h2>All</h2>
            </div>
            <div className="button dashboard--button">
              <h2>Active</h2>
            </div>
            <div className="button dashboard--button">
              <h2>Inactive</h2>
            </div>
          </div>
        </div>
        <div className="dashboard--projects">
          <Table data={questionDatabase} />
        </div>
      </div>
      <Footer />
    </div>
  );
}
