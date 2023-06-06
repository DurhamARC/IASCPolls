import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { client } from "../../Api";
import PollForm from "../../components/SurveyForm";
import "./survey.css";

/**
 * Request Poll page on /poll?survey=1&unique_id=12345
 * @returns {JSX.Element}
 * @constructor
 */
export default function Poll() {
  const location = useLocation();
  const history = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const surveyId = searchParams.get("survey");
  const uniqueId = searchParams.get("unique_id");

  const [pollQuestion, setPollQuestion] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      /*
        Although we could look up the parameter for the survey from
        the unique_id directly, requesting the question detail from
        /api/survey/${surveyId}/ is actually useful as it allows the
        web server to cache the response, which would not be possible
        for the unique_id key.
       */
      try {
        // Make the API call to check if the survey exists
        const response = await client.get(`/api/survey/${surveyId}/`);
        const surveyData = response.data;

        if (surveyData) {
          // Survey exists, set the poll question
          setPollQuestion(surveyData.question);
        } else {
          // Survey does not exist, redirect to the error page
          history.push("/error");
        }
      } catch (error) {
        console.error("Error fetching survey data:", error);
        // Handle error and redirect to the error page
        history.push("/error");
      }
    };

    fetchData();
  }, [surveyId, history]);

  return (
    <div className="poll--total">
      <div className="background-blur" />
      <div className="background-blur mirror" />
      <div className="poll">
        <div className="poll--box">
          <div className="poll--blurb">
            Please read the following statement carefully and answer with a
            response that aligns with your perspective on the given topic.
          </div>
          <div className="poll--question">{pollQuestion}</div>
          <PollForm uniqueId={uniqueId} />
        </div>
      </div>
    </div>
  );
}
