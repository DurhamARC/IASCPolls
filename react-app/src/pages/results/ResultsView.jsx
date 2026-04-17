import React, { useEffect, useState, useContext } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Pie, Line } from "react-chartjs-2";
import { client } from "../../Api";
import { AuthContext } from "../../components/AuthContext";
import "./results.css";

ChartJS.register(
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler
);

const VOTE_LABELS = {
  1: "Strongly Agree",
  2: "Agree",
  3: "Neutral",
  4: "Disagree",
  5: "Strongly Disagree",
};
const LIKERT_COLORS = ["#1A5276", "#27AE60", "#95A5A6", "#E59866", "#C0392B"];
const CHECKBOX_COLORS = ["#27AE60", "#E74C3C"];

function buildLikertBarData(counts) {
  const keys = ["1", "2", "3", "4", "5"];
  return {
    labels: keys.map((k) => VOTE_LABELS[k]),
    datasets: [
      {
        label: "Votes",
        data: keys.map((k) => counts[k] ?? 0),
        backgroundColor: LIKERT_COLORS,
      },
    ],
  };
}

function buildCheckboxPieData(counts) {
  const yes = counts.True ?? counts.true ?? 0;
  const no = counts.False ?? counts.false ?? 0;
  return {
    labels: [`Yes (${yes})`, `No (${no})`],
    datasets: [{ data: [yes, no], backgroundColor: CHECKBOX_COLORS }],
  };
}

const BAR_OPTIONS = {
  indexAxis: "y",
  responsive: true,
  plugins: { legend: { display: false } },
  scales: { x: { beginAtZero: true, ticks: { precision: 0 } } },
};

const PIE_OPTIONS = { plugins: { legend: { position: "bottom" } } };

function likertStats(counts) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (total === 0) return null;
  const agree = (counts["1"] ?? 0) + (counts["2"] ?? 0);
  const disagree = (counts["4"] ?? 0) + (counts["5"] ?? 0);
  const mean =
    [1, 2, 3, 4, 5].reduce((s, k) => s + k * (counts[String(k)] ?? 0), 0) /
    total;
  return {
    total,
    agreePct: Math.round((agree / total) * 100),
    disagreePct: Math.round((disagree / total) * 100),
    mean: mean.toFixed(2),
  };
}

function LikertBlock({ title, counts }) {
  const stats = likertStats(counts);
  return (
    <div className="results--question-block">
      <p className="results--question-title">{title}</p>
      <Bar data={buildLikertBarData(counts)} options={BAR_OPTIONS} />
      {stats && (
        <div className="results--stats-row">
          <span>
            <strong>{stats.agreePct}%</strong> Agree
          </span>
          <span>
            <strong>{stats.disagreePct}%</strong> Disagree
          </span>
          <span>
            Mean <strong>{stats.mean}</strong>
          </span>
          <span>
            n&nbsp;=&nbsp;<strong>{stats.total}</strong>
          </span>
        </div>
      )}
    </div>
  );
}

function CheckboxBlock({ title, counts }) {
  const yes = counts.True ?? counts.true ?? 0;
  const no = counts.False ?? counts.false ?? 0;
  const total = yes + no;
  return (
    <div className="results--question-block results--question-block--checkbox">
      <p className="results--question-title">{title}</p>
      <div className="results--pie-wrap">
        <Pie data={buildCheckboxPieData(counts)} options={PIE_OPTIONS} />
      </div>
      {total > 0 && (
        <div className="results--stats-row">
          <span>
            <strong>{Math.round((yes / total) * 100)}%</strong> Yes
          </span>
          <span>
            n&nbsp;=&nbsp;<strong>{total}</strong>
          </span>
        </div>
      )}
    </div>
  );
}

function buildBurnupData(series, participants, expiry) {
  const labels = series.map((p) => p.date);
  const actual = series.map((p) => p.cumulative);

  const datasets = [
    {
      label: "Votes received",
      data: actual,
      borderColor: "#1A5276",
      backgroundColor: "rgba(26,82,118,0.1)",
      fill: true,
      tension: 0.3,
    },
    {
      label: "Target",
      data: labels.map(() => participants),
      borderColor: "#95A5A6",
      borderDash: [4, 4],
      pointRadius: 0,
      fill: false,
    },
  ];

  if (expiry && series.length >= 2) {
    const now = new Date();
    const expiryDate = new Date(expiry);
    if (expiryDate > now) {
      const first = new Date(series[0].date);
      const last = new Date(series[series.length - 1].date);
      const daysElapsed = Math.max(1, (last - first) / (1000 * 60 * 60 * 24));
      const slope = series[series.length - 1].cumulative / daysElapsed;
      const daysToExpiry = Math.ceil(
        (expiryDate - last) / (1000 * 60 * 60 * 24)
      );

      const trendLabels = [];
      const trendData = [];
      const lastCumulative = series[series.length - 1].cumulative;
      for (let d = 1; d <= daysToExpiry; d += 1) {
        const date = new Date(last);
        date.setDate(date.getDate() + d);
        trendLabels.push(date.toISOString().slice(0, 10));
        trendData.push(
          Math.min(participants, Math.round(lastCumulative + slope * d))
        );
      }

      if (trendLabels.length > 0) {
        const allLabels = [...labels, ...trendLabels];
        const paddedActual = [
          ...actual,
          ...Array(trendLabels.length).fill(null),
        ];
        const paddedTarget = allLabels.map(() => participants);
        const trendFull = [
          ...Array(labels.length - 1).fill(null),
          lastCumulative,
          ...trendData,
        ];
        datasets[0].data = paddedActual;
        datasets[1].data = paddedTarget;
        datasets.push({
          label: "Trend",
          data: trendFull,
          borderColor: "#E59866",
          borderDash: [6, 3],
          pointRadius: 0,
          fill: false,
        });
        return { labels: allLabels, datasets };
      }
    }
  }

  return { labels, datasets };
}

function BurnupChart({ surveyId, participants, expiry }) {
  const [series, setSeries] = useState(null);

  useEffect(() => {
    client
      .get(`/api/survey/${surveyId}/timeseries/`)
      .then((r) => setSeries(r.data.series))
      .catch(() => setSeries([]));
  }, [surveyId]);

  if (series === null)
    return <p className="results--loading">Loading chart…</p>;
  if (series.length === 0)
    return <p className="results--empty">No votes yet.</p>;

  const chartData = buildBurnupData(series, participants, expiry);
  return (
    <Line
      data={chartData}
      options={{
        responsive: true,
        plugins: { legend: { position: "bottom" } },
        scales: {
          y: {
            beginAtZero: true,
            max: participants,
            ticks: { precision: 0 },
          },
        },
      }}
    />
  );
}

function InstitutionPanel({ surveyId, onSelect, selectedId }) {
  const [institutions, setInstitutions] = useState(null);

  useEffect(() => {
    client
      .get(`/api/survey/${surveyId}/institutions/`)
      .then((r) => setInstitutions(r.data.results))
      .catch(() => setInstitutions([]));
  }, [surveyId]);

  if (institutions === null)
    return <p className="results--loading">Loading…</p>;
  if (institutions.length === 0)
    return (
      <p className="results--empty">No institution breakdown available.</p>
    );

  return (
    <div className="results--inst-panel">
      <p className="results--inst-hint">Click a row to filter charts.</p>
      {selectedId && (
        <button
          type="button"
          className="results--clear-filter"
          onClick={() => onSelect(null)}
        >
          ✕ Clear filter
        </button>
      )}
      <table className="results--institution-table">
        <thead>
          <tr>
            <th>Institution</th>
            <th>Rate</th>
          </tr>
        </thead>
        <tbody>
          {institutions.map((inst) => {
            const voted = inst.total_count - inst.link_count;
            const rate =
              inst.total_count > 0
                ? `${Math.round((voted / inst.total_count) * 100)}%`
                : "—";
            return (
              <tr
                key={inst.id}
                className={`results--inst-row${selectedId === inst.id ? " selected" : ""}`}
                onClick={() =>
                  onSelect(selectedId === inst.id ? null : inst.id)
                }
              >
                <td>{inst.name}</td>
                <td>
                  {voted}/{inst.total_count} ({rate})
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function ResultsView() {
  const { surveyId } = useParams();
  const { isAuth } = useContext(AuthContext);
  const isLocal = process.env.NODE_ENV === "development";

  const [survey, setSurvey] = useState(null);
  const [aggregate, setAggregate] = useState(null);
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAggregate = (institutionId) => {
    const params = institutionId ? `?institution=${institutionId}` : "";
    return client
      .get(`/api/survey/${surveyId}/aggregate/${params}`)
      .then((r) => setAggregate(r.data));
  };

  useEffect(() => {
    client
      .get(`/api/survey/${surveyId}/`)
      .then((r) => {
        setSurvey(r.data);
        return fetchAggregate(null);
      })
      .catch((e) =>
        setError(e.response?.status === 404 ? "not_found" : "error")
      )
      .finally(() => setLoading(false));
  }, [surveyId]);

  const handleInstitutionSelect = (id) => {
    setSelectedInstitution(id);
    fetchAggregate(id);
  };

  if (!isAuth && !isLocal) return <Navigate to="/login" />;
  if (loading)
    return (
      <div className="container">
        <p className="results--loading">Loading…</p>
      </div>
    );
  if (error === "not_found")
    return (
      <div className="container">
        <p>
          Survey not found. <Link to="/dashboard">Back to dashboard</Link>
        </p>
      </div>
    );
  if (error || !survey || !aggregate)
    return (
      <div className="container">
        <p>
          Failed to load results. <Link to="/dashboard">Back to dashboard</Link>
        </p>
      </div>
    );

  const slots = aggregate.template_slots ?? [];
  const questions = aggregate.questions ?? [];
  const voteCounts = aggregate.vote_counts ?? {};
  const responseRate =
    survey.participants > 0
      ? Math.round((survey.voted / survey.participants) * 100)
      : 0;

  let likertIdx = 0;
  const chartBlocks = slots.map((slot, i) => {
    if (slot.type === "likert") {
      const key = String(likertIdx);
      const title = questions[likertIdx] ?? `Statement ${likertIdx + 1}`;
      likertIdx += 1;
      const counts = voteCounts[key] ?? {};
      return <LikertBlock key={slot.id} title={title} counts={counts} />;
    }
    if (slot.type === "checkbox") {
      const counts = voteCounts[String(i)] ?? {};
      return (
        <CheckboxBlock
          key={slot.id}
          title={questions[i] ?? slot.placeholder}
          counts={counts}
        />
      );
    }
    return null;
  });

  // Single-LI survey: vote_counts is a flat {1: n, 2: n, ...}
  const isSingleLikert = slots.length <= 1;
  const singleLikertBlock = isSingleLikert && (
    <LikertBlock title={survey.question} counts={voteCounts} />
  );

  return (
    <div className="container">
      <div className="results--page">
        <div className="results--header">
          <Link to="/dashboard" className="results--back">
            ← Back to dashboard
          </Link>
          <h1 className="results--title">{survey.question}</h1>
          <div className="results--meta">
            <span className="results--kind-badge">{survey.kind}</span>
            <span className="results--response-rate">
              {survey.voted} / {survey.participants} responses ({responseRate}%)
            </span>
          </div>
          <div className="results--progress-bar">
            <div
              className="results--progress-fill"
              style={{ width: `${responseRate}%` }}
            />
          </div>
        </div>

        <div className="results--body">
          <aside className="results--sidebar">
            <p className="results--section-header">Filter by institution</p>
            <hr />
            <InstitutionPanel
              surveyId={Number(surveyId)}
              onSelect={handleInstitutionSelect}
              selectedId={selectedInstitution}
            />
          </aside>

          <div className="results--main">
            <div className="results--charts">
              {isSingleLikert ? singleLikertBlock : chartBlocks}
            </div>

            <section className="results--section">
              <h2>Votes over time</h2>
              <BurnupChart
                surveyId={Number(surveyId)}
                participants={survey.participants}
                expiry={survey.expiry}
              />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
