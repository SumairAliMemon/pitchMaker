import { NextResponse } from 'next/server'

// This endpoint is disabled for security reasons
export async function POST() {
  return NextResponse.json({ 
    error: 'This endpoint is disabled. Please use the authenticated /api/generate-pitch endpoint.' 
  }, { status: 403 })
}