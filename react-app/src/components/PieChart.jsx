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

function PieChart({ surveyId }) {
  const [voteCounts, setVoteCounts] = useState(null);

  useEffect(() => {
    client
      .get("/api/survey/results/")
      .then((response) => {
        const survey = response.data.results.find((s) => s.id === surveyId);
        if (survey) {
          setVoteCounts(survey.vote_counts);
        }
      })
      .catch(() => {});
  }, [surveyId]);

  if (!voteCounts || Object.keys(voteCounts).length === 0) {
    return null;
  }

  const sortedKeys = Object.keys(voteCounts).sort();
  const chartData = {
    labels: sortedKeys.map((k) => VOTE_LABELS[k] ?? k),
    datasets: [
      {
        data: sortedKeys.map((k) => voteCounts[k]),
        backgroundColor: sortedKeys.map(
          (k) => COLORS[parseInt(k, 10)] ?? "#999"
        ),
      },
    ],
  };

  return (
    <div style={{ width: "300px" }}>
      <Pie data={chartData} />
    </div>
  );
}

export default PieChart;
