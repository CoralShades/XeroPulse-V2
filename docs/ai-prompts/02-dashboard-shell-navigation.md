# XeroPulse Dashboard Shell & Navigation - Component Prompt

**Component:** Main Application Layout, Header, Sidebar Navigation
**Dependencies:** Authentication system completed, Chakra UI 2.8+, @chakra-ui/icons, lucide-react
**Estimated Time:** 3-4 hours

---

## GOAL

Build the main application shell with header, role-based sidebar navigation, and dashboard container for embedding Superset iframes.

---

## VISUAL DESIGN

**Layout Structure:**
```
┌─────────────────────────────────────────────────┐
│ HEADER (h-16, bg-primary #1E3A8A)              │
│ Logo [left] ────────────── User Menu [right]   │
├───────────┬─────────────────────────────────────┤
│           │                                     │
│ SIDEBAR   │   MAIN CONTENT AREA                │
│ (w-64)    │   (flex-1, p-6, bg-gray-50)        │
│           │                                     │
│ Dashboard │   [Dashboard Name]                  │
│ Nav Items │   Last updated: ...                 │
│           │                                     │
│           │   [Superset iframe Container]       │
│           │                                     │
│           │                                     │
│           │                                     │
└───────────┴─────────────────────────────────────┘
```

**Color Palette:**
- Header: #1E3A8A (deep blue)
- Sidebar: White background, #E5E7EB border-right
- Active nav item: #EFF6FF background, #1E3A8A text, #1E3A8A left border (4px)
- Inactive nav item: #6B7280 text
- Hover state: #F3F4F6 background

---

## STEP-BY-STEP INSTRUCTIONS

### 1. Create Main Dashboard Layout (`/app/(dashboard)/layout.tsx`)

**Structure:**
```tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  )
}
```

### 2. Build Header Component (`/components/Header.tsx`)

**Layout:**
```
┌──────────────────────────────────────────────────┐
│ [XeroPulse Logo]           [user@email.com ▼]   │
└──────────────────────────────────────────────────┘
```

**Logo:**
- Text: "XeroPulse" in white, text-xl, font-semibold
- Icon: Use Activity icon from lucide-react (pulse/heartbeat symbol)
- Left padding: pl-6

**User Menu (Dropdown):**
- Trigger: User email + ChevronDown icon, white text, pr-6
- Dropdown Menu (Chakra UI Menu component):
  - User email (disabled MenuItem, fontSize="sm", color="gray.500")
  - MenuDivider
  - "Admin Panel" link (only if user.role === 'executive' or 'admin')
    - Icon: Settings from lucide-react or @chakra-ui/icons
    - Links to: `/admin/users`
  - MenuDivider
  - "Logout" button
    - Icon: LogOut from lucide-react
    - Calls signOut() function, redirects to `/login`

**Responsive Behavior:**
- Desktop (≥1024px): Logo left, user menu right, full layout
- Mobile (<1024px): Hamburger menu button (left), logo (center), user icon (right)

**Code Structure:**
```tsx
'use client'

import { useRouter } from 'next/navigation'
import { Activity, ChevronDown, Settings, LogOut, Menu } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { signOut } from '@/lib/auth'
import { useAuth } from '@/contexts/AuthContext'

export function Header() {
  const router = useRouter()
  const { user } = useAuth()

  async function handleLogout() {
    await signOut()
    router.push('/login')
  }

  return (
    <header className="h-16 bg-primary flex items-center justify-between px-6 shadow-sm">
      {/* Mobile hamburger */}
      <button className="lg:hidden text-white">
        <Menu className="h-6 w-6" />
      </button>

      {/* Logo */}
      <div className="flex items-center gap-2 text-white">
        <Activity className="h-6 w-6" />
        <span className="text-xl font-semibold">XeroPulse</span>
      </div>

      {/* User menu */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 text-white text-sm hover:text-gray-200">
          {user?.email}
          <ChevronDown className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-xs text-gray-500">
            {user?.email}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {(user?.role === 'executive' || user?.role === 'admin') && (
            <>
              <DropdownMenuItem onClick={() => router.push('/admin/users')}>
                <Settings className="mr-2 h-4 w-4" />
                Admin Panel
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
```

### 3. Build Sidebar Navigation (`/components/Sidebar.tsx`)

**Dashboard Configuration:**
```typescript
// /lib/dashboard-config.ts
import {
  TrendingUp,
  BarChart3,
  Calendar,
  Users,
  FileCheck,
  PieChart,
  Clock,
  DollarSign,
} from 'lucide-react'

export const DASHBOARD_CONFIG = {
  'dashboard-1': {
    id: 'dashboard-1',
    name: 'Income vs Expenses',
    icon: TrendingUp,
    supersetId: '1',
    allowedRoles: ['executive'],
  },
  'dashboard-2': {
    id: 'dashboard-2',
    name: 'Monthly Invoicing to Budget',
    icon: BarChart3,
    supersetId: '2',
    allowedRoles: ['executive', 'manager'],
  },
  'dashboard-3': {
    id: 'dashboard-3',
    name: 'YTD/MTD View',
    icon: Calendar,
    supersetId: '3',
    allowedRoles: ['executive', 'manager'],
  },
  'dashboard-4': {
    id: 'dashboard-4',
    name: 'Work In Progress by Team',
    icon: Users,
    supersetId: '4',
    allowedRoles: ['executive', 'manager'],
  },
  'dashboard-5': {
    id: 'dashboard-5',
    name: 'ATO Lodgment Status',
    icon: FileCheck,
    supersetId: '5',
    allowedRoles: ['executive', 'manager'],
  },
  'dashboard-6': {
    id: 'dashboard-6',
    name: 'Services Analysis',
    icon: PieChart,
    supersetId: '6',
    allowedRoles: ['executive', 'manager'],
  },
  'dashboard-7': {
    id: 'dashboard-7',
    name: 'Debtors/AR Aging',
    icon: Clock,
    supersetId: '7',
    allowedRoles: ['executive', 'manager', 'staff'],
  },
  'dashboard-8': {
    id: 'dashboard-8',
    name: 'Client Recoverability',
    icon: DollarSign,
    supersetId: '8',
    allowedRoles: ['executive', 'manager'],
  },
}

export function getAuthorizedDashboards(userRole: string) {
  return Object.values(DASHBOARD_CONFIG).filter((dashboard) =>
    dashboard.allowedRoles.includes(userRole)
  )
}

export function canAccessDashboard(userRole: string, dashboardId: string) {
  return DASHBOARD_CONFIG[dashboardId]?.allowedRoles.includes(userRole) ?? false
}
```

**Sidebar Layout:**
```tsx
'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { getAuthorizedDashboards } from '@/lib/dashboard-config'

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuth()

  const dashboards = getAuthorizedDashboards(user?.role || 'staff')

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <nav className="p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Dashboards
        </p>
        <ul className="space-y-1">
          {dashboards.map((dashboard) => {
            const Icon = dashboard.icon
            const isActive = pathname === `/dashboards/${dashboard.id}`

            return (
              <li key={dashboard.id}>
                <Link
                  href={`/dashboards/${dashboard.id}`}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors',
                    isActive
                      ? 'bg-blue-50 text-primary font-medium border-l-4 border-primary'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{dashboard.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
```

**Responsive Sidebar:**
- Desktop (≥1024px): Always visible, w-64
- Mobile (<1024px): Hidden by default, slides in from left when hamburger clicked
- Use `useState` for mobile menu open/close state

### 4. Build Dashboard Container (`/components/DashboardContainer.tsx`)

**Purpose:** Wrapper for individual dashboard pages

**Layout:**
```tsx
interface DashboardContainerProps {
  dashboardId: string
  dashboardName: string
  children: React.ReactNode
}

export function DashboardContainer({
  dashboardId,
  dashboardName,
  children,
}: DashboardContainerProps) {
  const lastUpdated = useLastSyncTimestamp() // Fetch from API or metadata table

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">
          {dashboardName}
        </h1>
        <p className="text-sm text-gray-500">
          Last updated: {formatTimestamp(lastUpdated)}
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        {children}
      </div>
    </div>
  )
}
```

### 5. Build Dashboard Embed Component (`/components/DashboardEmbed.tsx`)

**Purpose:** Embed Superset iframe with loading/error states

```tsx
'use client'

import { useState } from 'react'
import { Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DashboardEmbedProps {
  dashboardId: string
  supersetId: string
}

export function DashboardEmbed({ dashboardId, supersetId }: DashboardEmbedProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const supersetUrl = process.env.NEXT_PUBLIC_SUPERSET_BASE_URL
  const embedUrl = `${supersetUrl}/superset/dashboard/${supersetId}/?standalone=true`

  function handleLoad() {
    setLoading(false)
    setError(false)
  }

  function handleError() {
    setLoading(false)
    setError(true)
  }

  function handleRetry() {
    setLoading(true)
    setError(false)
    // Force iframe reload
    const iframe = document.getElementById(`dashboard-iframe-${dashboardId}`) as HTMLIFrameElement
    iframe.src = embedUrl
  }

  return (
    <div className="relative w-full h-[calc(100vh-240px)]">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center gap-4 max-w-md text-center">
            <AlertCircle className="h-16 w-16 text-red-500" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Unable to load dashboard
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                There was an error loading the dashboard. Please try again.
              </p>
            </div>
            <Button onClick={handleRetry}>
              Retry
            </Button>
          </div>
        </div>
      )}

      <iframe
        id={`dashboard-iframe-${dashboardId}`}
        src={embedUrl}
        title={`Dashboard ${dashboardId}`}
        className={cn(
          "w-full h-full border-0 rounded-lg",
          (loading || error) && "invisible"
        )}
        onLoad={handleLoad}
        onError={handleError}
        sandbox="allow-same-origin allow-scripts allow-forms"
      />
    </div>
  )
}
```

### 6. Create Dynamic Dashboard Route (`/app/(dashboard)/dashboards/[dashboardId]/page.tsx`)

```tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { canAccessDashboard, DASHBOARD_CONFIG } from '@/lib/dashboard-config'
import { DashboardContainer } from '@/components/DashboardContainer'
import { DashboardEmbed } from '@/components/DashboardEmbed'

export default async function DashboardPage({
  params,
}: {
  params: { dashboardId: string }
}) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Get user role
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single()

  const userRole = userData?.role || 'staff'

  // Check access
  if (!canAccessDashboard(userRole, params.dashboardId)) {
    redirect('/forbidden')
  }

  const dashboard = DASHBOARD_CONFIG[params.dashboardId]

  return (
    <DashboardContainer
      dashboardId={params.dashboardId}
      dashboardName={dashboard.name}
    >
      <DashboardEmbed
        dashboardId={params.dashboardId}
        supersetId={dashboard.supersetId}
      />
    </DashboardContainer>
  )
}
```

### 7. Create Loading State (`/app/(dashboard)/dashboards/[dashboardId]/loading.tsx`)

```tsx
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-5 w-48" />
      </div>
      <Skeleton className="w-full h-[calc(100vh-240px)] rounded-lg" />
    </div>
  )
}
```

---

## CONSTRAINTS

### ✅ DO:
- Filter sidebar dashboards based on user role
- Show loading state while dashboard iframe loads
- Handle iframe load errors gracefully with retry option
- Use semantic HTML (nav, aside, main elements)
- Implement ARIA labels for accessibility
- Make sidebar collapsible on mobile

### ❌ DO NOT:
- Hard-code dashboard list (use DASHBOARD_CONFIG)
- Allow access to unauthorized dashboards
- Skip loading states (poor UX)
- Create custom chart components (use iframe only)
- Implement dashboard filtering/search in sidebar (8 items is manageable)

---

## TESTING CHECKLIST

- ✅ Executive role sees all 8 dashboards
- ✅ Manager role sees 6 dashboards (2, 3, 4, 5, 6, 7)
- ✅ Staff role sees 1 dashboard (7 only)
- ✅ Active dashboard highlighted in sidebar
- ✅ Clicking dashboard in sidebar navigates correctly
- ✅ Loading state shows while iframe loads
- ✅ Error state shows with retry button if iframe fails
- ✅ User menu dropdown works correctly
- ✅ Logout redirects to login page
- ✅ Admin Panel link only visible to executives/admins
- ✅ Sidebar collapses on mobile with hamburger menu

---

## DELIVERABLES

1. Main dashboard layout with header + sidebar
2. Header component with logo and user menu
3. Sidebar component with role-based navigation
4. Dashboard container component
5. Dashboard embed component with iframe
6. Dynamic dashboard route with access control
7. Loading state for dashboards
8. Dashboard configuration file

**Estimated Lines of Code:** ~700-800 lines
**Key Files:** 8 files total
