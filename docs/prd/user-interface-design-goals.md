# User Interface Design Goals

### Overall UX Vision

XeroPulse delivers a **clean, professional dashboard portal** that prioritizes clarity and speed over complexity. The UX philosophy centers on "zero-click insights"—users log in and immediately see their role-appropriate dashboards without navigation friction. The interface adopts a **minimal chrome approach**: simple header with logo and user menu, sidebar navigation listing available dashboards, and full-width embedded Superset visualizations as the primary content.

The portal feels like a **professional financial intelligence platform**, not a generic admin panel. Visual hierarchy emphasizes data over decoration, with ample whitespace, clear typography, and subtle animations only where they aid comprehension (loading states, transitions). Users should experience a sense of **trust and confidence**—this is authoritative financial data presented with polish and precision.

**Key UX Principles:**
- **Immediate value delivery:** Dashboard loads on login (no empty state or "select a dashboard" friction)
- **Role-aware personalization:** Users never see dashboards they can't access (reduces cognitive load)
- **Performance transparency:** Loading indicators and "last updated" timestamps manage expectations around 2-hour sync lag
- **Progressive disclosure:** Simple dashboard list for most users; admin features (user management) tucked behind role-gated menu

### Key Interaction Paradigms

**1. Dashboard-Centric Navigation**
- Primary navigation is a vertical sidebar listing dashboard names (e.g., "Income vs Expenses," "AR Aging," "WIP by Team")
- Active dashboard highlighted; click switches embedded Superset view in main content area
- No multi-level menus or complex navigation trees—flat structure matches 8-dashboard scope

**2. Embedded Analytics (iframe/SDK)**
- Superset dashboards render as embedded iframes within Next.js portal
- Users interact directly with Superset visualizations (date filters, drill-downs, chart interactions) without leaving portal
- Authentication passed seamlessly from Next.js to Superset (single sign-on experience)

**3. Responsive Grid Layouts**
- Dashboards use Superset's responsive grid system for automatic layout adaptation
- Desktop (1920px): Multi-column dashboard layouts with side-by-side charts
- Tablet (1024px): Stacked layouts with preserved chart readability
- Mobile (phone screens): View-only capability acknowledged as degraded experience for MVP

**4. Role-Based Conditional Rendering**
- Middleware checks user role on every page load
- Sidebar navigation dynamically renders only authorized dashboards
- Admin menu item appears only for admin role (user management UI)

**5. Minimal User Inputs**
- No complex forms or data entry—this is a read-only analytics platform
- Primary inputs: Login form, password reset form, admin user management (add/edit users)
- Dashboard interactions handled entirely by Superset (date pickers, filters, toggles)

### Core Screens and Views

**1. Login Screen**
- Centered card layout with XeroPulse logo, email/password fields, "Forgot Password" link
- Clean, minimal design—no marketing copy or distractions
- Error states for invalid credentials displayed inline

**2. Dashboard Home (Post-Login Default View)**
- User lands on first authorized dashboard automatically
- Sidebar navigation visible with full dashboard list
- Header shows user name/email with logout dropdown

**3. Individual Dashboard Views (8 Total)**
- Full-width embedded Superset dashboard as primary content
- Breadcrumb or page title indicating current dashboard name
- "Last updated: [timestamp]" displayed prominently (builds trust around 2-hour sync)

**4. User Management Admin Panel** *(Admin role only)*
- Table view listing all users with columns: Name, Email, Role, Last Login, Actions (Edit/Delete)
- "Add User" button opens modal with fields: Email, Role dropdown, auto-generated password
- Role assignment dropdown: Executive, Manager, Staff (maps to dashboard permissions)

**5. Password Reset Flow**
- Email entry screen → Confirmation message → Email with reset link → New password entry screen
- Standard Supabase Auth flow with minimal custom UI

**6. Error States**
- 404 page for invalid routes
- "Dashboard unavailable" message if Superset sync fails or dashboard not found
- "Insufficient permissions" page if user attempts to access unauthorized dashboard

### Accessibility: WCAG AA

**Target:** WCAG 2.1 Level AA compliance (industry standard for enterprise applications)

**Key Requirements:**
- Keyboard navigation support (tab order, focus indicators, no mouse-only interactions)
- Color contrast ratios meet 4.5:1 minimum for text, 3:1 for UI components
- Alt text for logos/icons; ARIA labels for interactive elements
- Form validation errors announced to screen readers
- Responsive text sizing (users can zoom to 200% without breaking layouts)

**Rationale:** Professional services firms may have diverse user needs; AA compliance ensures accessibility without the implementation burden of AAA (which requires 7:1 contrast, sign language videos, etc.).

**Assumption:** Superset dashboards inherit accessibility from Superset's default rendering; custom accessibility work limited to Next.js portal UI.

### Branding

**Brand Identity:** Professional, trustworthy, modern financial software aesthetic

**Visual Style:**
- **Color palette:** Deep blues and grays (conveys financial professionalism and trust)
  - Primary: Deep blue (#1E3A8A or similar) for headers, CTAs, active states
  - Secondary: Slate gray (#64748B) for body text, borders
  - Accent: Subtle teal or green for success states, positive metrics
  - Background: Off-white (#F8FAFC) to reduce eye strain vs. pure white
- **Typography:**
  - Headings: Inter or similar geometric sans-serif (modern, clean)
  - Body: System font stack for performance (SF Pro on macOS, Segoe UI on Windows)
  - Dashboard text: Inherit from Superset defaults (typically Roboto or Open Sans)
- **Logo:** "XeroPulse" wordmark with subtle pulse/heartbeat icon element (suggests real-time data flow)
- **Iconography:** Minimal use of icons; where needed, use Heroicons or Lucide (consistent with modern web apps)

**Assumptions Made:**
- No existing brand guidelines provided—proposing financial software standard palette
- Logo does not exist yet—will need design (or use text-only wordmark for MVP)
- Branding should feel cohesive with Xero's UI (blue/white palette) to signal integration, but distinct enough to be standalone product

### Target Device and Platforms: Web Responsive (Desktop/Tablet Primary)

**Supported Platforms:**
- **Desktop browsers (primary):** Chrome 100+, Firefox 100+, Safari 15+, Edge 100+ on Windows 10+, macOS 11+, Linux (Ubuntu 20.04+)
- **Tablet browsers (secondary):** iPad Safari, Android Chrome on 1024px+ tablets
- **Mobile browsers (degraded experience):** iPhone Safari, Android Chrome—view-only capability, no responsive optimization for MVP

**Screen Size Optimization:**
- **Desktop (1920px+):** Multi-column dashboard layouts, optimal chart visibility
- **Laptop (1366-1920px):** Slightly condensed layouts, still comfortable viewing
- **Tablet (1024-1366px):** Stacked single-column layouts, charts sized for readability
- **Phone (<1024px):** Basic rendering without layout breaks, but suboptimal experience (small charts, horizontal scrolling possible)

**Rationale:** Professional services users primarily work on desktop/laptop during business hours; mobile optimization deferred to Phase 2 (Month 5 per roadmap).

**Deployment:** Web application only (no native mobile apps, no desktop Electron app)

---
