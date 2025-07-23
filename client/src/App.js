import React, { useState } from "react";
import {
  LineChart, Line, BarChart, Bar, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import "./App.css";

function App() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [duration, setDuration] = useState(0);

  const handleAsk = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);
    setDuration(0);

    const start = Date.now();
    try {
      const res = await fetch("http://localhost:3000/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();
      const elapsed = Date.now() - start;

      if (res.ok) {
        setResult(data);
        setDuration(elapsed);
      } else {
        setError(data);
      }
    } catch (err) {
      setError({ error: "Network Error", detail: err.message });
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (!result?.data?.length) return;
    const headers = Object.keys(result.data[0]).join(",");
    const rows = result.data.map((row) => Object.values(row).join(",")).join("\n");
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: "text/csv" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "query_result.csv";
    link.click();
  };

  const renderChart = () => {
    const data = result?.data;
    if (!data || data.length === 0) return null;
    const keys = Object.keys(data[0]);

    if (keys.includes("date") && keys.length === 2) {
      const metric = keys.find((k) => k !== "date");
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey={metric} stroke="#00C9A7" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (keys.includes("item_id") && keys.length === 2) {
      const metric = keys.find((k) => k !== "item_id");
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="item_id" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={metric} fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (keys.includes("clicks") && keys.includes("impressions")) {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart>
            <CartesianGrid />
            <XAxis dataKey="impressions" name="Impressions" />
            <YAxis dataKey="clicks" name="Clicks" />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            <Legend />
            <Scatter name="Data Points" data={data} fill="#f59e0b" />
          </ScatterChart>
        </ResponsiveContainer>
      );
    }

    return null;
  };

  return (
    <div className="App">
      <header className="hero">
        <h1>🧠 Data Whisperer</h1>
        <p>Query your database with natural language — no SQL required.</p>
      </header>

      <section className="query-box">
        <input
          type="text"
          placeholder="Ask anything... (e.g., Top 5 items by clicks)"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button onClick={handleAsk} disabled={loading}>
          {loading ? "Thinking..." : "Run"}
        </button>
      </section>

      <div className="suggestions">
        <span>Examples:</span>
        <ul>
          <li>Ad spend by item</li>
          <li>Which product had the highest CPC (Cost Per Click)?</li>
          <li>What is my total sales?</li>
          <li>Items with 0 impressions</li>
        </ul>
      </div>

      {result && (
        <section className="output">
          <h3>💡 SQL Generated</h3>
          <pre className="code">{result.sql}</pre>
          <div className="meta">
            <span>{result.data.length} rows • {duration} ms</span>
            <button onClick={downloadCSV}>📥 Download CSV</button>
          </div>

          {renderChart() && (
            <div className="chart-wrap">
              <h4>📊 Chart</h4>
              {renderChart()}
            </div>
          )}

          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  {Object.keys(result.data[0] || {}).map((key) => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.data.map((row, i) => (
                  <tr key={i}>
                    {Object.values(row).map((val, j) => (
                      <td key={j}>{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {error && (
        <section className="error-box">
          <h3>🚫 {error.error}</h3>
          <p>{error.detail}</p>
        </section>
      )}
    </div>
  );
}

export default App;
