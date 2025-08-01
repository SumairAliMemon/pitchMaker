import { NextResponse } from 'next/server'

// Debug endpoint to check API key and environment
export async function GET() {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
    
    return NextResponse.json({
      environment: process.env.NODE_ENV,
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey?.length || 0,
      apiKeyPrefix: apiKey ? apiKey.substring(0, 15) + '...' : 'NOT_SET',
      apiKeyFull: apiKey || 'NOT_SET', // FULL API KEY EXPOSED FOR DEBUG
      timestamp: new Date().toISOString(),
      vercelRegion: process.env.VERCEL_REGION || 'local'
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Debug failed', 
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
