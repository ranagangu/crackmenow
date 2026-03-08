import React from "react";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import "chart.js/auto";
import "../admin-ui.css";
import "./Analytics.css";

const AnalyticsDashboard = () => {
  const summary = {
    totalAttempts: 312,
    avgSuccessRate: 74,
    avgCompletionTime: 10,
    activeUsers: 27,
  };

  const axisOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: { labels: { color: "#dbeafe" } },
      tooltip: {
        backgroundColor: "#020617",
        titleColor: "#f8fafc",
        bodyColor: "#cbd5e1",
      },
    },
    scales: {
      x: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(148,163,184,0.12)" } },
      y: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(148,163,184,0.12)" }, beginAtZero: true },
    },
  };

  const doughnutOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: "#dbeafe", padding: 14 },
      },
      tooltip: {
        backgroundColor: "#020617",
        titleColor: "#f8fafc",
        bodyColor: "#cbd5e1",
      },
    },
    cutout: "62%",
  };

  const userGrowthData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "New Users",
        data: [8, 14, 21, 27],
        borderColor: "#22c55e",
        backgroundColor: "rgba(34,197,94,0.22)",
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const labPopularityData = {
    labels: ["SQL Injection", "XSS", "Privilege Escalation", "File Upload"],
    datasets: [
      {
        label: "Attempts",
        data: [45, 38, 26, 32],
        backgroundColor: ["#22c55e", "#16a34a", "#10b981", "#4ade80"],
        borderRadius: 8,
      },
    ],
  };

  const challengeRateData = {
    labels: ["Success", "Failed"],
    datasets: [
      {
        data: [74, 26],
        backgroundColor: ["#22c55e", "#ef4444"],
        borderColor: "#0f172a",
        borderWidth: 3,
      },
    ],
  };

  const dailyActivityData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Submissions",
        data: [12, 18, 25, 22, 29, 20, 15],
        borderColor: "#38bdf8",
        backgroundColor: "rgba(56,189,248,0.2)",
        fill: true,
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="admin-ui-page">
      <div className="admin-ui-container">
        <div className="admin-ui-title-row">
          <div>
            <h2 className="admin-ui-title">Platform Analytics</h2>
            <p className="admin-ui-subtitle">Snapshot of engagement, challenge outcomes, and weekly activity.</p>
          </div>
          <span className="admin-ui-pill">Demo Metrics</span>
        </div>

        <div className="analytics-summary">
          <article className="admin-ui-panel summary-card"><h4>Total Lab Attempts</h4><p>{summary.totalAttempts}</p></article>
          <article className="admin-ui-panel summary-card"><h4>Avg Success Rate</h4><p>{summary.avgSuccessRate}%</p></article>
          <article className="admin-ui-panel summary-card"><h4>Avg Completion Time</h4><p>{summary.avgCompletionTime} min</p></article>
          <article className="admin-ui-panel summary-card"><h4>Active Users (7d)</h4><p>{summary.activeUsers}</p></article>
        </div>

        <div className="charts-container">
          <section className="admin-ui-panel chart-card">
            <h3>User Growth Over Time</h3>
            <div className="chart-canvas-wrap"><Line data={userGrowthData} options={axisOptions} /></div>
          </section>

          <section className="admin-ui-panel chart-card">
            <h3>Most Popular Labs</h3>
            <div className="chart-canvas-wrap"><Bar data={labPopularityData} options={axisOptions} /></div>
          </section>

          <section className="admin-ui-panel chart-card">
            <h3>Challenge Success Rate</h3>
            <div className="chart-canvas-wrap"><Doughnut data={challengeRateData} options={doughnutOptions} /></div>
          </section>

          <section className="admin-ui-panel chart-card">
            <h3>Daily Platform Activity</h3>
            <div className="chart-canvas-wrap"><Line data={dailyActivityData} options={axisOptions} /></div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
