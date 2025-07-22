import React, { useState } from "react";
import {
  LineChart, Line,
  BarChart, Bar,
  ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
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
    const data = result.data;
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
            <Line type="monotone" dataKey={metric} stroke="#8884d8" strokeWidth={2} />
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
            <Bar dataKey={metric} fill="#82ca9d" />
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
            <Scatter name="Data Points" data={data} fill="#ff7300" />
          </ScatterChart>
        </ResponsiveContainer>
      );
    }

    return null;
  };

  return (
    <div className="App">
      <h1>🧠 Ask SQL with Gemini</h1>
      <input
        type="text"
        placeholder="e.g., Top 5 products by clicks, Avg sales per day"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />
      <button onClick={handleAsk} disabled={loading}>
        {loading ? "Thinking..." : "Ask"}
      </button>

      {result && (
        <div className="result">
          <h3>✅ Generated SQL</h3>
          <pre className="sql-block">{result.sql}</pre>

          <h3>📊 Query Result</h3>
          <div className="meta">
            <p>{result.data.length} rows returned in {duration}ms</p>
            <button onClick={downloadCSV}>⬇️ Download CSV</button>
          </div>

          {renderChart() && (
            <div className="chart">
              <h4>📈 Auto-Detected Visualization</h4>
              {renderChart()}
            </div>
          )}

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
      )}

      {error && (
        <div className="error">
          <h3>❌ {error.error}</h3>
          <p>{error.detail}</p>
          <p>🛠️ Try rephrasing your question or checking column/table names.</p>
        </div>
      )}
    </div>
  );
}

export default App;
