'use client'

import Link from 'next/link'

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  return (
    <main className="min-h-screen bg-slate-900 px-4 py-8 flex items-center justify-center">
      <div className="max-w-lg text-center">
        <div className="bg-slate-800 border border-red-600/30 rounded-lg p-8 mb-6">
          <h1 className="text-2xl font-bold text-red-400 mb-2">Failed to Load Collection</h1>
          <p className="text-slate-300 mb-2">{error.message || 'Unknown error occurred'}</p>

          {error.digest && (
            <p className="text-xs text-slate-500 mb-4 font-mono">Error ID: {error.digest}</p>
          )}

          {error.message.includes('User not found') && (
            <p className="text-sm text-slate-400">Please check the username and try again.</p>
          )}

          {error.message.includes('temporarily unavailable') && (
            <p className="text-sm text-slate-400">
              BoardGameGeek API is experiencing issues. Please try again in a few moments.
            </p>
          )}

          {!error.message && (
            <p className="text-sm text-slate-400">
              An unexpected error occurred. Check the browser console for details.
            </p>
          )}
        </div>

        <div className="flex gap-3 justify-center flex-wrap">
          <button
            onClick={() => unstable_retry()}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-amber-50 font-semibold rounded-lg transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-100 font-semibold rounded-lg transition-colors"
          >
            Back Home
          </Link>
        </div>
      </div>
    </main>
  )
}
