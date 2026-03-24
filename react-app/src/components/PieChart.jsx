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

const PIE_OPTIONS = {
  plugins: {
    legend: { position: "bottom" },
  },
};

function buildLikertChartData(counts) {
  const sortedKeys = Object.keys(counts).sort();
  return {
    labels: sortedKeys.map((k) => `${VOTE_LABELS[k] ?? k} (${counts[k]})`),
    datasets: [
      {
        data: sortedKeys.map((k) => counts[k]),
        backgroundColor: sortedKeys.map(
          (k) => COLORS[parseInt(k, 10)] ?? "#999"
        ),
      },
    ],
  };
}

function buildExpertiseChartData(counts) {
  const yes = counts.True ?? counts.true ?? 0;
  const no = counts.False ?? counts.false ?? 0;
  return {
    labels: [`Yes (${yes})`, `No (${no})`],
    datasets: [
      {
        data: [yes, no],
        backgroundColor: ["#27AE60", "#E74C3C"],
      },
    ],
  };
}

function SinglePie({ title, chartData }) {
  return (
    <div
      style={{ width: "300px", textAlign: "center", marginBottom: "1.5rem" }}
    >
      <p
        style={{
          fontWeight: "600",
          fontSize: "0.95rem",
          marginBottom: "0.5rem",
        }}
      >
        {title}
      </p>
      <Pie data={chartData} options={PIE_OPTIONS} />
    </div>
  );
}

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
  const title = survey ? survey.question : fallbackQuestion;

  if (!hasResults) {
    return (
      <div style={{ width: "300px", textAlign: "center", padding: "1rem" }}>
        <p style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>{title}</p>
        <p style={{ color: "#999" }}>No results yet</p>
        <p style={{ color: "#999", fontSize: "0.8rem", marginTop: "0.5rem" }}>
          Survey ID: #{surveyId}
        </p>
      </div>
    );
  }

  // Detect L3C: values are objects rather than numbers
  const isL3C = typeof Object.values(voteCounts)[0] === "object";

  if (isL3C) {
    const statements = survey.questions ?? [
      "Statement 1",
      "Statement 2",
      "Statement 3",
    ];
    const subKeys = ["0", "1", "2"];
    return (
      <div style={{ width: "300px", textAlign: "center", padding: "0.5rem" }}>
        <p style={{ fontWeight: "bold", marginBottom: "1rem" }}>{title}</p>
        {subKeys.map((k) =>
          voteCounts[k] && Object.keys(voteCounts[k]).length > 0 ? (
            <SinglePie
              key={k}
              title={
                statements[parseInt(k, 10)] ??
                `Statement ${parseInt(k, 10) + 1}`
              }
              chartData={buildLikertChartData(voteCounts[k])}
            />
          ) : null
        )}
        {voteCounts.expertise && (
          <SinglePie
            title="I have relevant expertise"
            chartData={buildExpertiseChartData(voteCounts.expertise)}
          />
        )}
        <p style={{ color: "#999", fontSize: "0.8rem", marginTop: "0.5rem" }}>
          Survey ID: #{surveyId}
        </p>
      </div>
    );
  }

  return (
    <div style={{ width: "300px", textAlign: "center" }}>
      <p style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>{title}</p>
      <Pie data={buildLikertChartData(voteCounts)} options={PIE_OPTIONS} />
      <p style={{ color: "#999", fontSize: "0.8rem", marginTop: "0.5rem" }}>
        Survey ID: #{surveyId}
      </p>
    </div>
  );
}

export default PieChart;
