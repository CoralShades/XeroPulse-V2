# XeroPulse Documentation Update Plan

**Created**: 2025-10-22
**Status**: In Progress
**Purpose**: Integrate detailed API endpoint mappings, dashboard specifications, and implementation details into PRD and architecture documentation

---

## Context

Three comprehensive technical documents have been created that provide production-ready specifications:

1. **`xero-api-endpoint-mapping.md`** - Complete API endpoint mappings for all 8 dashboards
2. **`xero-api-endpoint-mapping-expanded.md`** - Visual analysis methodology and ETL pipeline architecture
3. **`dashboard-implementation-checklist.md`** - Complete implementation specifications with Metabase and Internal BI options

These documents need to be integrated into the existing PRD and architecture documentation to ensure consistency and completeness.

---

## Analysis of Current Documentation

### Critical Issues Identified

1. **Technology Mismatch**: Epic 2 references "Superset" but the actual BI platform is "Metabase"
2. **API Version Inconsistency**: `external-apis.md` mentions "Xero API v3.0" but correct version is "v2.0"
3. **Missing Dashboard Details**: Epics 2 and 3 lack detailed dashboard component specifications
4. **Incomplete Endpoint Mapping**: `external-apis.md` has generic endpoint lists, not dashboard-specific mappings
5. **No Shadcn Component Specifications**: Frontend architecture lacks specific component requirements
6. **Limited ETL Details**: Core workflows lack n8n workflow specifics and transformation logic
7. **Missing Dashboard 5 Blocker**: ATO Lodgment dashboard lacks clear Suntax API investigation status

### Documentation Gaps

**In PRD:**
- Epic 2: Dashboard 2 and 7 specifications are high-level, need detailed component breakdowns
- Epic 3: Dashboards 4, 6, 8 lack XPM-specific endpoint details and WIP calculation formulas
- Missing: Dashboard 5 (ATO Lodgment) implementation blocker documentation
- Missing: Metabase vs Internal BI decision framework
- Missing: MCP integration strategy per dashboard

**In Architecture:**
- `external-apis.md`: Missing dashboard-to-endpoint mappings, transformation logic, ETL patterns
- `frontend-architecture.md`: Missing shadcn/ui component inventory, chart library selections
- `core-workflows.md`: Missing n8n workflow node sequences, Docker Compose configs
- `database-schema.md`: Missing materialized views for complex calculations (WIP aging, DSO)
- Missing file: `dashboard-specifications.md` with complete visual component breakdown

---

## Update Strategy

### Phase 1: Critical Fixes (1 hour)

**Priority**: CRITICAL - Fix factual errors

#### 1.1 Replace "Superset" with "Metabase" Throughout PRD

**Files to Update:**
- `docs/prd/epic-2-mvp-dashboard-suite-portal-launch.md`
- `docs/prd/epic-3-complete-dashboard-suite-with-xpm-integration.md`
- `docs/prd/epic-4-platform-refinement-advanced-features.md`

**Changes:**
- Find: "Superset" → Replace: "Metabase"
- Update embedding methodology (Apache Superset SSO → Metabase JWT embedding)
- Update export paths (`/apps/superset-config/` → `/apps/metabase-config/`)

#### 1.2 Correct API Versions in external-apis.md

**File:** `docs/architecture/external-apis.md`

**Changes:**
- Xero API: v3.0 → **v2.0** (correct production version)
- XPM API: v2 → **v3.1** (correct production version per PDF docs)
- Add base URL corrections:
  * Xero: `https://api.xero.com/api.xro/2.0/`
  * XPM: `https://api.xero.com/practicemanager/3.1/`

---

### Phase 2: Update Epic 2 with Detailed Dashboard Specifications (2 hours)

**File:** `docs/prd/epic-2-mvp-dashboard-suite-portal-launch.md`

#### 2.1 Enhance Story 2.1: Monthly Invoicing to Budget (Dashboard 2)

**Add Sections:**

**Visual Components Breakdown:**
```markdown
### Visual Components (Dashboard 2)

| Component | Type | Description | Data Source |
|-----------|------|-------------|-------------|
| Monthly Bars | Grouped Bar Chart | Actual vs Budget bars | Xero Payments + Budget API |
| Legend | Legend | Orange (Actual), Blue (Budget) | N/A |
| X-Axis | Month Labels | Jul 2024 - Jun 2025 | Fiscal Year |
| Y-Axis | Dollar Scale | $0K - $800K | Auto-scaled |
| Variance Tooltip | Tooltip | Shows %, absolute $ difference | Calculated |

### Metabase Configuration

**Dashboard Name**: "Monthly Invoicing to Budget"
**Dashboard Slug**: `monthly-invoicing-budget`

**Query 1: Monthly Actual vs Budget**
```sql
WITH monthly_actuals AS (
  SELECT
    DATE_TRUNC('month', transaction_date) AS month,
    SUM(amount) AS actual
  FROM financial_data
  WHERE organization_id = {{organization_id}}
    AND transaction_type = 'revenue'
    AND transaction_date >= '2024-07-01'
    AND transaction_date < '2025-07-01'
  GROUP BY month
),
monthly_budgets AS (
  SELECT
    DATE_TRUNC('month', budget_month) AS month,
    SUM(amount) AS budget
  FROM budgets
  WHERE organization_id = {{organization_id}}
    AND account_type = 'revenue'
    AND budget_year = 'FY25'
  GROUP BY month
)
SELECT
  TO_CHAR(a.month, 'Mon YYYY') AS month_label,
  COALESCE(a.actual, 0) AS actual,
  COALESCE(b.budget, 0) AS budget,
  ((a.actual - b.budget) / b.budget * 100) AS variance_pct
FROM monthly_actuals a
FULL OUTER JOIN monthly_budgets b ON a.month = b.month
ORDER BY a.month
```

**Chart Type**: Grouped Bar Chart
**X-Axis**: month_label
**Y-Axis**: actual (Orange #FB923C), budget (Blue #3B82F6)
**Filters**: Financial Year (FY24, FY25, FY26)
```

**Shadcn Components Required:**
```markdown
### Shadcn/ui Components (Dashboard 2)

```typescript
import { Card } from "@/components/ui/card"
import { Select } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tooltip } from "@/components/ui/tooltip"
```

**Components:**
- ✅ `Card` - Chart container
- ✅ `Select` - Financial year selector
- ✅ `Badge` - Variance percentage indicator
- ✅ `Tooltip` - Hover data display
```

#### 2.2 Enhance Story 2.2: Debtors/AR Aging (Dashboard 7)

**Add Similar Detailed Breakdowns:**
- Visual components table
- Aging bucket calculation logic (from endpoint mapping doc)
- DSO calculation formula (two methods documented)
- Complete Metabase SQL queries
- Shadcn component specifications
- Top debtors drill-down interaction pattern

---

### Phase 3: Update Epic 3 with XPM Integration Details (2 hours)

**File:** `docs/prd/epic-3-complete-dashboard-suite-with-xpm-integration.md`

#### 3.1 Add Dashboard 4 (WIP) Detailed Specifications

**Add Sections:**

**WIP Calculation Formula:**
```markdown
### WIP Calculation Logic

```
WIP (Net WIP) = (Time Value + Billable Costs) - Progress Invoices
```

**Component Breakdown:**
- **Time Value**: Sum of `chargeAmount` from XPM Time API (billable entries)
- **Billable Costs**: Sum of disbursements from XPM Costs API
- **Progress Invoices**: Sum of interim invoice amounts from XPM Invoices API

**Aging Buckets:**
```
Age (days) = Current Date - MIN(Time Entry Date, Job Start Date)
```
- <30 days (Green #10B981)
- 31-60 days (Yellow #FBBF24)
- 61-90 days (Orange #FB923C)
- 90+ days (Red #EF4444)
```

**XPM API Endpoints:**
```markdown
### Required XPM Endpoints (Dashboard 4)

| Endpoint | Purpose | Frequency |
|----------|---------|-----------|
| `/practicemanager/3.1/job.api/list` | Active job list | Every 2 hours |
| `/practicemanager/3.1/time.api/list` | Unbilled time entries | Every 2 hours |
| `/practicemanager/3.1/cost.api/list` | Billable disbursements | Every 2 hours |
| `/practicemanager/3.1/invoice.api/list` | Progress invoices | Every 2 hours |
| `/practicemanager/3.1/staff.api/list` | Staff/team assignments | Daily |

### Data Transformation Example

```typescript
// Transform XPM data to WIP metrics
const calculateWIP = (job: XPMJob) => {
  const timeValue = job.timeEntries
    .filter(e => e.billable && !e.invoiced)
    .reduce((sum, e) => sum + e.chargeAmount, 0)

  const costs = job.costs
    .filter(c => c.billable && !c.invoiced)
    .reduce((sum, c) => sum + c.amount, 0)

  const interims = job.invoices
    .filter(i => i.type === 'progress')
    .reduce((sum, i) => sum + i.amount, 0)

  return {
    timeValue,
    costs,
    interims,
    wipAmount: timeValue + costs - interims,
    agingDays: differenceInDays(new Date(), job.startDate)
  }
}
```
```

#### 3.2 Add Dashboard 5 Blocker Documentation

**Add New Story:**

```markdown
### Story 3.X: Investigate ATO Lodgment Dashboard (Dashboard 5) Data Source

**Status**: ⚠️ **BLOCKED** - Awaiting Suntax API Confirmation

**As a** platform architect,
**I want** to confirm data source availability for ATO lodgment tracking,
**So that** we can plan Dashboard 5 implementation or alternative solution.

#### Current Blocker

Per HH Dashboards PDF documentation:
> "No API's seem to be available for this category, will check with Suntax and update"

Dashboard 5 requires ATO lodgment status data that is NOT available in Xero or XPM APIs.

#### Required Data Fields

- Client Name
- Client Type (ITR, TRT, CTR, SMSF, PTR)
- Lodgment Status (Not Received, Not Required, Received, Return Not Necessary)
- Workflow State (Draft, Still To Do, Waiting to be Filed, Out to Sign, Approved, Completed, Filed)
- Due Date
- Completion Date
- Assigned Staff

#### Resolution Options

**Option A: Suntax API Integration** (Preferred)
- **Action**: Contact Suntax to confirm API availability
- **Timeline**: Week 1 of Epic 3
- **If Available**: Integrate similar to Xero/XPM with OAuth2
- **Estimated Effort**: 2-3 weeks if API exists

**Option B: CSV Upload Workflow** (Interim Solution)
- **Action**: Build admin CSV upload feature
- **Process**: Weekly export from Suntax → Upload via admin panel → n8n parses and loads to Supabase
- **Supabase Table**: `ato_lodgments` with full schema
- **Estimated Effort**: 1 week
- **Limitation**: Manual process, not real-time

**Option C: XPM Custom Tracking** (Fallback)
- **Action**: Use XPM job categories and custom fields for lodgment tracking
- **Process**: Map ATO client types to XPM job categories, track status via job states
- **Estimated Effort**: 2 weeks (includes data migration)
- **Limitation**: Requires process change, dual data entry

#### Acceptance Criteria

1. Suntax contacted and API availability confirmed (Y/N) by end of Week 1
2. If API available: API documentation reviewed, OAuth flow understood
3. If API unavailable: Option B or C selected with stakeholder approval
4. Implementation story created for chosen option with detailed acceptance criteria
5. Supabase schema created for `ato_lodgments` table regardless of option
6. Dashboard 5 timeline updated in Epic 3 based on chosen path

#### Impact on Timeline

- **Option A** (Suntax API): Adds 2-3 weeks to Epic 3
- **Option B** (CSV Upload): No additional time (can be done in parallel)
- **Option C** (XPM Tracking): Adds 2 weeks to Epic 3

**Decision Deadline**: End of Week 1, Epic 3
```

---

### Phase 4: Update external-apis.md with Complete Endpoint Mapping (3 hours)

**File:** `docs/architecture/external-apis.md`

#### 4.1 Replace Generic Endpoint Lists with Dashboard-Specific Mappings

**Add New Section:**

```markdown
## Dashboard-to-Endpoint Mapping

This section maps each of the 8 XeroPulse dashboards to the specific API endpoints required, including query parameters, transformation logic, and ETL frequency.

### Dashboard 1: Income vs Expenses

**Data Components:**

#### A. Income (Blue Bars)

**Xero API Endpoint:**
```
GET https://api.xero.com/api.xro/2.0/Payments
```

**Parameters:**
- `where`: `Status=="AUTHORISED" AND PaymentType=="ACCRECPAYMENT"`
- `page`: Pagination (100 records per page)
- `order`: `Date DESC`

**Key Response Fields:**
```json
{
  "Payments": [
    {
      "PaymentID": "uuid",
      "Date": "2025-01-15",
      "Amount": 1250.00,
      "PaymentType": "ACCRECPAYMENT",
      "Status": "AUTHORISED",
      "Invoice": {
        "InvoiceID": "uuid",
        "Contact": {
          "ContactID": "uuid",
          "Name": "Client ABC"
        }
      }
    }
  ]
}
```

**Transformation Logic:**
1. Filter: `PaymentType == "ACCRECPAYMENT"` AND `Status == "AUTHORISED"`
2. Group by: `DATE_TRUNC('week', Date)` → week_ending
3. Aggregate: `SUM(Amount)` per week
4. Load to: `financial_data` table with `transaction_type = 'revenue'`

**Supabase Upsert:**
```sql
INSERT INTO financial_data (
  organization_id,
  transaction_type,
  amount,
  currency,
  transaction_date,
  client_name,
  status,
  source,
  source_id,
  metadata,
  synced_at
)
VALUES (
  $1, -- organization_id
  'revenue',
  $2, -- amount
  'AUD',
  $3, -- Date
  $4, -- Contact.Name
  'paid',
  'xero',
  $5, -- PaymentID
  jsonb_build_object('payment_type', $6, 'invoice_id', $7),
  NOW()
)
ON CONFLICT (organization_id, source, source_id)
DO UPDATE SET
  amount = EXCLUDED.amount,
  updated_at = NOW()
WHERE financial_data.synced_at < EXCLUDED.synced_at;
```

**ETL Frequency:** Every 2 hours
**Rate Limit Consideration:** ~500-1000 payments per org per sync (well under 5,000/hour limit)

[Continue for all 3 components of Dashboard 1...]

### Dashboard 2: Monthly Invoicing to Budget

[Repeat detailed endpoint mapping pattern...]

### Dashboard 3: Cumulative Invoicing to Budget

**Note:** Uses same data as Dashboard 2 with cumulative aggregation

### Dashboard 4: Work in Progress (WIP) by Team

**Data Source:** XPM Practice Manager API

#### A. Jobs List

**XPM API Endpoint:**
```
GET https://api.xero.com/practicemanager/3.1/job.api/list
```

**Parameters:**
- `status`: `in_progress` OR `active`
- `page`: Pagination

**Key Response Fields:**
```json
{
  "items": [
    {
      "UUID": "job-uuid",
      "name": "EOFY 2025 - Client ABC",
      "clientUUID": "client-uuid",
      "state": "InProgress",
      "startDate": "2024-11-01",
      "dueDate": "2025-06-30",
      "manager": "staff-uuid"
    }
  ]
}
```

[Continue with detailed mappings for Time, Costs, Invoices endpoints...]

[Repeat for Dashboards 5, 6, 7, 8...]
```

#### 4.2 Add ETL Pipeline Patterns Section

**Add:**
```markdown
## ETL Pipeline Patterns

### Pattern 1: Incremental Sync with ModifiedAfter

**Use Case:** Xero Invoices, Payments (high-volume transactional data)

**n8n Workflow:**
```javascript
// Node 1: Get Last Sync Timestamp
const lastSync = await supabase
  .from('sync_sessions')
  .select('completed_at')
  .eq('organization_id', orgId)
  .eq('source', 'xero')
  .eq('endpoint', 'Invoices')
  .order('completed_at', { ascending: false })
  .limit(1)
  .single()

// Node 2: Call Xero API with filter
const response = await xeroApi.get('/Invoices', {
  headers: {
    'If-Modified-Since': lastSync.completed_at
  },
  params: {
    where: 'Type=="ACCREC"',
    order: 'UpdatedDateUTC DESC'
  }
})

// Node 3: Transform and Load
for (const invoice of response.Invoices) {
  await supabase.from('invoices').upsert({
    organization_id: orgId,
    source: 'xero',
    source_id: invoice.InvoiceID,
    // ... other fields
  }, {
    onConflict: 'organization_id,source,source_id'
  })
}

// Node 4: Update Sync Session
await supabase.from('sync_sessions').insert({
  organization_id: orgId,
  source: 'xero',
  endpoint: 'Invoices',
  status: 'completed',
  records_synced: response.Invoices.length,
  completed_at: new Date()
})
```

### Pattern 2: Full Refresh for Reference Data

**Use Case:** Xero Contacts, XPM Staff (low-volume, infrequently changing)

[Add pattern details...]

### Pattern 3: Report-Based Extraction

**Use Case:** Xero P&L Reports for rolling averages

[Add pattern details...]
```

---

### Phase 5: Update frontend-architecture.md with Component Specifications (2 hours)

**File:** `docs/architecture/frontend-architecture.md`

#### 5.1 Add Shadcn Component Inventory Section

**Add:**
```markdown
## Shadcn/ui Component Library Requirements

Based on all 8 dashboard implementations, the following shadcn/ui components are required:

### Core Components (Required for MVP)

```typescript
// Layout & Navigation
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

// Data Display
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"

// Forms & Inputs
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// Feedback
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert } from "@/components/ui/alert"
import { Toast } from "@/components/ui/toast"

// Utility
import { Tooltip } from "@/components/ui/tooltip"
import { DropdownMenu } from "@/components/ui/dropdown-menu"
import { Dialog } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
```

### Custom Components (Build on Shadcn)

```typescript
// Custom data table with sorting, filtering, pagination
import { DataTable } from "@/components/ui/data-table"

// Custom multi-select (extends Select)
import { MultiSelect } from "@/components/ui/multi-select"

// Custom date range picker (extends Calendar)
import { DateRangePicker } from "@/components/ui/date-range-picker"

// Custom radial progress (for Dashboard 5 ATO gauge)
import { RadialProgress } from "@/components/ui/radial-progress"

// Custom stat card (KPI metrics)
import { StatCard } from "@/components/ui/stat-card"
```

### Charting Libraries Decision

**Option A: Recharts** (Recommended for MVP)
- **Pros**: React-native, composable, well-documented
- **Best for**: Bar, Line, Area charts
- **Cons**: Manual styling required
- **Install**: `npm install recharts`

**Option B: Tremor** (Modern Alternative)
- **Pros**: Tailwind-native, beautiful defaults
- **Best for**: Dashboard KPIs, simple charts
- **Cons**: Less customizable
- **Install**: `npm install @tremor/react`

**Option C: AG Grid Enterprise** (If Budget Allows)
- **Pros**: Advanced table features (sorting, filtering, grouping, Excel export)
- **Best for**: Dashboard 4 WIP table, Dashboard 6 Services table
- **Cons**: Commercial license (~$1,000/year)
- **Install**: `npm install ag-grid-react ag-grid-enterprise`

**Recommendation:**
- Use **Recharts** for charts (free, flexible)
- Use **Tremor** for KPI cards (better DX)
- Use **shadcn Table** for basic tables
- Upgrade to **AG Grid** in Phase 4 if budget allows

### Component-to-Dashboard Mapping

| Component | Dashboard Usage | Count |
|-----------|-----------------|-------|
| `Card` | All dashboards (containers) | 50+ |
| `Tabs` | Dashboards 1, 3, 8 | 3 |
| `Table` | Dashboards 4, 6, 7, 8 | 15+ |
| `Select` | All dashboards (filters) | 25+ |
| `Badge` | Dashboards 3, 4, 5, 6, 7 | 20+ |
| `Progress` | Dashboards 3, 5 | 5 |
| `Calendar` + `Popover` | Dashboards 4, 6, 7 | 6 |
| `Button` | All dashboards (exports, actions) | 30+ |
| `DataTable` (custom) | Dashboards 4, 6, 8 | 8 |
| `RadialProgress` (custom) | Dashboard 5 | 1 |
| `MultiSelect` (custom) | Dashboards 4, 6 | 4 |
| `DateRangePicker` (custom) | Dashboards 4, 6, 7 | 6 |
```

#### 5.2 Add Metabase vs Internal BI Decision Framework

**Add:**
```markdown
## Dashboard Rendering Strategy: Metabase vs Internal BI

### Decision Framework

**Use Metabase Embedding When:**
- ✅ Dashboard has complex table features (sorting, filtering, drill-down)
- ✅ Dashboard requires frequent SQL query modifications
- ✅ Non-technical users need to modify chart configurations
- ✅ Dashboard has >5 different chart types
- ✅ Export to Excel/PDF is required with minimal dev effort

**Use Internal BI (Shadcn + React Charts) When:**
- ✅ Dashboard is simple (1-3 chart types)
- ✅ Full design control is required
- ✅ Mobile responsiveness is critical
- ✅ Real-time MCP integration is needed
- ✅ Custom interactions beyond Metabase capabilities

### Recommended Approach per Dashboard

| Dashboard | Recommendation | Reasoning |
|-----------|----------------|-----------|
| 1. Income vs Expenses | **Internal BI** (Phase 2) | Simple: 1 bar chart + 2 line charts, good mobile showcase |
| 2. Monthly Budget | **Internal BI** (Phase 2) | Simple: 1 grouped bar chart, custom branding desired |
| 3. Cumulative Budget | **Internal BI** (Phase 2) | Simple: 1 area chart + KPI cards, Tremor perfect fit |
| 4. WIP Analysis | **Metabase** (MVP + Keep) | Complex: 4 donut charts + 2 tables + area chart, advanced table features |
| 5. ATO Lodgment | **Internal BI** (Phase 2) | Custom gauge, static data, unique interactions |
| 6. Services Analysis | **Metabase** (MVP → Internal BI in Phase 3) | Complex table with calculated columns, migrate later |
| 7. Debtors Aging | **Metabase** (MVP + Keep) | DSO calculations, aging buckets, drill-down to invoices |
| 8. Client Recoverability | **Metabase** (MVP + Keep) | Complex WIP table, sortable, expandable rows |

### Implementation Phases

**Phase 1 (MVP - 3 weeks):**
- All 8 dashboards in Metabase

**Phase 2 (Enhancement - 4 weeks):**
- Migrate Dashboards 1, 2, 3, 5 to Internal BI
- Keep Dashboards 4, 6, 7, 8 in Metabase

**Phase 3 (Optional - 6 weeks):**
- Migrate Dashboard 6 to Internal BI (if AG Grid budget approved)
- Keep Dashboards 4, 7, 8 in Metabase (best served by BI platform)
```

---

### Phase 6: Create New dashboard-specifications.md File (2 hours)

**File:** `docs/architecture/dashboard-specifications.md` (NEW)

**Content:** Extract and consolidate all dashboard visual component specifications, Metabase queries, shadcn components, and MCP integration points from the implementation checklist into a single architectural reference document.

**Structure:**
```markdown
# Dashboard Specifications

## Dashboard 1: Income vs Expenses

### Visual Components
[Table of all visual components]

### Data Requirements
[Table of required data fields]

### Metabase Configuration
[Complete SQL queries, chart types, filters]

### Internal BI Alternative
[React component code examples]

### Shadcn Components Required
[List with import statements]

### MCP Integration Points
[When/how to use MCP for this dashboard]

[Repeat for all 8 dashboards]
```

---

### Phase 7: Update core-workflows.md with ETL Pipeline Details (2 hours)

**File:** `docs/architecture/core-workflows.md`

#### 7.1 Expand Workflow 1: Data Synchronization

**Add:**
- n8n workflow node sequences for each endpoint
- Docker Compose configuration for n8n deployment
- Rate limiting strategies
- Error handling patterns with retry logic
- Cache invalidation webhooks

**Example Addition:**
```markdown
### n8n Workflow: Xero Payments Sync

**Trigger:** Schedule (every 2 hours) OR Webhook (real-time)

**Node Sequence:**

1. **Schedule Trigger Node**
   - Cron: `0 */2 * * *` (every 2 hours)
   - Timezone: Australia/Sydney

2. **Get Organization Config**
   - Supabase Query
   - SQL: `SELECT * FROM organizations WHERE xero_connected = TRUE`
   - Output: Array of organizations to sync

3. **Loop Over Organizations**
   - For each organization:

4. **Check Last Sync Timestamp**
   - Supabase Query
   - SQL: `SELECT MAX(completed_at) FROM sync_sessions WHERE organization_id = $1 AND endpoint = 'Payments'`

5. **Call Xero Payments API**
   - HTTP Request
   - URL: `https://api.xero.com/api.xro/2.0/Payments`
   - Headers:
     * Authorization: Bearer {{xero_access_token}}
     * If-Modified-Since: {{last_sync_timestamp}}
     * Xero-Tenant-Id: {{xero_tenant_id}}
   - Params:
     * where: `Status=="AUTHORISED"`
     * page: 1 (pagination handled in loop)

6. **Transform Payment Data**
   - Function Node (JavaScript)
   - Code: [See transformation logic below]

7. **Upsert to Supabase**
   - Supabase Batch Insert
   - Table: `financial_data`
   - Conflict: `(organization_id, source, source_id)`

8. **Update Sync Session**
   - Supabase Insert
   - Table: `sync_sessions`
   - Status: `completed` or `failed`

9. **Error Handling**
   - If HTTP 429 (Rate Limit): Wait `Retry-After` seconds, retry
   - If HTTP 401 (Auth Expired): Call token refresh, retry
   - If HTTP 5xx: Exponential backoff (30s, 60s, 120s), max 3 retries
   - Log all errors to `sync_logs` table

10. **Notify on Failure**
    - If max retries exceeded: Send email to admin
    - Slack notification with error details

**Transformation Function:**
```javascript
// Transform Xero Payment to Supabase financial_data
const items = $input.all()
const organizationId = $node["Get Organization Config"].json.id

return items.map(item => {
  const payment = item.json

  return {
    organization_id: organizationId,
    transaction_type: payment.PaymentType === 'ACCRECPAYMENT' ? 'revenue' : 'expense',
    amount: parseFloat(payment.Amount),
    currency: payment.CurrencyCode || 'AUD',
    transaction_date: payment.Date,
    client_name: payment.Invoice?.Contact?.Name || '',
    status: payment.Status.toLowerCase(),
    source: 'xero',
    source_id: payment.PaymentID,
    metadata: {
      payment_type: payment.PaymentType,
      invoice_id: payment.Invoice?.InvoiceID,
      xero_updated_date: payment.UpdatedDateUTC
    },
    synced_at: new Date().toISOString()
  }
})
```

[Add similar detailed workflows for P&L Reports, XPM Jobs, XPM Time, etc.]
```

---

### Phase 8: Update Index Files and Cross-References (1 hour)

**Files:**
- `docs/prd/index.md`
- `docs/architecture/index.md`
- `CLAUDE.md`

**Changes:**
- Add references to new `dashboard-specifications.md`
- Update technology stack version references
- Add links to endpoint mapping documents
- Update Epic descriptions with "Metabase" instead of "Superset"
- Add cross-references between related sections

---

## Success Criteria

✅ All "Superset" references replaced with "Metabase"
✅ All API versions corrected (Xero v2.0, XPM v3.1)
✅ All 8 dashboards have detailed specifications in PRD
✅ Dashboard 5 blocker clearly documented with resolution options
✅ `external-apis.md` includes complete endpoint mappings with transformation logic
✅ `frontend-architecture.md` includes complete shadcn component inventory
✅ `core-workflows.md` includes n8n workflow node sequences
✅ New `dashboard-specifications.md` file created
✅ All index files updated with cross-references
✅ No broken links or inconsistent terminology
✅ All code examples tested for syntax errors

---

## Timeline

- **Phase 1**: 1 hour (Critical fixes)
- **Phase 2**: 2 hours (Epic 2 updates)
- **Phase 3**: 2 hours (Epic 3 updates)
- **Phase 4**: 3 hours (external-apis.md)
- **Phase 5**: 2 hours (frontend-architecture.md)
- **Phase 6**: 2 hours (dashboard-specifications.md)
- **Phase 7**: 2 hours (core-workflows.md)
- **Phase 8**: 1 hour (Index updates)

**Total Estimated Time**: 15 hours (can be done incrementally over 2-3 days)

---

## Execution Strategy

1. **Start with Phase 1** (critical fixes) - complete in one session
2. **Phases 2-3** (PRD updates) - complete in one session
3. **Phases 4-5** (Architecture updates) - complete in one session
4. **Phases 6-7** (New docs + workflows) - complete in one session
5. **Phase 8** (Index updates) - final cleanup session

**Checkpoint after each phase**: Verify no broken links, consistent terminology, accurate technical details.

---

## Implementation Notes

- **Do NOT delete** existing content without careful review
- **Preserve** all existing acceptance criteria
- **Enhance** rather than replace (add detail, don't remove context)
- **Maintain** consistent formatting across all files
- **Test** all SQL queries and code examples for syntax correctness
- **Cross-reference** between PRD and Architecture docs for traceability

---

## Phase 9: Chakra UI Migration Strategy (2 hours)

**Date Added**: 2025-10-25
**Priority**: HIGH - Foundational technology change

### Context

User has decided to migrate from Shadcn/ui v4 to Chakra UI for the entire XeroPulse platform. This decision was made to:
- Leverage Chakra UI MCP server integration for faster development
- Use Chakra UI's built-in accessibility (WCAG 2.0 AA compliant)
- Utilize Chakra UI Motion for animations (integrated Framer Motion)
- Maintain cost-effectiveness (Chakra UI Free/Open Source - $0 cost)

**User Decisions** (via questionnaire):
1. ✅ **Hybrid Approach**: Keep AG-UI Enterprise for complex data grids (admin tables), use Chakra UI for all other components
2. ✅ **Chakra UI Free**: Stick with open-source version (fits $15/month budget)
3. ✅ **Chakra UI Motion**: Use built-in animation system (not direct Framer Motion)
4. ✅ **Build Fresh**: Create new Chakra UI component library from scratch (not migrate existing)

### Required Changes

#### 9.1 Technology Decision Documentation

**File**: `docs/architecture/tech-stack.md`

**Changes**:
```markdown
# BEFORE (Line 10)
| **Base Components** | Shadcn/ui v4 | 4.0+ | Accessible component foundations | ...

# AFTER
| **UI Component Library** | Chakra UI | 2.8+ | General UI components, layouts, forms | Built-in a11y (WCAG 2.0 AA), MCP integration, motion system, theme customization |
| **Enterprise Data Grids** | AG-UI Enterprise | Latest | Complex tables (admin panel only) | Advanced features: inline editing, Excel export, virtualization |
| **Animation System** | Chakra UI Motion | Built-in | Component transitions and micro-interactions | Integrated Framer Motion, consistent API, declarative animations |
| **CSS Approach** | Chakra UI Styling | Style Props | Component styling and theming | Type-safe style props, responsive design tokens, no Tailwind needed |
```

**Add Section** (after line 60):
```markdown
### Chakra UI vs Shadcn/ui Decision Rationale

**Why Chakra UI?**
- ✅ **MCP Integration**: Chakra UI MCP server provides component examples, theme helpers, and a11y patterns
- ✅ **Built-in Accessibility**: WCAG 2.0 AA compliant out-of-box (vs. manual a11y with Shadcn)
- ✅ **Motion System**: Integrated Framer Motion via Chakra UI Motion (no separate setup)
- ✅ **Type-Safe Styling**: Style props with TypeScript autocomplete (better DX than Tailwind strings)
- ✅ **Theme System**: Powerful theme customization with tokens, variants, and component styles
- ✅ **Zero Cost**: Open-source free tier meets all requirements (Shadcn also free, but less DX)

**Hybrid Approach: Chakra UI + AG-UI**
- **Chakra UI**: All general UI (forms, modals, layouts, navigation, cards, badges, buttons)
- **AG-UI Enterprise**: Only for complex data grids requiring advanced features:
  * User management table (admin panel)
  * WIP analysis table (Dashboard 4)
  * Services analysis table (Dashboard 6)
  * Client recoverability table (Dashboard 8)

**Trade-off**: Slightly more complex integration (2 component systems) but retains enterprise-grade table features while maximizing DX for 95% of UI components.
```

#### 9.2 Component Mapping Reference

Create component mapping guide for developers:

**Shadcn/ui → Chakra UI Equivalents**:

| Shadcn Component | Chakra UI Component | Notes |
|------------------|---------------------|-------|
| `Button` | `Button` | Similar API, more variants |
| `Input` | `Input` | Use with `FormControl` |
| `Card` | `Card` + `CardHeader` + `CardBody` | More granular composition |
| `Badge` | `Badge` | Similar, better color schemes |
| `Dialog/Modal` | `Modal` | More layout options |
| `Tabs` | `Tabs` + `TabList` + `TabPanels` | Similar composition |
| `Table` | `Table` (simple) / AG-UI (complex) | Hybrid approach |
| `Select` | `Select` | Native or custom chakra-react-select |
| `Checkbox` | `Checkbox` | Similar API |
| `Switch` | `Switch` | Similar API |
| `Slider` | `Slider` | More features |
| `Progress` | `Progress` + `CircularProgress` | More variants |
| `Skeleton` | `Skeleton` | Similar API |
| `Toast` | `useToast` hook | Different pattern |
| `Dropdown Menu` | `Menu` | Similar composition |
| `Popover` | `Popover` | Similar API |
| `Tooltip` | `Tooltip` | Similar API |
| `Avatar` | `Avatar` | Similar API |
| `Accordion` | `Accordion` | Similar composition |

**Animation Migration**:
- Tailwind transitions → Chakra UI Motion
- Framer Motion direct → Chakra UI Motion (MotionBox, MotionFlex, etc.)
- Lottie animations → Keep as-is (compatible with Chakra)

---

## Phase 10: Update Core Technical Documentation (4 hours)

**Priority**: HIGH - Developers reference these files constantly

### 10.1 Complete Rewrite: front-end-spec.md (2.5 hours)

**File**: `docs/front-end-spec.md` (1300 lines)

**Scope**: Complete rewrite of component library sections

**Sections to Rewrite**:

1. **Component Library / Design System** (lines 459-650)
   - Replace all Shadcn component specifications with Chakra UI
   - Add Chakra theme configuration section
   - Add Chakra Provider setup instructions
   - Document hybrid Chakra + AG-UI approach

2. **Core Components** (lines 500-635)
   ```tsx
   // OLD (Shadcn)
   import { Button } from "@/components/ui/button"
   import { Card, CardContent } from "@/components/ui/card"

   // NEW (Chakra UI)
   import { Button, Card, CardHeader, CardBody } from '@chakra-ui/react'
   ```

3. **Animation & Micro-interactions** (lines 960-1062)
   - Replace Framer Motion examples with Chakra UI Motion
   - Update animation token system
   - Add motion variants examples

4. **Branding & Style Guide** (lines 636-775)
   - Replace Tailwind color classes with Chakra color tokens
   - Update design token system to Chakra theme structure
   - Add responsive design token examples

5. **Form Components** (lines 871-959)
   - Replace Shadcn form components with Chakra FormControl
   - Update validation patterns for Chakra
   - Add form example with Chakra + React Hook Form

6. **Data Display Components** (new section)
   - Add Chakra Table specifications (for simple tables)
   - Document AG-UI integration pattern for complex tables
   - Add data table decision matrix

7. **Accessibility Requirements** (lines 777-870)
   - Update with Chakra's built-in a11y features
   - Note: Most a11y requirements met by default
   - Add testing strategy for Chakra components

**New Sections to Add**:

```markdown
### Chakra UI Theme Configuration

**Theme File**: `src/theme/index.ts`

```typescript
import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
}

const colors = {
  brand: {
    50: '#E6F6FF',
    100: '#BAE3FF',
    // ... XeroPulse brand colors
    500: '#3B82F6', // Primary blue
    600: '#2563EB',
    // ...
  },
  accent: {
    orange: '#FB923C',
    yellow: '#FBBF24',
    green: '#10B981',
    red: '#EF4444',
  }
}

const fonts = {
  heading: `'Inter', sans-serif`,
  body: `'Inter', sans-serif`,
}

const components = {
  Button: {
    baseStyle: {
      fontWeight: '600',
    },
    variants: {
      solid: {
        bg: 'brand.500',
        color: 'white',
        _hover: { bg: 'brand.600' },
      },
    },
  },
  // ... other component customizations
}

export const theme = extendTheme({ config, colors, fonts, components })
```

### Chakra UI Provider Setup

**Root Layout**: `app/layout.tsx`

```typescript
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react'
import { theme } from '@/theme'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <ChakraProvider theme={theme}>
          {children}
        </ChakraProvider>
      </body>
    </html>
  )
}
```

### Hybrid Component Strategy: Chakra UI + AG-UI

**Decision Matrix**: When to use which component system

| Scenario | Use Chakra UI | Use AG-UI | Rationale |
|----------|---------------|-----------|-----------|
| Simple data table (<10 columns) | ✅ | ❌ | Chakra Table sufficient |
| Complex data grid (>10 columns, sorting, filtering) | ❌ | ✅ | Need advanced features |
| User management table | ❌ | ✅ | Inline editing, role management |
| Dashboard KPI cards | ✅ | ❌ | Simple data display |
| Forms and inputs | ✅ | ❌ | Chakra forms with validation |
| Navigation and layout | ✅ | ❌ | Chakra layout components |
| Modal dialogs | ✅ | ❌ | Chakra modals |
| WIP analysis table | ❌ | ✅ | Grouping, aggregation, Excel export |

**Integration Pattern**:

```tsx
// Admin page with hybrid approach
import { Box, Heading, Button } from '@chakra-ui/react' // Chakra layout
import { AgGridReact } from 'ag-grid-react' // AG-UI table
import 'ag-grid-enterprise'

export default function UserManagementPage() {
  return (
    <Box p={6}> {/* Chakra layout */}
      <Heading mb={4}>User Management</Heading> {/* Chakra heading */}
      <Button colorScheme="brand" mb={4}>Add User</Button> {/* Chakra button */}

      {/* AG-UI table for complex data grid */}
      <AgGridReact
        rowData={users}
        columnDefs={columnDefs}
        enableCellChangeFlash
        enableRangeSelection
        // ... AG-UI features
      />
    </Box>
  )
}
```

### Chakra UI MCP Integration

**When to Use Chakra UI MCP**:
- Getting component examples and patterns
- Checking accessible implementations
- Finding theme customization recipes
- Reviewing responsive design patterns

**Available MCP Tools**:
- `mcp__chakra-ui__get_component_props` - Component API reference
- `mcp__chakra-ui__get_component_example` - Usage examples
- `mcp__chakra-ui__list_components` - All available components
- `mcp__chakra-ui__customize_theme` - Theme customization help

**Example Usage**:
```bash
# Get Button component props and examples
mcp__chakra-ui__get_component_props(component="button")

# Get form field examples
mcp__chakra-ui__get_component_example(component="input")
```
```

### 10.2 Update frontend-architecture.md (1 hour)

**File**: `docs/architecture/frontend-architecture.md`

**Changes**:

1. **Component Directory Structure** (lines 34-40)
   ```
   components/
   ├── chakra/                    # Chakra theme and provider
   │   ├── theme/
   │   │   ├── index.ts          # Main theme
   │   │   ├── colors.ts         # Color tokens
   │   │   ├── components.ts     # Component styles
   │   │   └── foundations.ts    # Typography, spacing, etc.
   │   └── provider.tsx          # ChakraProvider wrapper
   ├── ui/                        # Custom Chakra components
   │   ├── stat-card.tsx
   │   ├── data-table.tsx        # Chakra Table wrapper
   │   └── ...
   ├── ag-grid/                   # AG-UI components
   │   ├── user-grid.tsx
   │   ├── wip-grid.tsx
   │   └── ...
   ```

2. **Atomic Design with Chakra** (lines 83-89)
   ```markdown
   - **Atoms**: Chakra primitives (Button, Input, Badge, Avatar, Icon)
   - **Molecules**: Chakra compositions (FormControl, Stat, Breadcrumb)
   - **Organisms**: Custom components (DashboardCard, StatGrid, NavHeader)
   - **Templates**: Chakra layouts (Box, Flex, Grid, Container, Stack)
   ```

3. **State Management Integration** (new section)
   ```markdown
   ### Chakra UI Hooks Integration

   Chakra provides built-in state management hooks:
   - `useColorMode` / `useColorModeValue` - Theme switching
   - `useTheme` - Access theme tokens
   - `useDisclosure` - Modal/drawer state
   - `useToast` - Toast notifications
   - `useBreakpointValue` - Responsive values
   ```

### 10.3 Update dashboard-specifications.md (30 minutes)

**File**: `docs/architecture/dashboard-specifications.md`

**Changes**: Find/replace all Shadcn imports with Chakra UI equivalents

**Pattern**:
```tsx
// FIND
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// REPLACE WITH
import { Card, CardHeader, CardBody, Tabs, TabList, Tab, TabPanels, TabPanel, Badge, Button } from '@chakra-ui/react'
```

**Sections to Update**:
- Dashboard 1-8: All component specifications (lines 56-1200)
- Component-to-Dashboard mapping table (update with Chakra components)
- Note AG-UI usage for Dashboards 4, 6, 8 (complex tables)

---

## Phase 11: Update PRD Files with Chakra UI (3 hours)

**Files**:
- `docs/prd/epic-1-foundation-data-pipeline-infrastructure.md`
- `docs/prd/epic-2-mvp-dashboard-suite-portal-launch.md`
- `docs/prd/epic-3-complete-dashboard-suite-with-xpm-integration.md`
- `docs/prd/epic-4-platform-refinement-advanced-features.md`
- `docs/prd/technical-assumptions.md`

### 11.1 Update Epic 1 (30 minutes)

**File**: `docs/prd/epic-1-foundation-data-pipeline-infrastructure.md`

**Changes**:
- **Story 1.0 (Next.js Init)**: Update technical assumptions to reference Chakra UI
- **Technical Constraints** section: Replace Shadcn with Chakra UI
- **Dependencies** section: Update npm package requirements

**Example Update**:
```markdown
# BEFORE
**UI Framework**: Shadcn/ui v4 with Tailwind CSS

# AFTER
**UI Framework**: Chakra UI 2.8+ with Chakra UI Motion for animations
**Data Grid**: AG-UI Enterprise (admin panel only)
**Styling**: Chakra style props (no Tailwind dependency for components)
```

### 11.2 Update Epic 2 (1 hour)

**File**: `docs/prd/epic-2-mvp-dashboard-suite-portal-launch.md`

**Changes**:

**Story 2.0: Initialize Next.js Portal**
- Update component library setup instructions
- Replace Shadcn installation steps with Chakra UI setup
- Add Chakra Provider configuration steps

**Story 2.1: Income vs Expenses Dashboard**
- Update component specifications (Card, Tabs, Badge → Chakra equivalents)
- Update acceptance criteria with Chakra component names

**Story 2.2: Monthly Invoicing to Budget**
- Update component references
- Note: Keep Metabase embedding (unchanged)

**Story 2.3: Debtors/AR Aging**
- Update table component specification
- Note: Use Chakra Table (simple) or AG-UI (if complex drill-down needed)

### 11.3 Update Epic 3 (1 hour)

**File**: `docs/prd/epic-3-complete-dashboard-suite-with-xpm-integration.md`

**Changes**:

**Story 3.1: YTD/MTD Budget Views**
- Update component references to Chakra UI

**Story 3.2: Work In Progress by Team**
- **IMPORTANT**: Specify AG-UI for WIP table
- Reason: Complex grouping, aging buckets, Excel export required

**Story 3.3: ATO Lodgment Status**
- Update gauge component specification (Chakra CircularProgress)

**Story 3.4: Services Analysis**
- **IMPORTANT**: Specify AG-UI for services table
- Reason: Billability calculations, service type filtering

**Story 3.5: Client Recoverability**
- **IMPORTANT**: Specify AG-UI for recoverability table
- Reason: Outstanding WIP calculations, client drill-down

### 11.4 Update Epic 4 (30 minutes)

**File**: `docs/prd/epic-4-platform-refinement-advanced-features.md`

**Changes**:
- **Performance Optimization**: Update with Chakra code-splitting patterns
- **Accessibility Audit**: Note Chakra's built-in WCAG AA compliance
- **Component Library Maturity**: Update from Shadcn to Chakra maintenance

### 11.5 Update Technical Assumptions

**File**: `docs/prd/technical-assumptions.md`

**Add Section**:
```markdown
### UI Component Library

**Assumption**: Chakra UI (Free/Open Source) provides sufficient component coverage for 95% of XeroPulse UI requirements.

**Validation**:
- ✅ All dashboard components available in Chakra UI
- ✅ Form validation integrates with React Hook Form
- ✅ Accessibility requirements met by default (WCAG 2.0 AA)
- ✅ Animation system (Chakra UI Motion) meets micro-interaction requirements
- ⚠️ Complex data grids require AG-UI Enterprise (separate license)

**Risk**: AG-UI licensing cost may exceed budget. Mitigation: Use AG-UI only for 4 complex tables, use Chakra Table elsewhere.
```

---

## Phase 12: Update Story Files with PO Agent (4 hours)

**Process**: Use `/BMad:agents:po` to ensure product consistency

**Files** (all in `docs/stories/`):
- 1.0.nextjs-project-init.md
- 1.7.income-expenses-dashboard.md
- 1.8.supabase-auth.md
- 1.9.nextjs-portal-embedding.md

### 12.1 Story 1.0: Next.js Project Init (1 hour)

**Changes**:
1. **Task 2: Install UI Dependencies**
   ```bash
   # OLD
   npx shadcn-ui@latest init

   # NEW
   npm install @chakra-ui/react @chakra-ui/next-js @emotion/react @emotion/styled framer-motion
   npx @chakra-ui/cli init
   ```

2. **Task 3: Configure Component Library**
   - Replace Shadcn config with Chakra theme setup
   - Add Chakra Provider to root layout

3. **Acceptance Criteria**:
   - Update: "Chakra UI configured with XeroPulse custom theme"
   - Add: "Chakra Provider wraps app with ColorModeScript"

### 12.2 Story 1.7: Income vs Expenses Dashboard (1 hour)

**Changes**:
1. **Visual Components Section**:
   ```markdown
   # OLD
   - Card component (shadcn)
   - Tabs component (shadcn)
   - Badge component (shadcn)

   # NEW
   - Card component (Chakra UI: Card, CardHeader, CardBody)
   - Tabs component (Chakra UI: Tabs, TabList, Tab, TabPanels)
   - Badge component (Chakra UI: Badge with colorScheme)
   ```

2. **Component Implementation Examples**:
   - Replace all Shadcn imports with Chakra UI
   - Update component props to Chakra API

3. **Acceptance Criteria**:
   - Update: "Dashboard uses Chakra UI components with XeroPulse theme"

### 12.3 Story 1.8: Supabase Auth (1 hour)

**Changes**:
1. **Login Form Components**:
   ```tsx
   // OLD
   import { Input } from "@/components/ui/input"
   import { Button } from "@/components/ui/button"

   // NEW
   import { FormControl, FormLabel, Input, Button, VStack } from '@chakra-ui/react'
   ```

2. **Form Layout**:
   - Replace Shadcn form patterns with Chakra FormControl
   - Update validation error display with Chakra FormErrorMessage

### 12.4 Story 1.9: Next.js Portal Embedding (1 hour)

**Changes**:
1. **Dashboard Shell Components**:
   - Replace Shadcn layout components with Chakra Box, Flex, Grid
   - Update navigation components to Chakra UI

2. **Acceptance Criteria**:
   - Update: "Dashboard shell uses Chakra UI layout components"

---

## Updated Success Criteria

✅ All "Superset" references replaced with "Metabase" *(Phase 1 - Complete)*
✅ All API versions corrected (Xero v2.0, XPM v3.1) *(Phase 1 - Complete)*
✅ All 8 dashboards have detailed specifications in PRD *(Phases 2-3 - Complete)*
✅ Dashboard 5 blocker clearly documented *(Phase 3 - Complete)*
✅ **NEW**: All Shadcn/ui references replaced with Chakra UI *(Phases 9-12)*
✅ **NEW**: Hybrid Chakra UI + AG-UI approach documented *(Phase 9)*
✅ **NEW**: front-end-spec.md completely rewritten with Chakra UI *(Phase 10)*
✅ **NEW**: All story files updated with Chakra UI components *(Phase 12)*
✅ **NEW**: AI prompts updated with Chakra UI examples *(Phase 13 - TBD)*
✅ **NEW**: Chakra UI MCP integration documented *(CLAUDE.md, README.md)*
✅ Budget remains under $15/month (Chakra UI Free = $0) *(Validated)*

---

## Updated Timeline

**Original Phases** (1-8): 15 hours
**New Chakra UI Phases** (9-12): 13 hours

- **Phase 9**: 2 hours (Chakra UI migration strategy)
- **Phase 10**: 4 hours (Core technical docs)
- **Phase 11**: 3 hours (PRD updates)
- **Phase 12**: 4 hours (Story files with PO agent)

**Total Estimated Time**: 28 hours (executable over 3-4 days incrementally)

---

## Updated Execution Strategy

**Session 1** (Current):
1. ✅ Phase 9: Update DOCUMENTATION-UPDATE-PLAN.md with Chakra UI phases
2. Phase 2 + Phase 10.1: Update tech-stack.md
3. Phase 6 + Phase 7: Update README.md and CLAUDE.md

**Session 2**:
4. Phase 10.2: Rewrite front-end-spec.md (largest update)
5. Phase 10.3: Update frontend-architecture.md

**Session 3**:
6. Phase 10.4: Update dashboard-specifications.md
7. Phase 11: Update PRD files (Epic 1-4)

**Session 4**:
8. Phase 12: Update story files with PO agent
9. Phase 13: Update AI prompts (deferred)
10. Phase 11: Update source-tree.md

**Checkpoint after each phase**: Verify Chakra UI component mappings accurate, no broken references, budget constraints maintained.

---

**Status**: Phase 9 complete - Chakra UI migration strategy documented
**Next Step**: Execute Phase 2 (tech-stack.md) + Phase 10.1 (begin core technical docs)
