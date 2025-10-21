# API Specification

### Overview

XeroPulse implements a hybrid API approach combining REST for external integrations and tRPC for type-safe internal communication. This design provides optimal developer experience for the TypeScript application while maintaining standard REST endpoints for potential future integrations.

### Core API Architecture

**tRPC Application Layer**
- Type-safe procedures for all internal operations
- Real-time subscriptions for dashboard updates
- Automatic TypeScript type generation
- Built-in input validation with Zod schemas

**REST Integration Layer**
- Webhook endpoints for Xero/XPM notifications
- External API compatibility endpoints
- Health checks and monitoring endpoints
- File upload/download operations

### tRPC Procedure Definitions

```typescript
// Core tRPC router structure
export const appRouter = router({
  // Authentication procedures
  auth: router({
    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(8)
      }))
      .mutation(async ({ input }) => { /* Implementation */ }),
    
    logout: protectedProcedure
      .mutation(async ({ ctx }) => { /* Implementation */ }),
    
    resetPassword: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => { /* Implementation */ })
  }),

  // User management procedures
  users: router({
    list: adminProcedure
      .input(z.object({
        search: z.string().optional(),
        role: z.enum(['executive', 'manager', 'staff']).optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0)
      }))
      .query(async ({ input, ctx }) => { /* Implementation */ }),
    
    create: adminProcedure
      .input(z.object({
        email: z.string().email(),
        role: z.enum(['executive', 'manager', 'staff']),
        sendInvitation: z.boolean().default(true)
      }))
      .mutation(async ({ input, ctx }) => { /* Implementation */ }),
    
    update: adminProcedure
      .input(z.object({
        id: z.string().uuid(),
        role: z.enum(['executive', 'manager', 'staff']).optional(),
        active: z.boolean().optional()
      }))
      .mutation(async ({ input, ctx }) => { /* Implementation */ }),
    
    delete: adminProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ input, ctx }) => { /* Implementation */ })
  }),

  // Dashboard procedures
  dashboards: router({
    getAuthorized: protectedProcedure
      .query(async ({ ctx }) => { /* Return user's authorized dashboards */ }),
    
    getEmbedUrl: protectedProcedure
      .input(z.object({
        dashboardId: z.enum(['dashboard-1', 'dashboard-2', /* ... */])
      }))
      .query(async ({ input, ctx }) => { /* Generate Metabase embed URL */ }),
    
    recordAccess: protectedProcedure
      .input(z.object({
        dashboardId: z.string(),
        accessTime: z.date().default(() => new Date())
      }))
      .mutation(async ({ input, ctx }) => { /* Log dashboard access */ })
  }),

  // Financial data procedures
  financialData: router({
    getLatestSync: protectedProcedure
      .query(async ({ ctx }) => { /* Return last sync timestamp */ }),
    
    triggerSync: adminProcedure
      .mutation(async ({ ctx }) => { /* Trigger manual n8n sync */ }),
    
    getSyncStatus: protectedProcedure
      .query(async ({ ctx }) => { /* Return current sync status */ })
  })
});
```

### REST Endpoints

```typescript
// Webhook endpoints for external integrations
POST /api/webhooks/xero
- Purpose: Receive Xero data change notifications
- Authentication: Webhook signature verification
- Payload: Xero webhook payload
- Response: 200 OK or error status

POST /api/webhooks/xpm
- Purpose: Receive XPM project updates
- Authentication: API key verification
- Payload: XPM webhook payload
- Response: 200 OK or error status

// Health and monitoring
GET /api/health
- Purpose: System health check
- Authentication: None (public)
- Response: { status: 'healthy', timestamp: ISO_STRING, version: STRING }

GET /api/health/detailed
- Purpose: Detailed system status
- Authentication: Admin only
- Response: { database: STATUS, xero: STATUS, metabase: STATUS, n8n: STATUS }

// File operations
POST /api/files/upload
- Purpose: File upload for potential future features
- Authentication: Protected (valid session)
- Content-Type: multipart/form-data
- Response: { fileId: STRING, url: STRING }
```

### Authentication & Authorization

**Session Management**
- Supabase Auth handles JWT generation and validation
- Custom middleware validates session for tRPC procedures
- Role-based access control through procedure-level guards

**Middleware Stack**
```typescript
// Authentication middleware
export const withAuth = t.middleware(async ({ ctx, next }) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  if (!session) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({ ctx: { ...ctx, session } });
});

// Role authorization middleware
export const withRole = (requiredRole: UserRole) => 
  t.middleware(async ({ ctx, next }) => {
    if (!hasRole(ctx.session.user.role, requiredRole)) {
      throw new TRPCError({ code: 'FORBIDDEN' });
    }
    return next();
  });

// Procedure factories
export const protectedProcedure = t.procedure.use(withAuth);
export const adminProcedure = t.procedure.use(withAuth).use(withRole('admin'));
```

**Role Hierarchy**
- `staff` → Can access assigned dashboards only
- `manager` → Can access staff dashboards + management dashboards
- `executive` → Can access all dashboards + admin functions
- `admin` → Technical role with user management capabilities

### Error Handling

**Standardized Error Responses**
```typescript
// tRPC error codes mapping
export const errorCodeMap = {
  UNAUTHORIZED: { status: 401, message: 'Authentication required' },
  FORBIDDEN: { status: 403, message: 'Insufficient permissions' },
  NOT_FOUND: { status: 404, message: 'Resource not found' },
  BAD_REQUEST: { status: 400, message: 'Invalid request data' },
  INTERNAL_SERVER_ERROR: { status: 500, message: 'Internal server error' },
  CONFLICT: { status: 409, message: 'Resource conflict' },
  TOO_MANY_REQUESTS: { status: 429, message: 'Rate limit exceeded' }
} as const;

// Error formatting
export const formatTRPCError = (error: TRPCError) => ({
  code: error.code,
  message: error.message,
  timestamp: new Date().toISOString(),
  ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
});
```

### Rate Limiting

**Implementation Strategy**
- Redis-based rate limiting for production
- Memory-based limiting for development
- Different limits per endpoint type

**Rate Limits**
```typescript
export const rateLimits = {
  // Authentication endpoints
  '/api/auth/login': { requests: 5, window: '15m' },
  '/api/auth/reset-password': { requests: 3, window: '1h' },
  
  // User management
  '/api/trpc/users.create': { requests: 10, window: '1h' },
  '/api/trpc/users.update': { requests: 50, window: '1h' },
  
  // Dashboard access
  '/api/trpc/dashboards.*': { requests: 200, window: '1h' },
  
  // Webhook endpoints
  '/api/webhooks/*': { requests: 1000, window: '1h' }
} as const;
```

### Detailed Rationale

**tRPC Choice Over GraphQL/REST**: tRPC provides end-to-end type safety without code generation overhead. Since this is a TypeScript monorepo, tRPC eliminates the client-server type synchronization problem entirely. GraphQL would add complexity without benefit for our simple CRUD operations. Pure REST would require manual type maintenance and validation.

**Hybrid API Architecture**: External integrations (Xero webhooks) require standard REST endpoints for compatibility. Internal operations benefit from tRPC's type safety. This hybrid approach provides the best of both worlds without forcing external partners to adopt tRPC.

**Role-Based Procedure Guards**: Instead of checking permissions in every procedure, middleware composition ensures role checks are consistent and enforceable at the type level. The procedure factory pattern (`adminProcedure`, `protectedProcedure`) makes authorization explicit in the API definition.

**Key Assumptions**: Metabase embedding will use signed URLs generated server-side (not direct iframe embedding). n8n webhook endpoints will need signature verification for security. Rate limiting assumes Redis availability in production (fallback to memory for development).

**Validation Needs**: All input schemas need validation against actual Xero API response formats. Metabase embedding URL generation needs testing with actual Metabase instance. Webhook signature verification needs testing with real Xero webhook payloads.

---
Perfect! Continuing to the **Components** section.
