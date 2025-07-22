const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function askGemini(prompt) {
  const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

module.exports = { askGemini };
