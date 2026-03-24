import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { client } from "../Api";

ChartJS.register(ArcElement, Tooltip, Legend);

const VOTE_LABELS = {
  0: "Strongly Disagree",
  1: "Disagree",
  2: "Slightly Disagree",
  3: "Slightly Agree",
  4: "Agree",
  5: "Strongly Agree",
};

const COLORS = [
  "#C0392B",
  "#E74C3C",
  "#E59866",
  "#82E0AA",
  "#27AE60",
  "#1A5276",
];

function PieChart({ surveyId, fallbackQuestion }) {
  const [survey, setSurvey] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (surveyId === null) {
      setSurvey(null);
      setLoaded(false);
      return;
    }
    setSurvey(null);
    setLoaded(false);
    client
      .get("/api/survey/results/")
      .then((response) => {
        const found = response.data.results.find((s) => s.id === surveyId);
        setSurvey(found ?? null);
        setLoaded(true);
      })
      .catch(() => {
        setSurvey(null);
        setLoaded(true);
      });
  }, [surveyId]);

  if (surveyId === null) {
    return null;
  }

  if (!loaded) {
    return null;
  }

  const voteCounts = survey ? survey.vote_counts : null;
  const hasResults = voteCounts && Object.keys(voteCounts).length > 0;

  if (!hasResults) {
    return (
      <div style={{ width: "300px", textAlign: "center", padding: "1rem" }}>
        <p style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>
          {survey ? survey.question : fallbackQuestion}
        </p>
        <p style={{ color: "#999" }}>No results yet</p>
        <p style={{ color: "#999", fontSize: "0.8rem", marginTop: "0.5rem" }}>
          Survey ID: #{surveyId}
        </p>
      </div>
    );
  }

  const sortedKeys = Object.keys(voteCounts).sort();
  const chartData = {
    labels: sortedKeys.map((k) => `${VOTE_LABELS[k] ?? k} (${voteCounts[k]})`),
    datasets: [
      {
        data: sortedKeys.map((k) => voteCounts[k]),
        backgroundColor: sortedKeys.map(
          (k) => COLORS[parseInt(k, 10)] ?? "#999"
        ),
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  return (
    <div style={{ width: "300px", textAlign: "center" }}>
      <p style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>
        {survey.question}
      </p>
      <Pie data={chartData} options={options} />
      <p style={{ color: "#999", fontSize: "0.8rem", marginTop: "0.5rem" }}>
        Survey ID: #{surveyId}
      </p>
    </div>
  );
}

export default PieChart;
