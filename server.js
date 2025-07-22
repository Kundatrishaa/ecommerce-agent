require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const port = 3000;


app.use(cors({
  origin: "http://localhost:3001"
}));

app.use(bodyParser.json());


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


const db = new sqlite3.Database("./db/ecommerce.db");


app.post("/query", async (req, res) => {
  const userQuestion = req.body.question;
  if (!userQuestion) {
    return res.status(400).json({ error: "Missing 'question' in request body" });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    
    const context = `
You are a SQLite SQL expert.

ONLY use these tables and columns:

Table: ad_sales
- date, item_id, ad_sales, impressions, ad_spend, clicks, units_sold

Table: total_sales
- date, item_id, total_sales, total_units_ordered

Table: eligibility
- eligibility_datetime_utc, item_id, eligibility, message

Your task:
- Return ONLY valid SQLite queries
- DO NOT add explanations, markdown, or notes
- Return clean raw SQL starting with SELECT, WITH, or INSERT

Question: ${userQuestion}
    `.trim();

    const result = await model.generateContent(context);
    const response = await result.response;
    const rawText = response.text();

    console.log("🧠 Gemini raw response:\n", rawText);

    
    let sqlQuery;
    const match = rawText.match(/```sql\s*([\s\S]*?)```/i);
    if (match) {
      sqlQuery = match[1].trim();
    } else {
      const lines = rawText.split("\n").map(line => line.trim());
      const startIndex = lines.findIndex(line =>
        line.toLowerCase().startsWith("select") || line.toLowerCase().startsWith("with")
      );
      if (startIndex === -1) {
        throw new Error("Failed to extract valid SQL query from Gemini output.");
      }
      sqlQuery = lines.slice(startIndex).join(" ");
    }

    console.log("✅ Generated SQL:", sqlQuery);

    
    db.all(sqlQuery, [], (err, rows) => {
      if (err) {
        console.error("❌ SQLite Error:", err.message);
        return res.status(500).json({
          error: "SQL Error",
          detail: err.message,
          sql: sqlQuery
        });
      }
      res.json({ sql: sqlQuery, data: rows });
    });

  } catch (err) {
    console.error("❌ Gemini Error:", err);
    res.status(500).json({
      error: "Gemini Error",
      detail: err.message
    });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
