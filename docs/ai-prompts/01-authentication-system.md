# XeroPulse Authentication System - Component Prompt

**Component:** Authentication & Session Management
**Dependencies:** Supabase Auth, Next.js 15 App Router
**Estimated Time:** 2-3 hours

---

## GOAL

Build a secure authentication system with login, password reset, and session management for XeroPulse using Supabase Auth and Next.js 15.

---

## VISUAL DESIGN

**Login Page Style:**
- Centered card layout on off-white background (#F8FAFC)
- White card with subtle shadow (shadow-lg)
- Max width: 400px
- Vertical centering: min-h-screen flex items-center justify-center

**Color Palette:**
- Primary Blue: #1E3A8A (buttons, links)
- Error Red: #DC2626 (error messages)
- Text Gray: #64748B (body text)
- Background: #F8FAFC (page background)

**Typography:**
- Logo: Inter font, text-2xl, font-bold
- Headings: Inter font, text-xl, font-semibold
- Body: System font, text-sm

---

## STEP-BY-STEP INSTRUCTIONS

### 1. Create Login Page (`/app/(auth)/login/page.tsx`)

**Layout Structure:**
```
┌─────────────────────────────────┐
│                                 │
│    [XeroPulse Logo & Icon]     │
│                                 │
│    Welcome Back                 │
│    Sign in to your account      │
│                                 │
│    [Email Input Field]          │
│    [Password Input Field]       │
│                                 │
│    [Forgot Password?] ───────→  │
│                                 │
│    [Sign In Button - Full Width]│
│                                 │
│    [Error Message Area]         │
│                                 │
└─────────────────────────────────┘
```

**Input Fields:**
- Email: type="email", placeholder="you@example.com", required, autofocus
- Password: type="password", placeholder="Enter your password", required, minLength={8}

**Button States:**
- Default: bg-primary (#1E3A8A), white text, hover:bg-blue-800
- Loading: Show spinner icon (lucide-react Loader2), button disabled, text: "Signing in..."
- Disabled: opacity-50, cursor-not-allowed

**Error Display:**
- Show below Sign In button
- Red text (#DC2626), text-sm
- Common errors:
  - "Invalid email or password"
  - "Your account has been locked. Please contact support."
  - "Network error. Please check your connection."

**Success Flow:**
1. On successful login, fetch user role from Supabase `users` table
2. Redirect to first authorized dashboard: `/dashboards/${firstDashboardId}`

### 2. Create Password Reset Request Page (`/app/(auth)/reset-password/page.tsx`)

**Layout:**
```
┌─────────────────────────────────┐
│    [Back to Login Link]         │
│                                 │
│    Reset Your Password          │
│    Enter your email address     │
│                                 │
│    [Email Input Field]          │
│                                 │
│    [Send Reset Link Button]     │
│                                 │
│    [Success Message Area]       │
└─────────────────────────────────┘
```

**Success Message:**
- Green background (#10B98110), green border, green text
- "Check your email for a password reset link. The link will expire in 1 hour."

### 3. Create Update Password Page (`/app/(auth)/update-password/page.tsx`)

**Accessed via:** Magic link from reset password email

**Layout:**
```
┌─────────────────────────────────┐
│    Set New Password             │
│                                 │
│    [New Password Input]         │
│    [Confirm Password Input]     │
│                                 │
│    Password Requirements:       │
│    ✓ At least 10 characters     │
│    ✓ One uppercase letter       │
│    ✓ One lowercase letter       │
│    ✓ One number                 │
│    ✓ One special character      │
│                                 │
│    [Update Password Button]     │
└─────────────────────────────────┘
```

**Password Validation:**
- Real-time validation as user types
- Show checkmarks (green) or X marks (red) next to each requirement
- Confirm password must match new password
- Show error if passwords don't match

**Success Flow:**
- Show success toast: "Password updated successfully"
- Redirect to `/login` after 2 seconds

### 4. Create Supabase Client Utilities

**File: `/lib/supabase/client.ts`**
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**File: `/lib/supabase/server.ts`**
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}
```

### 5. Create Authentication Helper Functions

**File: `/lib/auth.ts`**
```typescript
import { createClient } from '@/lib/supabase/client'

export async function signIn(email: string, password: string) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error

  // Fetch user role
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('id', data.user.id)
    .single()

  if (userError) throw userError

  return { ...data, role: userData.role }
}

export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function resetPassword(email: string) {
  const supabase = createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/update-password`,
  })

  if (error) throw error
}

export async function updatePassword(newPassword: string) {
  const supabase = createClient()

  const { error } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (error) throw error
}
```

### 6. Create Authentication Middleware

**File: `/middleware.ts`**
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // Protect dashboard and admin routes
  if (!session && (request.nextUrl.pathname.startsWith('/dashboards') ||
                   request.nextUrl.pathname.startsWith('/admin'))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect to dashboards if already logged in and trying to access login
  if (session && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboards', request.url))
  }

  return response
}

export const config = {
  matcher: ['/dashboards/:path*', '/admin/:path*', '/login']
}
```

---

## CODE EXAMPLES

### Login Form with React Hook Form
```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { role } = await signIn(email, password)

      // Redirect based on role
      const firstDashboard = getFirstDashboardForRole(role)
      router.push(`/dashboards/${firstDashboard}`)
    } catch (err: any) {
      setError(err.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary">XeroPulse</h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          <div className="text-right">
            <a href="/reset-password" className="text-sm text-primary hover:underline">
              Forgot password?
            </a>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  )
}
```

---

## CONSTRAINTS

### ✅ DO:
- Use Supabase Auth for all authentication operations
- Store session tokens in HTTP-only cookies (Supabase handles this)
- Validate email format before submission
- Show loading states during async operations
- Clear error messages on new form submission
- Use server-side session validation in middleware

### ❌ DO NOT:
- Store passwords in localStorage or sessionStorage
- Implement custom password hashing (Supabase handles this)
- Create a registration page (users added via Admin Panel only)
- Allow weak passwords (<10 characters)
- Skip session validation in middleware
- Hard-code redirect URLs (use environment variables)

---

## TESTING CHECKLIST

- ✅ Login with valid credentials succeeds
- ✅ Login with invalid credentials shows error
- ✅ Password reset email is sent
- ✅ Password reset link redirects to update password page
- ✅ New password meets requirements
- ✅ Session persists across page refreshes
- ✅ Logout clears session and redirects to login
- ✅ Middleware protects dashboard routes
- ✅ Already-logged-in users redirected away from login page

---

## DELIVERABLES

1. Login page with email/password form
2. Password reset request page
3. Update password page with validation
4. Supabase client utilities (client & server)
5. Authentication helper functions
6. Middleware for route protection
7. TypeScript interfaces for User and Session

**Estimated Lines of Code:** ~500-600 lines
**Key Files:** 7 files total
