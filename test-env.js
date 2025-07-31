// Quick test to verify environment variables are loaded
console.log('Environment Test:')
console.log('NEXT_PUBLIC_GEMINI_API_KEY:', process.env.NEXT_PUBLIC_GEMINI_API_KEY ? 'SET' : 'NOT SET')
console.log('Key length:', process.env.NEXT_PUBLIC_GEMINI_API_KEY?.length || 0)
console.log('First 10 chars:', process.env.NEXT_PUBLIC_GEMINI_API_KEY?.substring(0, 10) || 'NONE')
