# E-commerce AI Agent — Natural Language to SQL

This project is an intelligent AI assistant that can understand natural language questions about your e-commerce data, convert them into SQL queries, execute them on a SQLite database, and return clean, human-readable results (with charts and downloadable CSVs).

## Overview

You can ask questions like:

- What is my total sales?
- Show total sales over time.
- Which products had the highest clicks?
- What is my return on ad spend (RoAS)?
- Which items are ineligible and why?

The system understands your question, generates a SQL query using Google Gemini, runs it on the data, and returns the result with optional visualizations.

---

## Tech Stack

- React (Frontend)
- Express + Node.js (Backend)
- Google Gemini 1.5 Flash (LLM API)
- SQLite (Database)
- Recharts (Chart rendering library)

---

## Dataset

The following CSVs were mapped into a SQLite database:

1. **ad_sales**  
   Columns: date, item_id, ad_sales, impressions, ad_spend, clicks, units_sold

2. **total_sales**  
   Columns: date, item_id, total_sales, total_units_ordered

3. **eligibility**  
   Columns: eligibility_datetime_utc, item_id, eligibility, message

---

## Features

- Converts any valid e-commerce question to a correct SQL query
- Executes query on SQLite DB
- Displays results in a clean HTML table
- Auto-generates relevant charts for supported questions
- Provides query metadata (execution time, row count)
- Allows CSV download of results
- Handles Gemini hallucinations gracefully with retry suggestions
- Clean and responsive UI

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Kundatrishaa/ecommerce-agent.git
cd ecommerce-agent
```

### 2. Install backend dependencies

```bash
npm install
```

### Create a .env file and add your Gemini API key

```bash
GEMINI_API_KEY=your google gemini api key
```

### 4. Start the backend

```bash
node server.js
```
Backend will run on: http://localhost:3000

### 5. Start the frontend

```bash
cd client
npm install
npm start
```
Frontend will run on: http://localhost:3001

### Example Questions You Can Try

- Total sales over time
- Top 5 items by total units ordered
- Ad spend trends over time
- Which products are ineligible?
- RoAS (Return on Ad Spend)
- Average ad spend per day
- Click-through rate by item
- Products with zero ad spend
- Items with low sales messages

### Demo Video

- The final submission includes a demo video where:
- API requests are made live
- Gemini-generated SQL is shown
- Results are rendered in tables
- Charts are rendered automatically where relevant

### Credits

Created by Kunda Basetty Thrisha for the Anarix GenAI Intern Assignment

Mentors: Thiruvikraman Anand, Ben Geo Abraham
