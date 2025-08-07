const { GoogleGenAI } = require("@google/genai");
const {
  conceptExplanationPrompt,
  questionAnswerPrompt,
} = require("../utils/prompts");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const generateInterviewQuestions = async (req, res) => {
  try {
    const { role, experience, topicsToFocus, numberOfQuestions } = req.body;

    if (!role || !experience || !topicsToFocus || !numberOfQuestions) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const prompt = questionAnswerPrompt(
      role,
      experience,
      topicsToFocus,
      numberOfQuestions
    );

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: prompt,
    });

    let rawText = response.text;

    // clean it: remove ```json and ``` from the start and end
    const cleanedText = rawText
      .replace(/^```json\s*/, "") // remove ```json at the start
      .replace(/```$/, "") // remove ``` at the end
      .trim(); // remove extra whitespace

    // now safe to parse
    const data = JSON.parse(cleanedText);

    res.status(200).json({
      success: true,
      message: "Interview questions generated successfully",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to generate interview questions",
      error: error.message,
    });
  }
};

const generateConceptExplanation = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

    const prompt = conceptExplanationPrompt(question);

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: prompt,
    });

    let rawText = response.text;

    // clean it: remove ```json and ``` from the start and end
    const cleanedText = rawText
      .replace(/^```json\s*/, "") // remove ```json at the start
      .replace(/```$/, "") // remove ``` at the end
      .trim(); // remove extra whitespace

    const data = JSON.parse(cleanedText);
    res.status(200).json({
      success: true,
      message: "Concept explanation generated successfully",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to generate concept explanation",
      error: error.message,
    });
  }
};

module.exports = {
  generateInterviewQuestions,
  generateConceptExplanation,
};
