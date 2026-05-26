// Lazy-init Gemini client singleton. Reads GEMINI_API_KEY from env at first call.
import { GoogleGenerativeAI } from '@google/generative-ai'

let _client: GoogleGenerativeAI | null = null

export function getGeminiClient(): GoogleGenerativeAI {
  if (_client === null) {
    _client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '')
  }
  return _client
}
