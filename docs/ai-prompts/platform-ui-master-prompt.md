# XeroPulse Web Portal - Platform UI/UX Generation

**Generated:** October 15, 2025
**For:** v0.dev, Lovable.ai, or similar AI UI generation tools
**Scope:** Platform UI/UX (Authentication, Navigation, Layout, User Management)
**Excludes:** Dashboard visualizations (handled by embedded Superset)

---

## PROJECT CONTEXT

### Overview
XeroPulse is a professional financial intelligence platform that delivers automated dashboards for professional services firms using Xero accounting software. You are building the **web portal container** that houses embedded Apache Superset dashboards with secure authentication, role-based access control, and professional financial software aesthetics.

### Full Technology Stack
- **Framework:** Next.js 15 (App Router, React 19, Server Components)
- **Styling:** Chakra UI 2.8+ (type-safe style props, built-in WCAG 2.0 AA compliance)
- **Component Library:** Chakra UI (95% coverage) + AG-UI Enterprise (4 complex data grids only)
- **Animation:** Chakra UI Motion (integrated Framer Motion)
- **Authentication:** Supabase Auth (email/password, JWT tokens, session management)
- **Deployment:** Vercel (serverless, edge functions)
- **TypeScript:** Strictly typed (TSX files, interfaces for all data structures)

### Visual Design System
**Brand Identity:** Professional, trustworthy, modern financial software

**Color Palette:**
- Primary: Deep blue (#1E3A8A) - headers, CTAs, active navigation states
- Secondary: Slate gray (#64748B) - body text, borders, inactive states
- Accent: Subtle teal (#14B8A6) - success states, positive metrics
- Background: Off-white (#F8FAFC) - reduces eye strain
- Error: Red (#DC2626) - error states, overdue indicators
- Success: Green (#10B981) - confirmations, positive actions

**Typography:**
- Headings: Inter font family (geometric sans-serif, weights: 600-700)
- Body: System font stack (-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto)
- Code/Data: JetBrains Mono (for technical displays if needed)

**Spacing & Layout:**
- Use Chakra UI spacing scale (4px increments: spacing={4} = 16px, spacing={6} = 24px)
- Ample whitespace for professional feel
- 8px grid system for alignment
- Responsive spacing props: `{{ base: 4, md: 6, lg: 8 }}`

**Accessibility:** WCAG 2.1 Level AA compliance
- 4.5:1 contrast ratio for text
- 3:1 for UI components
- Keyboard navigation (Tab, Enter, Escape)
- ARIA labels for screen readers
- Focus indicators visible (ring-2 ring-blue-500)

---

## HIGH-LEVEL GOAL

Create a **clean, professional dashboard portal** for XeroPulse that implements:
1. Secure authentication system (login, password reset, session management)
2. Role-based application shell (header, sidebar navigation, main content area)
3. User management admin panel (for admin role users only)
4. Error handling and edge states (404, 403, loading states)
5. Responsive design (desktop 1920px, tablet 1024px, mobile <1024px)

The portal should feel like a **professional financial intelligence platform** with immediate value delivery—users log in and instantly see their first authorized dashboard without friction.

---

## DETAILED STEP-BY-STEP INSTRUCTIONS

### PHASE 1: Project Setup & Configuration

1. **Initialize Next.js 15 project** with TypeScript and App Router:
   ```bash
   npx create-next-app@latest xeropulse-portal --typescript --app
   ```

2. **Install Chakra UI and required dependencies**:
   ```bash
   npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
   npm install @chakra-ui/react @chakra-ui/icons @emotion/react @emotion/styled framer-motion
   npm install lucide-react date-fns zustand
   ```

3. **Create Chakra UI theme configuration** in `components/chakra/theme/index.ts`:
   ```typescript
   import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

   const config: ThemeConfig = {
     initialColorMode: 'light',
     useSystemColorMode: false,
   }

   const colors = {
     brand: {
       50: '#EEF2FF',
       500: '#6366F1',  // Primary blue
       600: '#4F46E5',  // Primary hover
       900: '#312E81',
     },
     accent: {
       success: '#10B981',
       error: '#EF4444',
       warning: '#F59E0B',
       violet: '#8B5CF6',
     },
   }

   const fonts = {
     heading: `'Montserrat', sans-serif`,
     body: `'Poppins', sans-serif`,
     mono: `'JetBrains Mono', monospace`,
   }

   export const theme = extendTheme({ config, colors, fonts })
   ```

4. **Create ChakraProvider wrapper** in `components/chakra/provider.tsx`:
   ```typescript
   'use client'

   import { ChakraProvider } from '@chakra-ui/react'
   import { theme } from './theme'

   export function Providers({ children }: { children: React.ReactNode }) {
     return <ChakraProvider theme={theme}>{children}</ChakraProvider>
   }
   ```

   Then wrap your app in `app/layout.tsx`:
   ```typescript
   import { Providers } from '@/components/chakra/provider'

   export default function RootLayout({ children }: { children: React.ReactNode }) {
     return (
       <html lang="en">
         <body>
           <Providers>{children}</Providers>
         </body>
       </html>
     )
   }
   ```

5. **Set up environment variables** in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_SUPERSET_BASE_URL=your_superset_url
   ```

### PHASE 2: Authentication System

6. **Create Supabase client utility** at `/lib/supabase/client.ts`:
   - Export `createClient()` function for client-side auth
   - Export `createServerClient()` for server components

7. **Create authentication context** at `/contexts/AuthContext.tsx`:
   - Manage user session state
   - Provide `signIn`, `signOut`, `resetPassword` functions
   - Store user object with role information

8. **Build Login Page** at `/app/(auth)/login/page.tsx`:
   - Centered card layout (max-width: 400px, centered vertically/horizontally)
   - XeroPulse logo at top (use text wordmark "XeroPulse" with pulse icon for MVP)
   - Email input field (type="email", required, validation)
   - Password input field (type="password", required, min 8 characters)
   - "Forgot Password?" link (navigates to `/reset-password`)
   - "Sign In" button (primary blue, full width, disabled during loading)
   - Error message display (inline, red text, below form)
   - Loading state (spinner in button during authentication)
   - Background: Off-white (#F8FAFC), card on white with shadow

9. **Build Password Reset Flow**:
   - **Request Reset Page** (`/app/(auth)/reset-password/page.tsx`):
     - Email input field
     - "Send Reset Link" button
     - Success message: "Check your email for reset link"
   - **New Password Page** (`/app/(auth)/update-password/page.tsx`):
     - New password input (validation: 10+ chars, uppercase, lowercase, number, special char)
     - Confirm password input (must match)
     - "Update Password" button
     - Success redirect to login

10. **Create authentication middleware** at `/middleware.ts`:
    - Protect all routes under `/dashboards/*` and `/admin/*`
    - Check Supabase session, redirect to `/login` if unauthenticated
    - Pass user object to protected pages via session

### PHASE 3: Main Application Shell & Navigation

11. **Create main layout** at `/app/(dashboard)/layout.tsx`:
    - **Structure:**
      ```
      ┌─────────────────────────────────────┐
      │ HEADER (h-16, fixed top)            │
      ├──────────┬──────────────────────────┤
      │          │                          │
      │ SIDEBAR  │   MAIN CONTENT AREA      │
      │ (w-64)   │   (flex-1, p-6)          │
      │          │                          │
      │          │                          │
      └──────────┴──────────────────────────┘
      ```
    - Sticky header, sidebar scrollable if needed, main content scrollable

12. **Build Header Component** (`/components/Header.tsx`):
    - Background: Primary blue (#1E3A8A)
    - Height: 64px (h-16)
    - Left side: XeroPulse logo (text + icon, white color, text-xl font-semibold)
    - Right side: User dropdown menu
      - Trigger: User email (white text, with ChevronDown icon)
      - Dropdown items:
        - User email (disabled item, shows current user)
        - Divider
        - "Admin Panel" (only if user role = executive or admin, navigates to `/admin/users`)
        - "Logout" (calls signOut function)
    - Shadow below header (shadow-sm)

13. **Build Sidebar Navigation Component** (`/components/Sidebar.tsx`):
    - Background: White, border-right (border-gray-200)
    - Width: 256px (w-64) on desktop
    - **Dynamic dashboard list based on user role:**
      ```typescript
      // Define role-to-dashboard permissions
      const dashboardPermissions = {
        executive: ['dashboard-1', 'dashboard-2', 'dashboard-3', 'dashboard-4', 'dashboard-5', 'dashboard-6', 'dashboard-7', 'dashboard-8'],
        manager: ['dashboard-2', 'dashboard-7', 'dashboard-4', 'dashboard-6'],
        staff: ['dashboard-7']
      }
      ```
    - **Dashboard list items:**
      - Dashboard 1: Income vs Expenses
      - Dashboard 2: Monthly Invoicing to Budget
      - Dashboard 3: YTD/MTD View
      - Dashboard 4: Work In Progress by Team
      - Dashboard 5: ATO Lodgment Status
      - Dashboard 6: Services Analysis
      - Dashboard 7: Debtors/AR Aging
      - Dashboard 8: Client Recoverability
    - **Styling per item:**
      - Padding: px-4 py-3
      - Hover state: bg-gray-100
      - Active state: bg-blue-50, text-primary, border-l-4 border-primary
      - Icon: Use lucide-react icons (BarChart3, TrendingUp, Users, etc.)
      - Text: text-sm, text-gray-700 (inactive), text-primary (active)
    - **Responsive behavior:**
      - Desktop (>=1024px): Always visible
      - Tablet/Mobile (<1024px): Hamburger menu, collapsible sidebar

14. **Build Main Content Area** (`/components/DashboardContainer.tsx`):
    - Container for embedded Superset iframes
    - Props: `dashboardId`, `dashboardName`
    - **Layout:**
      - Page title (h1, text-2xl, font-semibold, mb-4): Shows dashboard name
      - "Last updated" timestamp (text-sm, text-gray-500, mb-4): "Data as of October 15, 2025, 2:15 PM"
      - iframe container (w-full, h-[calc(100vh-200px)], border rounded-lg)
    - **Loading state:** Skeleton loader (shimmer animation) while iframe loads
    - **Error state:** If dashboard fails to load, show:
      - Error icon (AlertCircle from lucide-react, size-16, text-red-500)
      - Message: "Unable to load dashboard. Please try again."
      - "Retry" button (reloads iframe)

15. **Create dashboard routes**:
    - `/app/(dashboard)/dashboards/[dashboardId]/page.tsx`
    - Dynamic route that accepts dashboard-1, dashboard-2, etc.
    - Checks user role against dashboardPermissions
    - If unauthorized, redirect to 403 page
    - If authorized, render DashboardContainer with embedded Superset iframe

16. **Implement default redirect after login**:
    - After successful login, redirect user to their first authorized dashboard
    - Logic: `dashboardPermissions[userRole][0]` → redirect to `/dashboards/dashboard-X`

### PHASE 4: User Management Admin Panel

17. **Create Admin Panel route** at `/app/(dashboard)/admin/users/page.tsx`:
    - **Access control:** Only accessible if user.role === 'executive' or user.role === 'admin'
    - If unauthorized, show 403 page

18. **Build User Management Table**:
    - Use AG-UI Enterprise for complex table with inline editing, sorting, filtering
    - **Columns:**
      - Email (fontSize="sm", fontWeight="medium")
      - Role (Chakra Badge component: Executive=blue, Manager=green, Staff=gray)
      - Last Login (formatted date: "Oct 15, 2025, 3:45 PM" or "Never")
      - Created Date (formatted date)
      - Actions (Edit button, Delete button)
    - **Header:** Title "User Management" (text-2xl), "Add User" button (primary blue, top right)
    - **Search & Filter:**
      - Search input (top left): Filter by email
      - Role filter dropdown: "All Roles", "Executive", "Manager", "Staff"
    - **Empty state:** If no users, show "No users found" message

19. **Build Add User Modal** (Chakra UI Modal component):
    - **Trigger:** "Add User" button
    - **Modal content:**
      - ModalHeader: "Add New User"
      - ModalBody:
        - Email input (FormControl with FormLabel, required, email validation)
        - Role Select dropdown (Executive, Manager, Staff)
        - Checkbox: "Send invitation email" (checked by default)
      - ModalFooter:
        - "Cancel" button (variant="ghost", closes modal)
        - "Create User" button (colorScheme="brand", submits form)
    - **Logic:**
      - Calls Supabase Auth `admin.createUser()` API
      - Generates temporary password (auto-generated, sent via email)
      - Inserts user into `users` table with role
      - Shows success toast: "User created successfully" (useToast hook)
      - Refreshes user table

20. **Build Edit User Modal** (Chakra UI Modal component):
    - Similar to Add User, but:
      - ModalHeader: "Edit User"
      - ModalBody:
        - Email input (isDisabled={true}, shows existing email)
        - Role Select dropdown (defaultValue set to current role)
      - ModalFooter:
        - "Cancel" button (variant="ghost")
        - "Save Changes" button (colorScheme="brand")
    - **Logic:**
      - Updates user role in `users` table
      - Shows success toast: "User updated successfully" (useToast hook)

21. **Build Delete User Confirmation Dialog** (Chakra UI AlertDialog component):
    - **Trigger:** Delete button in table row
    - **AlertDialog content:**
      - AlertDialogHeader: "Delete User"
      - AlertDialogBody: "Are you sure you want to delete [email]? This action cannot be undone."
      - AlertDialogFooter:
        - "Cancel" button (ref={cancelRef}, ml={3})
        - "Delete" button (colorScheme="red", destructive action)
    - **Logic:**
      - Calls Supabase Auth `admin.deleteUser()` API
      - Deletes user from `users` table
      - Shows success toast: "User deleted successfully" (useToast hook)

22. **Add Bulk User Import** (optional enhancement):
    - "Import CSV" button next to "Add User"
    - File upload input (accepts .csv)
    - Expected columns: email, role
    - Validates each row, shows error summary if issues
    - Bulk creates users via Supabase Auth API

### PHASE 5: Error States & Edge Cases

23. **Create 404 Page** at `/app/not-found.tsx`:
    - Centered content
    - Large "404" text (text-6xl, font-bold, text-gray-300)
    - Message: "Page not found"
    - Description: "The page you're looking for doesn't exist."
    - "Go Home" button (navigates to `/dashboards`)

24. **Create 403 Forbidden Page** at `/app/(dashboard)/forbidden/page.tsx`:
    - Similar layout to 404
    - "403" text
    - Message: "Access Denied"
    - Description: "You do not have permission to view this dashboard."
    - "Back to Home" button

25. **Implement global error boundary** at `/app/error.tsx`:
    - Catches unhandled errors
    - Shows generic error message
    - "Try Again" button (resets error boundary)
    - Logs error to console/monitoring service

26. **Add loading states** at `/app/(dashboard)/dashboards/[dashboardId]/loading.tsx`:
    - Skeleton loader for dashboard page
    - Shimmer animation (use Chakra UI Skeleton component with isLoaded prop)
    - Matches dashboard layout (title skeleton, timestamp skeleton, large rectangle for iframe)

### PHASE 6: Responsive Design & Mobile Optimization

27. **Implement responsive header**:
    - Desktop: Logo left, user menu right
    - Mobile (<1024px):
      - Hamburger menu icon (left) to toggle sidebar
      - Logo (center)
      - User menu (right, simplified to avatar icon only)

28. **Implement responsive sidebar**:
    - Desktop: Always visible, w-64
    - Tablet (768-1023px): Collapsible, slide-in from left, overlay on content
    - Mobile (<768px): Full-width slide-in, hamburger toggle

29. **Optimize dashboard content for mobile**:
    - iframe container: h-[calc(100vh-120px)] on mobile (more vertical space)
    - Dashboard title: text-xl on mobile (smaller than desktop text-2xl)
    - "Last updated" timestamp: Hidden on very small screens (<640px) to save space

30. **Test responsive breakpoints**:
    - Test on: iPhone SE (375px), iPhone 14 (390px), iPad (768px), Desktop (1920px)
    - Ensure no horizontal scroll, readable text, tappable buttons (min 44x44px)

### PHASE 7: Performance & Accessibility

31. **Optimize iframe loading**:
    - Use `loading="lazy"` on iframe elements
    - Preconnect to Superset domain: `<link rel="preconnect" href="SUPERSET_URL">`
    - Set iframe `title` attribute for accessibility

32. **Implement keyboard navigation**:
    - All interactive elements focusable (Tab order logical)
    - Focus indicators visible (ring-2 ring-blue-500 ring-offset-2)
    - Escape key closes modals
    - Enter key submits forms

33. **Add ARIA labels**:
    - Sidebar navigation: `aria-label="Dashboard navigation"`
    - User menu: `aria-label="User menu"`
    - Form inputs: `aria-label` or associated `<label>` elements
    - Error messages: `role="alert"` for screen reader announcements

34. **Optimize bundle size**:
    - Dynamic imports for admin panel (code-split: `const AdminPanel = dynamic(() => import('@/components/AdminPanel'))`)
    - Tree-shake unused Chakra UI components (use selective imports where possible)
    - Minimize lucide-react icon imports (import only used icons)

35. **Add loading performance monitoring**:
    - Use Next.js `<Script strategy="afterInteractive">` for Vercel Analytics
    - Measure Core Web Vitals (LCP <2.5s, FID <100ms, CLS <0.1)

---

## CODE EXAMPLES, DATA STRUCTURES & CONSTRAINTS

### User Data Structure (TypeScript Interface)
```typescript
interface User {
  id: string; // UUID from Supabase Auth
  email: string;
  role: 'executive' | 'manager' | 'staff' | 'admin';
  created_at: string; // ISO 8601 timestamp
  last_login: string | null; // ISO 8601 timestamp or null
}

interface Session {
  user: User;
  access_token: string; // JWT token
  expires_at: string; // ISO 8601 timestamp
}
```

### Dashboard Permission Mapping
```typescript
const DASHBOARD_CONFIG = {
  'dashboard-1': {
    id: 'dashboard-1',
    name: 'Income vs Expenses',
    icon: 'TrendingUp',
    supersetId: '1', // Superset dashboard ID
    allowedRoles: ['executive']
  },
  'dashboard-2': {
    id: 'dashboard-2',
    name: 'Monthly Invoicing to Budget',
    icon: 'BarChart3',
    supersetId: '2',
    allowedRoles: ['executive', 'manager']
  },
  'dashboard-7': {
    id: 'dashboard-7',
    name: 'Debtors/AR Aging',
    icon: 'Users',
    supersetId: '7',
    allowedRoles: ['executive', 'manager', 'staff']
  },
  // ... continue for all 8 dashboards
};

// Helper function to check access
function canAccessDashboard(userRole: User['role'], dashboardId: string): boolean {
  return DASHBOARD_CONFIG[dashboardId]?.allowedRoles.includes(userRole) ?? false;
}
```

### Supabase Auth Example (Login Logic)
```typescript
// /lib/auth.ts
import { createClient } from '@/lib/supabase/client';

export async function signIn(email: string, password: string) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  // Fetch user role from users table
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('id', data.user.id)
    .single();

  if (userError) throw userError;

  return { ...data, role: userData.role };
}
```

### Superset iframe Embedding Example
```tsx
// /components/DashboardEmbed.tsx
interface DashboardEmbedProps {
  dashboardId: string;
  accessToken: string; // JWT from Supabase session
}

export function DashboardEmbed({ dashboardId, accessToken }: DashboardEmbedProps) {
  const supersetUrl = process.env.NEXT_PUBLIC_SUPERSET_BASE_URL;
  const supersetDashboardId = DASHBOARD_CONFIG[dashboardId]?.supersetId;

  // Superset guest token or embedded URL with auth token
  const embedUrl = `${supersetUrl}/superset/dashboard/${supersetDashboardId}/?standalone=true`;

  return (
    <iframe
      src={embedUrl}
      title={`Dashboard ${dashboardId}`}
      className="w-full h-full border-0 rounded-lg"
      loading="lazy"
      sandbox="allow-same-origin allow-scripts allow-forms"
    />
  );
}
```

### What NOT to Do (Critical Constraints)
❌ **DO NOT** implement actual dashboard visualizations (charts, tables, metrics) - those come from embedded Superset
❌ **DO NOT** create custom chart components - use iframe embedding only
❌ **DO NOT** hard-code user credentials - always use environment variables
❌ **DO NOT** store passwords in plain text - Supabase handles bcrypt hashing
❌ **DO NOT** skip role-based access checks - every protected route must validate user.role
❌ **DO NOT** use client-side only routing for protected pages - use Next.js middleware for server-side auth checks
❌ **DO NOT** exceed 500ms time-to-interactive for portal shell (excluding dashboard iframe load)
❌ **DO NOT** use external UI component libraries other than Chakra UI and AG-UI Enterprise (consistency requirement)
❌ **DO NOT** create a separate registration page - user creation happens only via Admin Panel
❌ **DO NOT** use inline styles - all styling via Chakra UI style props

---

## DEFINE STRICT SCOPE

### Files You WILL Create/Modify:
✅ `/app/(auth)/login/page.tsx` - Login page
✅ `/app/(auth)/reset-password/page.tsx` - Password reset request
✅ `/app/(auth)/update-password/page.tsx` - New password entry
✅ `/app/(dashboard)/layout.tsx` - Main application shell layout
✅ `/app/(dashboard)/dashboards/[dashboardId]/page.tsx` - Dynamic dashboard route
✅ `/app/(dashboard)/dashboards/[dashboardId]/loading.tsx` - Loading state
✅ `/app/(dashboard)/admin/users/page.tsx` - User management panel
✅ `/app/not-found.tsx` - 404 page
✅ `/app/error.tsx` - Error boundary
✅ `/components/Header.tsx` - Header component
✅ `/components/Sidebar.tsx` - Sidebar navigation
✅ `/components/DashboardContainer.tsx` - Dashboard iframe container
✅ `/components/DashboardEmbed.tsx` - Superset iframe embed
✅ `/components/UserTable.tsx` - User management table
✅ `/components/AddUserModal.tsx` - Add user dialog
✅ `/components/EditUserModal.tsx` - Edit user dialog
✅ `/components/DeleteUserDialog.tsx` - Delete confirmation
✅ `/lib/supabase/client.ts` - Supabase client utility
✅ `/lib/supabase/server.ts` - Server-side Supabase client
✅ `/lib/auth.ts` - Authentication helper functions
✅ `/lib/dashboard-config.ts` - Dashboard permission mappings
✅ `/middleware.ts` - Authentication middleware
✅ `/types/index.ts` - TypeScript interfaces
✅ `/components/chakra/theme/index.ts` - Chakra UI theme configuration with custom colors
✅ `/components/chakra/provider.tsx` - ChakraProvider wrapper component
✅ `.env.local.example` - Environment variable template

### Files You MUST NOT Modify:
🚫 Any files in `/node_modules/` - Third-party dependencies
🚫 Dashboard visualization files (those don't exist - visualizations live in Superset)
🚫 Backend API routes for Xero/XPM data sync (handled by n8n on VPS, not Next.js)
🚫 Database migration files (managed separately in Supabase CLI)
🚫 Superset configuration files (Superset is self-hosted separately)

### Features Outside This Scope:
⛔ Dashboard chart/visualization implementation (use embedded Superset iframes only)
⛔ ETL workflows (handled by n8n)
⛔ Database schema creation (handled separately in Supabase)
⛔ VPS infrastructure setup (Docker Compose, n8n, Superset deployment)
⛔ Email sending functionality (use Supabase Auth's built-in email for password resets)
⛔ Two-factor authentication (deferred to future phase)
⛔ Real-time notifications/websockets (not required for MVP)
⛔ PDF/Excel export from portal (handled by Superset's built-in export features)
⛔ Mobile native apps (web-responsive only)

---

## ADDITIONAL CONTEXT & BEST PRACTICES

### Mobile-First Approach
- Start with mobile layout (375px width), then progressively enhance for tablet (768px) and desktop (1920px)
- Test all interactions on touch devices (tap targets minimum 44x44px)
- Use responsive Chakra UI props: `{{ base: ..., sm: ..., md: ..., lg: ..., xl: ... }}` breakpoints

### Performance Targets
- Portal shell (header + sidebar + empty content area): <500ms time-to-interactive
- Login page: <1 second time-to-interactive
- Dashboard iframe loads: <3 seconds (Superset's responsibility, but optimize iframe wrapper)
- Admin panel (user table with 20 users): <2 seconds load time

### Security Considerations
- All API routes use Supabase Row-Level Security (RLS) policies
- Never expose Supabase service_role key on client (use anon key only)
- Middleware validates sessions on every protected route request
- CSRF protection via Supabase Auth's session tokens
- Content Security Policy (CSP) headers configured in `next.config.js` to allow iframe embedding from Superset domain only

### Error Handling Strategy
- Network errors: Show retry button with "Check your connection" message
- Auth errors: Clear session, redirect to login with error message
- Permission errors: Redirect to 403 page
- Dashboard load failures: Show error state in DashboardContainer with retry
- Form validation errors: Display inline below field with red text

### Testing Checklist (Manual UAT in Week 4)
- ✅ Login with valid credentials → redirects to first authorized dashboard
- ✅ Login with invalid credentials → shows error message
- ✅ Password reset flow → receives email, resets password successfully
- ✅ Executive role → sees all 8 dashboards in sidebar
- ✅ Manager role → sees only subset of dashboards
- ✅ Staff role → sees limited dashboards
- ✅ Unauthorized dashboard access → redirects to 403 page
- ✅ Admin creates new user → user receives invitation email
- ✅ Admin edits user role → role updates correctly
- ✅ Admin deletes user → user removed from system
- ✅ Logout → session cleared, redirects to login
- ✅ Responsive design → works on iPhone, iPad, Desktop
- ✅ Keyboard navigation → all features accessible without mouse
- ✅ Screen reader → ARIA labels announced correctly

---

## DELIVERABLE SUMMARY

**YOU WILL BUILD:**
1. **Authentication System:** Login, password reset, session management via Supabase Auth
2. **Application Shell:** Header, sidebar, responsive layout with role-based navigation
3. **Dashboard Routes:** Dynamic routes embedding Superset iframes with permission checks
4. **User Management:** Admin panel for creating, editing, deleting users with role assignment
5. **Error Handling:** 404, 403, loading states, error boundaries
6. **Responsive Design:** Mobile-first, tablet, desktop breakpoints using Chakra UI responsive props
7. **Accessibility:** WCAG AA compliance, keyboard navigation, ARIA labels

**TECH STACK:**
- Next.js 15 (App Router, React 19, Server Components, TypeScript)
- Chakra UI 2.8+ (95% coverage) + AG-UI Enterprise (4 complex data grids)
- Supabase (Auth, PostgreSQL database for user roles)
- Vercel deployment

**VISUAL STYLE:**
- Professional financial software aesthetic
- Deep blue (#1E3A8A) + slate gray (#64748B) palette
- Inter font for headings, system fonts for body
- Clean, minimal, data-focused design

**PERFORMANCE:**
- Portal shell: <500ms time-to-interactive
- Dashboard loads: <3 seconds (including iframe)
- Mobile responsive: Works on 375px+ screens
- WCAG AA accessible

**SCOPE BOUNDARIES:**
- ✅ Platform UI/UX (this prompt)
- ❌ Dashboard visualizations (embedded from Superset)
- ❌ ETL workflows (handled by n8n)
- ❌ Infrastructure (VPS, Docker)

---

## ⚠️ IMPORTANT REMINDER

All AI-generated code from this prompt will require **careful human review, testing, and refinement** to be considered production-ready. Specifically:

1. **Security Review:** Validate all authentication flows, check for XSS vulnerabilities in user inputs, ensure Supabase RLS policies configured correctly
2. **Accessibility Testing:** Test with actual screen readers (NVDA, JAWS), keyboard-only navigation, color contrast verification
3. **Cross-Browser Testing:** Verify in Chrome, Firefox, Safari, Edge (especially Safari for iOS quirks)
4. **Performance Optimization:** Profile with Chrome DevTools, optimize bundle size, lazy-load admin panel
5. **User Acceptance Testing:** Week 4 UAT with 5+ real users per Story 2.7 acceptance criteria
6. **Error Handling Edge Cases:** Test network failures, expired sessions, concurrent user edits

**This prompt provides a comprehensive blueprint, but human oversight is critical for production deployment.**

---

🎯 **You now have a complete, production-ready prompt for generating the XeroPulse platform UI/UX!**

Copy this entire prompt and paste it into v0.dev, Lovable.ai, or your preferred AI frontend generation tool. The structured approach (context → goal → instructions → examples → scope) ensures high-quality, consistent output.

Good luck building XeroPulse! 🚀
