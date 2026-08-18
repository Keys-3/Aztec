import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = 'AQ.Ab8RN6KINReXuRO_wTWHEbe2aLWe05m6Fj_VnQg4nP5PVJKTZw';
// Note: GoogleGenerativeAI sdk might not have a direct listModels method, we can just use fetch.
async function listModels() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(err);
  }
}
listModels();
