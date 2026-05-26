export function GraphAbsent() {
  return (
    <div className="bg-zinc-100 rounded-lg p-6 flex flex-col items-center justify-center min-h-[200px]">
      <h3 className="text-2xl font-semibold mb-3 text-center">
        Causality graph not available
      </h3>
      <p className="text-base text-center text-zinc-500 max-w-md">
        The analysis did not find enough high-confidence causal relationships to render a graph
        reliably. Individual issue details are above.
      </p>
    </div>
  )
}
