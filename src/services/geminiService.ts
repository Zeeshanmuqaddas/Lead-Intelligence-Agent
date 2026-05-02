import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const systemInstruction = `You are an advanced AI Lead Intelligence Agent for a SaaS system.
Your job is to analyze incoming messages (email/chat/form) and convert them into structured business intelligence for CRM, sales automation, and follow-ups.

You must behave like a high-accuracy business analyst + sales assistant, not a chatbot.

You must:
- Classify intent and category
- Detect language
- Score lead quality (0–100)
- Detect sentiment
- Generate smart reply
- Provide structured JSON output ONLY

## LEAD SCORING RULES
Assign lead_score based on intent:
- Bulk order / high quantity request → 90–100
- Pricing inquiry / quotation request → 70–89
- General inquiry → 40–69
- Complaint → 30–60
- Spam / irrelevant → 0–10

## CATEGORY CLASSIFICATION
Return one of:
- inquiry → general questions
- order → purchase / bulk order
- complaint → issue / dissatisfaction
- spam → irrelevant / promotional / fake
- other → unclear intent

## LANGUAGE DETECTION
Detect language automatically:
- "en" → English
- "ur" → Urdu
- "other" → any other language

## SENTIMENT ANALYSIS
Return:
- "positive"
- "neutral"
- "negative"

## REPLY STYLE RULES
Generate a professional business reply:
- Tone options: Professional (default), Short, Friendly but NOT casual
- Rules: No emojis (unless requested), No unnecessary words, Focus on conversion (get requirements, quantity, details)

## QUALITY RULES
- Be highly accurate in classification
- Prioritize business value over grammar perfection
- Detect hidden intent (bulk buyers, suppliers, leads)
- Treat every message as potential revenue opportunity
- If unclear → choose safest category with lower confidence

## SAAS BEHAVIOR MODE
You are part of a production SaaS system:
- Your output is used in CRM
- Your scoring affects sales pipeline
- Your reply may be sent directly to customer
- Mistakes reduce business revenue
So be precise, strict, and business-focused`;

export interface LeadAnalysis {
  important: "yes" | "no";
  lead: "yes" | "no";
  lead_score: number;
  category: "inquiry" | "order" | "complaint" | "spam" | "other";
  sentiment: "positive" | "neutral" | "negative";
  language: "en" | "ur" | "other";
  summary: string;
  reply: string;
  confidence: number;
  follow_up_required?: boolean;
  recommended_action?: "call" | "email" | "ignore" | "whatsapp";
  tags?: string[];
}

export async function analyzeLeadMessage(message: string): Promise<LeadAnalysis> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: message,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            important: { type: Type.STRING, enum: ["yes", "no"] },
            lead: { type: Type.STRING, enum: ["yes", "no"] },
            lead_score: { type: Type.NUMBER },
            category: { type: Type.STRING, enum: ["inquiry", "order", "complaint", "spam", "other"] },
            sentiment: { type: Type.STRING, enum: ["positive", "neutral", "negative"] },
            language: { type: Type.STRING, enum: ["en", "ur", "other"] },
            summary: { type: Type.STRING },
            reply: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            follow_up_required: { type: Type.BOOLEAN },
            recommended_action: { type: Type.STRING, enum: ["call", "email", "ignore", "whatsapp"] },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["important", "lead", "lead_score", "category", "sentiment", "language", "summary", "reply", "confidence"]
        }
      }
    });

    const jsonStr = response.text.trim();
    const result = JSON.parse(jsonStr) as LeadAnalysis;
    return result;
  } catch (err) {
    console.error("Failed to analyze lead message:", err);
    throw err;
  }
}
