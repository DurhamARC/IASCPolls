import React, { useState, useEffect } from 'react';
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import questionData from '../databases/questions_overview.json';
import Table from '../components/DashboardTable';
import { useNavigate } from "react-router-dom";
import axios from 'axios';

export default function Dashboard() {
  const tableData = Object.entries(questionData).map(([key, value]) => ({
    statement: key,
    completed: value[0],
    active: value[2] === "True",
  }));

  const navigate = useNavigate();

  const createNew = () => {
    navigate('/create');
  };

  const questionDatabase = useState('');

  useEffect(() => {
    const fetchData = async () => {
          try {
            // Make the API call to check if the survey exists
            const response = await axios.get(`/api/survey`);
            const questionDatabase = response.data;
            console.log(questionDatabase);

          } catch (error) {
            console.error('Error fetching survey data:', error);
            // Handle error and redirect to the error page
            navigate.push('/error');
        }
      };
    fetchData();
    }, [questionDatabase, navigate]);


  return (
    <div className="container">
      <NavBar />
      <div className="dashboard">
        <div className="dashboard--overview">


          <div className="dashboard--overview--create">
            <a>
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
            </a>
          </div>


          <div className="dashboard--overview--create">
            <a>
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
            <Table data={questionDatabase} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
