const axios = require('axios');
require('dotenv').config();

async function listModels() {
  const res = await axios.get(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
  );
  res.data.models.forEach(m => {
    const gens = m.supportedGenerationMethods || m.supported_actions;
    if (gens.includes("generateContent")) console.log(m.name);
  });
}

listModels();
