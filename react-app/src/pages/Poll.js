import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import NavBar from "../components/NavBar";
import PollForm from "../components/PollForm";
import Footer from '../components/Footer';
import uniquePolls from '../databases/live_polls.json';
import idData from '../databases/unique_ids.json';

export default function Poll() {
  const location = useLocation();
  const history = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const pollId = searchParams.get("pollId");
  const uniqueId = searchParams.get("uniqueId");

  const [pollQuestion, setPollQuestion] = useState('');

  useEffect(() => {
    // Check if the unique ID exists
    const idExists = idData[pollId] && idData[pollId].includes(uniqueId);
    if (!idExists) {
      // Redirect to the error page
      history.push('/error');
    } else {
      // Load the poll question from the JSON data
      const question = uniquePolls[pollId];
      setPollQuestion(question || '');
    }
  }, [pollId, uniqueId, history]);

  return (
    <div className="poll--total">
      <div className="background-blur"></div>
      <div className="background-blur mirror"></div>
      <NavBar />
        <div className="poll">
          <div className="poll--box">
            <div className="poll--blurb">
              Please read the follwing statement carefully and answer with a response that aligns with your perspective on the given topic.
            </div>
            <div className="poll--question">
              {pollQuestion}
            </div>
            <PollForm/>
          </div>
        </div>
      <Footer />
      </div>
  );
}
