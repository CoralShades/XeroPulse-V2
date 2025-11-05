# Epic 2: MVP Dashboard Suite & Portal Launch

**Epic Goal:**

Complete the MVP by building the remaining two dashboards (Monthly Invoicing to Budget and Debtors/AR Aging), developing a full-featured Next.js web portal with role-based navigation and user management capabilities, implementing comprehensive RBAC to control dashboard access by user role, onboarding all 20 production users, conducting user acceptance testing with representative stakeholders, and launching the production platform by October 31, 2025. This epic transforms the technical proof-of-concept from Epic 1 into a professional, multi-user financial intelligence platform ready for organizational adoption.

### Story 2.1: Build Monthly Invoicing to Budget Dashboard (Dashboard 2)

**As a** finance manager,
**I want** a dashboard comparing actual invoicing performance against budget targets by month,
**So that** I can track revenue goals and identify budget variances quickly.

#### Acceptance Criteria

1. Metabase dashboard created with title "Monthly Invoicing to Budget"
2. Chart 1: Bar chart showing actual invoiced amounts by month (source: Xero Invoices API, aggregated by invoice date)
3. Chart 2: Line chart overlay showing budget targets by month (source: Xero Budget Summary API)
4. Chart 3: Variance calculation displayed (Actual - Budget) with color coding (green for over budget, red for under budget)
5. Chart 4: Year-to-date totals KPI cards (YTD Actual, YTD Budget, YTD Variance %)
6. Chart 5: Payments received overlay (source: Xero Payments API, distinguishing invoiced vs. collected amounts)
7. Date range filter widget (default: current fiscal year, user-adjustable)
8. Budget category filter (if multiple budgets exist in Xero)
9. Dashboard loads in <3 seconds with 12 months of data
10. Visual design: Consistent with Dashboard 1 styling (blue/gray palette, clean layout)
11. "Last updated" timestamp displayed
12. Dashboard exported to version control (`/apps/metabase-config/dashboards/dashboard-2-budget.json`)

#### Detailed Specifications

**Visual Components**

| Component | Type | Description | Data Source |
|-----------|------|-------------|-------------|
| Monthly Bars | Grouped Bar Chart | Actual vs Budget bars | Xero Payments + Budget API |
| Legend | Legend | Orange (Actual), Blue (Budget) | N/A |
| X-Axis | Axis Labels | Month names (Jul 2024 - Jun 2025) | N/A |
| Y-Axis | Axis Scale | Dollar amounts ($0K - $800K) | N/A |

**Metabase SQL Query**

```sql
WITH monthly_actuals AS (
  SELECT
    DATE_TRUNC('month', transaction_date) AS month,
    SUM(amount) AS actual
  FROM financial_data
  WHERE
    organization_id = {{organization_id}}
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
  CASE
    WHEN b.budget > 0 THEN ((a.actual - b.budget) / b.budget * 100)
    ELSE 0
  END AS variance_pct
FROM monthly_actuals a
FULL OUTER JOIN monthly_budgets b ON a.month = b.month
ORDER BY a.month
```

**Metabase Chart Configuration**
- Chart Type: Grouped Bar Chart
- X-Axis: month_label
- Y-Axis Multi-Series:
  - actual (Orange #FB923C)
  - budget (Blue #3B82F6)
- Filters: Financial Year selector (FY24, FY25, FY26)

**Chakra UI Components Required** (for internal BI alternative)
- ✅ `Card` - Chart container
- ✅ `Select` - Financial year selector
- ✅ `Tooltip` - Hover data display

### Story 2.2: Build Debtors/AR Aging Dashboard (Dashboard 7)

**As a** accounts receivable manager,
**I want** a dashboard showing aged receivables with aging buckets and debtor details,
**So that** I can prioritize collection efforts and monitor DSO trends.

#### Acceptance Criteria

1. Metabase dashboard created with title "Debtors/AR Aging"
2. Chart 1: Stacked bar chart showing AR aging by buckets (<30 days, 31-60 days, 61-90 days, 90+ days)
3. Chart 2: AR aging calculation logic: Current date - Invoice due date determines bucket assignment
4. Chart 3: Days Sales Outstanding (DSO) trend line over last 6 months (formula: (AR / Revenue) × Days in Period)
5. Chart 4: Top 10 debtors table with columns: Contact Name, Total Outstanding, Oldest Invoice Date, Days Overdue
6. Chart 5: Total AR KPI card (sum of all unpaid invoices)
7. Chart 6: Percentage in each aging bucket (visual breakdown)
8. Contact detail drill-down: Click debtor name to see invoice-level detail (invoice number, date, amount, status)
9. Date filter for "as of date" analysis (default: today)
10. Dashboard loads in <3 seconds with current AR dataset
11. Visual design: Red color gradient for aging (darker = older debt)
12. "Last updated" timestamp displayed
13. Dashboard exported to version control (`/apps/metabase-config/dashboards/dashboard-7-ar-aging.json`)

#### Detailed Specifications

**Visual Components**

| Component | Type | Description | Data Source |
|-----------|------|-------------|-------------|
| Aging Donut Chart | Donut Chart | AR aging buckets visualization | Xero Invoices |
| Top Debtors Bar Chart | Horizontal Bar | Largest outstanding balances | Xero Invoices |
| DSO Line Chart | Line Chart | Rolling 12-month DSO trend | Xero Payments |
| Summary KPI Cards | Stat Cards | Total AR, Avg DSO, Overdue | Calculated |
| Client Filter | Dropdown | Filter by specific client | Xero Contacts |

**Metabase SQL Queries**

**Query 1: AR Aging Donut Chart**
```sql
SELECT
  CASE
    WHEN days_overdue <= 30 THEN '<30 days'
    WHEN days_overdue BETWEEN 31 AND 60 THEN '31-60 days'
    WHEN days_overdue BETWEEN 61 AND 90 THEN '61-90 days'
    ELSE '90+ days'
  END AS aging_bucket,
  SUM(amount_due) AS balance
FROM (
  SELECT
    invoice_id,
    amount_due,
    GREATEST(0, CURRENT_DATE - due_date) AS days_overdue
  FROM invoices
  WHERE organization_id = {{organization_id}}
    AND type = 'ACCREC'
    AND status IN ('AUTHORISED', 'PARTPAID')
    AND amount_due > 0
) AS aged_invoices
GROUP BY aging_bucket
```

**Query 2: Top Debtors Bar Chart**
```sql
SELECT
  c.name AS client,
  SUM(i.amount_due) AS outstanding
FROM invoices i
JOIN contacts c ON i.contact_id = c.id
WHERE i.organization_id = {{organization_id}}
  AND i.amount_due > 0
GROUP BY c.name
ORDER BY outstanding DESC
LIMIT 15
```

**Query 3: DSO Rolling 12-Month Line Chart**
```sql
WITH monthly_ar AS (
  SELECT
    DATE_TRUNC('month', snapshot_date) AS month,
    AVG(total_ar_balance) AS avg_ar
  FROM ar_snapshots
  WHERE organization_id = {{organization_id}}
    AND snapshot_date >= CURRENT_DATE - INTERVAL '12 months'
  GROUP BY month
),
monthly_sales AS (
  SELECT
    DATE_TRUNC('month', transaction_date) AS month,
    SUM(amount) AS credit_sales
  FROM financial_data
  WHERE organization_id = {{organization_id}}
    AND transaction_type = 'revenue'
    AND transaction_date >= CURRENT_DATE - INTERVAL '12 months'
  GROUP BY month
)
SELECT
  ar.month,
  CASE
    WHEN s.credit_sales > 0 THEN (ar.avg_ar / s.credit_sales * 30)
    ELSE 0
  END AS dso
FROM monthly_ar ar
JOIN monthly_sales s ON ar.month = s.month
ORDER BY ar.month
```

**Metabase Chart Configurations**
- Donut Chart: Colors - Green, Yellow, Orange, Red (aging severity)
- Horizontal Bar Chart: Top 15 debtors by outstanding balance
- Line Chart: Y-Axis = DSO (days), X-Axis = Month

**Chakra UI Components Required** (for internal BI alternative)
- ✅ `Card` - Chart containers and KPI cards
- ✅ `Badge` - Aging bucket indicators
- ✅ `Select` - Client filter dropdown
- ✅ `Tooltip` - Hover data display

### Story 2.3: Implement Role-Based Access Control (RBAC) System

**As a** platform administrator,
**I want** role-based permissions controlling which dashboards each user can access,
**So that** executives, managers, and staff only see dashboards relevant to their responsibilities.

#### Acceptance Criteria

1. Three user roles defined in Supabase user table: `executive`, `manager`, `staff`
2. Dashboard permission mapping documented:
   - **Executive role:** Access to all 3 MVP dashboards (Income vs Expenses, Monthly Invoicing to Budget, Debtors/AR Aging)
   - **Manager role:** Access to Monthly Invoicing to Budget and Debtors/AR Aging
   - **Staff role:** Access to Debtors/AR Aging only
3. Permission mapping stored as configuration (JSON file or database table): `{ role: 'executive', dashboards: ['dashboard-1', 'dashboard-2', 'dashboard-7'] }`
4. Next.js middleware enforces RBAC: On dashboard route access, check user role against permission mapping
5. Unauthorized access returns 403 Forbidden page with message "You do not have permission to view this dashboard"
6. Navigation sidebar dynamically renders only authorized dashboards for logged-in user
7. Metabase RBAC configured: Map Supabase roles to Metabase dashboard permissions (executives → all dashboards, managers → subset, staff → limited)
8. Testing completed: 3 test users (one per role) verify correct dashboard access/denial
9. Documentation created: RBAC permission matrix, how to modify role assignments

### Story 2.4: Build Full Next.js Portal with Navigation

**As a** dashboard user,
**I want** a professional web portal with sidebar navigation listing all my authorized dashboards,
**So that** I can easily switch between dashboards and access financial insights in one place.

#### Acceptance Criteria

1. Next.js portal redesigned from Story 1.9 minimal version to full-featured layout
2. Layout structure: Header (logo, user menu) + Sidebar navigation + Main content area
3. Sidebar navigation lists all dashboards user has access to (based on RBAC from Story 2.3):
   - Dashboard 1: Income vs Expenses
   - Dashboard 2: Monthly Invoicing to Budget
   - Dashboard 7: Debtors/AR Aging
4. Active dashboard highlighted in sidebar (visual indicator)
5. Click dashboard name in sidebar loads embedded Metabase dashboard in main content area
6. Header displays: XeroPulse logo (left), user email/name (right), logout button (dropdown menu)
7. Default landing: User auto-redirected to first authorized dashboard after login
8. Responsive layout: Desktop (1920px) shows full sidebar, Tablet (1024px) collapsible sidebar, Mobile (<1024px) hamburger menu
9. Loading states: Skeleton loader displayed while dashboard iframe loads
10. Error states: If dashboard fails to load, show error message with retry button
11. Branding applied: Deep blue header (#1E3A8A), slate gray sidebar (#64748B), off-white background (#F8FAFC)
12. Accessibility: Keyboard navigation supported (Tab, Enter, Escape), focus indicators visible
13. Performance: Portal shell loads in <1 second, dashboard iframes load within 3 seconds
14. Deployed to Vercel production URL

### Story 2.5: Implement User Management Admin Panel

**As a** platform administrator,
**I want** an admin UI to add users, assign roles, and manage dashboard permissions,
**So that** I can onboard the 20 production users without manual database edits.

#### Acceptance Criteria

1. Admin panel route created: `/admin/users` (only accessible to users with `admin` role or `executive` role with admin flag)
2. User list table displaying: Email, Role, Last Login, Created Date, Actions (Edit, Delete)
3. "Add User" button opens modal form with fields:
   - Email (required, validated email format)
   - Role (dropdown: executive, manager, staff)
   - Auto-generate temporary password checkbox (if checked, sends password via email)
4. Edit user functionality: Click "Edit" opens modal to change role assignment
5. Delete user functionality: Click "Delete" shows confirmation dialog, then removes user from Supabase Auth and user table
6. User invitation flow: New user receives email with temporary password and login link
7. Password change required on first login (Supabase Auth password reset flow)
8. Admin panel protected by RBAC: Non-admin users attempting to access receive 403 Forbidden
9. Audit log: User creation, role changes, and deletions logged to database table (`admin_audit_log`)
10. Bulk user import: CSV upload feature to add multiple users at once (email, role columns)
11. Search/filter users: Search by email, filter by role
12. User count displayed: "20 users total" badge
13. Testing: Admin successfully adds 5 test users, assigns different roles, verifies RBAC works correctly

### Story 2.6: Onboard 20 Production Users

**As a** platform administrator,
**I want** all 20 organizational users added to the platform with correct role assignments,
**So that** the entire team has dashboard access for production launch.

#### Acceptance Criteria

1. User list finalized with stakeholders: 20 names, emails, role assignments documented
2. All 20 users created in Supabase via admin panel (Story 2.5)
3. Role distribution confirmed:
   - Executives: X users (access to all 3 dashboards)
   - Managers: Y users (access to dashboards 2 and 7)
   - Staff: Z users (access to dashboard 7 only)
4. Invitation emails sent to all 20 users with login credentials and portal URL
5. Quick Start Guide created (PDF or web page) explaining:
   - How to log in
   - How to navigate dashboards
   - What each dashboard shows
   - How to reset password
   - Who to contact for support
6. Quick Start Guide distributed to all 20 users via email
7. Support channel established: Email address or Slack channel for user questions during rollout
8. 15+ of 20 users successfully complete first login within Week 4 (80% onboarding success rate)
9. User feedback collected: Short survey asking about login experience, dashboard clarity, any issues encountered

### Story 2.7: Conduct User Acceptance Testing (UAT)

**As a** product manager,
**I want** representative users from each role to test the platform and provide feedback,
**So that** we identify critical issues before full production launch.

#### Acceptance Criteria

1. UAT participants identified: 5+ users representing all 3 roles (2 executives, 2 managers, 1 staff member)
2. UAT test script created covering scenarios:
   - Login with credentials
   - Navigate to all authorized dashboards
   - Verify data accuracy (spot-check dashboard numbers against known Xero values)
   - Test role permissions (attempt to access unauthorized dashboard)
   - Reset password
   - Use dashboard filters (date ranges, categories)
   - Report any visual bugs, performance issues, or confusing UX
3. UAT sessions scheduled: 1-hour sessions with each participant during Week 4
4. UAT feedback documented: Issues categorized as Critical (blocks launch), High (fix before launch), Medium (fix post-launch), Low (nice-to-have)
5. Critical and High issues resolved before production launch
6. UAT success criteria met:
   - 80%+ of users successfully complete all test scenarios
   - 80%+ of users rate dashboards "useful" or "very useful" (5-point scale survey)
   - Zero critical bugs blocking launch
   - <5 high-priority bugs remaining (all have mitigation plans)
7. UAT results presented to stakeholders with go/no-go recommendation

### Story 2.8: Production Launch and Monitoring Setup

**As a** DevOps engineer,
**I want** production environment fully operational with monitoring and alerting,
**So that** we can detect issues quickly and maintain 99%+ uptime SLA.

#### Acceptance Criteria

1. Production VPS confirmed stable: 7+ days uptime with no critical issues during Epic 1-2 development
2. Monitoring dashboards established:
   - VPS resource monitoring: CPU, RAM, disk usage tracked (alerts at 80% threshold)
   - n8n sync monitoring: Success/failure rate logged, alert on 2 consecutive failures
   - Metabase query performance: Dashboard load times tracked, alert on >5 second loads
   - Vercel Next.js monitoring: Built-in Vercel analytics tracking page views, errors
3. Backup verification: Weekly VPS snapshots tested (restore snapshot to verify integrity)
4. Supabase database size monitored: Current usage displayed, alert at 400MB (80% of 500MB free tier)
5. Uptime monitoring: External service (UptimeRobot or similar) pings portal URL every 5 minutes, alerts on downtime
6. Alert channels configured: Email notifications to admin team for critical alerts
7. Incident response runbook documented: Common issues and remediation steps (n8n sync failure, Metabase down, VPS resource exhaustion, etc.)
8. Production launch checklist completed:
   - ✅ All 3 dashboards deployed and tested
   - ✅ 20 users onboarded successfully
   - ✅ UAT passed with 80%+ satisfaction
   - ✅ Monitoring and alerting operational
   - ✅ Backup and disaster recovery tested
   - ✅ Documentation complete (user guides, admin runbooks)
9. Launch announcement sent to organization: "XeroPulse is now live at [URL]"
10. Post-launch support: Admin monitors user activity and support requests for first 48 hours

### Story 2.9: Post-Launch Performance Optimization

**As a** platform engineer,
**I want** dashboards optimized for sub-3-second load times based on production usage data,
**So that** users experience fast, responsive dashboards meeting performance SLA.

#### Acceptance Criteria

1. Dashboard load times measured over 7 days post-launch with 20 active users
2. Performance bottlenecks identified:
   - Slow SQL queries (>2 seconds) logged and optimized (add indexes, rewrite queries)
   - Metabase cache hit rate monitored (target: >60% cache hits to reduce DB load)
   - Large datasets causing slow renders (implement pagination or query limits)
3. Optimizations implemented:
   - Database query optimization: Add missing indexes on filtered columns
   - Metabase query result caching tuned (increase cache TTL if data freshness allows)
   - Dashboard chart limits: Cap table rows to 100, use pagination for detail views
4. Post-optimization measurements:
   - 95%+ of dashboard loads complete in <3 seconds (measured over 7 days)
   - Database query times reduced by 30%+ on average
   - VPS CPU/RAM usage remains <70% during peak usage hours
5. Performance metrics documented as baseline for Month 2-3 monitoring
6. User satisfaction check: No performance complaints in support channel during Week 5

---
