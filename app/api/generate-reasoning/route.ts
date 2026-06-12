import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Simple in-memory rate limiting map
// Maps IP address to request count and reset timestamp
const rateLimitMap = new Map<string, { count: number, resetTime: number }>();
const RATE_LIMIT_MAX = 5; // max 5 requests
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // per 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    // Start new window
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  
  if (record.count >= RATE_LIMIT_MAX) {
    return false; // Rate limit exceeded
  }
  
  record.count += 1;
  return true;
}

export async function POST(request: Request) {
  try {
    // 1. Basic Rate Limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown-ip';
    if (!checkRateLimit(ip)) {
      console.warn(`Rate limit exceeded for IP: ${ip}`);
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { 
      familyName, 
      hotspotCategory, 
      totalCo2, 
      totalEnergyCo2, 
      totalTransportCo2,
      logsSummary 
    } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your-gemini-api-key") {
      console.warn("GEMINI_API_KEY is not configured or is using the placeholder. Falling back to template reasoning.");
      return NextResponse.json({ reasoning: "" });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
You are the carbon intelligence engine for "ZeroRoute", a family-centric carbon reduction platform.
Analyze this weekly carbon footprint data for the family "${familyName}":
- Total CO₂ Footprint: ${totalCo2.toFixed(1)} kg CO₂
- Home Energy CO₂: ${totalEnergyCo2.toFixed(1)} kg CO₂
- Transport CO₂: ${totalTransportCo2.toFixed(1)} kg CO₂
- Primary Carbon Hotspot Category: ${hotspotCategory === 'energy' ? 'Home Energy (electricity, AC use, LPG)' : 'Transport (car travel, commutes)'}
- Activities details: ${JSON.stringify(logsSummary)}

Write a highly personalized, encouraging, and actionable reasoning/explanation (exactly 2 to 3 sentences long) for the family.
Highlight that their primary hotspot is ${hotspotCategory === 'energy' ? 'Home Energy' : 'Transport'}.
Include one contextually relevant, practical carbon reduction tip tailored to the Indian urban household context (e.g., using public transport like the metro/auto-rickshaws, setting AC to 24°C, switching to LEDs, or carpooling). 
Keep the tone warm, motivating, and collaborative. Do not use markdown bold/italic formatting.
`;

    const result = await model.generateContent(prompt);
    const reasoning = result.response.text().trim();

    return NextResponse.json({ reasoning });
  } catch (error: any) {
    console.error('Error generating AI reasoning:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
