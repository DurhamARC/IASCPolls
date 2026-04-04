import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { client } from "../Api";
import definitions from "../surveyDefinitions";

ChartJS.register(ArcElement, Tooltip, Legend);

const VOTE_LABELS = {
  1: "Strongly Agree",
  2: "Agree",
  3: "Neutral",
  4: "Disagree",
  5: "Strongly Disagree",
};

const COLORS = ["#999", "#1A5276", "#27AE60", "#F4D03F", "#E59866", "#C0392B"];

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

function buildCheckboxChartData(counts) {
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
    return (
      <p className="pie-chart--placeholder">
        Pick a survey from the list to view details
      </p>
    );
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

  const kind = survey?.kind ?? "LI";
  const definition = definitions[kind] ?? definitions.LI;
  const slots = definition.questions;
  const isMulti = slots.length > 1;

  if (isMulti) {
    const dbStatements = survey.questions ?? [];
    let likertIdx = 0;
    return (
      <div style={{ width: "300px", textAlign: "center", padding: "0.5rem" }}>
        <p style={{ fontWeight: "bold", marginBottom: "1rem" }}>{title}</p>
        {slots.map((slot) => {
          if (slot.type === "likert") {
            const key = String(likertIdx);
            const slotTitle =
              dbStatements[likertIdx] ?? `Statement ${likertIdx + 1}`;
            likertIdx += 1;
            return voteCounts[key] &&
              Object.keys(voteCounts[key]).length > 0 ? (
              <SinglePie
                key={slot.id}
                title={slotTitle}
                chartData={buildLikertChartData(voteCounts[key])}
              />
            ) : null;
          }
          if (slot.type === "checkbox") {
            return voteCounts.expertise ? (
              <SinglePie
                key={slot.id}
                title={slot.label}
                chartData={buildCheckboxChartData(voteCounts.expertise)}
              />
            ) : null;
          }
          return null;
        })}
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
