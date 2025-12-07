import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
// Note: In a production app, API keys should not be exposed on the client.
// This is for hackathon/demo purposes.
const API_KEY = import.meta.env.VITE_GEMINI_API || "";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export interface Market {
  id: string;
  question: string;
  category: "Crypto" | "Sports" | "Politics" | "Tech";
  endDate: string;
  yesPool: number;
  noPool: number;
  resolved: boolean;
  outcome?: "YES" | "NO";
  imageUrl?: string;
}

export class PredictionService {
  /**
   * Generates prediction markets using Gemini AI based on real-world trends.
   */
  async generateMarkets(): Promise<Market[]> {
    if (!API_KEY) {
      console.warn("Gemini API Key missing. Returning mock data.");
      return this.getMockMarkets();
    }

    try {
      // 1. Prompt Gemini to act as a News Aggregator and Market Creator
      const prompt = `
                You are a Prediction Market Oracle.
                The current date is December 7, 2025.
                First, identify 5 trending, controversial, or high-interest real-world events happening in the near future (2026) across Crypto, Sports, Politics, and Tech.
                Focus on events with binary outcomes (Yes/No).
                
                For each event, generate a prediction market in this JSON format:
                [
                    {
                        "id": "unique_id_string",
                        "question": "Clear, specific Yes/No question?",
                        "category": "Crypto" | "Sports" | "Politics" | "Tech",
                        "endDate": "YYYY-MM-DD",
                        "yesPool": integer (1000-50000),
                        "noPool": integer (1000-50000),
                        "imageUrl": "https://source.unsplash.com/random/800x600/?keyword"
                    }
                ]
                
                Use real, current context for late 2025/2026. For example:
                - Crypto: Bitcoin price targets for 2026, Regulation changes.
                - Sports: 2026 World Cup qualifiers, major finals.
                - Politics: 2026 Midterms or global elections.
                - Tech: AGI milestones, Mars mission updates.

                Return ONLY the valid JSON array. No markdown, no explanations.
            `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Clean up markdown code blocks if present
      const jsonStr = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      const markets = JSON.parse(jsonStr);

      return markets.map((m: any) => ({ ...m, resolved: false }));
    } catch (error) {
      console.error("Failed to generate markets with AI:", error);
      return this.getMockMarkets();
    }
  }

  /**
   * Asks Gemini to resolve a market based on its knowledge or simulation.
   */
  async resolveMarket(question: string): Promise<"YES" | "NO"> {
    if (!API_KEY) return Math.random() > 0.5 ? "YES" : "NO";

    try {
      const prompt = `
                Act as an Oracle. The current date is December 7, 2025.
                Resolve this prediction market question: "${question}".
                If the event has happened, give the result.
                If it is in the future, simulate a realistic outcome based on current trends.
                Return ONLY the string "YES" or "NO".
            `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim().toUpperCase();

      return text.includes("YES") ? "YES" : "NO";
    } catch (error) {
      return "YES";
    }
  }

  private getMockMarkets(): Market[] {
    return [
      {
        id: "1",
        question: "Will Bitcoin surpass $200,000 by Q1 2026?",
        category: "Crypto",
        endDate: "2026-03-31",
        yesPool: 45000,
        noPool: 12000,
        resolved: false,
        imageUrl: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "2",
        question: "Will SpaceX land Starship on Mars in 2026?",
        category: "Tech",
        endDate: "2026-12-31",
        yesPool: 28000,
        noPool: 32000,
        resolved: false,
        imageUrl: "https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "3",
        question: "Will France win the 2026 World Cup?",
        category: "Sports",
        endDate: "2026-07-19",
        yesPool: 15000,
        noPool: 15000,
        resolved: false,
        imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80",
      },
    ];
  }
}

export const predictionService = new PredictionService();
