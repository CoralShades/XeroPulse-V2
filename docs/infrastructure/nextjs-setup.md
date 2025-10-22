# Next.js Project Setup - XeroPulse

## Overview

This document describes the Next.js 15 project setup for XeroPulse, including local development configuration, deployment setup, and architecture decisions.

**Project initialized:** October 2025 (Story 1.0)
**Template used:** Next.js with Supabase (via `npx create-next-app --example with-supabase`)

---

## Tech Stack

- **Framework:** Next.js 15+ (App Router)
- **Language:** TypeScript 5.0+ (strict mode enabled)
- **Styling:** Tailwind CSS 3.4+
- **UI Components:** shadcn/ui v4 (with Radix UI primitives)
- **Authentication:** Supabase Auth
- **Database:** Supabase PostgreSQL
- **State Management:** React Server Components + Context API
- **Additional Libraries:**
  - `lucide-react` - Icon library
  - `date-fns` - Date utilities
  - `zustand` - Client-side state management
  - `next-themes` - Dark mode support

---

## Project Structure

```
XeroPulse/
├── app/                          # Next.js App Router pages
│   ├── (auth)/                   # Auth route group (future)
│   │   ├── login/
│   │   ├── signup/
│   │   └── reset-password/
│   ├── (portal)/                 # Protected portal routes (future)
│   │   ├── dashboards/
│   │   └── admin/
│   ├── auth/                     # Current auth routes from template
│   │   ├── login/page.tsx
│   │   ├── sign-up/page.tsx
│   │   └── forgot-password/page.tsx
│   ├── protected/                # Template protected route example
│   ├── layout.tsx                # Root layout with metadata
│   ├── globals.css               # Global styles
│   └── page.tsx                  # Home page
├── components/
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── auth/                     # Auth components (future)
│   ├── dashboard/                # Dashboard components (future)
│   └── layout/                   # Layout components (future)
├── lib/
│   ├── supabase/                 # Supabase client setup
│   │   ├── client.ts             # Client-side Supabase client
│   │   ├── server.ts             # Server-side Supabase client
│   │   └── middleware.ts         # Auth middleware
│   ├── types/                    # TypeScript type definitions
│   │   ├── index.ts              # Central type exports
│   │   ├── auth.types.ts         # Auth & user types
│   │   └── database.types.ts     # Supabase database types
│   └── utils.ts                  # Utility functions (cn, etc.)
├── docs/                         # Project documentation
├── middleware.ts                 # Next.js middleware (auth)
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
├── next.config.ts                # Next.js configuration
├── components.json               # shadcn/ui configuration
└── package.json                  # Dependencies

```

---

## Local Development Setup

### Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- npm 9+ (comes with Node.js)
- Git 2.30+
- Supabase account with project created

### Step 1: Clone Repository

```bash
git clone https://github.com/[your-org]/XeroPulse.git
cd XeroPulse
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

Create `.env.local` file in project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Metabase Configuration (for Story 1.9)
# METABASE_SITE_URL=https://metabase.xeropulse.com
# METABASE_SECRET_KEY=your-embedding-secret
```

**Important Security Notes:**
- ✅ `NEXT_PUBLIC_*` variables are exposed to the browser
- ✅ Use `NEXT_PUBLIC_` prefix ONLY for: `SUPABASE_URL` and `SUPABASE_ANON_KEY`
- ❌ **NEVER** add `NEXT_PUBLIC_` prefix to `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `.env.local` is in `.gitignore` and should never be committed

**Getting Supabase Credentials:**
1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to Settings → API
4. Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
5. Copy `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Copy `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### Step 4: Run Development Server

```bash
npm run dev
```

Server starts at: **http://localhost:3000**

**Hot Reload Enabled:** Changes to code automatically refresh the browser.

### Step 5: Verify Setup

1. Open **http://localhost:3000** in browser
2. Navigate to `/auth/login`
3. Test authentication flow (create test account)
4. Check browser console for errors (should be none)

---

## Available Scripts

```bash
# Development
npm run dev          # Start dev server with Turbopack (fast!)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npx tsc --noEmit     # TypeScript type checking

# Supabase (future)
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed development data
npm run db:reset     # Reset local database
```

---

## Configuration Details

### TypeScript Configuration

**Strict Mode Enabled** (`tsconfig.json`):
- `strict: true` - All strict type checking enabled
- `noUncheckedIndexedAccess: true` - Array/object index access returns `T | undefined`
- `noUnusedLocals: true` - Error on unused local variables
- `noUnusedParameters: true` - Error on unused function parameters
- `noFallthroughCasesInSwitch: true` - Error on missing break in switch cases

**Path Aliases:**
- `@/*` → Project root
- `@/components/*` → `components/`
- `@/lib/*` → `lib/`
- `@/app/*` → `app/`

**Usage Example:**
```typescript
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { User } from '@/lib/types';
```

### Tailwind CSS Configuration

**XeroPulse Brand Colors:**
```typescript
// tailwind.config.ts
colors: {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',  // XeroPulse Blue
    600: '#2563eb',
    700: '#1d4ed8',
  },
  secondary: {
    50: '#f9fafb',
    100: '#f3f4f6',
    500: '#6b7280',  // Neutral Gray
    600: '#4b5563',
    700: '#374151',
  },
  success: '#10b981',
  error: '#ef4444',
}
```

**Font Family:**
- **Primary:** Inter (Google Fonts)
- **Fallback:** system-ui, sans-serif

### shadcn/ui Configuration

**Configuration File:** `components.json`
- **Style:** new-york
- **Base Color:** neutral
- **CSS Variables:** Enabled (for theme switching)
- **Icon Library:** lucide-react
- **React Server Components (RSC):** Enabled

**Installed Components:**
- badge, button, card, checkbox, dropdown-menu, input, label

**Adding New Components:**
```bash
npx shadcn@latest add [component-name]
```

---

## Deployment

### Vercel Deployment (Production)

**Prerequisites:**
- Vercel account connected to GitHub
- Supabase project configured

**Deployment Steps:**

1. **Push to GitHub:**
```bash
git add .
git commit -m "Initial Next.js setup"
git push origin main
```

2. **Import Project to Vercel:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Import Project"
   - Select XeroPulse repository
   - Configure environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `NEXT_PUBLIC_APP_URL` (set to Vercel URL)
   - Click "Deploy"

3. **Configure Supabase Callback URLs:**
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Add redirect URLs:
     - `http://localhost:3000/auth/callback` (local dev)
     - `https://your-app.vercel.app/auth/callback` (production)
     - `https://*.vercel.app/auth/callback` (preview deployments)

4. **Verify Deployment:**
   - Access production URL
   - Test authentication flow
   - Check Vercel logs for errors

**Auto-Deployment:**
- Every push to `main` triggers production deployment
- Pull requests create preview deployments automatically

---

## Supabase Integration

### Authentication Flow

1. User visits `/auth/login` or `/auth/sign-up`
2. User submits credentials
3. Next.js calls Supabase Auth API
4. On success: Session cookie set (httpOnly, secure)
5. Middleware checks session on protected routes
6. Redirect to dashboard if authenticated

**Template Auth Pages:**
- `/auth/login` - Login page
- `/auth/sign-up` - Signup page
- `/auth/forgot-password` - Password reset
- `/auth/update-password` - Update password
- `/auth/confirm` - Email confirmation callback

### Supabase Clients

**Client-side (Browser):**
```typescript
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();
const { data, error } = await supabase.auth.getUser();
```

**Server-side (API Routes, Server Components):**
```typescript
import { createClient } from '@/lib/supabase/server';

const supabase = await createClient();
const { data, error } = await supabase.auth.getUser();
```

**Middleware:**
```typescript
// middleware.ts automatically checks auth on protected routes
// Configure protected routes in middleware.ts
```

---

## Testing

### Manual Testing Checklist

**Authentication:**
- [ ] Signup creates user in Supabase
- [ ] Login redirects to dashboard
- [ ] Logout clears session
- [ ] Protected routes redirect to login when not authenticated
- [ ] Session persists across page refreshes

**TypeScript:**
- [ ] `npx tsc --noEmit` shows no errors
- [ ] Path aliases (`@/...`) work in imports
- [ ] Strict mode catches type errors

**Styling:**
- [ ] Tailwind classes work
- [ ] Brand colors (`bg-primary-500`) render correctly
- [ ] Inter font loads and displays
- [ ] Dark mode toggle works (if implemented)

**Build:**
- [ ] `npm run build` completes without errors
- [ ] Production build size is reasonable (<1MB JS)
- [ ] `npm run start` serves production build

---

## Troubleshooting

### Common Issues

**Issue: "Supabase client error" in console**
- **Cause:** Invalid Supabase credentials
- **Fix:** Verify `.env.local` has correct `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Issue: "Invalid callback URL" during auth**
- **Cause:** Callback URL not whitelisted in Supabase
- **Fix:** Add `http://localhost:3000/auth/callback` to Supabase Dashboard → Authentication → URL Configuration

**Issue: TypeScript errors about `@/...` imports**
- **Cause:** tsconfig.json path aliases not configured
- **Fix:** Verify `tsconfig.json` has `baseUrl: "."` and correct `paths` mapping

**Issue: Tailwind classes not working**
- **Cause:** Tailwind config not detecting files
- **Fix:** Check `tailwind.config.ts` `content` array includes `./app/**/*.{js,ts,jsx,tsx}`

**Issue: Hot reload not working**
- **Cause:** Turbopack cache issue
- **Fix:** Delete `.next/` directory and restart dev server

---

## Next Steps

After completing Story 1.0 setup:

1. **Story 1.8:** Configure Supabase Auth backend with RLS policies
2. **Story 1.9:** Embed Metabase dashboards in Next.js portal
3. **Epic 2:** Build complete dashboard suite

---

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

---

**Document Version:** 1.0
**Last Updated:** October 2025
**Maintained By:** XeroPulse Development Team
