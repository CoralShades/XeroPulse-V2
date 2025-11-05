# Epic 3: Complete Dashboard Suite with XPM Integration

**Epic Goal:**

Expand XeroPulse beyond the MVP by integrating XPM/Workflow Max API to access practice management data (jobs, time entries, costs, WIP), build the remaining 5 dashboards (YTD/MTD View, Work In Progress by Team, ATO Lodgment Status, Services Analysis, Client Recoverability), enhance the authentication system with comprehensive user management features and security hardening, and deliver the complete 8-dashboard platform vision. This epic transforms XeroPulse from a basic financial reporting tool into a comprehensive professional services intelligence platform combining accounting and practice management insights.

### Story 3.1: Integrate XPM/Workflow Max API with n8n

**As a** data engineer,
**I want** n8n workflow successfully authenticating to XPM API and fetching practice management data,
**So that** we can extract jobs, time entries, costs, and WIP data for advanced dashboards.

#### Acceptance Criteria

1. XPM/Workflow Max developer account created with API credentials (OAuth2 or API key, depending on XPM version)
2. n8n HTTP Request nodes configured for XPM API endpoints (XPM does not have native n8n node, requires custom HTTP requests)
3. Authentication method implemented: OAuth2 flow configured or API key passed in headers
4. Test workflow created fetching data from minimum 5 XPM API endpoints: Jobs, Time Entries, Costs, Invoices, Staff/Contacts
5. XPM API rate limit handling implemented (confirm rate limits with XPM documentation, implement exponential backoff if needed)
6. Data structure validated: JSON responses match expected XPM API schema
7. Error handling tested: Invalid credentials, network failures, API errors trigger appropriate retries/alerts
8. XPM-specific field mapping documented: Job status values, time entry types, cost categories, billing rates
9. Test data extracted: Minimum 100 jobs, 500 time entries, 100 cost records to validate schema
10. Documentation created: XPM API endpoints used, authentication setup, field mapping reference

### Story 3.2: Extend Supabase Schema for XPM Data

**As a** database administrator,
**I want** Supabase schema extended with tables for XPM practice management data,
**So that** n8n workflows can load synchronized XPM data alongside Xero financial data.

#### Acceptance Criteria

1. New PostgreSQL tables created: `xpm_jobs`, `xpm_time_entries`, `xpm_costs`, `xpm_staff`, `xpm_tasks`
2. Table relationships defined:
   - `xpm_time_entries.job_id` references `xpm_jobs.id`
   - `xpm_costs.job_id` references `xpm_jobs.id`
   - `xpm_time_entries.staff_id` references `xpm_staff.id`
3. Cross-system relationships documented (where applicable):
   - `xpm_jobs.client_id` may link to `contacts.id` from Xero (if client exists in both systems)
   - `xpm_invoices` may link to Xero invoices via invoice number matching
4. Indexes created on frequently filtered fields: `job_id`, `staff_id`, `date` fields, `status` fields
5. Database migration files version-controlled in monorepo
6. WIP calculation supporting fields added: `time_value` (hours × rate), `billable_costs`, `progress_invoices`, `calculated_wip`
7. Service taxonomy field added to jobs or time entries: `service_type` (enum: EOFY, SMSF, Bookkeeping, ITR, BAS, Advisory, ASIC, FBT, Client Service, Tax Planning)
8. Test XPM data inserted manually to verify schema (10 sample jobs with time entries and costs)
9. Database storage monitored: Baseline measurement updated, confirm still within 500MB free tier (or plan Supabase Pro upgrade)

### Story 3.3: Build XPM-to-Supabase ETL Workflow

**As a** data engineer,
**I want** n8n workflow automatically syncing XPM practice management data to Supabase every 2 hours,
**So that** WIP and service analysis dashboards display fresh data.

#### Acceptance Criteria

1. n8n workflow scheduled to run every 2 hours (integrated with existing Xero sync or separate workflow)
2. Workflow extracts data from XPM API endpoints: Jobs, Time Entries, Costs, Staff, Tasks/Categories
3. Data transformation logic implemented:
   - Map XPM JSON to Supabase table columns
   - Calculate time value: hours × billable rate (or use XPM's pre-calculated value if available)
   - Identify billable vs non-billable entries
   - Parse date fields correctly (handle XPM date format)
4. Service type classification logic: Map XPM task codes/categories to service taxonomy (EOFY, SMSF, ITR, etc.)
5. WIP calculation: For each job, calculate (Time Value + Billable Costs) - Progress Invoices = Net WIP
6. Upsert logic configured: Update existing records if changed, insert new records, handle deletions
7. Cross-system data linking: Match XPM clients to Xero contacts where possible (by name or custom field)
8. Sync execution logs generated: Records processed, errors, duration
9. Workflow completes within 30 minutes for typical dataset (alongside Xero sync, total <45 minutes)
10. Error handling: Retry failed API calls, log failures for manual review
11. Success criteria: 7 consecutive days with 95%+ successful XPM sync executions
12. Data freshness timestamp updated in metadata table

### Story 3.4: Build YTD/MTD View Dashboard (Dashboard 3)

**As a** finance manager,
**I want** a dashboard with toggle widget to view month-to-date vs year-to-date budget performance,
**So that** I can analyze performance at different time aggregations.

#### Acceptance Criteria

1. Metabase dashboard created with title "YTD/MTD Budget Performance"
2. Toggle widget (filter): User selects "MTD" (Month-to-Date) or "YTD" (Year-to-Date)
3. Chart 1: Actual vs Budget comparison chart (extends Dashboard 2 logic) with MTD or YTD aggregation based on toggle
4. Chart 2: Variance percentage displayed: ((Actual - Budget) / Budget) × 100
5. Chart 3: Performance trend: Compare current MTD/YTD to same period prior year
6. KPI cards: Total Actual, Total Budget, Variance $, Variance %
7. Date context displayed: "Month to Date: October 1-15, 2025" or "Year to Date: Jan 1 - Oct 15, 2025"
8. Dashboard loads in <3 seconds with YTD data
9. Visual design: Consistent with Dashboards 1-2 styling
10. "Last updated" timestamp displayed
11. Dashboard exported to version control (`/apps/metabase-config/dashboards/dashboard-3-ytd-mtd.json`)

### Story 3.5: Build Work In Progress by Team Dashboard (Dashboard 4)

**As a** practice manager,
**I want** a dashboard showing unbilled WIP across service teams with aging breakdown,
**So that** I can identify bottlenecks in billing and prioritize WIP conversion to invoices.

#### Acceptance Criteria

1. Metabase dashboard created with title "Work In Progress by Team"
2. Chart 1: WIP by service team bar chart (teams: Accounting, Bookkeeping, SMSF, Support Hub, or as defined by client)
3. WIP calculation: (Time Value + Billable Costs) - Progress Invoices for each job (source: `xpm_time_entries`, `xpm_costs`, Xero invoices)
4. Chart 2: WIP aging breakdown (stacked bar or separate chart): <30 days, 31-60 days, 61-90 days, 90+ days old
5. Aging calculation: Current date - Job start date or earliest unbilled time entry date
6. Chart 3: Top 10 WIP jobs table with columns: Client Name, Job Name, Team, WIP Amount, Age (days), Last Activity Date
7. KPI cards: Total WIP $, Average WIP Age (days), WIP by aging bucket totals
8. Team filter widget: Select specific team or "All Teams"
9. Drill-down capability: Click job to see detailed time entries and costs contributing to WIP
10. Dashboard loads in <3 seconds with current WIP dataset
11. Visual design: Color coding for aging (green <30 days, yellow 31-60, orange 61-90, red 90+)
12. "Last updated" timestamp displayed
13. Dashboard exported to version control (`/apps/metabase-config/dashboards/dashboard-4-wip-team.json`)

#### Detailed Specifications

**Visual Components**

| Component | Type | Description | Data Source |
|-----------|------|-------------|-------------|
| Donut Charts (4x) | Donut/Pie Charts | WIP aging by team | XPM Jobs/Time/Costs |
| WIP Summary Table | Data Table | Team breakdown | XPM aggregated |
| Client Details Table | Sortable Table | Client-level WIP | XPM Job details |
| WIP Trends Chart | Area Chart | Monthly WIP accumulation | XPM historical |
| Team Filters | Dropdown | Team selector | XPM Staff |

**WIP Calculation Formula**:
```
WIP = (Time Value + Billable Costs) - Progress Invoices
```

**Aging Calculation Logic**:
```
Aging Days = CURRENT_DATE - MIN(Job Start Date, Earliest Unbilled Time Entry Date)
```

**Metabase SQL Queries**

**Query 1: WIP Donut Charts by Team**
```sql
WITH wip_by_team_aging AS (
  SELECT
    team_name,
    CASE
      WHEN aging_days <= 30 THEN '<30 days'
      WHEN aging_days BETWEEN 31 AND 60 THEN '31-60 days'
      WHEN aging_days BETWEEN 61 AND 90 THEN '61-90 days'
      ELSE '90+ days'
    END AS aging_bucket,
    SUM(wip_amount) AS wip
  FROM vw_wip_aging
  WHERE organization_id = {{organization_id}}
    AND report_date = {{report_date}}
  GROUP BY team_name, aging_bucket
)
SELECT * FROM wip_by_team_aging
WHERE team_name = {{team_name}}
```

**Query 2: Client Details Table**
```sql
SELECT
  c.client_name,
  SUM(j.time_value) AS total_time,
  SUM(j.costs_value) AS disbursements,
  SUM(j.invoiced_amount) AS interims,
  SUM(j.wip_amount) AS wip_accumulated
FROM jobs j
JOIN clients c ON j.client_id = c.id
WHERE j.organization_id = {{organization_id}}
  AND j.status = 'in_progress'
GROUP BY c.client_name
ORDER BY wip_accumulated DESC
```

**Metabase Chart Configurations**
- Donut Charts: 4 separate charts (Accounting, Bookkeeping, SMSF, Support Hub)
- Colors: Green (<30 days), Yellow (31-60), Orange (61-90), Red (90+)
- Table Features: Sortable, paginated, exportable to CSV

**Chakra UI Components Required** (for internal BI alternative)
- ✅ `Table` - WIP client details table (sortable, expandable)
- ✅ `Card` - Container for donut charts
- ✅ `Tabs` - Overview / WIP by Team / Details navigation
- ✅ `Select` - Team and client filters
- ✅ `Badge` - Aging bucket indicators
- ✅ `Calendar` + `Popover` - Date range picker
- ✅ `Button` - Export to Excel action

**Database View Dependencies**:
```sql
CREATE MATERIALIZED VIEW vw_wip_aging AS
SELECT
  pd.organization_id,
  s.team_name,
  c.client_name,
  j.job_number,
  j.id AS job_id,
  (SUM(t.charge_value) + SUM(co.cost_amount) - SUM(i.invoice_amount)) AS wip_amount,
  CURRENT_DATE - j.start_date AS aging_days,
  CURRENT_DATE AS report_date
FROM project_data j
JOIN clients c ON j.client_id = c.id
LEFT JOIN time_entries t ON j.id = t.job_id
LEFT JOIN costs co ON j.id = co.job_id
LEFT JOIN invoices i ON j.id = i.job_id
LEFT JOIN staff s ON j.assigned_staff_id = s.id
WHERE j.status = 'in_progress'
GROUP BY pd.organization_id, s.team_name, c.client_name, j.job_number, j.id, j.start_date;
```

### Story 3.6: Build ATO Lodgment Status Dashboard (Dashboard 5)

**As a** tax compliance manager,
**I want** a dashboard tracking tax lodgment status by client type,
**So that** I can monitor compliance obligations and identify overdue lodgments.

#### Acceptance Criteria

1. **PREREQUISITE CONFIRMED:** Suntax API availability validated (if API unavailable, this story deferred or replaced with manual data entry approach)
2. Metabase dashboard created with title "ATO Lodgment Status"
3. Chart 1: Lodgment progress gauge by client type (ITR, TRT, CTR, SMSF, PTR) showing % complete
4. Chart 2: Workflow state breakdown: Not Started, In Progress, Lodged, Overdue (color-coded)
5. Chart 3: Client type performance table: Columns: Client Type, Total Clients, Lodged, Overdue, Completion %
6. Chart 4: Overdue lodgments list: Client Name, Client Type, Due Date, Days Overdue, Assigned Staff
7. KPI cards: Total Lodgments Due, Total Lodged, Total Overdue, Overall Completion %
8. Date filter: Lodgment period selector (e.g., "FY 2024-25", "Q1 2025")
9. Client type filter: Focus on specific lodgment type (ITR only, SMSF only, etc.)
10. Dashboard loads in <3 seconds with current lodgment data
11. Visual design: Red highlights for overdue, green for lodged, gray for not started
12. "Last updated" timestamp displayed
13. Dashboard exported to version control (`/apps/metabase-config/dashboards/dashboard-5-ato-lodgment.json`)
14. **NOTE:** If Suntax API unavailable, implement manual CSV upload workflow for lodgment status data as interim solution

#### **⚠️ CRITICAL BLOCKER: Data Source Uncertainty**

**Issue**: No direct API available for ATO lodgment data. Xero/XPM do not track tax lodgment status.

**Decision Required By**: End of Week 1, Epic 3

**Resolution Options:**

**Option A: Suntax API Integration** (Preferred - if available)
- **Approach**: Investigate Suntax REST API or export capabilities
- **Implementation**:
  * Create Supabase `ato_lodgments` table
  * Build n8n workflow: Suntax API → Transform → Supabase
  * Configure Metabase dashboard queries on `ato_lodgments`
- **Timeline**: 1-2 weeks if API exists
- **Risk**: Suntax may not have public API

**Option B: CSV Upload Workflow** (Interim Solution)
- **Approach**: Weekly manual CSV upload from Suntax
- **Implementation**:
  * Admin exports CSV from Suntax
  * n8n webhook receives CSV upload
  * Parse and load to `ato_lodgments` table
  * Metabase queries Supabase table
- **Timeline**: 3-4 days
- **Risk**: Manual process prone to delays, not real-time

**Option C: XPM Custom Fields Tracking** (Fallback)
- **Approach**: Use XPM task/job custom fields for lodgment status
- **Implementation**:
  * Admin team updates XPM custom field "Lodgment Status" per client
  * n8n pulls custom field data via XPM API v3.1
  * Transform to lodgment status table
- **Timeline**: 1 week
- **Risk**: Double data entry (staff update XPM + actual lodgment system)

**Recommended Path**: Attempt Option A first (investigate Suntax API availability). If blocked within 3 days, proceed with Option B for MVP, plan migration to Option A for post-launch.

**Impact on Timeline**: Could add 2-3 weeks to Epic 3 if Suntax integration complex.

#### Detailed Specifications (Assuming Data Source Resolved)

**Visual Components**

| Component | Type | Description | Data Source |
|-----------|------|-------------|-------------|
| Lodgment Table | Data Table | Status by type (ITR, TRT, CTR, SMSF, PTR) | Suntax or CSV |
| Progress Gauge | Radial Gauge | Overall completion % | Calculated |
| Status Bar Chart | Horizontal Bar | Lodgments by state | Suntax or CSV |

**Metabase SQL Query** (requires `ato_lodgments` table):
```sql
SELECT
  client_type AS "ATO Client Type",
  SUM(CASE WHEN status = 'Not Received' THEN 1 ELSE 0 END) AS "Not Received",
  SUM(CASE WHEN status = 'Filed' THEN 1 ELSE 0 END) AS "Filed",
  SUM(CASE WHEN status = 'Still To Do' THEN 1 ELSE 0 END) AS "Still To Do",
  COUNT(*) AS "Total"
FROM ato_lodgments
WHERE organization_id = {{organization_id}}
  AND ato_year = {{ato_year}}
GROUP BY client_type
```

**Chakra UI Components Required**:
- ✅ `Table` - Lodgment status table
- ✅ `Badge` - Status indicators (Filed, Still To Do, Draft)
- ✅ `CircularProgress` - Radial progress (e.g., 71.34%)
- ✅ `Select` - ATO Year dropdown

### Story 3.7: Build Services Analysis Dashboard (Dashboard 6)

**As a** practice manager,
**I want** a dashboard analyzing service line profitability with time added, invoiced amounts, and charge rates,
**So that** I can identify most/least profitable service offerings and optimize resource allocation.

#### Acceptance Criteria

1. Metabase dashboard created with title "Services Analysis"
2. Chart 1: Service line profitability table with columns:
   - Service Type (EOFY, SMSF, Bookkeeping, ITR, BAS, Advisory, ASIC, FBT, Client Service, Tax Planning)
   - Time Added $ (billable hours × charge rate from XPM)
   - Invoiced $ (actual invoiced amounts from Xero, matched to service type)
   - Net Write-Ups $ (Invoiced - Time Added, shows discounts/premiums)
   - Time Revenue $ (subset of Invoiced attributable to time vs. disbursements)
   - Avg Charge Rate (Time Revenue / Hours)
3. Service type classification: Jobs/time entries tagged with service type (from Story 3.3 taxonomy mapping)
4. Chart 2: Service profitability bar chart (Net Write-Ups by service, sorted high to low)
5. Chart 3: Utilization by service: Hours worked vs. hours invoiced (identifies write-offs)
6. Chart 4: Trend analysis: Service revenue over last 12 months (line chart by service type)
7. KPI cards: Total Time Added, Total Invoiced, Overall Write-Up %, Average Charge Rate (all services)
8. Service type filter: Focus on specific service or "All Services"
9. Date range filter: Default last 12 months, user-adjustable
10. Dashboard loads in <3 seconds with 12 months of service data
11. Visual design: Color-coded write-ups (green positive, red negative)
12. "Last updated" timestamp displayed
13. Dashboard exported to version control (`/apps/metabase-config/dashboards/dashboard-6-services.json`)

#### Detailed Specifications

**Visual Components**

| Component | Type | Description | Data Source |
|-----------|------|-------------|-------------|
| Services Table | Data Table | Service performance metrics | XPM Time + Xero Invoices |
| Service Filter | Multi-Select | Service type selector | XPM Tasks/Categories |
| Staff Filter | Multi-Select | Staff member selector | XPM Staff |
| Export Button | Button | Export to Excel | N/A |

**Table Columns**:
- Service (e.g., EOFY, SMSF, Bookkeeping, ITR, BAS, Advisory)
- Time Added $ (charge value of time entered)
- Invoiced (invoice amounts)
- Net Write Ups (Invoiced - Time Added)
- Time (Hours) (billable hours)
- Time Revenue (realized revenue)
- Avg. Charge Rate (Time Revenue ÷ Hours)

**Metabase SQL Query**:
```sql
WITH service_time AS (
  SELECT
    service_type,
    SUM(hours) AS total_hours,
    SUM(charge_value) AS time_added_dollars
  FROM time_entries
  WHERE organization_id = {{organization_id}}
    AND service_date BETWEEN {{start_date}} AND {{end_date}}
    AND billable = TRUE
  GROUP BY service_type
),
service_invoices AS (
  SELECT
    service_type,
    SUM(amount) AS invoiced
  FROM invoices
  WHERE organization_id = {{organization_id}}
    AND invoice_date BETWEEN {{start_date}} AND {{end_date}}
  GROUP BY service_type
)
SELECT
  t.service_type AS "Service",
  t.time_added_dollars AS "Time Added $",
  COALESCE(i.invoiced, 0) AS "Invoiced",
  (COALESCE(i.invoiced, 0) - t.time_added_dollars) AS "Net Write Ups",
  t.total_hours AS "Time (Hours)",
  COALESCE(i.invoiced, 0) AS "Time Revenue",
  CASE
    WHEN t.total_hours > 0 THEN (COALESCE(i.invoiced, 0) / t.total_hours)
    ELSE 0
  END AS "Avg. Charge Rate"
FROM service_time t
LEFT JOIN service_invoices i ON t.service_type = i.service_type
ORDER BY t.time_added_dollars DESC
```

**Service Type Mapping Strategy**:

Create a mapping table to classify XPM tasks to service types:

```sql
CREATE TABLE service_type_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  xpm_task_uuid UUID NOT NULL,
  xpm_task_name TEXT NOT NULL,
  service_type TEXT NOT NULL CHECK (service_type IN (
    'EOFY Financials & Tax Returns',
    'SMSF Financials & Tax Return',
    'Bookkeeping',
    'ITR',
    'BAS',
    'Advisory',
    'ASIC Annual Review',
    'Client Service',
    'FBT',
    'Tax Planning'
  )),
  UNIQUE (organization_id, xpm_task_uuid)
);
```

**Metabase Chart Configurations**:
- Table with conditional formatting: Net Write Ups green (positive) / red (negative)
- Sortable columns
- Export to CSV/Excel enabled
- Filters: Service Type Multi-Select, Staff Multi-Select, Date Range

**Chakra UI Components Required** (for internal BI alternative):
- ✅ `Table` - Services performance table (sortable)
- ✅ `MultiSelect` - Service and staff filters
- ✅ `Button` - Export to Excel
- ✅ `Calendar` + `Popover` - Date range selector
- ✅ `Badge` - Write-up/write-off indicators (green/red)

### Story 3.8: Build Client Recoverability Dashboard (Dashboard 8)

**As a** practice manager,
**I want** a dashboard showing client-level WIP and profitability tracking,
**So that** I can identify problematic clients with high WIP or low recoverability rates.

#### Acceptance Criteria

1. Metabase dashboard created with title "Client Recoverability"
2. Chart 1: Client WIP table with columns: Client Name, Time $, Disbursements, Interims (progress invoices), Net WIP
3. Net WIP calculation: (Time $ + Disbursements) - Interims for each client
4. Chart 2: Toggle view "By Staff" vs "By Client" (filter widget switches perspective)
5. "By Staff" view: Shows which staff members have highest WIP attributed to their time entries
6. "By Client" view: Shows which clients have highest unbilled amounts
7. Chart 3: Client recoverability percentage: (Invoiced / (Time + Costs)) × 100 (shows if client typically billed at full value or discounted)
8. Chart 4: Top 10 problematic clients: High WIP, old WIP age, or low recoverability %
9. KPI cards: Total Client WIP, Average WIP per Client, Average Recoverability %
10. Client search/filter: Find specific client by name
11. Drill-down: Click client to see job-level WIP detail
12. Dashboard loads in <3 seconds with current WIP dataset
13. Visual design: Red highlighting for clients with >90 day WIP or <70% recoverability
14. "Last updated" timestamp displayed
15. Dashboard exported to version control (`/apps/metabase-config/dashboards/dashboard-8-recoverability.json`)

#### Detailed Specifications

**Visual Components**

| Component | Type | Description | Data Source |
|-----------|------|-------------|-------------|
| Client Table | Data Table | WIP breakdown by client | XPM Jobs/Time/Costs/Invoices |
| View Toggle | Tabs | by Staff / by Client | N/A |
| Client Filter | Dropdown | Select specific client | XPM Clients |
| Column Sorting | Sort Icons | Sortable table headers | N/A |

**Table Columns**:
- Client (client name)
- Time (unbilled time value)
- Disbursements (unbilled costs)
- Interims (progress invoices)
- WIP (calculated: Time + Disbursements - Interims)

**Net WIP Calculation Formula**:
```
Net WIP = (Time $ + Disbursements) - Interims
```

**Recoverability Percentage**:
```
Recoverability % = (Invoiced / (Time + Costs)) × 100
```

**Metabase SQL Query**:
```sql
SELECT
  c.name AS client,
  SUM(t.charge_value) AS time_value,
  SUM(co.amount) AS disbursements,
  SUM(i.amount) AS interims,
  (SUM(t.charge_value) + SUM(co.amount) - SUM(i.amount)) AS wip
FROM clients c
LEFT JOIN jobs j ON c.id = j.client_id
LEFT JOIN time_entries t ON j.id = t.job_id AND t.billable = TRUE AND t.invoiced = FALSE
LEFT JOIN costs co ON j.id = co.job_id AND co.billable = TRUE AND co.invoiced = FALSE
LEFT JOIN invoices i ON j.id = i.job_id AND i.type = 'progress'
WHERE c.organization_id = {{organization_id}}
  AND j.status = 'in_progress'
GROUP BY c.name
HAVING (SUM(t.charge_value) + SUM(co.amount) - SUM(i.amount)) > 0
ORDER BY wip DESC
```

**"By Staff" View Query**:
```sql
SELECT
  s.staff_name AS staff_member,
  SUM(t.charge_value) AS time_value,
  SUM(co.amount) AS disbursements,
  SUM(i.amount) AS interims,
  (SUM(t.charge_value) + SUM(co.amount) - SUM(i.amount)) AS wip
FROM staff s
LEFT JOIN time_entries t ON s.id = t.staff_id AND t.billable = TRUE AND t.invoiced = FALSE
LEFT JOIN jobs j ON t.job_id = j.id
LEFT JOIN costs co ON j.id = co.job_id
LEFT JOIN invoices i ON j.id = i.job_id AND i.type = 'progress'
WHERE s.organization_id = {{organization_id}}
  AND j.status = 'in_progress'
GROUP BY s.staff_name
HAVING (SUM(t.charge_value) + SUM(co.amount) - SUM(i.amount)) > 0
ORDER BY wip DESC
```

**Metabase Chart Configurations**:
- Table with sortable columns
- Search by client name
- Export to CSV enabled
- Toggle between "by Client" and "by Staff" views
- Total row displaying sum of all WIP

**Chakra UI Components Required** (for internal BI alternative):
- ✅ `Table` - Client recoverability table
- ✅ `Tabs` - by Staff / by Client toggle
- ✅ `Button` - Sort icons in table headers
- ✅ `Select` - Client dropdown filter

**Key Business Logic**:
- **Problematic Clients Criteria**:
  * WIP > 90 days old
  * Recoverability < 70%
  * High WIP amount (>$50K) with aging >60 days
- **Visual Indicators**:
  * Red highlighting for problematic clients
  * Negative interims displayed in red with parentheses: ($XX,XXX)

### Story 3.9: Enhance Authentication System with Advanced Features

**As a** platform administrator,
**I want** comprehensive user management features and security hardening,
**So that** the platform meets enterprise security standards for production use.

#### Acceptance Criteria

1. Password policies enforced via Supabase Auth configuration:
   - Minimum 10 characters (increased from MVP 8)
   - Requires uppercase, lowercase, number, special character
   - Password expiration: 90 days (users prompted to change)
   - Password history: Cannot reuse last 3 passwords
2. Session management enhancements:
   - Configurable session timeout (default: 8 hours inactivity)
   - Multi-device session tracking: Users can see active sessions, revoke devices
   - "Remember me" option on login extends session to 30 days
3. Security hardening:
   - Rate limiting on login endpoint (5 failed attempts = 15 minute lockout)
   - Brute force protection (IP-based blocking after 10 failed attempts)
   - Activity logging: All logins, logouts, password changes logged to `security_audit_log` table
4. User management enhancements (extends Story 2.5):
   - Bulk actions: Select multiple users, change roles simultaneously
   - User status: Active/Inactive flag (inactive users cannot log in but retain data)
   - Last login tracking: Identify inactive users (no login in 30+ days)
5. Admin notifications:
   - Email alert to admin when new user created or role changed
   - Weekly summary: User activity report (logins, new users, locked accounts)
6. Two-factor authentication (2FA) foundation (optional, if time permits):
   - Supabase supports TOTP; basic 2FA setup documented for future implementation
   - Admin flag to require 2FA for executive role users
7. Testing: Security audit performed (penetration testing or automated security scan)
8. Documentation: Security configuration guide, incident response procedures updated

### Story 3.10: Update Portal Navigation for 8 Dashboards

**As a** dashboard user,
**I want** portal navigation updated to include all 8 dashboards with logical grouping,
**So that** I can easily find and access the complete dashboard suite.

#### Acceptance Criteria

1. Sidebar navigation redesigned to accommodate 8 dashboards (was 3 in MVP)
2. Dashboard grouping (optional, if improves UX):
   - Financial Dashboards: Income vs Expenses, Monthly Invoicing to Budget, YTD/MTD View
   - Operational Dashboards: Work In Progress by Team, Services Analysis, Client Recoverability
   - Compliance Dashboards: Debtors/AR Aging, ATO Lodgment Status
3. All 8 dashboards listed with clear names:
   - Dashboard 1: Income vs Expenses
   - Dashboard 2: Monthly Invoicing to Budget
   - Dashboard 3: YTD/MTD View
   - Dashboard 4: Work In Progress by Team
   - Dashboard 5: ATO Lodgment Status
   - Dashboard 6: Services Analysis
   - Dashboard 7: Debtors/AR Aging
   - Dashboard 8: Client Recoverability
4. RBAC applied: Users only see dashboards they have permission to access (executives see all 8, managers see subset, staff see limited set)
5. Dashboard icons added (optional): Visual icons next to dashboard names for easier scanning
6. Active dashboard highlighting updated to work with 8-dashboard navigation
7. Responsive design: 8 dashboards fit in sidebar without scrolling on desktop (1920px); tablet/mobile use collapsible menu
8. Performance: Navigation rendering remains instant (<100ms) with 8 items
9. Accessibility: Keyboard navigation works correctly with expanded menu
10. User testing: 3+ users confirm navigation is intuitive and easy to use

---
