import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function listModels() {
  try {
    console.log('Using Key:', process.env.GEMINI_API_KEY?.substring(0, 8) + '...');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    // We can't easily list models with the simple SDK, but we can try a basic generation
    const result = await model.generateContent('hi');
    console.log('Success with gemini-1.5-flash');
  } catch (e) {
    console.error('Failed with gemini-1.5-flash:', e.message);
    
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const result = await model.generateContent('hi');
        console.log('Success with gemini-pro (legacy)');
    } catch (e2) {
        console.error('Failed with gemini-pro:', e2.message);
    }
  }
}

listModels();
