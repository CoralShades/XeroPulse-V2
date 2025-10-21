# Components

### Component Architecture Overview

XeroPulse follows a modular component architecture with clear separation between frontend components (Next.js/React), backend services (FastAPI), and integration components (n8n workflows). This design enables independent scaling, testing, and maintenance of each component layer.

### Frontend Components (Next.js Application)

**Authentication Layer**
```typescript
// Authentication components with Supabase integration
AuthProvider: Context provider for global auth state
LoginForm: Email/password authentication with validation
PasswordResetForm: Password reset flow with email verification
AuthGuard: Route protection component for private pages
RoleGuard: Role-based access control wrapper

// Session management
SessionManager: Automatic token refresh and logout handling
AuthRedirect: Handles post-login routing based on user role
```

**Dashboard Shell Components**
```typescript
// Layout and navigation
AppLayout: Main application shell (header + sidebar + content)
Header: Top navigation with user menu and branding
Sidebar: Collapsible navigation with dashboard list
DashboardContainer: Wrapper for embedded Metabase iframes
LoadingSkeleton: Placeholder content during dashboard loading

// Navigation components
NavigationItem: Individual sidebar navigation element
UserMenu: Dropdown menu with admin/logout actions
MobileMenu: Responsive hamburger menu for mobile devices
```

**Admin Panel Components**
```typescript
// User management interface
UserManagementPage: Main admin dashboard
UserTable: Sortable/filterable table of system users
UserModal: Add/edit user form with role selection
DeleteConfirmation: Safety confirmation for user deletion
RoleBadge: Visual indicator for user roles

// Form components
UserForm: Reusable form for user creation/editing
SearchInput: Real-time search with debouncing
RoleSelector: Dropdown for role assignment
```

**UI Component Library (shadcn/ui based)**
```typescript
// Core interaction components
Button: Primary/secondary/destructive action buttons
Input: Text/email/password input fields with validation
Modal: Overlay dialogs for focused tasks
Toast: Non-blocking success/error notifications
Table: Data display with sorting and pagination

// Form components
Label: Accessible form field labels
Select: Dropdown selection components
Checkbox: Boolean input with proper accessibility
FormField: Wrapper for form validation and errors

// Layout components
Card: Content containers with consistent styling
Badge: Status and role indicators
Skeleton: Loading state placeholders
```

### Backend Service Components (FastAPI/Python)

**Authentication Service**
```python
# Supabase integration service
class AuthService:
    async def authenticate_user(email: str, password: str) -> AuthResult
    async def create_user(email: str, role: UserRole) -> User
    async def reset_password(email: str) -> ResetResult
    async def validate_session(token: str) -> Optional[User]
    async def refresh_token(refresh_token: str) -> TokenPair

# Role-based authorization
class AuthorizationService:
    def check_dashboard_access(user: User, dashboard_id: str) -> bool
    def check_admin_access(user: User) -> bool
    def get_authorized_dashboards(user: User) -> List[DashboardConfig]
```

**Dashboard Service**
```python
# Metabase integration service
class DashboardService:
    async def generate_embed_url(dashboard_id: str, user: User) -> str
    async def get_dashboard_config(dashboard_id: str) -> DashboardConfig
    async def validate_dashboard_access(user: User, dashboard_id: str) -> bool
    async def log_dashboard_access(user: User, dashboard_id: str) -> None

# Dashboard configuration management
class DashboardConfigService:
    def get_all_dashboards() -> List[DashboardConfig]
    def get_dashboards_by_role(role: UserRole) -> List[DashboardConfig]
    def get_dashboard_metadata(dashboard_id: str) -> DashboardMetadata
```

**User Management Service**
```python
# User CRUD operations
class UserService:
    async def list_users(search: str, role_filter: UserRole) -> List[User]
    async def create_user(user_data: CreateUserRequest) -> User
    async def update_user(user_id: str, updates: UpdateUserRequest) -> User
    async def delete_user(user_id: str) -> None
    async def send_invitation_email(user: User) -> None

# User session and activity tracking
class UserActivityService:
    async def track_login(user: User) -> None
    async def track_dashboard_access(user: User, dashboard_id: str) -> None
    async def get_user_activity(user_id: str) -> List[ActivityRecord]
```

**Data Synchronization Service**
```python
# Financial data sync coordination
class SyncService:
    async def get_last_sync_timestamp() -> datetime
    async def trigger_manual_sync() -> SyncResult
    async def get_sync_status() -> SyncStatus
    async def monitor_sync_health() -> HealthStatus

# Xero/XPM integration monitoring
class IntegrationMonitorService:
    async def check_xero_connection() -> ConnectionStatus
    async def check_xpm_connection() -> ConnectionStatus
    async def handle_webhook_payload(source: str, payload: dict) -> None
```

### Integration Components (n8n ETL Workflows)

**Xero Data Pipeline**
```javascript
// n8n workflow components for Xero integration
XeroAccountingDataSync: Extracts general ledger, invoices, payments
XeroBankTransactionSync: Processes bank reconciliation data
XeroContactSync: Synchronizes client/supplier information
XeroReportingSync: Pulls trial balance and P&L data

// Data transformation nodes
XeroDataCleaner: Standardizes Xero data formats
XeroDataValidator: Ensures data quality before storage
XeroDataMapper: Maps Xero fields to internal schema
```

**XPM Integration Pipeline**
```javascript
// XPM project management data sync
XPMProjectSync: Extracts project data and time tracking
XPMClientSync: Synchronizes client information
XPMBudgetSync: Pulls budget vs actual data
XPMTimeSync: Processes timesheet and billing data

// Integration coordination
IntegrationScheduler: Manages sync timing and dependencies
ErrorHandler: Handles and logs integration failures
DataQualityMonitor: Validates data integrity post-sync
```

**Database Storage Layer**
```javascript
// Supabase integration components
SupabaseWriter: Handles all database write operations
DataArchiver: Archives historical data for compliance
SchemaValidator: Ensures data matches expected structure
ConflictResolver: Handles duplicate/conflicting records
```

### External Service Integration Components

**Metabase Embedding Service**
```python
# Metabase integration for dashboard embedding
class MetabaseEmbedService:
    def generate_signed_url(dashboard_id: str, user_context: dict) -> str
    def validate_embed_permissions(user: User, dashboard_id: str) -> bool
    def refresh_dashboard_cache(dashboard_id: str) -> None
    def get_dashboard_refresh_status(dashboard_id: str) -> RefreshStatus

# Metabase configuration management
class MetabaseConfigService:
    def sync_user_permissions(user: User) -> None
    def create_dashboard_collection(organization: str) -> str
    def configure_row_level_security(user: User) -> dict
```

**Email Service Component**
```python
# Email delivery via Supabase Auth
class EmailService:
    async def send_invitation_email(user: User, temp_password: str) -> bool
    async def send_password_reset_email(email: str, reset_link: str) -> bool
    async def send_system_notification(recipients: List[str], message: str) -> bool
    async def log_email_delivery(email_id: str, status: str) -> None
```

### Component Communication Patterns

**Frontend-Backend Communication**
- tRPC for type-safe API calls with automatic TypeScript generation
- Real-time subscriptions for dashboard updates (WebSocket via tRPC)
- RESTful endpoints for webhook integrations from external services

**Service-to-Service Communication**
- Direct database access via Supabase client libraries
- HTTP API calls for Metabase operations
- Webhook callbacks for n8n workflow completion

**Error Handling Patterns**
- Circuit breaker pattern for external API calls
- Retry logic with exponential backoff for transient failures
- Dead letter queues for failed webhook processing

### Component Dependencies

**Critical Dependencies**
```typescript
// External service dependencies
Supabase: Authentication, database, real-time subscriptions
Metabase: Dashboard rendering and embedding
n8n: ETL workflow orchestration
Xero API: Accounting data source
XPM API: Project management data source

// Development dependencies
Next.js: Frontend framework and API routes
FastAPI: Backend service framework
PostgreSQL: Primary data storage
Redis: Session storage and caching (production)
```

**Component Interaction Matrix**
```
Authentication Service ↔ User Management ↔ Dashboard Service
           ↓                    ↓                 ↓
    Supabase Auth      Supabase Database    Metabase API
           ↑                    ↑                 ↑
    Frontend Auth     Frontend Admin    Dashboard Container
```

### Component Deployment Strategy

**Frontend Deployment (Vercel)**
- Static generation for authentication pages
- Server-side rendering for dashboard pages
- Edge functions for API routes requiring low latency

**Backend Deployment (Vercel Functions)**
- Serverless functions for FastAPI endpoints
- Automatic scaling based on request volume
- Environment-based configuration (dev/staging/prod)

**Integration Deployment (n8n Cloud)**
- Managed n8n instance with workflow version control
- Scheduled execution for regular data synchronization
- Manual trigger capabilities for immediate sync needs

### Detailed Rationale

**Component Separation Strategy**: Authentication, user management, and dashboard services are separated to enable independent scaling and testing. Authentication handles high-frequency session validation, user management handles low-frequency admin operations, and dashboard service handles variable-frequency embed URL generation.

**Frontend Component Architecture**: React components follow atomic design principles (atoms → molecules → organisms → templates). The component library approach with shadcn/ui provides consistency without external dependencies while maintaining full customization control.

**Backend Service Design**: FastAPI services use dependency injection for database connections and external APIs. This enables easy testing with mocked dependencies and supports different configurations across environments.

**Integration Component Strategy**: n8n workflows are designed as idempotent operations that can be safely rerun. Each workflow component handles a specific data source (Xero accounting vs XPM projects) to enable parallel processing and independent failure handling.

**Key Assumptions**: Metabase supports signed URL embedding with user context for row-level security. n8n webhooks can reliably trigger on Xero/XPM data changes. Supabase Row Level Security (RLS) policies will enforce data access controls at the database level.

**Validation Needs**: Component integration testing with actual Metabase instance and dashboard configurations. Load testing of tRPC endpoints under realistic user concurrency. Webhook reliability testing with simulated Xero/XPM failures and recovery scenarios.

---
Perfect! Continuing to the **External APIs** section.
