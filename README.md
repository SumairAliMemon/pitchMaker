# Magic Link Authentication App

A beautiful authentication system built with Next.js, Tailwind CSS, and Supabase magic link authentication.

## Features

- 🔐 **Magic Link Authentication** - No passwords needed, just secure email links
- ✨ **Beautiful UI** - Clean, modern design with smooth animations
- 🛡️ **Secure** - Built with Supabase's enterprise-grade authentication
- 📱 **Responsive** - Works perfectly on all devices
- 🚀 **Fast** - Built with Next.js 15 and optimized for performance

## Getting Started

### 1. Clone and Install

```bash
npm install
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy your project URL and anon key from the API settings
3. Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Configure Authentication

In your Supabase dashboard:

1. Go to **Authentication** → **Settings**
2. Add your site URL to **Site URL**: `http://localhost:3000`
3. Add redirect URLs to **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `https://yourdomain.com/auth/callback` (for production)

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app!

## Project Structure

```
src/
├── app/
│   ├── auth/
│   │   ├── callback/
│   │   │   └── route.ts          # Handle magic link authentication
│   │   └── auth-code-error/
│   │       └── page.tsx          # Authentication error page
│   ├── dashboard/
│   │   └── page.tsx              # Protected dashboard page
│   ├── login/
│   │   └── page.tsx              # Login page
│   ├── signup/
│   │   └── page.tsx              # Signup page
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── lib/
│   └── supabase.ts               # Supabase client configuration
└── middleware.ts                 # Authentication middleware
```

## How It Works

1. **Landing Page** (`/`) - Beautiful intro with links to login/signup
2. **Authentication** - Users enter their email and receive a magic link
3. **Magic Link** - Clicking the link authenticates and redirects to dashboard
4. **Dashboard** - Protected page showing user information
5. **Middleware** - Handles authentication redirects automatically

## Key Files

- **`src/lib/supabase.ts`** - Supabase client setup
- **`src/middleware.ts`** - Protects routes and handles redirects
- **`src/app/auth/callback/route.ts`** - Handles magic link authentication
- **Login/Signup Pages** - Beautiful forms with magic link sending

## Styling

The app uses Tailwind CSS with:
- Clean white backgrounds with subtle gradients
- Rounded corners (rounded-2xl, rounded-3xl)
- Beautiful shadows and borders
- Smooth hover animations
- Responsive design for all screen sizes

## Deployment

1. Deploy to Vercel, Netlify, or your preferred platform
2. Update your Supabase redirect URLs with your production domain
3. Update your environment variables in your deployment platform

## Technologies Used

- **Next.js 15** - React framework with App Router
- **Supabase** - Backend as a service with authentication
- **Tailwind CSS** - Utility-first CSS framework
- **TypeScript** - Type-safe JavaScript
- **Lucide React** - Beautiful icons

## License

MIT License - feel free to use this project for your own applications!
"# pitchMaker" 
"# pitchMaker" 
