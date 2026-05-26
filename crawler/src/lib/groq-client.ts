// Lazy-init Groq client singleton. Reads GROQ_API_KEY from env at first call.
import Groq from 'groq-sdk'

let _client: Groq | null = null

export function getGroqClient(): Groq {
  if (_client === null) {
    _client = new Groq({ apiKey: process.env.GROQ_API_KEY })
  }
  return _client
}
