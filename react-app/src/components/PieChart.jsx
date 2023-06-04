import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";

function PieChart({ surveyId }) {
  const [voteData, setVoteData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/result/");
        const result = await response.json();
        const filteredData = result.filter(
          (item) => item.fields.survey === surveyId
        );
        setVoteData(filteredData);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, [surveyId]);

  if (voteData.length === 0) {
    return null;
  }

  const voteCounts = voteData.reduce((acc, item) => {
    const { vote } = item.fields;
    acc[vote] = (acc[vote] || 0) + 1;
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(voteCounts),
    datasets: [
      {
        data: Object.values(voteCounts),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#FF8F40",
          "#386FA4",
        ],
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
