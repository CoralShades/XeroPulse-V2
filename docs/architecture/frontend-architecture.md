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
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout with ChakraProvider
│   └── page.tsx                  # Landing/redirect page
├── components/                   # Reusable UI components
│   ├── chakra/                   # Chakra UI theme and providers
│   │   ├── theme/                # Custom theme configuration
│   │   │   ├── index.ts          # Main theme (extends Chakra)
│   │   │   ├── colors.ts         # Brand color palette
│   │   │   ├── components.ts     # Component style overrides
│   │   │   └── foundations.ts    # Typography, spacing, etc.
│   │   └── provider.tsx          # ChakraProvider wrapper
│   ├── ui/                       # Custom Chakra UI components
│   │   ├── motion.tsx            # Chakra UI Motion wrappers
│   │   ├── data-table.tsx        # Chakra Table wrapper
│   │   └── stat-card.tsx         # Custom stat card component
│   ├── ag-grid/                  # AG-UI Enterprise components (4 tables)
│   │   ├── user-grid.tsx         # User management table
│   │   ├── wip-grid.tsx          # WIP analysis table
│   │   ├── services-grid.tsx     # Services analysis table
│   │   └── recovery-grid.tsx     # Client recoverability table
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
│   ├── globals.css               # Global CSS resets
│   └── fonts.css                 # Font loading (Google Fonts)
└── types/                        # TypeScript type definitions
    ├── auth.ts                   # Authentication types
    ├── dashboard.ts              # Dashboard-related types
    ├── api.ts                    # API response types
    └── global.ts                 # Global type definitions
```

### Component Architecture Patterns

**Atomic Design Structure**
- **Atoms**: Basic UI elements (Button, Input, Badge) from Chakra UI
- **Molecules**: Combined UI elements (FormControl groups, Stat cards, Menu compositions)
- **Organisms**: Complex UI sections (Header, Sidebar, DashboardContainer)
- **Templates**: Page layouts (AuthLayout with ChakraProvider, DashboardLayout)
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

**Client State with Chakra UI Hooks**
```tsx
// Leverage Chakra UI built-in state management hooks
import { useColorMode, useDisclosure, useToast } from '@chakra-ui/react'

export function DashboardHeader() {
  // Color mode management (light/dark theme)
  const { colorMode, toggleColorMode } = useColorMode()

  // Modal state management
  const { isOpen, onOpen, onClose } = useDisclosure()

  // Toast notifications
  const toast = useToast()

  const handleSave = () => {
    // Save logic
    toast({
      title: 'Changes saved',
      status: 'success',
      duration: 3000,
    })
  }

  return (
    <Box>
      <IconButton
        icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
        onClick={toggleColorMode}
        aria-label="Toggle theme"
      />
      <Button onClick={onOpen}>Open Settings</Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        {/* Modal content */}
      </Modal>
    </Box>
  )
}
```

**Custom Context for Application State**
```tsx
// Minimal custom context for app-specific concerns
interface AppState {
  sidebarCollapsed: boolean;
  activeFilters: Record<string, any>;
}

export const AppContext = createContext<{
  state: AppState;
  actions: {
    toggleSidebar: () => void;
    setFilters: (filters: Record<string, any>) => void;
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

## Chakra UI Component Library Inventory

### Core Components (Required for MVP)

Based on all 8 dashboards, the complete Chakra UI component library needed:

```typescript
// Layout & Navigation
import {
  Box, Flex, Grid, SimpleGrid, Container, Stack, HStack, VStack,
  Card, CardHeader, CardBody, CardFooter,
  Tabs, TabList, Tab, TabPanels, TabPanel,
  Divider, Spacer
} from '@chakra-ui/react'

// Data Display
import {
  Table, Thead, Tbody, Tr, Th, Td, TableContainer,
  Badge, Tag, TagLabel, TagCloseButton,
  Avatar, AvatarBadge, AvatarGroup,
  Stat, StatLabel, StatNumber, StatHelpText, StatArrow, StatGroup,
  List, ListItem, ListIcon, OrderedList, UnorderedList
} from '@chakra-ui/react'

// Forms & Inputs
import {
  Button, IconButton, ButtonGroup,
  Input, InputGroup, InputLeftElement, InputRightElement, InputLeftAddon, InputRightAddon,
  Textarea,
  Select,
  Checkbox, CheckboxGroup,
  Radio, RadioGroup,
  Switch,
  Slider, SliderTrack, SliderFilledTrack, SliderThumb,
  FormControl, FormLabel, FormErrorMessage, FormHelperText
} from '@chakra-ui/react'

// Feedback
import {
  Progress, CircularProgress, CircularProgressLabel,
  Spinner,
  Skeleton, SkeletonCircle, SkeletonText,
  Alert, AlertIcon, AlertTitle, AlertDescription,
  useToast // Toast hook (not component)
} from '@chakra-ui/react'

// Overlay
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton,
  Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter, DrawerCloseButton,
  AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter,
  Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverBody, PopoverArrow, PopoverCloseButton,
  Tooltip,
  Menu, MenuButton, MenuList, MenuItem, MenuGroup, MenuDivider
} from '@chakra-ui/react'

// Typography
import { Heading, Text, Code } from '@chakra-ui/react'

// Media & Icons
import { Image, Icon } from '@chakra-ui/react'
import { ChakraProvider, ColorModeScript, useColorMode, useColorModeValue } from '@chakra-ui/react'

// Utility Hooks
import { useDisclosure, useBreakpointValue, useTheme } from '@chakra-ui/react'
```

### Chakra UI Motion (Animation)

```typescript
// Chakra UI Motion components (integrated Framer Motion)
import { motion } from 'framer-motion'
import { Box, Flex } from '@chakra-ui/react'

// Create motion components
export const MotionBox = motion(Box)
export const MotionFlex = motion(Flex)

// Usage example
<MotionBox
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  Dashboard content
</MotionBox>
```

### Custom Components (Built on Chakra UI)

```typescript
// Custom data table wrapper (Chakra Table for simple tables)
import { DataTable } from '@/components/ui/data-table'

// Custom stat card (extends Chakra Stat)
import { StatCard } from '@/components/ui/stat-card'

// Custom date range picker (extends Chakra Calendar integration)
import { DateRangePicker } from '@/components/ui/date-range-picker'

// Custom radial progress (uses Chakra CircularProgress)
import { RadialProgress } from '@/components/ui/radial-progress'

// Custom stat card (KPI metrics)
import { StatCard } from "@/components/ui/stat-card"
```

### Component-to-Dashboard Mapping

| Dashboard | Required Components | Custom Components |
|-----------|---------------------|-------------------|
| **Dashboard 1** | Card, Tabs, Select, Badge, Separator | ChartContainer (if internal BI) |
| **Dashboard 2** | Card, Select, Tooltip | ChartContainer (if internal BI) |
| **Dashboard 3** | Card, Tabs, Progress, Badge | StatCard, ChartContainer |
| **Dashboard 4** | Table, Card, Tabs, Select, Badge, Calendar, Popover, Button | DataTable (expandable rows) |
| **Dashboard 5** | Table, Badge, Progress, Select | RadialProgress |
| **Dashboard 6** | Table, Card, Button, Calendar, Popover, Badge | MultiSelect, DataTable |
| **Dashboard 7** | Card, Badge, Select, Tooltip | ChartContainer (if internal BI) |
| **Dashboard 8** | Table, Card, Tabs, Button, Select | DataTable |

---

## Charting Library Decision Framework

### Option A: Recharts (Recommended for MVP)

**Installation**:
```bash
npm install recharts
```

**Pros**:
- ✅ React-native, fully composable
- ✅ Well-documented with extensive examples
- ✅ TypeScript support out-of-the-box
- ✅ Supports all chart types needed (Bar, Line, Area, Donut)
- ✅ Free and open-source

**Cons**:
- ⚠️ Styling requires manual configuration
- ⚠️ Some advanced features require custom code
- ⚠️ Bundle size: ~95KB gzipped

**Best For**: Bar, Line, Area, and Donut charts across all dashboards

**Example Usage**:
```typescript
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

export function IncomeExpenseChart({ data }: { data: ChartData[] }) {
  return (
    <ComposedChart width={1000} height={400} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="weekEnding" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="income" fill="#3B82F6" name="Income" />
      <Line
        type="monotone"
        dataKey="wagesAvg"
        stroke="#FBBF24"
        name="Wages (8wk Avg)"
        strokeWidth={2}
      />
    </ComposedChart>
  )
}
```

### Option B: Tremor (Modern Alternative)

**Installation**:
```bash
npm install @tremor/react
```

**Pros**:
- ✅ Tailwind-native, beautiful defaults
- ✅ Built-in dark mode support
- ✅ Dashboard-style charts with minimal config
- ✅ Excellent TypeScript support
- ✅ Smaller bundle size: ~45KB gzipped

**Cons**:
- ⚠️ Less customizable than Recharts
- ⚠️ Fewer chart types available
- ⚠️ Newer library (less community resources)
- ⚠️ Requires Tailwind CSS (adds dependency alongside Chakra UI)

**Best For**: KPI cards, simple charts, donut charts

**Example Usage**:
```typescript
import { DonutChart, Card } from "@tremor/react"

export function WIPAgingChart({ data }: { data: WIPData[] }) {
  return (
    <Card>
      <DonutChart
        data={data}
        category="wip"
        index="agingBucket"
        colors={["green", "yellow", "orange", "red"]}
        valueFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
      />
    </Card>
  )
}
```

### Option C: AG Grid Enterprise (If Budget Allows)

**Installation**:
```bash
npm install ag-grid-react ag-grid-enterprise
```

**Pricing**: ~$1,000/year per developer (commercial license required)

**Pros**:
- ✅ Advanced table features (sorting, filtering, grouping, Excel export)
- ✅ Master-detail (expandable rows)
- ✅ Virtual scrolling for large datasets
- ✅ Built-in CSV/Excel export
- ✅ Column pinning, resizing, reordering

**Cons**:
- ⚠️ Requires commercial license (~$1,000/year)
- ⚠️ Large bundle size: ~200KB gzipped
- ⚠️ Steep learning curve

**Best For**: Dashboard 4 (WIP table with expandable rows), Dashboard 6 (Services table with complex filtering)

**Decision**: Use AG Grid only if:
- Budget allows (~$1,000/year)
- Dashboard 4 and 6 require advanced table features
- Export to Excel is critical feature

Otherwise, use Chakra Table + custom DataTable component

### Recommendation Matrix

| Use Case | Recommended Library | Rationale |
|----------|-------------------|-----------|
| **Charts (All Dashboards)** | Recharts | Free, flexible, comprehensive chart types |
| **KPI Cards & Simple Charts** | Tremor | Better DX, beautiful defaults |
| **Basic Tables** | Chakra Table | Sufficient for most use cases, free |
| **Advanced Tables** | AG Grid Enterprise | Only if budget allows, Dashboard 4/6 benefit most |
| **Donut Charts** | Tremor | Simpler API, better visuals |

**Final Recommendation**:
- Use **Recharts** for charts (free, flexible)
- Use **Tremor** for KPI cards and donut charts (better DX)
- Use **Chakra Table** for basic tables
- Upgrade to **AG Grid Enterprise** later if budget allows (Dashboard 4, 6 would benefit)

---

## Metabase vs Internal BI Decision Matrix

### Option A: Metabase Embedding (MVP Recommended)

**Pros**:
- ✅ Faster time-to-market (2-3 weeks)
- ✅ Leverage Metabase's query builder and chart library
- ✅ Secure JWT-signed iframe embedding
- ✅ Built-in caching and query optimization
- ✅ No frontend charting code to maintain

**Cons**:
- ⚠️ Limited customization of look-and-feel
- ⚠️ Iframe performance overhead
- ⚠️ Dependent on Metabase infrastructure
- ⚠️ Less control over user experience

**Best For**: MVP launch, complex analytical dashboards (Dashboard 4, 6, 7, 8)

**Implementation Complexity**: **Low**
- 2-3 weeks for all 8 dashboards
- Minimal frontend code (iframe embedding)
- Focus on Metabase dashboard configuration

### Option B: Internal BI with Chakra UI + React Charts

**Pros**:
- ✅ Full design control and brand alignment
- ✅ Better mobile responsiveness
- ✅ Direct Supabase data access (no Metabase layer)
- ✅ MCP integration for real-time data
- ✅ No iframe performance overhead

**Cons**:
- ⚠️ Longer development time (6-8 weeks)
- ⚠️ More frontend code to maintain
- ⚠️ Need to implement caching manually
- ⚠️ Higher complexity for complex dashboards

**Best For**: Future enhancement, simple KPI dashboards (Dashboard 1, 2, 3)

**Implementation Complexity**: **High**
- 6-8 weeks for all 8 dashboards
- Requires tRPC routers, Supabase database functions, chart components
- Dashboard 4 alone could take 2-3 weeks

### Option C: Hybrid Approach (Best of Both Worlds)

**Strategy**:
- Use **Metabase** for complex analytical dashboards (Dashboard 4, 6, 7, 8)
- Build **Internal BI** for simple KPI dashboards (Dashboard 1, 2, 3)
- Gradual migration strategy

**Pros**:
- ✅ Fast MVP launch with Metabase
- ✅ Full control for key dashboards
- ✅ Flexibility to migrate over time
- ✅ Reduced dependency on Metabase

**Cons**:
- ⚠️ Maintain two systems
- ⚠️ Inconsistent user experience initially
- ⚠️ More complex architecture

**Timeline**:
- **Phase 1 (MVP - 3 weeks)**: All 8 dashboards in Metabase
- **Phase 2 (Post-MVP - 4 weeks)**: Rebuild Dashboard 1, 2, 3 internally
- **Phase 3 (Optional - 6 weeks)**: Migrate Dashboard 4, 6, 7, 8 if needed

### Decision Framework

**Choose Metabase if**:
- ✅ Time-to-market is critical (MVP in 2-3 weeks)
- ✅ Dashboard complexity is high (Dashboard 4, 6, 7, 8)
- ✅ Team lacks frontend charting experience
- ✅ Budget allows Metabase embedding license

**Choose Internal BI if**:
- ✅ Brand alignment and design control are critical
- ✅ Mobile-first experience is priority
- ✅ Team has strong React/TypeScript skills
- ✅ Long-term maintenance cost is concern

**Choose Hybrid if**:
- ✅ Want fast MVP but full control later
- ✅ Can afford phased implementation
- ✅ Need to reduce Metabase dependency over time

**XeroPulse Recommendation**: **Option A (Metabase Embedding)** for MVP, with Option C (Hybrid) as post-launch enhancement strategy.

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
