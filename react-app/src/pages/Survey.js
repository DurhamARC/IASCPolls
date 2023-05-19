import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import NavBar from "../components/NavBar";
import PollForm from "../components/SurveyForm";
import Footer from '../components/Footer';
import axios from 'axios';

export default function Poll() {
  const location = useLocation();
  const history = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const pollId = searchParams.get("pollId");
  const uniqueId = searchParams.get("uniqueId");

  const [pollQuestion, setPollQuestion] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Make the API call to check if the survey exists
        const response = await axios.get(`/api/survey/${pollId}`);
        const surveyData = response.data;

        if (surveyData) {
          // Survey exists, set the poll question
          setPollQuestion(surveyData.question);
        } else {
          // Survey does not exist, redirect to the error page
          history.push('/error');
        }
      } catch (error) {
        console.error('Error fetching survey data:', error);
        // Handle error and redirect to the error page
        history.push('/error');
      }
    };

    fetchData();
  }, [pollId, history]);

  return (
    <div className="poll--total">
      <div className="background-blur"></div>
      <div className="background-blur mirror"></div>
      <NavBar />
      <div className="poll">
        <div className="poll--box">
          <div className="poll--blurb">
            Please read the following statement carefully and answer with a response that aligns with your perspective on the given topic.
          </div>
          <div className="poll--question">
            {pollQuestion}
          </div>
          <PollForm uniqueId={uniqueId} pollId={pollId}/>
        </div>
      </div>
      <Footer />
    </div>
  );
}
