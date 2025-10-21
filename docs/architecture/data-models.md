# Data Models

Based on the PRD requirements and the financial intelligence platform functionality, the following data models represent the core business entities shared between frontend and backend systems. These models align with Xero API structures while providing the foundation for role-based access control and conversational AI integration.

### User

**Purpose:** Represents system users with role-based access control for dashboard permissions and authentication management.

**Key Attributes:**
- id: UUID (primary key) - Unique user identifier
- email: string - User's email address (unique, used for authentication)
- role: UserRole enum - Determines dashboard access permissions
- created_at: timestamp - Account creation timestamp
- last_login: timestamp | null - Last successful authentication
- is_active: boolean - Account status flag

#### TypeScript Interface

```typescript
enum UserRole {
  EXECUTIVE = 'executive',
  MANAGER = 'manager', 
  STAFF = 'staff',
  ADMIN = 'admin'
}

interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
  last_login: string | null;
  is_active: boolean;
}

interface CreateUserRequest {
  email: string;
  role: UserRole;
  send_invitation?: boolean;
}

interface UpdateUserRequest {
  role?: UserRole;
  is_active?: boolean;
}
```

#### Relationships
- Has many: DashboardAccess (role-based permissions)
- Has many: ActivityLog (audit trail)

### Organization

**Purpose:** Represents the business entity connecting to Xero/XPM, containing OAuth credentials and sync configuration.

**Key Attributes:**
- id: UUID (primary key) - Unique organization identifier
- name: string - Organization display name
- xero_tenant_id: string | null - Xero OAuth tenant identifier
- xpm_tenant_id: string | null - XPM OAuth tenant identifier
- sync_frequency: SyncFrequency enum - Data synchronization interval
- last_sync: timestamp | null - Last successful data synchronization
- sync_status: SyncStatus enum - Current synchronization state

#### TypeScript Interface

```typescript
enum SyncFrequency {
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly'
}

enum SyncStatus {
  NEVER_SYNCED = 'never_synced',
  SYNCING = 'syncing',
  SUCCESS = 'success',
  ERROR = 'error',
  PARTIAL = 'partial'
}

interface Organization {
  id: string;
  name: string;
  xero_tenant_id: string | null;
  xpm_tenant_id: string | null;
  sync_frequency: SyncFrequency;
  last_sync: string | null;
  sync_status: SyncStatus;
  created_at: string;
  updated_at: string;
}
```

#### Relationships
- Has many: Users (organization members)
- Has many: FinancialData (imported from Xero)
- Has many: ProjectData (imported from XPM)

### FinancialData

**Purpose:** Aggregated financial metrics from Xero API, optimized for dashboard queries and conversational AI access.

**Key Attributes:**
- id: UUID (primary key) - Unique record identifier
- organization_id: UUID - Foreign key to Organization
- metric_type: FinancialMetricType enum - Type of financial data
- period_start: date - Reporting period start date
- period_end: date - Reporting period end date
- amount: decimal - Financial amount value
- currency: string - Currency code (AUD)
- metadata: JSON - Additional metric-specific data

#### TypeScript Interface

```typescript
enum FinancialMetricType {
  REVENUE = 'revenue',
  EXPENSES = 'expenses',
  PROFIT = 'profit',
  ACCOUNTS_RECEIVABLE = 'accounts_receivable',
  ACCOUNTS_PAYABLE = 'accounts_payable',
  CASH_FLOW = 'cash_flow',
  BUDGET_ACTUAL = 'budget_actual'
}

interface FinancialData {
  id: string;
  organization_id: string;
  metric_type: FinancialMetricType;
  period_start: string;
  period_end: string;
  amount: number;
  currency: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface FinancialSummary {
  total_revenue: number;
  total_expenses: number;
  net_profit: number;
  outstanding_receivables: number;
  period: string;
  currency: string;
}
```

#### Relationships
- Belongs to: Organization
- Referenced by: ConversationContext (for AI queries)

### ProjectData

**Purpose:** Work In Progress (WIP) data from XPM/Workflow Max, enabling project-based financial analysis and team performance tracking.

**Key Attributes:**
- id: UUID (primary key) - Unique project record identifier
- organization_id: UUID - Foreign key to Organization
- project_id: string - External project identifier (from XPM)
- client_name: string - Client name for project
- project_status: ProjectStatus enum - Current project state
- time_value: decimal - Total time value (hours × rates)
- cost_value: decimal - Total billable costs
- invoiced_amount: decimal - Amount already invoiced
- wip_amount: decimal - Work In Progress value (calculated)
- aging_bucket: AgingBucket enum - WIP aging classification

#### TypeScript Interface

```typescript
enum ProjectStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ON_HOLD = 'on_hold',
  CANCELLED = 'cancelled'
}

enum AgingBucket {
  CURRENT = 'current',        // < 30 days
  DAYS_30_60 = '30_60',      // 31-60 days
  DAYS_61_90 = '61_90',      // 61-90 days
  OVER_90 = 'over_90'        // 90+ days
}

interface ProjectData {
  id: string;
  organization_id: string;
  project_id: string;
  client_name: string;
  project_status: ProjectStatus;
  time_value: number;
  cost_value: number;
  invoiced_amount: number;
  wip_amount: number;
  aging_bucket: AgingBucket;
  team_assigned: string[];
  created_at: string;
  updated_at: string;
}

interface WIPSummary {
  total_wip: number;
  by_aging: Record<AgingBucket, number>;
  by_team: Record<string, number>;
  project_count: number;
}
```

#### Relationships
- Belongs to: Organization
- Referenced by: ConversationContext (for AI queries)

### ConversationContext

**Purpose:** Stores conversational AI query context and history for PydanticAI integration, enabling personalized financial insights.

**Key Attributes:**
- id: UUID (primary key) - Unique conversation identifier
- user_id: UUID - Foreign key to User
- query: string - User's natural language query
- response: string - AI-generated response
- data_sources: string[] - Referenced data types used in response
- query_timestamp: timestamp - When query was made
- response_time_ms: integer - AI response generation time

#### TypeScript Interface

```typescript
interface ConversationContext {
  id: string;
  user_id: string;
  query: string;
  response: string;
  data_sources: string[];
  query_timestamp: string;
  response_time_ms: number;
}

interface ConversationQuery {
  query: string;
  context?: {
    previous_queries?: string[];
    focus_area?: 'financial' | 'projects' | 'general';
    time_period?: string;
  };
}

interface ConversationResponse {
  response: string;
  data_visualizations?: {
    type: 'chart' | 'table' | 'metric';
    config: Record<string, any>;
  }[];
  suggested_followups?: string[];
  confidence_score: number;
}
```

#### Relationships
- Belongs to: User
- References: FinancialData, ProjectData (via data_sources)

### DashboardAccess

**Purpose:** Defines which dashboards each user role can access, enabling fine-grained permission control.

**Key Attributes:**
- id: UUID (primary key) - Unique access record identifier
- role: UserRole enum - User role this access applies to
- dashboard_id: string - Dashboard identifier (matches Metabase dashboard IDs)
- dashboard_name: string - Human-readable dashboard name
- access_level: AccessLevel enum - Read/write permissions
- is_default: boolean - Whether this dashboard is user's default landing page

#### TypeScript Interface

```typescript
enum AccessLevel {
  READ = 'read',
  WRITE = 'write',
  ADMIN = 'admin'
}

interface DashboardAccess {
  id: string;
  role: UserRole;
  dashboard_id: string;
  dashboard_name: string;
  access_level: AccessLevel;
  is_default: boolean;
  created_at: string;
}

interface UserDashboards {
  user_role: UserRole;
  accessible_dashboards: {
    id: string;
    name: string;
    url: string;
    is_default: boolean;
  }[];
}
```

#### Relationships
- References: User (via role)
- Defines: Metabase dashboard permissions

---

**Detailed Rationale:**

**Trade-offs and Key Decisions:**
- **Denormalized Financial Data**: Chose pre-aggregated metrics over normalized transaction data for dashboard performance. Raw transactions stored separately for AI analysis.
- **Role-Based vs User-Based Permissions**: Dashboard access tied to roles rather than individual users for easier management and consistency with organizational hierarchy.
- **JSON Metadata Fields**: Used flexible JSON fields for metric-specific data to accommodate varying Xero API response structures without frequent schema changes.
- **Calculated WIP Fields**: Store calculated WIP amounts rather than computing on-demand to ensure consistent reporting and faster dashboard loads.

**Key Assumptions:**
- Single organization per deployment (can be extended to multi-tenant later)
- Financial periods aligned with standard accounting cycles (monthly/quarterly/yearly)
- Conversational AI queries primarily focus on aggregated data rather than individual transactions
- User roles remain relatively stable (not frequently changing)

**Areas Needing Validation:**
- Confirm Xero API data structure alignment with FinancialData model
- Validate XPM V2 API availability and data format for ProjectData
- Test conversation context storage performance with large query volumes
- Verify Metabase dashboard ID consistency across environments

Summarized conversation historyPerfect! Continuing to the **API Specification** section.
