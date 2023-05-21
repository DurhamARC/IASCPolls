import React, { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const DownloadParticipants = () => {
  const location = useLocation();
  const history = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const pollId = searchParams.get("pollId");

  const [pollQuestion, setPollQuestion] = useState('');
  const [institutions, setInstitutions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [institutionsResponse, surveyResponse] = await Promise.all([
          //axios.get(`/api/survey/${pollId}/institutions`), this route not working and cannot see on api
          axios.get('/api/institutions'),
          axios.get(`/api/survey/${pollId}`)
        ]);

        const institutionData = institutionsResponse.data;
        const pollData = surveyResponse.data;

        if (institutionData) {
          setInstitutions(institutionData);
        }

        if (pollData) {
          setPollQuestion(pollData.question);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [pollId]);

  const handleDownloadAll = async () => {
    try {
      const response = await axios.get(`/api/links/zip/?survey=${pollId}`, {   // THIS IS NOT WORKING WILL NEED TO BE
        responseType: 'blob',
      });
  
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `poll_${pollId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const handleDownload = async (institutionId) => {
    try {
      const response = await axios.get('/api/links/', {
        responseType: 'blob',
        params: {
          survey: pollId,
          institution: institutionId,
        },
      });
  
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `institution_${institutionId}_poll_${pollId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  return (
    <div>
      <NavBar />
      <div className="container">
        <div className="download--container">
          <h>Download Participants for...</h>
          <h3>{pollQuestion}</h3>
          <button className="button download--button" onClick={handleDownloadAll}>Download All</button>
          <div className="download--content">
            <div>
              <div><h4>Institution</h4></div>
              <div><h4>Download</h4></div>
            </div>
            {institutions.map((institution, index) => (
              <div key={index}>
                <div>{institution.name}</div>
                <div>
                  <button className="button download--button" onClick={() => handleDownload(institution.id)}>Download</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DownloadParticipants;
