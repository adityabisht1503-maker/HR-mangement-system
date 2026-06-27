require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Create AI object
const genAI = new GoogleGenerativeAI(process.env.KEY);

const Ai = async(req, res) => {
  try {
    const { question } = req.body;
    
    if (!question) {
      return res.status(400).json({
        success: false,
        error: "Question is required"
      });
    }
    
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    const result = await model.generateContent(question);
    const answer = result.response.text();
    
    res.json({
      success: true,
      data: { answer }
    });

  } catch(error) {
    console.error("Error:", error.message);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
}

module.exports = { Ai }