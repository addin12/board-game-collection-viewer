import SearchForm from '@/components/SearchForm'

export const metadata = {
  title: 'Board Game Collection Viewer',
}

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-100 mb-4">
          Board Game<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Collection Viewer</span>
        </h1>

        <p className="text-slate-400 text-lg mb-8">
          Enter your BoardGameGeek username to browse your collection and explore statistics
        </p>

        <SearchForm />

        <div className="mt-12 pt-8 border-t border-slate-700">
          <p className="text-sm text-slate-500">
            Powered by{' '}
            <a href="https://boardgamegeek.com" className="text-amber-400 hover:text-amber-300">
              BoardGameGeek
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}
