import React, { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function DownloadParticipants() {
  const location = useLocation();
  const history = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const pollId = searchParams.get("pollId");

  const fakeInstitutions = [
    'Durham University',
    'NYU Taiwan',
    'Leeds',
    'Oxford Institute of Technology',
    'Cambridge School of Business',
    'Harvard College',
    'Stanford Institute of Technology',
    'Yale School of Medicine',
    'Princeton Academy',
    'MIT School of Engineering',
    'Columbia Law School',
    'Brown University',
    'Cornell College',
    'University of Chicago',
    'Georgetown Business School',
    'Northwestern School of Journalism',
    'University of Pennsylvania',
    'Dartmouth College',
    'UC Berkeley School of Arts',
    'UCLA College of Engineering',
    'University of Michigan',
    'University of Texas at Austin',
    'University of Washington',
    'Johns Hopkins School of Public Health',
    'Vanderbilt School of Music',
    'Rice University',
    'Carnegie Mellon Institute',
    'University of Southern California',
    'Emory School of Law',
    'Boston University',
  ];

  const [selectedPollId, setSelectedPollId] = useState(pollId);
  const [pollQuestions, setPollQuestions] = useState([]);
  const [pollQuestion, setPollQuestion] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Make the API call to get the survey data
        const response = await axios.get('/api/survey/');
        const surveyData = response.data.results;

        if (surveyData) {
          // Set the available poll questions from the survey data
          const availablePollQuestions = surveyData.map((survey) => survey.question);
          setPollQuestions(availablePollQuestions);

          // Find the survey with the matching question
          const matchingSurvey = surveyData.find((survey) => survey.question === selectedPollId);

          if (matchingSurvey) {
            // Survey with the specified question exists, set the poll question
            setPollQuestion(matchingSurvey.question);
          } else {
            // Survey does not exist, redirect to the error page
            console.log("survey does not exist");
          }
        }
      } catch (error) {
        console.error('Error fetching survey data:', error);
      }
    };

    fetchData();
  }, [selectedPollId, history]);

  const handleDownloadAll = () => {
    // Logic to download all participants
    console.log('Downloading all participants...');
  };

  const handlePollSelect = (e) => {
    const selectedPoll = e.target.value;
    setSelectedPollId(selectedPoll);
    history(`/download?pollId=${selectedPoll}`);
  };

  return (
    <div>
      <NavBar />
      <div className="container">
        <div className="download--container">
          <div>
            <select value={selectedPollId} onChange={handlePollSelect}>
              <option value="">Select a poll</option>
              {pollQuestions.map((pollQuestion, index) => (
                <option key={index} value={pollQuestion}>
                  {pollQuestion}
                </option>
              ))}
            </select>
          </div>
          <button onClick={handleDownloadAll}>Download All</button>
          <div className="download--content">
            <div>
              <div>Institution</div>
              <div>Download</div>
            </div>
            {fakeInstitutions.map((institution, index) => (
              <div key={index}>
                <div>{institution}</div>
                <div>
                  <button>Download</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
