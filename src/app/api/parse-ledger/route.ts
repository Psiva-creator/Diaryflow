import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const image = formData.get('image') as File | null

    if (!image) {
      return NextResponse.json({ error: 'చిత్రం అందించబడలేదు (No image provided)' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey || apiKey === 'PASTE_YOUR_KEY_HERE') {
      return NextResponse.json({ error: 'AI అసిస్టెంట్ ప్రస్తుతం ఆఫ్‌లైన్‌లో ఉంది (API key missing)' }, { status: 500 })
    }

    // Initialize inside the handler to ensure process.env is ready
    const genAI = new GoogleGenerativeAI(apiKey)

    const bytes = await image.arrayBuffer()
    const imagePart = {
      inlineData: {
        data: Buffer.from(bytes).toString('base64'),
        mimeType: image.type,
      },
    }

    const prompt = `
      You are an expert at reading handwritten milk collection ledgers, specifically those written in Telugu script.
      Look at the image and extract the milk collection records into a JSON array.
      
      The ledger is written in Telugu. Please transcribe the farmer names carefully. 
      If the names are in Telugu script, provide the English transliteration (e.g., 'రాజేష్' -> 'Rajesh') for the farmerName field.
      
      For each record, extract:
      - farmerName: The name of the farmer (transliterated to English if in Telugu).
      - farmerId: If an ID number is visible, extract it. Otherwise, leave null.
      - qty: The quantity of milk in litres (number).
      - fat: The fat percentage (number).
      - water: The water percentage (number).
      - shift: Either "morning" or "evening". Look for headings or context in the ledger. Default to "morning" if unclear.

      Return ONLY a JSON array in this format:
      [
        { "farmerName": "Rajesh", "farmerId": "F001", "qty": 10.5, "fat": 4.2, "water": 0, "shift": "morning" },
        ...
      ]
      
      If a value is unreadable, use null for numbers or an empty string for text.
      Do not include any other text or markdown formatting in your response.
    `

    // We will try these models in order if one fails (e.g., 503 High Demand or 429 Quota)
    const modelsToTry = ['gemini-flash-latest', 'gemini-2.5-flash', 'gemini-flash-lite-latest']
    let text = ''
    let lastError: any = null

    for (const modelName of modelsToTry) {
      try {
        console.log(`Attempting to parse with model: ${modelName}`)
        const model = genAI.getGenerativeModel({ model: modelName })
        const result = await model.generateContent([prompt, imagePart])
        const response = await result.response
        text = response.text()
        console.log(`Success with model: ${modelName}`)
        break // Stop the loop if successful
      } catch (err: any) {
        console.warn(`Failed with model ${modelName}:`, err.message)
        lastError = err
      }
    }

    if (!text) {
      throw new Error(`All models failed. Last error: ${lastError?.message}`)
    }
    
    // Clean up the response in case the model included markdown blocks
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim()
    
    try {
      const data = JSON.parse(jsonString)
      return NextResponse.json({ data })
    } catch (parseError) {
      console.error('Failed to parse AI response:', text)
      return NextResponse.json({ error: 'AI చెల్లని JSON ఫార్మాట్‌ను తిరిగి ఇచ్చింది', raw: text }, { status: 500 })
    }

  } catch (error: any) {
    console.error('Error parsing ledger:', error)
    return NextResponse.json({ error: 'లెడ్జర్‌ను ప్రాసెస్ చేయడంలో విఫలమైంది: ' + (error.message || '') }, { status: 500 })
  }
}
