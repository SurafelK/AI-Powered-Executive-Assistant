import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = 'AIzaSyDaSupt3TwoMozaqtlL3ezzjHYGK5fmeA0' ; // Replace with your actual API key

if (!apiKey) {
  console.error("GEMINI_API_KEY is not defined.");
  throw new Error("GEMINI_API_KEY is not defined.");
}

const genAI = new GoogleGenerativeAI(apiKey);

export const getGeminiResponse = async (subject:string, body:string, from:string) => {
  try {
    console.log(body)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    const prompt = `Subject: ${subject}\nBody: from ${from}:\n ${body}\n\nPlease provide a professional response to the message above.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text()
    console.log(text);

    return response.text() || "No response received.";
  } catch (error) {
    console.error("Gemini API error:", error);
    return "An error occurred while generating the response.";
  }
};

