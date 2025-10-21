# Frontend Architecture

### Next.js Application Structure

XeroPulse follows Next.js 14+ App Router conventions with a clean separation between public routes (authentication), protected routes (dashboards), and admin routes (user management). The architecture leverages React Server Components for optimal performance while maintaining rich interactivity through client components where needed.

```
src/
├── app/                          # Next.js App Router pages
│   ├── (auth)/                   # Route group for authentication
│   │   ├── login/page.tsx        # Login page (public)
│   │   ├── signup/page.tsx       # User registration (admin invite only)
│   │   └── layout.tsx            # Auth layout (minimal shell)
│   ├── (dashboard)/              # Route group for authenticated users
│   │   ├── dashboard/            # Main dashboard directory
│   │   │   ├── [dashboardId]/    # Dynamic dashboard routes
│   │   │   │   └── page.tsx      # Dashboard embed page
│   │   │   ├── page.tsx          # Dashboard list/home
│   │   │   └── loading.tsx       # Dashboard loading states
│   │   ├── admin/                # Admin panel routes
│   │   │   ├── users/            # User management
│   │   │   │   ├── page.tsx      # User list
│   │   │   │   ├── [userId]/     # User detail/edit
│   │   │   │   └── new/page.tsx  # Create user
│   │   │   └── sync/page.tsx     # Data sync monitoring
│   │   └── layout.tsx            # Main app layout with navigation
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── trpc/                 # tRPC handler
│   │   └── webhooks/             # External webhook handlers
│   ├── globals.css               # Global Tailwind styles
│   ├── layout.tsx                # Root layout with providers
│   └── page.tsx                  # Landing/redirect page
├── components/                   # Reusable UI components
│   ├── ui/                       # shadcn/ui base components
│   │   ├── button.tsx            # Button component variations
│   │   ├── input.tsx             # Form input components
│   │   ├── modal.tsx             # Dialog/modal components
│   │   ├── table.tsx             # Data table components
│   │   └── index.ts              # Component exports
│   ├── layout/                   # Layout-specific components
│   │   ├── Header.tsx            # Top navigation bar
│   │   ├── Sidebar.tsx           # Collapsible side navigation
│   │   ├── UserMenu.tsx          # User account dropdown
│   │   └── MobileMenu.tsx        # Responsive mobile navigation
│   ├── dashboard/                # Dashboard-specific components
│   │   ├── DashboardContainer.tsx # Metabase embed wrapper
│   │   ├── DashboardCard.tsx     # Dashboard preview cards
│   │   ├── EmbedFrame.tsx        # Secure iframe component
│   │   └── LoadingSkeleton.tsx   # Dashboard loading states
│   ├── admin/                    # Admin panel components
│   │   ├── UserTable.tsx         # User management table
│   │   ├── UserModal.tsx         # Create/edit user modal
│   │   ├── SyncStatus.tsx        # Data sync monitoring
│   │   └── RoleBadge.tsx         # User role indicators
│   ├── auth/                     # Authentication components
│   │   ├── LoginForm.tsx         # Email/password login
│   │   ├── AuthGuard.tsx         # Route protection wrapper
│   │   └── RoleGuard.tsx         # Role-based access control
│   └── shared/                   # Shared utility components
│       ├── LoadingSpinner.tsx    # Loading indicators
│       ├── ErrorBoundary.tsx     # Error handling wrapper
│       ├── SearchInput.tsx       # Debounced search input
│       └── Toast.tsx             # Notification system
├── lib/                          # Utility libraries and configuration
│   ├── auth.ts                   # Supabase Auth configuration
│   ├── supabase.ts               # Supabase client setup
│   ├── trpc.ts                   # tRPC client configuration
│   ├── utils.ts                  # Utility functions (cn, etc.)
│   └── validations.ts            # Zod schema definitions
├── styles/                       # Styling and theme configuration
│   ├── globals.css               # Global styles and Tailwind imports
│   └── components.css            # Component-specific styles
└── types/                        # TypeScript type definitions
    ├── auth.ts                   # Authentication types
    ├── dashboard.ts              # Dashboard-related types
    ├── api.ts                    # API response types
    └── global.ts                 # Global type definitions
```

### Component Architecture Patterns

**Atomic Design Structure**
- **Atoms**: Basic UI elements (Button, Input, Badge) from shadcn/ui
- **Molecules**: Combined UI elements (SearchInput, UserMenu, RoleBadge)
- **Organisms**: Complex UI sections (Header, Sidebar, DashboardContainer)
- **Templates**: Page layouts (AuthLayout, DashboardLayout)
- **Pages**: Complete routes (LoginPage, DashboardPage, AdminPage)

**Component Composition Pattern**
```tsx
// Example: Dashboard page composition
export default function DashboardPage({ params }: { params: { dashboardId: string } }) {
  return (
    <DashboardLayout>
      <DashboardHeader dashboardId={params.dashboardId} />
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContainer dashboardId={params.dashboardId} />
      </Suspense>
      <DashboardActions dashboardId={params.dashboardId} />
    </DashboardLayout>
  );
}
```

### State Management Strategy

**Server State with tRPC**
```tsx
// Server state management with automatic caching and revalidation
import { api } from "~/lib/trpc";

export function UserManagementPage() {
  const { data: users, isLoading, error } = api.admin.getUsers.useQuery({
    search: searchTerm,
    role: roleFilter
  });

  const createUser = api.admin.createUser.useMutation({
    onSuccess: () => {
      // Automatic cache invalidation and refetch
      utils.admin.getUsers.invalidate();
    }
  });

  return (
    <div>
      {isLoading && <LoadingSkeleton />}
      {error && <ErrorMessage error={error} />}
      <UserTable users={users} onCreateUser={createUser.mutate} />
    </div>
  );
}
```

**Client State with React Context**
```tsx
// Minimal client state for UI-only concerns
interface UIState {
  sidebarCollapsed: boolean;
  currentTheme: 'light' | 'dark';
  activeModal: string | null;
}

export const UIContext = createContext<{
  state: UIState;
  actions: {
    toggleSidebar: () => void;
    setTheme: (theme: 'light' | 'dark') => void;
    openModal: (modalId: string) => void;
    closeModal: () => void;
  };
}>();
```

### Routing & Navigation Architecture

**Route Protection Strategy**
```tsx
// Multi-layered route protection
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <RoleGuard allowedRoles={['staff', 'manager', 'executive', 'admin']}>
        <DashboardShell>
          {children}
        </DashboardShell>
      </RoleGuard>
    </AuthGuard>
  );
}

// Role-specific admin routes
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <RoleGuard allowedRoles={['admin', 'executive']}>
        <AdminShell>
          {children}
        </AdminShell>
      </RoleGuard>
    </AuthGuard>
  );
}
```

**Dynamic Dashboard Routing**
```tsx
// Dynamic route handling for dashboard embedding
export default async function DashboardPage({ params }: { params: { dashboardId: string } }) {
  const user = await getCurrentUser();
  const hasAccess = await checkDashboardAccess(user, params.dashboardId);
  
  if (!hasAccess) {
    redirect('/dashboard?error=access_denied');
  }

  const embedUrl = await generateEmbedUrl(params.dashboardId, user);
  
  return <DashboardEmbed url={embedUrl} dashboardId={params.dashboardId} />;
}
```

### Performance Optimization Strategies

**Code Splitting & Lazy Loading**
```tsx
// Lazy load admin components for non-admin users
const AdminPanel = lazy(() => import('~/components/admin/AdminPanel'));
const DashboardContainer = lazy(() => import('~/components/dashboard/DashboardContainer'));

export function AppRouter() {
  const { user } = useAuth();
  
  return (
    <Router>
      <Routes>
        <Route path="/dashboard/*" element={
          <Suspense fallback={<DashboardSkeleton />}>
            <DashboardContainer />
          </Suspense>
        } />
        {user?.role === 'admin' && (
          <Route path="/admin/*" element={
            <Suspense fallback={<AdminSkeleton />}>
              <AdminPanel />
            </Suspense>
          } />
        )}
      </Routes>
    </Router>
  );
}
```

**Image & Asset Optimization**
```tsx
// Optimized image handling with Next.js Image component
import Image from 'next/image';

export function DashboardCard({ dashboard }: { dashboard: Dashboard }) {
  return (
    <Card>
      <Image
        src={dashboard.thumbnail || '/default-dashboard.png'}
        alt={`${dashboard.name} preview`}
        width={300}
        height={200}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        priority={dashboard.isDefault}
      />
      <CardContent>
        <h3>{dashboard.name}</h3>
        <p>{dashboard.description}</p>
      </CardContent>
    </Card>
  );
}
```

### Security Implementation

**Content Security Policy**
```tsx
// Next.js security headers configuration
export const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' ${process.env.METABASE_DOMAIN};
      frame-src 'self' ${process.env.METABASE_DOMAIN};
      connect-src 'self' ${process.env.SUPABASE_URL} ${process.env.METABASE_DOMAIN};
      img-src 'self' data: blob: ${process.env.SUPABASE_URL};
      style-src 'self' 'unsafe-inline';
    `.replace(/\s{2,}/g, ' ').trim()
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  }
];
```

**Input Sanitization & Validation**
```tsx
// Form validation with Zod schemas
import { z } from 'zod';

const CreateUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  role: z.enum(['staff', 'manager', 'executive', 'admin']),
  sendInvitation: z.boolean().optional().default(true)
});

export function CreateUserForm() {
  const form = useForm<z.infer<typeof CreateUserSchema>>({
    resolver: zodResolver(CreateUserSchema),
    defaultValues: {
      email: '',
      role: 'staff',
      sendInvitation: true
    }
  });

  const onSubmit = (data: z.infer<typeof CreateUserSchema>) => {
    // Data is automatically validated and type-safe
    createUser.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Form fields with automatic validation */}
      </form>
    </Form>
  );
}
```

---

**Detailed Rationale:**

**Next.js App Router Choice**: App Router provides better performance through React Server Components, improved routing with layout support, and enhanced developer experience with file-based routing. The route grouping strategy isolates authentication flows from dashboard functionality.

**Component Architecture**: Atomic design principles ensure component reusability and maintainability. The separation between UI components (atoms/molecules) and feature components (organisms) enables independent testing and development.

**State Management Strategy**: Server state handled by tRPC provides automatic caching, revalidation, and type safety. Client state minimized to UI-only concerns reduces complexity and prevents data synchronization issues.

**Security Implementation**: CSP headers prevent XSS attacks while allowing necessary iframe embedding for Metabase. Input validation with Zod ensures type safety and prevents malicious input at the component level.

**Performance Optimization**: Code splitting based on user roles ensures non-admin users don't download admin-specific code. Next.js Image optimization reduces bandwidth usage for dashboard thumbnails and assets.

**Key Assumptions**: Metabase embedding domain remains consistent across environments. User roles change infrequently enough that code splitting by role is beneficial. Dashboard thumbnails are available from Metabase API or can be pre-generated.

**Areas Needing Validation**: Performance testing of dashboard iframe embedding with multiple concurrent users. Security testing of CSP headers with actual Metabase content. Accessibility testing of dashboard navigation and screen reader compatibility.

Perfect! I can see you have an active architecture.md file. Let me continue with the next section - **Backend Architecture**.

---
