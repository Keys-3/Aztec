import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

const apiKey = 'AQ.Ab8RN6KINReXuRO_wTWHEbe2aLWe05m6Fj_VnQg4nP5PVJKTZw';
async function listModels() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    const names = data.models.map(m => m.name);
    fs.writeFileSync('models.json', JSON.stringify(names, null, 2));
    console.log("Saved to models.json");
  } catch (err) {
    console.error(err);
  }
}
listModels();
