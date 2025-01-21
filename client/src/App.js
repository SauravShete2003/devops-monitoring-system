import React, { useState, useEffect } from "react";
import axios from 'axios'
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

function App() {
  const [metrics, setMetrics] = useState({ cpu: 0, memory: 0, disk: 0 })
  const [history, setHistory] = useState({ cpu: [], memory: [], disk: [] })

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/metrics`);
    
        const data = response.data;
    
        setMetrics(data);
        setHistory((prev) => ({
          cpu: [...prev.cpu, data.cpu].slice(-10),
          memory: [...prev.memory, data.memory].slice(-10),
          disk: [...prev.disk, data.disk].slice(-10),
        }));
      } catch (error) {
        console.error("Failed to fetch metrics:", error);
      }
    };
    

    fetchMetrics()
    const interval = setInterval(fetchMetrics, 5000)
    return () => clearInterval(interval)
  }, [])

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "System Metrics",
      },
    },
  }

  const chartData = {
    labels: [...Array(10).keys()].map((i) => `${i * 5}s ago`),
    datasets: [
      {
        label: "CPU Usage (%)",
        data: history.cpu,
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
      {
        label: "Memory Usage (%)",
        data: history.memory,
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
      {
        label: "Disk Usage (%)",
        data: history.disk,
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
      },
    ],
  }

  return (
    <div className="App">
      <header>
        <h1>DevOps Monitoring Dashboard</h1>
      </header>
      <div className="metrics-container">
        <div className="metric-card">
          <h2>CPU Usage</h2>
          <p>{metrics.cpu}%</p>
        </div>
        <div className="metric-card">
          <h2>Memory Usage</h2>
          <p>{metrics.memory}%</p>
        </div>
        <div className="metric-card">
          <h2>Disk Usage</h2>
          <p>{metrics.disk}%</p>
        </div>
      </div>
      <div className="chart-container">
        <Line options={chartOptions} data={chartData} />
      </div>
    </div>
  );
}

export default App

