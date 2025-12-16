import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { ErrorBoundary } from "react-error-boundary";
import './index.css'
import App from './App.jsx'

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="p-4 flex flex-col items-center justify-center min-h-screen text-center">
      <h2 className="text-xl font-bold mb-2">Oops! Ada masalah.</h2>
      <pre className="text-xs bg-gray-100 p-2 rounded mb-4 text-left overflow-auto max-w-full">
        {error.message}
      </pre>
      <button onClick={resetErrorBoundary} className="bg-blue-500 text-white px-4 py-2 rounded">
        Coba Lagi
      </button>
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <div style={{ padding: 20, border: '5px solid blue' }}>
      <h1>SYSTEM CHECK: REACT IS ALIVE (V3)</h1>
      <p>If you see this, main.jsx is working.</p>
    </div>
    {/* 
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <App />
      <Analytics />
      <SpeedInsights />
    </ErrorBoundary>
    */}
  </StrictMode>,
)
