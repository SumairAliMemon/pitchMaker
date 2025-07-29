import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  return NextResponse.json({
    message: 'Auth callback test endpoint',
    url: request.url,
    searchParams: Object.fromEntries(searchParams.entries()),
    headers: Object.fromEntries(request.headers.entries()),
    timestamp: new Date().toISOString()
  })
}
