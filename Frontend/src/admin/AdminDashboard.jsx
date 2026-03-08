import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../AuthContext";
import {
  Users,
  FlaskConical,
  FolderKanban,
  ShieldCheck,
  Activity,
} from "lucide-react";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import "./AdminDashboard.css";

ChartJS.register(
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const { token } = useContext(AuthContext);

  const [stats, setStats] = useState({
    users: 0,
    admins: 0,
    labs: 0,
    challenges: 0,
  });

  const [weeklyData, setWeeklyData] = useState([0, 0, 0, 0, 0, 0, 0]); // Mon-Sun
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const userRes = await axios.get(
          "http://localhost:5000/api/users/admin/users",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const users = userRes.data || [];
        const adminCount = users.filter(
          (u) => u.role?.toUpperCase() === "ADMIN"
        ).length;
        const userCount = users.filter(
          (u) => u.role?.toUpperCase() !== "ADMIN"
        ).length;

        const labRes = await axios.get("http://localhost:5000/api/labs");
        const labs = Array.isArray(labRes.data) ? labRes.data.length : 0;

        let challenges = 0;
        try {
          const chalRes = await axios.get("http://localhost:5000/api/challenges");
          challenges = Array.isArray(chalRes.data) ? chalRes.data.length : 0;
        } catch {
          challenges = 0;
        }

        setStats({
          users: userCount,
          admins: adminCount,
          labs,
          challenges,
        });

        const weekRes = await axios.get(
          "http://localhost:5000/api/labs/submissions",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const submissions = weekRes.data || [];
        const weeklyCounts = [0, 0, 0, 0, 0, 0, 0];

        submissions.forEach((s) => {
          const day = new Date(s.createdAt).getDay(); // 0=Sun
          const index = day === 0 ? 6 : day - 1; // Mon=0
          weeklyCounts[index]++;
        });

        setWeeklyData(weeklyCounts);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const totalMembers = stats.admins + stats.users;
  const totalCompletionsThisWeek = weeklyData.reduce((acc, value) => acc + value, 0);
  const bestDayCount = Math.max(...weeklyData);
  const bestDayIndex = weeklyData.findIndex((value) => value === bestDayCount);
  const bestDay =
    bestDayCount > 0 && bestDayIndex >= 0 ? dayLabels[bestDayIndex] : "N/A";

  const barData = {
    labels: dayLabels,
    datasets: [
      {
        label: "Labs Completed",
        data: weeklyData,
        backgroundColor: [
          "#5eead4",
          "#5eead4",
          "#5eead4",
          "#22c55e",
          "#22c55e",
          "#22c55e",
          "#16a34a",
        ],
        hoverBackgroundColor: "#34d399",
        borderRadius: 8,
        borderSkipped: false,
        maxBarThickness: 42,
      },
    ],
  };

  const doughnutData = {
    labels: ["Admins", "Users"],
    datasets: [
      {
        data: [stats.admins, stats.users],
        backgroundColor: ["#22c55e", "#1e293b"],
        borderColor: "#0b1220",
        borderWidth: 3,
      },
    ],
  };

  const barOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#d1d5db",
          font: { weight: "600" },
        },
      },
      tooltip: {
        backgroundColor: "#0b1220",
        titleColor: "#f8fafc",
        bodyColor: "#cbd5e1",
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#94a3b8" },
      },
      y: {
        beginAtZero: true,
        ticks: { color: "#94a3b8", precision: 0 },
        grid: { color: "rgba(148, 163, 184, 0.16)" },
      },
    },
  };

  const doughnutOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#d1d5db",
          boxWidth: 14,
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: "#0b1220",
        titleColor: "#f8fafc",
        bodyColor: "#cbd5e1",
      },
    },
    cutout: "62%",
  };

  if (loading) {
    return <div className="admin-loading">Loading admin dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <section className="admin-hero">
        <div>
          <p className="admin-kicker">Control Center</p>
          <h1 className="admin-title">Admin Dashboard</h1>
          <p className="admin-subtitle">
            Live overview of users, labs, challenges, and weekly activity.
          </p>
        </div>
        <div className="admin-hero-pill">
          <Activity size={18} />
          <span>{totalCompletionsThisWeek} completions this week</span>
        </div>
      </section>

      <div className="admin-card-grid">
        <div className="admin-card">
          <div className="admin-card-text">
            <p className="admin-card-title">Total Users</p>
            <h2 className="admin-card-value">{stats.users}</h2>
            <p className="admin-card-meta">Registered learners</p>
          </div>
          <div className="admin-icon-wrap">
            <Users size={28} />
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-text">
            <p className="admin-card-title">Admins</p>
            <h2 className="admin-card-value">{stats.admins}</h2>
            <p className="admin-card-meta">Platform managers</p>
          </div>
          <div className="admin-icon-wrap">
            <ShieldCheck size={28} />
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-text">
            <p className="admin-card-title">Active Labs</p>
            <h2 className="admin-card-value">{stats.labs}</h2>
            <p className="admin-card-meta">Published practicals</p>
          </div>
          <div className="admin-icon-wrap">
            <FlaskConical size={28} />
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-text">
            <p className="admin-card-title">Challenges</p>
            <h2 className="admin-card-value">{stats.challenges}</h2>
            <p className="admin-card-meta">Assessment tracks</p>
          </div>
          <div className="admin-icon-wrap">
            <FolderKanban size={28} />
          </div>
        </div>
      </div>

      <div className="admin-insights-grid">
        <article className="admin-insight-card">
          <p className="admin-insight-label">Total Platform Members</p>
          <h3 className="admin-insight-value">{totalMembers}</h3>
        </article>
        <article className="admin-insight-card">
          <p className="admin-insight-label">Top Submission Day</p>
          <h3 className="admin-insight-value">
            {bestDay} {bestDayCount > 0 ? `(${bestDayCount})` : ""}
          </h3>
        </article>
      </div>

      <div className="admin-chart-grid">
        <div className="admin-chart-box">
          <div className="admin-chart-head">
            <h2 className="admin-chart-title">Weekly Lab Completions</h2>
            <span className="admin-chart-badge">{totalCompletionsThisWeek}</span>
          </div>
          <div className="admin-bar-wrap">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        <div className="admin-chart-box">
          <div className="admin-chart-head">
            <h2 className="admin-chart-title">User Role Distribution</h2>
          </div>
          <div className="admin-chart-center">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
