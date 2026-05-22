import { AnalyzeForm } from '@/components/AnalyzeForm'

export default function HomePage() {
  return (
    <main className="max-w-xl mx-auto p-8">
      <h1>FeelTrace</h1>
      <p>Paste a URL to analyze its UX signals</p>
      <AnalyzeForm />
    </main>
  )
}
