# XeroPulse Mobile Responsive & Accessibility - Component Prompt

**Component:** Responsive Design & WCAG AA Accessibility
**Dependencies:** All core components completed
**Estimated Time:** 3-4 hours

---

## GOAL

Optimize XeroPulse for mobile devices (375px+) and ensure WCAG 2.1 Level AA accessibility compliance for keyboard navigation, screen readers, and color contrast.

---

## RESPONSIVE DESIGN BREAKPOINTS

**Tailwind CSS Breakpoints:**
- `sm`: 640px (Small phones landscape)
- `md`: 768px (Tablets portrait)
- `lg`: 1024px (Tablets landscape, small laptops)
- `xl`: 1280px (Desktops)
- `2xl`: 1536px (Large desktops)

**XeroPulse Target Breakpoints:**
- Mobile: < 768px (Single column, hamburger menu)
- Tablet: 768px - 1023px (Collapsible sidebar)
- Desktop: ≥ 1024px (Full layout with sidebar)

---

## STEP-BY-STEP INSTRUCTIONS

### 1. Responsive Header (`/components/Header.tsx`)

**Desktop (≥1024px):**
```
┌────────────────────────────────────────────────┐
│ [Logo + Text]              [user@email.com ▼] │
└────────────────────────────────────────────────┘
```

**Mobile (<1024px):**
```
┌────────────────────────────────────────────────┐
│ [☰]        [Logo]                     [👤 ▼]  │
└────────────────────────────────────────────────┘
```

**Implementation:**
```tsx
'use client'

import { useState } from 'react'
import { Activity, Menu, User, ChevronDown } from 'lucide-react'
import { useSidebar } from '@/contexts/SidebarContext'

export function Header() {
  const { toggleSidebar } = useSidebar()
  const { user } = useAuth()

  return (
    <header className="h-16 bg-primary flex items-center justify-between px-4 lg:px-6">
      {/* Mobile hamburger */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden text-white hover:text-gray-200 p-2"
        aria-label="Toggle navigation menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Logo - center on mobile, left on desktop */}
      <div className="flex items-center gap-2 text-white lg:flex-none mx-auto lg:mx-0">
        <Activity className="h-5 w-5 lg:h-6 lg:w-6" />
        <span className="text-lg lg:text-xl font-semibold">XeroPulse</span>
      </div>

      {/* User menu - icon only on mobile, full email on desktop */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 text-white text-sm hover:text-gray-200">
          <span className="hidden md:inline">{user?.email}</span>
          <User className="h-5 w-5 md:hidden" />
          <ChevronDown className="h-4 w-4 hidden md:block" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {/* Dropdown items... */}
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
```

### 2. Responsive Sidebar with Overlay (`/components/Sidebar.tsx`)

**Mobile Behavior:**
- Hidden by default
- Slides in from left when hamburger clicked
- Overlay backdrop (gray with opacity)
- Closes when clicking outside or selecting dashboard

**Implementation:**
```tsx
'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSidebar } from '@/contexts/SidebarContext'

export function Sidebar() {
  const pathname = usePathname()
  const { isOpen, closeSidebar } = useSidebar()
  const { user } = useAuth()
  const dashboards = getAuthorizedDashboards(user?.role || 'staff')

  return (
    <>
      {/* Overlay - mobile only */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50',
          'w-64 bg-white border-r border-gray-200',
          'transform transition-transform duration-300 ease-in-out',
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Mobile close button */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b">
          <span className="font-semibold text-gray-900">Menu</span>
          <button
            onClick={closeSidebar}
            className="p-2 hover:bg-gray-100 rounded-lg"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
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
                    onClick={closeSidebar} // Close on mobile after navigation
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors',
                      isActive
                        ? 'bg-blue-50 text-primary font-medium border-l-4 border-primary'
                        : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span>{dashboard.name}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </aside>
    </>
  )
}
```

**Sidebar Context** (`/contexts/SidebarContext.tsx`):
```tsx
'use client'

import { createContext, useContext, useState } from 'react'

interface SidebarContextType {
  isOpen: boolean
  toggleSidebar: () => void
  closeSidebar: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        toggleSidebar: () => setIsOpen(!isOpen),
        closeSidebar: () => setIsOpen(false),
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider')
  }
  return context
}
```

### 3. Responsive Dashboard Container

**Desktop:** Dashboard title (text-2xl), full height iframe
**Mobile:** Smaller title (text-xl), more vertical space for iframe, hide timestamp on very small screens

```tsx
export function DashboardContainer({
  dashboardId,
  dashboardName,
  children,
}: DashboardContainerProps) {
  const lastUpdated = useLastSyncTimestamp()

  return (
    <div className="space-y-3 md:space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
          {dashboardName}
        </h1>
        <p className="text-xs md:text-sm text-gray-500 hidden sm:block">
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

### 4. Responsive Tables (Admin Panel)

**Desktop:** Full table layout
**Mobile:** Stacked cards or horizontal scroll

**Option 1: Horizontal Scroll** (Simpler)
```tsx
<div className="overflow-x-auto">
  <Table className="min-w-[600px]">
    {/* Table content */}
  </Table>
</div>
```

**Option 2: Card Layout** (Better UX on mobile)
```tsx
{/* Desktop table */}
<div className="hidden md:block">
  <Table>{/* Table content */}</Table>
</div>

{/* Mobile cards */}
<div className="md:hidden space-y-3">
  {filteredUsers.map((user) => (
    <div key={user.id} className="bg-white p-4 rounded-lg border">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-medium text-gray-900">{user.email}</p>
          <RoleBadge role={user.role} />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setEditingUser(user)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDeletingUser(user)}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="text-sm text-gray-600 space-y-1">
        <p>Last login: {user.last_login ? formatDate(user.last_login) : 'Never'}</p>
        <p>Created: {formatDate(user.created_at)}</p>
      </div>
    </div>
  ))}
</div>
```

### 5. Touch-Friendly Interactions

**Minimum Touch Target:** 44x44px (Apple HIG, WCAG 2.5.5)

```tsx
// ✅ Good: Large enough touch target
<button className="p-3 min-w-[44px] min-h-[44px]">
  <Icon className="h-5 w-5" />
</button>

// ❌ Bad: Too small
<button className="p-1">
  <Icon className="h-4 w-4" />
</button>
```

**Hover States → Active States on Mobile:**
```tsx
// Use both hover and active states
<button className="hover:bg-gray-100 active:bg-gray-200">
  Click me
</button>
```

---

## ACCESSIBILITY (WCAG AA)

### 1. Keyboard Navigation

**Focus Indicators:**
```tsx
// Add visible focus ring to all interactive elements
<button className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
  Click me
</button>

<Link className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded">
  Navigate
</Link>
```

**Tab Order:**
- Ensure logical tab order (header → sidebar → main content)
- Skip links for screen readers:
```tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded"
>
  Skip to main content
</a>
```

**Keyboard Shortcuts:**
- Escape closes modals
- Enter/Space activates buttons
- Arrow keys navigate dropdown menus

### 2. ARIA Labels

**Navigation:**
```tsx
<nav aria-label="Dashboard navigation">
  <ul>{/* Dashboard links */}</ul>
</nav>

<nav aria-label="User menu">
  {/* Dropdown menu */}
</nav>
```

**Buttons:**
```tsx
<button aria-label="Toggle navigation menu">
  <Menu className="h-6 w-6" />
</button>

<button aria-label="Close dialog">
  <X className="h-5 w-5" />
</button>
```

**Form Inputs:**
```tsx
// Option 1: Associated label (preferred)
<Label htmlFor="email">Email</Label>
<Input id="email" type="email" />

// Option 2: ARIA label
<Input type="email" aria-label="Email address" />
```

**Status Messages:**
```tsx
// Error messages
<div role="alert" className="text-red-600">
  Invalid email or password
</div>

// Success toast
<Toast role="status" aria-live="polite">
  User created successfully
</Toast>
```

### 3. Color Contrast (WCAG AA: 4.5:1 for text, 3:1 for UI)

**Text Contrast:**
```tsx
// ✅ Good: #1E3A8A on white = 10.5:1
<h1 className="text-primary">XeroPulse</h1>

// ✅ Good: #64748B on white = 5.8:1
<p className="text-secondary">Body text</p>

// ❌ Bad: Light gray on white
<p className="text-gray-300">Hard to read</p>
```

**Button Contrast:**
```tsx
// Primary button: White text on #1E3A8A (10.5:1) ✅
<Button className="bg-primary text-white">
  Sign In
</Button>

// Disabled button: Lower contrast but acceptable for disabled state
<Button disabled className="bg-gray-300 text-gray-500">
  Disabled
</Button>
```

**Use Color + Icons (Not Color Alone):**
```tsx
// ✅ Good: Icon + color for success
<div className="flex items-center gap-2 text-green-600">
  <CheckCircle className="h-5 w-5" />
  <span>Success</span>
</div>

// ❌ Bad: Color only
<div className="text-red-600">
  Error (no visual indicator for colorblind users)
</div>
```

### 4. Screen Reader Support

**Hide Decorative Elements:**
```tsx
<Activity className="h-6 w-6" aria-hidden="true" />
```

**Provide Alternative Text:**
```tsx
<img src="/logo.png" alt="XeroPulse logo" />
```

**Loading States:**
```tsx
<Button disabled aria-busy="true">
  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
  <span>Loading...</span>
</Button>
```

**Live Regions for Dynamic Content:**
```tsx
<div aria-live="polite" aria-atomic="true">
  {filteredUsers.length} users found
</div>
```

### 5. Form Accessibility

**Labels:**
```tsx
<div>
  <Label htmlFor="email">Email Address</Label>
  <Input
    id="email"
    type="email"
    aria-required="true"
    aria-invalid={!!emailError}
    aria-describedby={emailError ? "email-error" : undefined}
  />
  {emailError && (
    <p id="email-error" role="alert" className="text-sm text-red-600 mt-1">
      {emailError}
    </p>
  )}
</div>
```

**Required Fields:**
```tsx
<Label htmlFor="password">
  Password <span className="text-red-600" aria-label="required">*</span>
</Label>
```

---

## TESTING CHECKLIST

### Responsive Design
- ✅ Test on iPhone SE (375px width)
- ✅ Test on iPad (768px width)
- ✅ Test on desktop (1920px width)
- ✅ Hamburger menu works on mobile
- ✅ Sidebar slides in/out smoothly
- ✅ No horizontal scroll on any breakpoint
- ✅ Text remains readable at all sizes
- ✅ Buttons are at least 44x44px
- ✅ Tables work on mobile (scroll or cards)
- ✅ Images/iframes scale proportionally

### Keyboard Navigation
- ✅ Tab through all interactive elements
- ✅ Focus indicators visible on all elements
- ✅ Enter/Space activates buttons
- ✅ Escape closes modals
- ✅ Arrow keys navigate dropdowns
- ✅ No keyboard traps
- ✅ Skip link works

### Screen Reader (Test with NVDA or VoiceOver)
- ✅ All images have alt text
- ✅ All buttons have accessible names
- ✅ Form labels announced correctly
- ✅ Error messages announced
- ✅ Navigation landmarks announced
- ✅ Loading states announced
- ✅ Dynamic content updates announced

### Color Contrast
- ✅ All text meets 4.5:1 ratio (use browser DevTools color picker)
- ✅ UI components meet 3:1 ratio
- ✅ Disabled states distinguishable
- ✅ Focus indicators visible
- ✅ Error states use icon + color

---

## BROWSER COMPATIBILITY

**Supported Browsers:**
- Chrome 100+ ✅
- Firefox 100+ ✅
- Safari 15+ ✅
- Edge 100+ ✅

**Known Issues:**
- iOS Safari: Fixed positioning quirks (use -webkit-overflow-scrolling)
- Safari: Flexbox gap polyfill may be needed for older versions

---

## DELIVERABLES

1. Responsive header with mobile hamburger
2. Responsive sidebar with overlay
3. Sidebar context for state management
4. Mobile-optimized dashboard container
5. Responsive tables (cards or scroll)
6. Keyboard navigation support
7. ARIA labels throughout
8. Focus indicators on all interactive elements
9. Skip link for accessibility
10. Color contrast compliance

**Estimated Lines of Code:** ~400-500 lines (refactoring existing components)
**Key Files:** 8 files modified
