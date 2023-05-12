import React, { useState, useEffect } from 'react';
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import Table from '../components/DashboardTable';
import { useNavigate } from "react-router-dom";
import axios from 'axios';

export default function Dashboard() {

  const navigate = useNavigate();

  const createNew = () => {
    navigate('/create');
  };

  const [questionDatabase, setQuestionDatabase] = useState([]);

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

  
  return (
    <div className="container">
      <NavBar />
      <div className="dashboard">
        <div className="dashboard--overview">


          <div>
              <button onClick={createNew} className="button dashboard--button">
                <div>
                  <span class="material-symbols-outlined">
                    edit_square
                  </span>
                </div>
                <div>
                  Create
                </div>
              </button>
          </div>


          <div>
              <button onClick={createNew} className="button dashboard--button">
                <div>
                  <span class="material-symbols-outlined">
                    contact_page
                  </span>
                </div>
                <div>
                  Add Participants
                </div>
              </button>
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
