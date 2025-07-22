const { askGemini } = require('../gemini');

askGemini("Write SQL to find the product with the highest CPC.").then(console.log);
