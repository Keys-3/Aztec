import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = 'AQ.Ab8RN6KINReXuRO_wTWHEbe2aLWe05m6Fj_VnQg4nP5PVJKTZw';
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

async function test() {
  try {
    const result = await model.generateContent("Hello!");
    console.log(result.response.text());
  } catch (error) {
    console.error(error.message);
  }
}
test();
