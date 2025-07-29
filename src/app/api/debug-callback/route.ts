import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin, pathname, href } = new URL(request.url)
  
  const debugInfo = {
    timestamp: new Date().toISOString(),
    request: {
      fullUrl: href,
      origin,
      pathname,
      searchParams: Object.fromEntries(searchParams.entries()),
      headers: Object.fromEntries(request.headers.entries()),
    },
    environment: {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '[PRESENT]' : '[MISSING]',
      NODE_ENV: process.env.NODE_ENV,
    }
  }

  return NextResponse.json(debugInfo, { 
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    }
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  
  const debugInfo = {
    timestamp: new Date().toISOString(),
    request: {
      url: request.url,
      body,
      headers: Object.fromEntries(request.headers.entries()),
    }
  }

  return NextResponse.json(debugInfo, { status: 200 })
}
