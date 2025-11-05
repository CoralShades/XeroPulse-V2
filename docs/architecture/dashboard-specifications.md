# Dashboard Specifications

**Document Version**: 1.0
**Last Updated**: 2025-10-22
**Purpose**: Comprehensive technical specifications for all 8 XeroPulse dashboards

---

## Table of Contents

1. [Dashboard Overview](#dashboard-overview)
2. [Dashboard 1: Income vs Expenses](#dashboard-1-income-vs-expenses)
3. [Dashboard 2: Monthly Invoicing to Budget](#dashboard-2-monthly-invoicing-to-budget)
4. [Dashboard 3: YTD/MTD Budget Views](#dashboard-3-ytdmtd-budget-views)
5. [Dashboard 4: Work In Progress by Team](#dashboard-4-work-in-progress-by-team)
6. [Dashboard 5: ATO Lodgment Status](#dashboard-5-ato-lodgment-status)
7. [Dashboard 6: Services Analysis](#dashboard-6-services-analysis)
8. [Dashboard 7: Debtors/AR Aging](#dashboard-7-debtorsar-aging)
9. [Dashboard 8: Client Recoverability](#dashboard-8-client-recoverability)
10. [Implementation Quick Reference](#implementation-quick-reference)

---

## Dashboard Overview

### Complete Dashboard Suite

| ID | Dashboard Name | Complexity | Primary Data Source | Epic | Priority |
|----|---------------|------------|---------------------|------|----------|
| 1 | Income vs Expenses | Medium | Xero Payments + P&L | 2 | High |
| 2 | Monthly Invoicing to Budget | Low | Xero Payments + Budget | 2 | High |
| 3 | YTD/MTD Budget Views | Low | Xero Payments + Budget | 3 | Medium |
| 4 | Work In Progress by Team | **High** | XPM Jobs/Time/Costs | 3 | High |
| 5 | ATO Lodgment Status | Medium | Suntax (⚠️ API TBD) | 3 | Medium |
| 6 | Services Analysis | Medium | XPM Time + Invoices | 3 | High |
| 7 | Debtors/AR Aging | Medium | Xero Invoices + Payments | 2 | High |
| 8 | Client Recoverability | Medium | XPM Time/Costs/Invoices | 3 | Medium |

### User Role Access Matrix

| Dashboard | Executive | Manager | Staff | Description |
|-----------|-----------|---------|-------|-------------|
| Dashboard 1 | ✅ | ✅ | ❌ | Income vs Expenses |
| Dashboard 2 | ✅ | ✅ | ❌ | Monthly Budget |
| Dashboard 3 | ✅ | ✅ | ❌ | YTD/MTD Budget |
| Dashboard 4 | ✅ | ✅ | ⚠️ Team only | WIP by Team |
| Dashboard 5 | ✅ | ✅ | ❌ | ATO Lodgment |
| Dashboard 6 | ✅ | ✅ | ⚠️ Own services | Services Analysis |
| Dashboard 7 | ✅ | ✅ | ❌ | Debtors Aging |
| Dashboard 8 | ✅ | ✅ | ⚠️ Own clients | Client Recoverability |

**Legend**: ✅ Full Access | ⚠️ Filtered View | ❌ No Access

---

## Dashboard 1: Income vs Expenses

### Visual Components

| Component | Type | Description | Data Source |
|-----------|------|-------------|-------------|
| Income Bars | Bar Chart | Weekly income (blue bars) | Xero Payments API |
| Wages Line | Line Chart | 52-week rolling average (yellow) | Xero P&L Report |
| Expenses Line | Line Chart | 52-week rolling average (gray) | Xero P&L Report |
| Tab Navigation | Tabs | Revenue / Debtors tabs | N/A |
| Date Filter | Dropdown | FY selector (FY25, Feb) | N/A |
| KPI Cards (Top) | Stat Cards | 8 quick metrics | Multiple APIs |

### Data Requirements

**Primary Metric**: Weekly cash flow visualization with trend analysis

**API Endpoints**:
- `/api.xro/2.0/Payments` (Income bars)
- `/api.xro/2.0/Reports/ProfitAndLoss` (Wages + Expenses)

**Calculations**:
```sql
-- 52-Week Rolling Average
AVG(Amount) OVER (
  ORDER BY week
  ROWS BETWEEN 51 PRECEDING AND CURRENT ROW
) AS rolling_avg
```

### Metabase Configuration

**Dashboard Slug**: `income-vs-expenses`

**Chart 1: Income Bars**
```sql
SELECT
  DATE_TRUNC('week', transaction_date) AS week_ending,
  SUM(amount) AS income
FROM financial_data
WHERE
  organization_id = {{organization_id}}
  AND transaction_type = 'revenue'
  AND transaction_date >= CURRENT_DATE - INTERVAL '52 weeks'
GROUP BY week_ending
ORDER BY week_ending
```

**Chart 2: Wages Rolling Average**
```sql
WITH weekly_wages AS (
  SELECT
    DATE_TRUNC('week', transaction_date) AS week_ending,
    SUM(amount) AS wages
  FROM financial_data
  WHERE
    organization_id = {{organization_id}}
    AND account_code = '500'
    AND transaction_date >= CURRENT_DATE - INTERVAL '52 weeks'
  GROUP BY week_ending
)
SELECT
  week_ending,
  AVG(wages) OVER (
    ORDER BY week_ending
    ROWS BETWEEN 51 PRECEDING AND CURRENT ROW
  ) AS wages_avg
FROM weekly_wages
ORDER BY week_ending
```

### Chakra UI Components

- `Card`, `Tabs`, `Select`, `Badge`, `Divider`

### ETL Requirements

- **Frequency**: Every 2 hours
- **Pattern**: Incremental sync (Payments), Full refresh (P&L Report)
- **Dependencies**: None

---

## Dashboard 2: Monthly Invoicing to Budget

### Visual Components

| Component | Type | Description | Data Source |
|-----------|------|-------------|-------------|
| Monthly Bars | Grouped Bar Chart | Actual vs Budget bars | Xero Payments + Budget |
| Legend | Legend | Orange (Actual), Blue (Budget) | N/A |
| X-Axis | Axis Labels | Month names (Jul 2024 - Jun 2025) | N/A |
| Y-Axis | Axis Scale | Dollar amounts ($0K - $800K) | N/A |

### Data Requirements

**Primary Metric**: Monthly revenue performance vs budget targets

**API Endpoints**:
- `/api.xro/2.0/Payments` (Actual invoicing)
- `/api.xro/2.0/Reports/BudgetSummary` (Budget targets)

**Calculations**:
```
Variance $ = Actual - Budget
Variance % = ((Actual - Budget) / Budget) × 100
```

### Metabase Configuration

**Dashboard Slug**: `monthly-invoicing-budget`

**Main Query**:
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

**Chart Type**: Grouped Bar Chart
- X-Axis: `month_label`
- Y-Axis Multi-Series: `actual` (Orange #FB923C), `budget` (Blue #3B82F6)

### Chakra UI Components

- `Card`, `Select`, `Tooltip`

### ETL Requirements

- **Frequency**: Every 2 hours (Payments), Daily (Budgets)
- **Pattern**: Incremental sync (Payments), Full refresh (Budgets)
- **Dependencies**: Budgets table populated from Xero

---

## Dashboard 3: YTD/MTD Budget Views

### Visual Components

| Component | Type | Description | Data Source |
|-----------|------|-------------|-------------|
| Cumulative Bars | Grouped Bar Chart | Running totals | Xero Payments + Budget |
| MTD/YTD Toggle | Toggle Buttons | View switcher | N/A |
| KPI Cards | Stat Cards | Budget, Actual, Leads Won | Multiple |
| Progress Bar | Linear Progress | Visual budget attainment | Calculated |

### Data Requirements

**Primary Metric**: Cumulative budget performance (MTD/YTD toggle)

**API Endpoints**: Same as Dashboard 2

**Calculations**:
```sql
-- Cumulative Sum
SUM(SUM(amount)) OVER (
  ORDER BY DATE_TRUNC('month', transaction_date)
) AS cumulative_actual
```

### Metabase Configuration

**Dashboard Slug**: `cumulative-budget`

**MTD Query**:
```sql
SELECT
  SUM(amount) AS mtd_actual,
  (SELECT SUM(amount) FROM budgets
   WHERE organization_id = {{organization_id}}
   AND budget_month = DATE_TRUNC('month', CURRENT_DATE)) AS mtd_budget
FROM financial_data
WHERE organization_id = {{organization_id}}
  AND transaction_date >= DATE_TRUNC('month', CURRENT_DATE)
```

**YTD Query**: Similar to MTD but with year-to-date range

### Chakra UI Components

- `Card`, `Tabs`, `Progress`, `Badge`

### ETL Requirements

- **Frequency**: Every 2 hours
- **Pattern**: Same as Dashboard 2
- **Dependencies**: Budgets table

---

## Dashboard 4: Work In Progress by Team

### Visual Components

| Component | Type | Description | Data Source |
|-----------|------|-------------|-------------|
| Donut Charts (4x) | Donut/Pie Charts | WIP aging by team | XPM Jobs/Time/Costs |
| WIP Summary Table | Data Table | Team breakdown | XPM aggregated |
| Client Details Table | Sortable Table | Client-level WIP | XPM Job details |
| WIP Trends Chart | Area Chart | Monthly WIP accumulation | XPM historical |
| Team Filters | Dropdown | Team selector | XPM Staff |

### Data Requirements

**Primary Metric**: Unbilled WIP by team with aging buckets

**API Endpoints**:
- `/practicemanager/3.1/job.api/list` (Jobs)
- `/practicemanager/3.1/time.api/list` (Time entries)
- `/practicemanager/3.1/cost.api/list` (Costs)
- `/practicemanager/3.1/invoice.api/list` (Progress invoices)
- `/practicemanager/3.1/staff.api/list` (Staff/teams)

**Calculations**:
```
WIP = (Time Value + Billable Costs) - Progress Invoices
Aging Days = CURRENT_DATE - MIN(Time Entry Date, Job Start Date)
```

**Aging Buckets**: <30, 31-60, 61-90, 90+ days

### Metabase Configuration

**Dashboard Slug**: `wip-analysis`

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

**Database View**:
```sql
CREATE MATERIALIZED VIEW vw_wip_aging AS
SELECT
  pd.organization_id,
  s.team_name,
  c.client_name,
  j.job_number,
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

### Chakra UI Components

- `Table`, `Card`, `Tabs`, `Select`, `Badge`, `Popover`, `Button`
- **Custom/Third-party**: Date picker (react-datepicker or chakra-dayzed-datepicker)

### ETL Requirements

- **Frequency**: Every 2 hours
- **Pattern**: Incremental sync (all XPM endpoints)
- **Dependencies**: Materialized view refresh (daily at 6 AM)

---

## Dashboard 5: ATO Lodgment Status

### Visual Components

| Component | Type | Description | Data Source |
|-----------|------|-------------|-------------|
| Lodgment Table | Data Table | Status by type (ITR, TRT, CTR, SMSF, PTR) | Suntax API |
| Progress Gauge | Radial Gauge | Overall completion % | Calculated |
| Status Bar Chart | Horizontal Bar | Lodgments by state | Suntax API |

### Data Requirements

**Primary Metric**: Tax lodgment compliance tracking

**⚠️ CRITICAL BLOCKER**: Suntax API availability TBD

**Resolution Options**:
1. **Option A**: Suntax API integration (preferred, 1-2 weeks)
2. **Option B**: CSV upload workflow (interim, 3-4 days)
3. **Option C**: XPM custom fields (fallback, 1 week)

**Decision Required By**: End of Week 1, Epic 3

### Metabase Configuration

**Dashboard Slug**: `ato-lodgment-status`

**Main Query** (requires `ato_lodgments` table):
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

**Progress Gauge Query**:
```sql
SELECT
  (COUNT(CASE WHEN status IN ('Filed', 'Approved', 'Completed') THEN 1 END)::FLOAT / COUNT(*)::FLOAT * 100) AS progress_pct
FROM ato_lodgments
WHERE organization_id = {{organization_id}}
  AND ato_year = {{ato_year}}
```

### Chakra UI Components

- `Table`, `Badge`, `Progress`, `Select`

### ETL Requirements

- **Frequency**: Daily (if Suntax API available)
- **Pattern**: Full refresh or CSV upload
- **Dependencies**: Suntax API investigation, `ato_lodgments` table schema

---

## Dashboard 6: Services Analysis

### Visual Components

| Component | Type | Description | Data Source |
|-----------|------|-------------|-------------|
| Services Table | Data Table | Service performance metrics | XPM Time + Invoices |
| Service Filter | Multi-Select | Service type selector | XPM Tasks/Categories |
| Staff Filter | Multi-Select | Staff member selector | XPM Staff |
| Export Button | Button | Export to Excel | N/A |

### Data Requirements

**Primary Metric**: Service line profitability with write-up/write-off analysis

**Table Columns**:
- Service (e.g., EOFY, SMSF, Bookkeeping, ITR, BAS)
- Time Added $ (charge value of time entered)
- Invoiced (invoice amounts)
- Net Write Ups (Invoiced - Time Added)
- Time (Hours) (billable hours)
- Time Revenue (realized revenue)
- Avg. Charge Rate (Time Revenue ÷ Hours)

**API Endpoints**:
- `/practicemanager/3.1/time.api/list` (Time entries)
- `/practicemanager/3.1/task.api/list` (Service mapping)
- `/practicemanager/3.1/invoice.api/list` (Invoices)

**Calculations**:
```
Net Write Ups = Invoiced $ - Time Added $
Avg Charge Rate = Time Revenue $ ÷ Time (Hours)
```

### Metabase Configuration

**Dashboard Slug**: `services-analysis`

**Main Query**:
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

**Service Type Mapping Table**:
```sql
CREATE TABLE service_type_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  xpm_task_uuid UUID NOT NULL,
  service_type TEXT NOT NULL CHECK (service_type IN (
    'EOFY Financials & Tax Returns',
    'SMSF Financials & Tax Return',
    'Bookkeeping', 'ITR', 'BAS', 'Advisory',
    'ASIC Annual Review', 'FBT', 'Tax Planning'
  )),
  UNIQUE (organization_id, xpm_task_uuid)
);
```

### Chakra UI Components

- `Table`, `Card`, `Button`, `Popover`, `Badge`
- **Custom/Third-party**: Date picker (react-datepicker), Multi-select (chakra-react-select)

### ETL Requirements

- **Frequency**: Every 2 hours
- **Pattern**: Incremental sync
- **Dependencies**: `service_type_mappings` table

---

## Dashboard 7: Debtors/AR Aging

### Visual Components

| Component | Type | Description | Data Source |
|-----------|------|-------------|-------------|
| Aging Donut Chart | Donut Chart | AR aging buckets | Xero Invoices |
| Top Debtors Bar Chart | Horizontal Bar | Largest outstanding balances | Xero Invoices |
| DSO Line Chart | Line Chart | Rolling 12-month DSO | Xero Payments |
| Summary KPI Cards | Stat Cards | Total AR, Avg DSO, Overdue | Calculated |
| Client Filter | Dropdown | Filter by client | Xero Contacts |

### Data Requirements

**Primary Metric**: Aged receivables with DSO trend analysis

**API Endpoints**:
- `/api.xro/2.0/Invoices` (AR invoices)
- `/api.xro/2.0/Contacts` (Debtors)
- `/api.xro/2.0/Payments` (for DSO calculation)

**Calculations**:
```
days_overdue = CURRENT_DATE - DueDate
DSO = (Avg AR Balance / Credit Sales) × Days in Period
```

**Aging Buckets**: <30, 31-60, 61-90, 90+ days

### Metabase Configuration

**Dashboard Slug**: `debtors-aging-dso`

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

**Query 2: Top Debtors**
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

**Query 3: DSO Rolling 12-Month**
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

### Chakra UI Components

- `Card`, `Badge`, `Select`, `Tooltip`

### ETL Requirements

- **Frequency**: Every 2 hours
- **Pattern**: Incremental sync (Invoices, Payments), Daily (Contacts)
- **Dependencies**: `ar_snapshots` table (daily snapshot job)

---

## Dashboard 8: Client Recoverability

### Visual Components

| Component | Type | Description | Data Source |
|-----------|------|-------------|-------------|
| Client Table | Data Table | WIP breakdown by client | XPM Jobs/Time/Costs/Invoices |
| View Toggle | Tabs | by Staff / by Client | N/A |
| Client Filter | Dropdown | Select specific client | XPM Clients |
| Column Sorting | Sort Icons | Sortable table headers | N/A |

### Data Requirements

**Primary Metric**: Client profitability and WIP recoverability tracking

**Table Columns**:
- Client (client name)
- Time (unbilled time value)
- Disbursements (unbilled costs)
- Interims (progress invoices)
- WIP (calculated: Time + Disbursements - Interims)

**API Endpoints**: Same as Dashboard 4

**Calculations**:
```
Net WIP = (Time $ + Disbursements) - Interims
Recoverability % = (Invoiced / (Time + Costs)) × 100
```

**Problematic Clients Criteria**:
- WIP > 90 days old
- Recoverability < 70%
- High WIP (>$50K) with aging >60 days

### Metabase Configuration

**Dashboard Slug**: `client-recoverability`

**Query 1: By Client View**
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

**Query 2: By Staff View**
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

### Chakra UI Components

- `Table`, `Card`, `Tabs`, `Button`, `Select`

### ETL Requirements

- **Frequency**: Every 2 hours
- **Pattern**: Incremental sync
- **Dependencies**: Same as Dashboard 4

---

## Implementation Quick Reference

### ETL Sync Frequency Summary

| Entity | Sync Frequency | Pattern | Dashboard(s) |
|--------|---------------|---------|--------------|
| Xero Payments | Every 2 hours | Incremental | 1, 2, 3, 7 |
| Xero Invoices | Every 2 hours | Incremental | 7 |
| Xero P&L Reports | Every 2 hours | Full refresh | 1 |
| Xero Budgets | Daily | Full refresh | 2, 3 |
| Xero Contacts | Daily | Master data | 7 |
| XPM Jobs | Every 2 hours | Incremental | 4, 6, 8 |
| XPM Time Entries | Every 2 hours | Incremental | 4, 6, 8 |
| XPM Costs | Every 2 hours | Incremental | 4, 6, 8 |
| XPM Invoices | Every 2 hours | Incremental | 4, 6, 8 |
| XPM Staff | Daily | Master data | 4, 6 |
| Suntax Lodgments | Daily (TBD) | Full refresh / CSV | 5 |

### Component Library Quick Reference

**Most Used Components**:
1. `Card` (all dashboards)
2. `Table` (Dashboard 4, 5, 6, 8)
3. `Select` (all dashboards)
4. `Badge` (Dashboard 1, 3, 4, 5, 6, 7)
5. `Tabs` (Dashboard 1, 3, 4, 8)

**Custom Components Needed**:
1. `DataTable` (expandable rows for Dashboard 4, 8)
2. `MultiSelect` (Dashboard 6)
3. `RadialProgress` (Dashboard 5)
4. `DateRangePicker` (Dashboard 4, 6)
5. `StatCard` (Dashboard 1, 3)

### Database Views Required

| View Name | Purpose | Refresh Frequency | Dashboard(s) |
|-----------|---------|-------------------|--------------|
| `vw_wip_aging` | WIP with aging buckets | Daily at 6 AM | 4 |
| `ar_snapshots` | AR balance snapshots | Daily at 11 PM | 7 |

### Critical Dependencies

**Dashboard 5 Blocker**:
- ⚠️ Suntax API investigation required
- Decision deadline: End of Week 1, Epic 3
- 3 resolution options documented

**Service Type Mapping**:
- Required for Dashboard 6
- `service_type_mappings` table must be populated
- Admin UI for mapping XPM tasks to service types

---

**Document Status**: Complete
**Next Actions**:
1. Validate Suntax API availability (Dashboard 5)
2. Implement Metabase dashboards (Epic 2)
3. Create materialized views (`vw_wip_aging`, `ar_snapshots`)
4. Build custom Chakra UI components (DataTable, MultiSelect, RadialProgress)
