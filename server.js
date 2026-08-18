import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || process.env.VITE_SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || process.env.VITE_SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true' || process.env.VITE_SMTP_SECURE === 'true' || false,
  auth: {
    user: process.env.SMTP_USER || process.env.VITE_SMTP_USER,
    pass: process.env.SMTP_PASS || process.env.VITE_SMTP_PASS,
  },
});

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.PUBLIC_GEMINI_API_KEY || process.env.VITE_PUBLIC_GEMINI_API_KEY || process.env.EXPO_PUBLIC_GEMINI_API_KEY || '');

app.post('/api/chat', async (req, res) => {
  const { history, message } = req.body;
  
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: {
        role: "system",
        parts: [{ text: "You are an AI assistant for a hydroponic farming application called Aztec. You should be helpful, friendly, and knowledgeable about hydroponics, farming, crop management, and general topics. Answer general questions as well, but always be ready to help with farm-related queries." }]
      }
    });
    
    // Formatting history for Gemini: { role: "user" | "model", parts: [{ text: "..." }] }
    const formattedHistory = (history || []).map(msg => ({
      role: msg.isBot ? "model" : "user",
      parts: [{ text: msg.text }]
    }));

    const chat = model.startChat({
      history: formattedHistory
    });
    
    const result = await chat.sendMessage(message);
    const responseText = result.response.text();
    
    res.status(200).json({ success: true, text: responseText });
  } catch (error) {
    console.error('Error with Gemini API:', error);
    
    let errorMessage = 'Failed to get response from AI';
    if (error.message && error.message.includes('404')) {
      errorMessage = "Invalid API Key or Model. Please check your GEMINI_API_KEY in the .env file. It should start with 'AIzaSy'.";
    } else if (error.message && error.message.includes('400')) {
      errorMessage = "API key not valid or bad request. Please check your GEMINI_API_KEY in the .env file.";
    }

    res.status(500).json({ success: false, error: errorMessage });
  }
});

app.post('/api/feedback', async (req, res) => {
  const { name, email, subject, message, type } = req.body;
  
  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER || process.env.VITE_SMTP_USER,
      to: 'prithvis3804@gmail.com',
      subject: subject || `New Feedback from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nType: ${type || 'General'}\nSubject: ${subject || 'Feedback'}\n\nMessage:\n${message}`,
    });
    res.status(200).json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, error: 'Failed to send email' });
  }
});

const PORT = process.env.SERVER_PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
