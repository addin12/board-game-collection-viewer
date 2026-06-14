export default function Loading() {
  return (
    <main className="min-h-screen bg-slate-900 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="h-10 w-64 bg-slate-800 rounded animate-pulse mb-8" />

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-slate-800 rounded-lg p-4 border border-slate-700 animate-pulse h-24" />
          ))}
        </div>

        <div className="bg-slate-800 rounded-lg p-4 mb-6 border border-slate-700 animate-pulse h-20" />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-slate-800 rounded-lg overflow-hidden animate-pulse h-80 border border-slate-700" />
          ))}
        </div>
      </div>
    </main>
  )
}
