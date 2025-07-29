import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  
  // This will help us see what URLs are being generated
  const baseUrl = url.origin
  const redirectUrl = `${baseUrl}/auth/callback`
  
  return NextResponse.json({
    message: 'Debug information for Supabase configuration',
    currentUrl: request.url,
    baseUrl,
    redirectUrl,
    expectedSupabaseConfig: {
      siteUrl: 'https://pitch-maker.vercel.app',
      redirectUrls: [
        'http://localhost:3000/auth/callback',
        'https://pitch-maker.vercel.app/auth/callback'
      ]
    },
    instructions: [
      '1. Go to Supabase Dashboard → Authentication → URL Configuration',
      '2. Set Site URL to: https://pitch-maker.vercel.app',
      '3. Add both redirect URLs above',
      '4. Save the configuration',
      '5. Test with /auth-test page'
    ]
  })
}
