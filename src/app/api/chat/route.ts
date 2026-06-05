import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json()

    if (!message) {
      return NextResponse.json({ error: 'No message provided' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey || apiKey === 'PASTE_YOUR_KEY_HERE') {
      return NextResponse.json({ error: 'AI Assistant is currently offline (API key missing)' }, { status: 500 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const systemPrompt = `
      You are "DairyFlow Assistant", a helpful AI for a dairy management platform.
      Your goal is to help the Admin (user) clarify doubts about their dairy operations.
      
      CRITICAL INSTRUCTION:
      The user wants to communicate in TELUGU. 
      - Always respond primarily in Telugu script.
      - You can use English for technical terms or numbers if necessary for clarity.
      - Be polite, professional, and supportive.
      - If you don't know something about specific user data, explain that you are an AI assistant and they should check their reports.
      
      About DairyFlow:
      - It manages Farmers, Milk Collection, Payments, Customers, and Inventory.
      - It supports Fat and SNF based rate calculation.
      - It generates 15-day passbooks for farmers.
      - It has an AI Ledger Uploader to read manual books.
    `
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      systemInstruction: systemPrompt
    })

    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: "Who are you?" }] },
        { role: 'model', parts: [{ text: "నేను డెయిరీఫ్లో అసిస్టెంట్‌ని (DairyFlow Assistant). మీ డెయిరీ కార్యకలాపాలలో మీకు సహాయం చేయడానికి నేను ఇక్కడ ఉన్నాను. మీరు నన్ను తెలుగులో ఏదైనా అడగవచ్చు." }] },
        ...(history || [])
      ],
      generationConfig: {
        maxOutputTokens: 1000,
      },
    })

    const result = await chat.sendMessage(message)
    const response = await result.response
    const text = response.text()

    return NextResponse.json({ text })

  } catch (error: any) {
    console.error('Chat API Error:', error)
    return NextResponse.json({ error: 'చాట్ చేయడంలో సమస్య ఏర్పడింది. దయచేసి మళ్ళీ ప్రయత్నించండి.' }, { status: 500 })
  }
}
