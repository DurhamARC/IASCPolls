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
  const [templateSlots, setTemplateSlots] = useState([]);
  const [surveyQuestions, setSurveyQuestions] = useState(null);
  const [hideTitle, setHideTitle] = useState(false);
  const [tokenUsed, setTokenUsed] = useState(false);

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
          setPollQuestion(surveyData.question);
          setTemplateSlots(surveyData.template_slots ?? []);
          setSurveyQuestions(surveyData.questions);
          setHideTitle(surveyData.hide_title);
        } else {
          history("/error", {
            state: { message: "This survey could not be found." },
          });
          return;
        }
      } catch (error) {
        const message =
          error.response?.status === 404
            ? "This survey could not be found."
            : "An error occurred while loading the survey.";
        history("/error", { state: { message } });
        return;
      }

      // Validate the token. A 404 means it has already been used (or never existed).
      try {
        await client.get(`/api/vote/${uniqueId}/`);
      } catch (error) {
        if (error.response?.status === 404) {
          setTokenUsed(true);
        } else {
          history("/error", {
            state: { message: "An error occurred while validating your link." },
          });
        }
      }
    };

    fetchData();
  }, [surveyId, uniqueId, history]);

  if (tokenUsed) {
    return (
      <div className="poll--total">
        <div className="background-blur" />
        <div className="background-blur mirror" />
        <div className="poll">
          <div className="poll--box">
            <div className="poll--blurb">
              This voting link has already been used.
            </div>
            <div className="poll--question">
              If you believe this is an error, please contact the survey
              administrator.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="poll--total">
      <div className="background-blur" />
      <div className="background-blur mirror" />
      <div className="poll">
        <div
          className={`poll--box${templateSlots.length > 1 ? " poll--box-l3c" : ""}`}
        >
          <div className="poll--blurb">
            Please respond to the following statement
            {templateSlots.length > 1 ? "s" : ""}:
          </div>
          {!hideTitle && <div className="poll--question">{pollQuestion}</div>}
          <PollForm
            uniqueId={uniqueId}
            slots={templateSlots}
            questions={surveyQuestions}
          />
        </div>
      </div>
    </div>
  );
}
