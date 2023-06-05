import React, { useState, useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";
import { client } from "../../Api";
import NavBar from "../../components/nav/NavBar";
import Footer from "../../components/footer/Footer";
import { MessageContext } from "../../components/MessageHandler";
import "./download.css";

function DownloadParticipants() {
  const location = useLocation();
  // const history = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const pollId = searchParams.get("pollId");

  const [pollQuestion, setPollQuestion] = useState("");
  const [institutions, setInstitutions] = useState([]);
  const { pushError } = useContext(MessageContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [institutionsResponse, surveyResponse] = await Promise.all([
          client.get(`/api/survey/${pollId}/institutions/`),
          client.get(`/api/survey/${pollId}/`),
        ]).catch((e) => {
          pushError(e);
        });

        const institutionData = institutionsResponse.data.results;
        const pollData = surveyResponse.data;

        if (institutionData) {
          setInstitutions(institutionData);
        }

        if (pollData) {
          setPollQuestion(pollData.question);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [pollId]);

  const handleDownloadAll = async () => {
    try {
      const response = await client
        .get(`/api/links/zip/?survey=${pollId}`, {
          responseType: "blob",
        })
        .catch((e) => {
          pushError(e);
        });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `IASC-${pollId}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      pushError(error, "Error downloading file:");
    }
  };

  const handleDownload = async (institution) => {
    try {
      const response = await client.get("/api/links/xls/", {
        responseType: "blob",
        params: {
          survey: pollId,
          institution: institution.id,
        },
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `IASC-${pollId}-${institution.name}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      pushError(error, "Error downloading file:");
    }
  };

  return (
    <div>
      <NavBar />
      <div className="container">
        <div className="download--container">
          <h2>Download Voting Links for...</h2>
          <h3>{pollQuestion}</h3>
          <button
            type="button"
            className="button download--button"
            onClick={handleDownloadAll}
          >
            Download All
          </button>
          <div className="download--content">
            <div>
              <div>
                <h4>Institution</h4>
              </div>
              <div>
                <h4>Download</h4>
              </div>
            </div>
            {institutions.map((institution) => (
              <div key={institution.id}>
                <div>{institution.name}</div>
                <div>
                  <button
                    type="button"
                    className="button download--button"
                    onClick={() => handleDownload(institution)}
                  >
                    Download
                  </button>
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

export default DownloadParticipants;
