# XeroPulse Dashboard Implementation Checklist

**Document Version**: 1.0
**Last Updated**: 2025-10-22
**Author**: Claude (BMAD Implementation Planner)
**Purpose**: Comprehensive checklist for implementing all 8 dashboards with Metabase and Internal BI alternatives

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Dashboard-by-Dashboard Breakdown](#dashboard-by-dashboard-breakdown)
3. [Shadcn/ui Component Library Inventory](#shadcnui-component-library-inventory)
4. [Metabase Implementation Requirements](#metabase-implementation-requirements)
5. [Internal BI Alternative Architecture](#internal-bi-alternative-architecture)
6. [MCP Integration Points](#mcp-integration-points)
7. [Implementation Priorities](#implementation-priorities)

---

## Executive Summary

### Total Dashboard Count: 8 Core Dashboards

**Dashboard 1**: Income vs Expenses (Financial Overview)
**Dashboard 2**: Monthly Invoicing to Budget
**Dashboard 3**: Cumulative Invoicing to Budget (MTD/YTD Views)
**Dashboard 4**: Work in Progress (WIP) by Team
**Dashboard 5**: ATO Lodgment Status (Suntax Integration)
**Dashboard 6**: Services Analysis
**Dashboard 7**: Debtors Aging & DSO
**Dashboard 8**: Client Recoverability

### Implementation Approaches

**Option A: Metabase Embedding** (MVP Recommended)
- Faster time-to-market (2-3 weeks)
- Leverage Metabase's query builder and chart library
- Secure JWT-signed iframe embedding
- Limited customization of look-and-feel

**Option B: Internal BI with Shadcn + React Charts** (Future Enhancement)
- Full design control and brand alignment
- Better mobile responsiveness
- MCP integration for real-time data
- Longer development time (6-8 weeks)

**Option C: Hybrid Approach** (Best of Both Worlds)
- Use Metabase for complex analytical dashboards (Dashboards 4, 6, 7, 8)
- Build custom internal BI for simple KPI dashboards (Dashboards 1, 2, 3)
- Gradual migration strategy

---

## Dashboard-by-Dashboard Breakdown

### Dashboard 1: Income vs Expenses (Financial Overview)

#### Visual Components

| Component | Type | Description | Data Source |
|-----------|------|-------------|-------------|
| Income Bars | Bar Chart | Weekly income (blue bars) | Xero Payments API |
| Wages Line | Line Chart | 8-week rolling average (yellow) | Xero P&L Report |
| Expenses Line | Line Chart | 8-week rolling average (gray) | Xero P&L Report |
| Tab Navigation | Tabs | Revenue / Debtors tabs | N/A |
| Date Filter | Dropdown | FY selector (FY25, Feb) | N/A |
| KPI Cards (Top) | Stat Cards | 8 quick metrics | Multiple APIs |

#### Shadcn/ui Components Required

```typescript
// Navigation & Layout
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Charts (if using internal BI)
import { BarChart, LineChart } from "recharts" // or Tremor
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
```

**Components List**:
- ✅ `Card` - Container for chart and KPI metrics
- ✅ `Tabs` - Revenue/Debtors navigation
- ✅ `Select` - FY and month selectors
- ✅ `Badge` - Status indicators
- ✅ `Separator` - Visual dividers

#### Metabase Requirements

**Metabase Dashboard Configuration**:

```yaml
Dashboard Name: "Income vs Expenses"
Dashboard Slug: "income-vs-expenses"
Security Context:
  - organization_id (required)
  - role (for RLS filtering)

Questions/Charts:
  1. Income Chart (Bar Chart):
     Query Type: "Custom SQL"
     SQL: |
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

     Chart Type: "Bar Chart"
     X-Axis: week_ending
     Y-Axis: income
     Color: #3B82F6 (blue)

  2. Wages Rolling Average (Line Chart):
     Query Type: "Custom SQL"
     SQL: |
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

     Chart Type: "Line Chart"
     X-Axis: week_ending
     Y-Axis: wages_avg
     Color: #FBBF24 (yellow)
     Line Style: "smooth"

  3. Expenses Rolling Average (Line Chart):
     [Similar to wages but filtering for expense accounts]

Filters:
  - Financial Year Selector (FY24, FY25, FY26)
  - Month Selector (dropdown)

Embedding Parameters:
  - organization_id: {{ user.organization_id }}
  - role: {{ user.role }}
  - theme: "light" | "dark"
```

**Metabase Cache Strategy**:
- Refresh: Every 2 hours (aligned with n8n sync schedule)
- Cache duration: 1 hour
- Invalidation trigger: On ETL completion webhook

#### Internal BI Alternative (Shadcn + Recharts)

**Technology Stack**:
- **Charting**: Recharts (recommended) or Tremor Charts
- **Data Fetching**: tRPC + React Query
- **State Management**: Zustand (for filter state)
- **Date Utilities**: date-fns

**Component Structure**:

```typescript
// app/dashboards/income-vs-expenses/page.tsx

import { IncomeExpenseChart } from "@/components/dashboards/income-expense-chart"
import { KPIMetrics } from "@/components/dashboards/kpi-metrics"
import { DashboardFilters } from "@/components/dashboards/dashboard-filters"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function IncomeExpenseDashboard() {
  const { data, isLoading } = trpc.dashboards.getIncomeExpense.useQuery({
    financialYear: 'FY25',
    timeRange: '52weeks'
  })

  return (
    <div className="space-y-6">
      <DashboardFilters />

      <Tabs defaultValue="revenue">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="debtors">Debtors</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <KPIMetrics metrics={data?.kpis} />
          <Card>
            <IncomeExpenseChart data={data?.chartData} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

**Chart Component** (Recharts):

```typescript
// components/dashboards/income-expense-chart.tsx

import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { ChartContainer } from "@/components/ui/chart"

interface ChartData {
  weekEnding: string
  income: number
  wagesAvg: number
  expensesAvg: number
}

export function IncomeExpenseChart({ data }: { data: ChartData[] }) {
  return (
    <ChartContainer className="h-[400px]">
      <ComposedChart data={data}>
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
        <Line
          type="monotone"
          dataKey="expensesAvg"
          stroke="#9CA3AF"
          name="Expenses (8wk Avg)"
          strokeWidth={2}
        />
      </ComposedChart>
    </ChartContainer>
  )
}
```

**tRPC Router**:

```typescript
// server/routers/dashboards.ts

import { z } from 'zod'
import { publicProcedure, router } from '../trpc'

export const dashboardsRouter = router({
  getIncomeExpense: publicProcedure
    .input(z.object({
      financialYear: z.string(),
      timeRange: z.enum(['52weeks', '26weeks', '13weeks'])
    }))
    .query(async ({ input, ctx }) => {
      const orgId = ctx.session.user.organizationId

      // Fetch from Supabase
      const chartData = await ctx.supabase
        .rpc('get_income_expense_data', {
          org_id: orgId,
          fy: input.financialYear,
          weeks: parseInt(input.timeRange)
        })

      return {
        chartData,
        kpis: await calculateKPIs(orgId)
      }
    })
})
```

**Supabase Database Function**:

```sql
-- Database function for income/expense data with rolling averages

CREATE OR REPLACE FUNCTION get_income_expense_data(
  org_id UUID,
  fy TEXT,
  weeks INTEGER
)
RETURNS TABLE (
  week_ending DATE,
  income NUMERIC,
  wages_avg NUMERIC,
  expenses_avg NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH weekly_income AS (
    SELECT
      DATE_TRUNC('week', transaction_date)::DATE AS week_ending,
      SUM(amount) AS income
    FROM financial_data
    WHERE
      organization_id = org_id
      AND transaction_type = 'revenue'
      AND transaction_date >= CURRENT_DATE - (weeks || ' weeks')::INTERVAL
    GROUP BY DATE_TRUNC('week', transaction_date)
  ),
  weekly_wages AS (
    SELECT
      DATE_TRUNC('week', transaction_date)::DATE AS week_ending,
      AVG(amount) OVER (
        ORDER BY DATE_TRUNC('week', transaction_date)
        ROWS BETWEEN 51 PRECEDING AND CURRENT ROW
      ) AS wages_avg
    FROM financial_data
    WHERE
      organization_id = org_id
      AND account_code = '500'
    GROUP BY DATE_TRUNC('week', transaction_date), amount
  )
  SELECT
    i.week_ending,
    COALESCE(i.income, 0) AS income,
    COALESCE(w.wages_avg, 0) AS wages_avg,
    0::NUMERIC AS expenses_avg -- TODO: Add expenses calculation
  FROM weekly_income i
  LEFT JOIN weekly_wages w ON i.week_ending = w.week_ending
  ORDER BY i.week_ending;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### MCP Integration Points

**Dashboard 1 MCP Usage**:

```typescript
// MCP for real-time data refresh and conversational queries

import { useMCP } from '@/lib/mcp/client'

function IncomeExpenseDashboard() {
  const { executeQuery } = useMCP('xero')

  // Real-time query example
  const handleAIQuery = async (question: string) => {
    const result = await executeQuery({
      tool: 'mcp__xero__list-payments',
      params: {
        page: 1
      }
    })

    // Process and visualize result
  }

  return (
    <div>
      {/* Dashboard content */}
      <AIChatPanel onQuery={handleAIQuery} />
    </div>
  )
}
```

**MCP Use Cases for Dashboard 1**:
1. ✅ Refresh income data on-demand (mcp__xero__list-payments)
2. ✅ Conversational queries: "Show me largest income spikes in last quarter"
3. ✅ Real-time payment notifications
4. ⚠️ Not recommended for chart data (too slow, use tRPC + Supabase instead)

---

### Dashboard 2: Monthly Invoicing to Budget

#### Visual Components

| Component | Type | Description | Data Source |
|-----------|------|-------------|-------------|
| Monthly Bars | Grouped Bar Chart | Actual vs Budget bars | Xero Payments + Budget |
| Legend | Legend | Orange (Actual), Blue (Budget) | N/A |
| X-Axis | Axis Labels | Month names (Jul 2024 - Jun 2025) | N/A |
| Y-Axis | Axis Scale | Dollar amounts ($0K - $800K) | N/A |

#### Shadcn/ui Components Required

```typescript
import { Card } from "@/components/ui/card"
import { Select } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
```

**Components List**:
- ✅ `Card` - Chart container
- ✅ `Select` - Financial year selector
- ✅ `Tooltip` - Hover data display (shadcn Chart component)

#### Metabase Requirements

**Metabase Dashboard Configuration**:

```yaml
Dashboard Name: "Monthly Invoicing to Budget"
Dashboard Slug: "monthly-invoicing-budget"

Questions/Charts:
  1. Monthly Actual vs Budget (Grouped Bar Chart):
     Query Type: "Custom SQL"
     SQL: |
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

     Chart Type: "Bar Chart (Grouped)"
     X-Axis: month_label
     Y-Axis Multi-Series:
       - actual (Orange #FB923C)
       - budget (Blue #3B82F6)

Filters:
  - Financial Year (FY24, FY25, FY26)
```

#### Internal BI Alternative (Shadcn + Recharts)

```typescript
// components/dashboards/monthly-budget-chart.tsx

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

interface MonthlyData {
  month: string
  actual: number
  budget: number
  variancePct: number
}

export function MonthlyBudgetChart({ data }: { data: MonthlyData[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Invoicing to Budget</CardTitle>
      </CardHeader>
      <CardContent>
        <BarChart width={1000} height={400} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="actual" fill="#FB923C" name="Actual" />
          <Bar dataKey="budget" fill="#3B82F6" name="Budget" />
        </BarChart>
      </CardContent>
    </Card>
  )
}
```

**tRPC Query**:

```typescript
getMonthlyBudget: publicProcedure
  .input(z.object({ financialYear: z.string() }))
  .query(async ({ input, ctx }) => {
    const data = await ctx.supabase
      .rpc('get_monthly_budget_variance', {
        org_id: ctx.session.user.organizationId,
        fy: input.financialYear
      })

    return data
  })
```

#### MCP Integration Points

**MCP Use Cases**:
1. ✅ Fetch latest budget data (mcp__xero__list-budgets via BudgetSummary report)
2. ✅ Real-time invoice updates
3. ⚠️ Conversational analytics: "Did we hit budget in March?"

---

### Dashboard 3: Cumulative Invoicing to Budget (MTD/YTD Views)

#### Visual Components

| Component | Type | Description | Data Source |
|-----------|------|-------------|-------------|
| Cumulative Bars | Grouped Bar Chart | Running totals | Xero Payments + Budget |
| MTD/YTD Toggle | Toggle Buttons | View switcher | N/A |
| KPI Cards | Stat Cards | Budget, Actual, Leads Won | Multiple |
| Progress Bar | Linear Progress | Visual budget attainment | Calculated |

#### Shadcn/ui Components Required

```typescript
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
```

**Components List**:
- ✅ `Tabs` - MTD/YTD switcher (styled as pill buttons)
- ✅ `Card` - KPI metric cards
- ✅ `Progress` - Budget achievement bar
- ✅ `Badge` - Variance percentage indicator

#### Metabase Requirements

**Metabase Dashboard Configuration**:

```yaml
Dashboard Name: "Cumulative Budget Performance"
Dashboard Slug: "cumulative-budget"

Questions/Charts:
  1. Cumulative Chart (Grouped Bar):
     Query Type: "Custom SQL"
     SQL: |
       WITH cumulative_actuals AS (
         SELECT
           DATE_TRUNC('month', transaction_date) AS month,
           SUM(SUM(amount)) OVER (ORDER BY DATE_TRUNC('month', transaction_date)) AS cumulative_actual
         FROM financial_data
         WHERE
           organization_id = {{organization_id}}
           AND transaction_type = 'revenue'
           AND EXTRACT(YEAR FROM transaction_date) = {{fiscal_year}}
         GROUP BY month
       )
       SELECT * FROM cumulative_actuals

     Chart Type: "Area Chart (Cumulative)"

  2. MTD KPI Card:
     Query Type: "Metric"
     SQL: |
       SELECT
         SUM(amount) AS mtd_actual,
         (SELECT SUM(amount) FROM budgets
          WHERE organization_id = {{organization_id}}
          AND budget_month = DATE_TRUNC('month', CURRENT_DATE)) AS mtd_budget
       FROM financial_data
       WHERE organization_id = {{organization_id}}
         AND transaction_date >= DATE_TRUNC('month', CURRENT_DATE)

     Display: "Number + Comparison"

  3. YTD KPI Card:
     [Similar to MTD but year-to-date range]
```

#### Internal BI Alternative

```typescript
// components/dashboards/cumulative-budget-view.tsx

export function CumulativeBudgetView() {
  const [view, setView] = useState<'mtd' | 'ytd'>('ytd')
  const { data } = trpc.dashboards.getCumulativeBudget.useQuery({ view })

  return (
    <div className="space-y-6">
      <Tabs value={view} onValueChange={(v) => setView(v as any)}>
        <TabsList className="grid w-[400px] grid-cols-2">
          <TabsTrigger value="mtd">MTD</TabsTrigger>
          <TabsTrigger value="ytd">YTD</TabsTrigger>
        </TabsList>

        <TabsContent value={view}>
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Budget {view.toUpperCase()}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${data?.budget.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actual {view.toUpperCase()}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  ${data?.actual.toLocaleString()}
                </div>
                <Badge variant={data?.variancePct > 0 ? "success" : "destructive"}>
                  {data?.variancePct.toFixed(1)}%
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Leads Won YTD</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${data?.leadsWon.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground">(Blank) - Future Enhancement</p>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Budget Progress</span>
                  <span>{((data?.actual / data?.budget) * 100).toFixed(1)}%</span>
                </div>
                <Progress value={(data?.actual / data?.budget) * 100} />
              </div>
            </CardContent>
          </Card>

          <AreaChart data={data?.chartData} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

#### MCP Integration Points

**MCP Use Cases**:
1. ⚠️ Limited - Budget data is static (updated quarterly)
2. ✅ Conversational: "How are we tracking against YTD budget?"
3. ✅ Drill-down: Click chart → MCP fetch detailed transactions

---

### Dashboard 4: Work in Progress (WIP) by Team

#### Visual Components

| Component | Type | Description | Data Source |
|-----------|------|-------------|-------------|
| Donut Charts (4x) | Donut/Pie Charts | WIP aging by team | XPM Jobs/Time/Costs |
| WIP Summary Table | Data Table | Team breakdown | XPM aggregated |
| Client Details Table | Sortable Table | Client-level WIP | XPM Job details |
| WIP Trends Chart | Area Chart | Monthly WIP accumulation | XPM historical |
| Team Filters | Dropdown | Team selector | XPM Staff |
| Date Range Picker | Date Range | Report period | N/A |

#### Shadcn/ui Components Required

```typescript
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
```

**Components List**:
- ✅ `Table` - WIP client details table (sortable, expandable)
- ✅ `Card` - Container for donut charts
- ✅ `Tabs` - Overview / WIP by Team / Details navigation
- ✅ `Select` - Team and client filters
- ✅ `Badge` - Aging bucket indicators (<30, 31-60, 61-90, 90+ days)
- ✅ `Calendar` + `Popover` - Date range picker
- ✅ `Button` - Export to Excel action

#### Metabase Requirements

**Metabase Dashboard Configuration**:

```yaml
Dashboard Name: "Work in Progress Analysis"
Dashboard Slug: "wip-analysis"
Complexity: HIGH (Most complex dashboard)

Questions/Charts:
  1. WIP Donut Charts by Team (4x Pie Charts):
     Query Type: "Custom SQL"
     SQL: |
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

     Chart Type: "Donut Chart"
     Segments: aging_bucket
     Values: wip
     Colors:
       - <30: Green (#10B981)
       - 31-60: Yellow (#FBBF24)
       - 61-90: Orange (#FB923C)
       - 90+: Red (#EF4444)

     Repeat for: Accounting, Bookkeeping, SMSF, Support Hub

  2. WIP Summary Table:
     Query Type: "Table"
     SQL: |
       SELECT
         team_name,
         SUM(wip_amount) AS closing_wip,
         COUNT(DISTINCT job_id) AS job_count,
         COUNT(DISTINCT client_id) AS client_count
       FROM vw_wip_by_team
       WHERE organization_id = {{organization_id}}
       GROUP BY team_name
       ORDER BY closing_wip DESC

     Display: "Table"
     Formatting:
       - closing_wip: Currency
       - Sortable columns

  3. WIP Trends Area Chart:
     Query Type: "Custom SQL"
     SQL: |
       SELECT
         month,
         SUM(wip_accumulated) AS wip
       FROM wip_monthly_snapshot
       WHERE organization_id = {{organization_id}}
         AND month >= CURRENT_DATE - INTERVAL '12 months'
       GROUP BY month
       ORDER BY month

     Chart Type: "Area Chart"
     X-Axis: month
     Y-Axis: wip
     Fill: Orange gradient

  4. Client Details Table (Expandable):
     Query Type: "Table"
     SQL: |
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

     Display: "Table (Paginated)"
     Features:
       - Click to expand → Show job-level breakdown
       - Sortable columns
       - Export to CSV

Filters:
  - Team Selector (All, Accounting, Bookkeeping, SMSF, Support Hub)
  - Report Date Picker (defaults to current date)
  - Client Search (text input)

Embedding Parameters:
  - organization_id: {{ user.organization_id }}
  - team_filter: {{ user.team }} (for staff users only)
  - accessible_clients: {{ user.assigned_clients }} (RLS for staff)
```

**Metabase View Dependencies**:

```sql
-- Create materialized view for WIP aging

CREATE MATERIALIZED VIEW vw_wip_aging AS
SELECT
  pd.organization_id,
  s.team_name,
  c.client_name,
  j.job_number,
  j.id AS job_id,
  c.id AS client_id,
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
GROUP BY pd.organization_id, s.team_name, c.client_name, j.job_number, j.id, c.id, j.start_date;

-- Refresh strategy: Daily at 6 AM
CREATE INDEX idx_wip_aging_org_team ON vw_wip_aging(organization_id, team_name);
```

#### Internal BI Alternative (Complex - Recommended Metabase for MVP)

**Why Metabase is Recommended for Dashboard 4**:
- ✅ Complex multi-chart layout (4 donut charts + 2 tables + 1 area chart)
- ✅ Advanced table features (expandable rows, sorting, pagination)
- ✅ Dynamic filtering across all charts
- ✅ Export to Excel built-in
- ⚠️ Internal BI would require 2-3 weeks just for this dashboard

**If Building Internal BI**:

```typescript
// components/dashboards/wip-dashboard.tsx

import { DonutChart } from "@tremor/react" // Tremor recommended for donut charts
import { DataTable } from "@/components/ui/data-table"
import { AreaChart } from "recharts"

export function WIPDashboard() {
  const [selectedTeam, setSelectedTeam] = useState<string>("all")
  const [reportDate, setReportDate] = useState<Date>(new Date())

  const { data: wipData } = trpc.dashboards.getWIPAnalysis.useQuery({
    team: selectedTeam,
    reportDate: reportDate.toISOString()
  })

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="by-team">WIP by Team</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="by-team">
          <div className="grid grid-cols-2 gap-4">
            {['Accounting', 'Bookkeeping', 'SMSF', 'Support Hub'].map(team => (
              <Card key={team}>
                <CardHeader>
                  <CardTitle>Unbilled WIP Days - {team}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Aging Days: <Badge>{"<30"}</Badge> <Badge>31-60</Badge> <Badge>61-90</Badge> <Badge>90+</Badge>
                  </p>
                </CardHeader>
                <CardContent>
                  <DonutChart
                    data={wipData?.donutCharts[team]}
                    category="wip"
                    index="agingBucket"
                    colors={["green", "yellow", "orange", "red"]}
                    valueFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                  />
                  <div className="mt-4 text-center">
                    <div className="text-3xl font-bold">
                      ${(wipData?.teamTotals[team] / 1000).toFixed(0)}K
                    </div>
                    <div className="text-sm text-muted-foreground">WIP</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Our WIP Balance by Client</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={wipClientColumns}
                data={wipData?.clientDetails || []}
                searchKey="clientName"
                expandable={true}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Trends: WIP accumulated in a month</CardTitle>
        </CardHeader>
        <CardContent>
          <AreaChart
            width={1000}
            height={300}
            data={wipData?.trendData}
          >
            {/* Area chart configuration */}
          </AreaChart>
        </CardContent>
      </Card>
    </div>
  )
}
```

**DataTable Columns Configuration**:

```typescript
// lib/columns/wip-client-columns.tsx

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight } from "lucide-react"

export const wipClientColumns: ColumnDef<WIPClient>[] = [
  {
    accessorKey: "clientName",
    header: "Client",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => row.toggleExpanded()}
        >
          {row.getIsExpanded() ? <ChevronDown /> : <ChevronRight />}
        </Button>
        {row.getValue("clientName")}
      </div>
    ),
  },
  {
    accessorKey: "openingWIP",
    header: "Opening WIP",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("openingWIP"))
      return <div className="text-right">${amount.toLocaleString()}</div>
    },
  },
  {
    accessorKey: "totalTime",
    header: "Total Time Allocated to WIP ($)",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("totalTime"))
      return <div className="text-right">${amount.toLocaleString()}</div>
    },
  },
  {
    accessorKey: "disbursements",
    header: "Disbursements",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("disbursements"))
      return <div className="text-right">${amount.toLocaleString()}</div>
    },
  },
  {
    accessorKey: "interims",
    header: "Interims",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("interims"))
      return <div className="text-right text-red-600">(${ Math.abs(amount).toLocaleString()})</div>
    },
  },
  {
    accessorKey: "wipAccumulated",
    header: "WIP Accumulated",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("wipAccumulated"))
      return (
        <div className="text-right font-bold">
          ${amount.toLocaleString()}
        </div>
      )
    },
  },
]
```

**AG Grid Enterprise Alternative** (if budget allows):

```typescript
// Using AG Grid for advanced table features

import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-enterprise' // Requires license

export function WIPClientTable({ data }: { data: WIPClient[] }) {
  const columnDefs = [
    { field: 'clientName', headerName: 'Client', sortable: true, filter: true },
    {
      field: 'wipAccumulated',
      headerName: 'WIP Accumulated',
      valueFormatter: (params) => `$${params.value.toLocaleString()}`,
      cellStyle: { fontWeight: 'bold' }
    },
    // ... other columns
  ]

  return (
    <div className="ag-theme-alpine" style={{ height: 500, width: '100%' }}>
      <AgGridReact
        columnDefs={columnDefs}
        rowData={data}
        masterDetail={true}
        detailCellRendererParams={{
          detailGridOptions: {
            columnDefs: jobLevelColumns,
            // Job-level breakdown
          },
        }}
        pagination={true}
        paginationPageSize={20}
        enableCellTextSelection={true}
        exportFormats={['csv', 'excel']}
      />
    </div>
  )
}
```

#### MCP Integration Points

**MCP Use Cases for Dashboard 4**:
1. ✅ Real-time job status updates (mcp__xero__get-job via XPM API)
2. ✅ Drill-down to job details: Click client → MCP fetch time entries
3. ✅ Conversational analytics: "Which clients have WIP over 90 days in Accounting team?"
4. ⚠️ Performance consideration: Too many MCP calls will slow down UI

**Recommended MCP Pattern**:

```typescript
// Use MCP for drill-down, not initial load

function WIPClientRow({ client }: { client: WIPClient }) {
  const [expanded, setExpanded] = useState(false)
  const { data: jobDetails, isLoading } = useMCP('xero', 'get-jobs-by-client', {
    clientId: client.id
  }, {
    enabled: expanded // Only fetch when expanded
  })

  return (
    <TableRow>
      <TableCell>
        <Button onClick={() => setExpanded(!expanded)}>
          {expanded ? <ChevronDown /> : <ChevronRight />}
        </Button>
        {client.clientName}
      </TableCell>
      {expanded && (
        <TableCell colSpan={6}>
          {isLoading ? <Spinner /> : <JobDetailsTable data={jobDetails} />}
        </TableCell>
      )}
    </TableRow>
  )
}
```

---

### Dashboard 5: ATO Lodgment Status (Suntax Integration)

#### Visual Components

| Component | Type | Description | Data Source |
|-----------|------|-------------|-------------|
| Lodgment Table | Data Table | Status by type (ITR, TRT, CTR, SMSF, PTR) | Suntax API |
| Progress Gauge | Radial Gauge | Overall completion % | Calculated |
| Status Bar Chart | Horizontal Bar | Lodgments by state | Suntax API |
| Client Type Bar | Vertical Bar | Progress by client type | Suntax API |
| Year Selector | Dropdown | ATO Year (2024, 2025) | N/A |
| View Toggle | Tabs | Report / Details | N/A |

#### Shadcn/ui Components Required

```typescript
import { Card } from "@/components/ui/card"
import { Table } from "@/components/ui/table"
import { Select } from "@/components/ui/select"
import { Tabs } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
```

**Components List**:
- ✅ `Table` - Lodgment status table
- ✅ `Badge` - Status indicators (Filed, Still To Do, Draft, etc.)
- ✅ `Progress` - Radial progress (71.34%)
- ✅ `Tabs` - Report / Details switcher
- ✅ `Select` - ATO Year dropdown

#### Metabase Requirements

**⚠️ BLOCKER: No Xero/XPM API Available**

Per PDF documentation:
> "No API's seem to be available for this category, will check with Suntax and update"

**Workaround Options**:

1. **Option A**: Suntax API Integration (if available)
   - Investigate Suntax REST API
   - Map to Supabase `ato_lodgments` table
   - Build Metabase dashboard on top

2. **Option B**: CSV Upload Workflow (Interim Solution)
   - Admin uploads weekly CSV from Suntax
   - n8n parses and loads to Supabase
   - Metabase queries Supabase table

3. **Option C**: Manual Tracking in XPM (Fallback)
   - Use XPM custom fields for lodgment status
   - Map to task statuses
   - Not ideal but workable

**Metabase Configuration (Assuming Supabase Table Exists)**:

```yaml
Dashboard Name: "ATO Lodgment Status"
Dashboard Slug: "ato-lodgment-status"

Database Table: ato_lodgments
Schema:
  - organization_id: UUID
  - client_type: ENUM('ITR', 'TRT', 'CTR', 'SMSF', 'PTR')
  - status: ENUM('Filed', 'Still To Do', 'Draft', 'Waiting to be Filed', 'Out to Sign', 'Approved', 'Completed')
  - ato_year: INTEGER
  - client_name: TEXT
  - lodgment_date: DATE
  - due_date: DATE

Questions/Charts:
  1. Lodgment Summary Table:
     SQL: |
       SELECT
         client_type AS "ATO Client Type",
         SUM(CASE WHEN status = 'Not Received' THEN 1 ELSE 0 END) AS "Not Received",
         SUM(CASE WHEN status = 'Not Required' THEN 1 ELSE 0 END) AS "Not Required",
         SUM(CASE WHEN status = 'Received' THEN 1 ELSE 0 END) AS "Received",
         SUM(CASE WHEN status = 'Return Not Necessary' THEN 1 ELSE 0 END) AS "Return Not Necessary",
         COUNT(*) AS "Total"
       FROM ato_lodgments
       WHERE organization_id = {{organization_id}}
         AND ato_year = {{ato_year}}
       GROUP BY client_type

     Display: "Table"

  2. Overall Progress Gauge:
     SQL: |
       SELECT
         (COUNT(CASE WHEN status IN ('Filed', 'Approved', 'Completed') THEN 1 END)::FLOAT / COUNT(*)::FLOAT * 100) AS progress_pct
       FROM ato_lodgments
       WHERE organization_id = {{organization_id}}
         AND ato_year = {{ato_year}}

     Chart Type: "Progress Bar (Radial)"
     Display: "71.34%" format

  3. Lodgment List by State:
     SQL: |
       SELECT
         status,
         COUNT(*) AS count,
         (COUNT(*)::FLOAT / SUM(COUNT(*)) OVER () * 100) AS percentage
       FROM ato_lodgments
       WHERE organization_id = {{organization_id}}
         AND ato_year = {{ato_year}}
       GROUP BY status
       ORDER BY count DESC

     Chart Type: "Horizontal Bar Chart"
```

#### Internal BI Alternative

```typescript
// components/dashboards/ato-lodgment-dashboard.tsx

import { Table } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { RadialProgress } from "@/components/ui/radial-progress" // Custom component

export function ATOLodgmentDashboard() {
  const [atoYear, setAtoYear] = useState(2024)
  const { data } = trpc.dashboards.getATOLodgment.useQuery({ atoYear })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">What is the status of our ATO Lodgment?</h2>
        <Select value={atoYear.toString()} onValueChange={(v) => setAtoYear(parseInt(v))}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2024">ATO Year: 2024</SelectItem>
            <SelectItem value="2025">ATO Year: 2025</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="report">
        <TabsList>
          <TabsTrigger value="report">Report</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="report">
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Lodgment Status Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ATO Client Type</TableHead>
                      <TableHead>Not Received</TableHead>
                      <TableHead>Not Required</TableHead>
                      <TableHead>Received</TableHead>
                      <TableHead>Return Not Necessary</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.summary.map(row => (
                      <TableRow key={row.clientType}>
                        <TableCell className="font-medium">{row.clientType}</TableCell>
                        <TableCell>{row.notReceived}</TableCell>
                        <TableCell>{row.notRequired}</TableCell>
                        <TableCell>{row.received}</TableCell>
                        <TableCell>{row.returnNotNecessary}</TableCell>
                        <TableCell className="font-bold">{row.total}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Overall lodgment progress (%)</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <RadialProgress
                  value={data?.overallProgress || 0}
                  size={200}
                  strokeWidth={20}
                  className="text-yellow-500"
                />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Lodgment list by state</CardTitle>
              </CardHeader>
              <CardContent>
                <HorizontalBarChart data={data?.byState} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lodgment progress (%) by client type</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart data={data?.byClientType} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

**Custom Radial Progress Component**:

```typescript
// components/ui/radial-progress.tsx

export function RadialProgress({ value, size = 200, strokeWidth = 20 }: {
  value: number
  size?: number
  strokeWidth?: number
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (value / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--primary))"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-4xl font-bold">{value.toFixed(2)}%</span>
      </div>
    </div>
  )
}
```

#### MCP Integration Points

**⚠️ Limited MCP Usage** (depends on Suntax API availability):
1. ❓ If Suntax has API: MCP wrapper for lodgment status sync
2. ❓ If CSV upload: No real-time MCP needed
3. ✅ Conversational: "How many ITR lodgments are still pending?"

---

### Dashboard 6: Services Analysis

#### Visual Components

| Component | Type | Description | Data Source |
|-----------|------|-------------|-------------|
| Services Table | Data Table | Service performance metrics | XPM Time + Invoices |
| Service Filter | Multi-Select | Service type selector | XPM Tasks/Categories |
| Staff Filter | Multi-Select | Staff member selector | XPM Staff |
| Date Range | Date Picker | Report period | N/A |
| Export Button | Button | Export to Excel | N/A |

**Table Columns**:
- Service (e.g., EOFY Financials, SMSF, Bookkeeping, ITR, BAS, Advisory)
- Time Added $ (charge value of time entered)
- Invoiced (invoice amounts)
- Net Write Ups (Invoiced - Time Added)
- Time (Hours) (billable hours)
- Time Revenue (realized revenue)
- Avg. Charge Rate (Time Revenue ÷ Hours)

#### Shadcn/ui Components Required

```typescript
import { Table } from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { MultiSelect } from "@/components/ui/multi-select" // Custom or shadcn extension
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
```

**Components List**:
- ✅ `Table` - Services performance table (sortable)
- ✅ `MultiSelect` - Service and staff filters
- ✅ `Button` - Export to Excel
- ✅ `Calendar` + `Popover` - Date range selector
- ✅ `Badge` - Write-up/write-off indicators (green/red)

#### Metabase Requirements

```yaml
Dashboard Name: "Services Analysis"
Dashboard Slug: "services-analysis"

Questions/Charts:
  1. Services Performance Table:
     Query Type: "Custom SQL"
     SQL: |
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

     Display: "Table"
     Formatting:
       - Currency: Time Added $, Invoiced, Net Write Ups, Time Revenue, Avg. Charge Rate
       - Number: Time (Hours) with 2 decimals
       - Conditional: Net Write Ups (green if positive, red if negative)

Filters:
  - Service Type Multi-Select (All, EOFY, SMSF, ITR, BAS, etc.)
  - Staff Multi-Select (All staff or specific team members)
  - Date Range Picker (defaults to current FY)

Exporting:
  - Enable CSV/Excel export
```

**Service Type Mapping Strategy**:

Since XPM doesn't directly provide service types, create a mapping table:

```sql
-- Supabase: service_type_mappings table

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
    'ASIC Administration',
    'FBT',
    'Tax Planning'
  )),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (organization_id, xpm_task_uuid)
);

-- Admin UI allows mapping XPM tasks to service types
-- n8n ETL joins time entries with this mapping table
```

#### Internal BI Alternative

```typescript
// components/dashboards/services-analysis.tsx

import { DataTable } from "@/components/ui/data-table"
import { MultiSelect } from "@/components/ui/multi-select"

export function ServicesAnalysis() {
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [selectedStaff, setSelectedStaff] = useState<string[]>([])
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  })

  const { data, isLoading } = trpc.dashboards.getServicesAnalysis.useQuery({
    services: selectedServices,
    staff: selectedStaff,
    dateRange
  })

  const handleExport = () => {
    // Export to Excel using xlsx library
    const XLSX = require('xlsx')
    const ws = XLSX.utils.json_to_sheet(data || [])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Services Analysis')
    XLSX.writeFile(wb, `services-analysis-${format(new Date(), 'yyyy-MM-dd')}.xlsx`)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Services Analysis</CardTitle>
            <Button onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export to Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <MultiSelect
              options={serviceOptions}
              selected={selectedServices}
              onChange={setSelectedServices}
              placeholder="Select Services"
            />
            <MultiSelect
              options={staffOptions}
              selected={selectedStaff}
              onChange={setSelectedStaff}
              placeholder="Select Staff"
            />
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
            />
          </div>

          <DataTable
            columns={servicesAnalysisColumns}
            data={data || []}
            isLoading={isLoading}
          />

          <div className="mt-4 flex justify-between items-center border-t pt-4">
            <span className="font-bold">Total</span>
            <div className="flex gap-8 text-right">
              <div>
                <span className="font-bold">${data?.totals.timeAdded.toLocaleString()}</span>
              </div>
              <div>
                <span className="font-bold">${data?.totals.invoiced.toLocaleString()}</span>
              </div>
              <div>
                <Badge variant={data?.totals.netWriteUps >= 0 ? "success" : "destructive"}>
                  ${data?.totals.netWriteUps.toLocaleString()}
                </Badge>
              </div>
              <div>
                <span className="font-bold">{data?.totals.hours}</span>
              </div>
              <div>
                <span className="font-bold">${data?.totals.revenue.toLocaleString()}</span>
              </div>
              <div>
                <span className="font-bold">${data?.totals.avgRate}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

**Column Definitions**:

```typescript
// lib/columns/services-analysis-columns.tsx

export const servicesAnalysisColumns: ColumnDef<ServiceAnalysis>[] = [
  {
    accessorKey: "service",
    header: "Service",
    cell: ({ row }) => <div className="font-medium">{row.getValue("service")}</div>,
  },
  {
    accessorKey: "timeAddedDollars",
    header: "Time Added $",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("timeAddedDollars"))
      return <div className="text-right">${amount.toLocaleString()}</div>
    },
  },
  {
    accessorKey: "invoiced",
    header: "Invoiced",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("invoiced"))
      return <div className="text-right">${amount.toLocaleString()}</div>
    },
  },
  {
    accessorKey: "netWriteUps",
    header: "Net Write Ups",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("netWriteUps"))
      const isPositive = amount >= 0
      return (
        <div className={`text-right font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? '+' : ''}${amount.toLocaleString()}
        </div>
      )
    },
  },
  {
    accessorKey: "timeHours",
    header: "Time (Hours)",
    cell: ({ row }) => {
      const hours = parseFloat(row.getValue("timeHours"))
      return <div className="text-right">{hours.toFixed(2)}</div>
    },
  },
  {
    accessorKey: "timeRevenue",
    header: "Time Revenue",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("timeRevenue"))
      return <div className="text-right">${amount.toLocaleString()}</div>
    },
  },
  {
    accessorKey: "avgChargeRate",
    header: "Avg. Charge Rate",
    cell: ({ row }) => {
      const rate = parseFloat(row.getValue("avgChargeRate"))
      return <div className="text-right">${rate.toFixed(0)}</div>
    },
  },
]
```

#### MCP Integration Points

1. ✅ Real-time service data refresh (mcp__xero__get-time-entries via XPM)
2. ✅ Drill-down: Click service → Show individual jobs
3. ✅ Conversational: "Which service has the highest write-offs this month?"
4. ⚠️ Performance: Use tRPC for table, MCP for drill-down only

---

### Dashboard 7: Debtors Aging & DSO

#### Visual Components

| Component | Type | Description | Data Source |
|-----------|------|-------------|-------------|
| Aging Donut Chart | Donut Chart | AR aging buckets | Xero Invoices |
| Top Debtors Bar Chart | Horizontal Bar | Largest outstanding balances | Xero Invoices |
| DSO Line Chart | Line Chart | Rolling 12-month DSO | Xero Payments |
| Summary KPI Cards | Stat Cards | Total AR, Avg DSO | Calculated |
| Client Filter | Dropdown | Filter by client | Xero Contacts |

#### Shadcn/ui Components Required

```typescript
import { Card } from "@/components/ui/card"
import { Select } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
```

**Components List**:
- ✅ `Card` - Chart containers
- ✅ `Badge` - Aging bucket indicators
- ✅ `Select` - Client filter dropdown

#### Metabase Requirements

```yaml
Dashboard Name: "Debtors Aging & DSO"
Dashboard Slug: "debtors-aging-dso"

Questions/Charts:
  1. AR Aging Donut Chart:
     SQL: |
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

     Chart Type: "Donut Chart"
     Colors: Green, Yellow, Orange, Red

  2. Top Debtors Bar Chart:
     SQL: |
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

     Chart Type: "Horizontal Bar Chart"

  3. DSO Rolling 12-Month Line Chart:
     SQL: |
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

     Chart Type: "Line Chart"
     Y-Axis: DSO (days)

Filters:
  - Client Dropdown (All or specific client)
```

#### Internal BI Alternative

```typescript
// components/dashboards/debtors-aging.tsx

import { DonutChart } from "@tremor/react"
import { BarChart, LineChart } from "recharts"

export function DebtorsAgingDashboard() {
  const { data } = trpc.dashboards.getDebtorsAging.useQuery()

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total AR Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${data?.totalAR.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average DSO (12 months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data?.avgDSO} days</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Overdue (>30 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              ${data?.overdueAmount.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>AR Aging Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <DonutChart
              data={data?.agingBuckets || []}
              category="balance"
              index="agingBucket"
              colors={["green", "yellow", "orange", "red"]}
              valueFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
            />
            <div className="mt-4 text-center">
              <div className="text-4xl font-bold">${(data?.totalAR / 1000).toFixed(0)}K</div>
              <div className="text-sm text-muted-foreground">Amount Outstanding</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Clients contributing to debtor balance</CardTitle>
          </CardHeader>
          <CardContent>
            <HorizontalBarChart
              data={data?.topDebtors || []}
              dataKey="outstanding"
              nameKey="client"
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Average Collection Days - Rolling 12 Months</CardTitle>
        </CardHeader>
        <CardContent>
          <LineChart
            width={1000}
            height={300}
            data={data?.dsoTrend || []}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis domain={[0, 30]} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="dso"
              stroke="#FB923C"
              strokeWidth={2}
              fill="#FED7AA"
            />
          </LineChart>
        </CardContent>
      </Card>
    </div>
  )
}
```

#### MCP Integration Points

1. ✅ Real-time AR data (mcp__xero__list-invoices with filters)
2. ✅ Click client → Drill-down to invoice details
3. ✅ Conversational: "Which clients are overdue by more than 60 days?"

---

### Dashboard 8: Client Recoverability

#### Visual Components

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

#### Shadcn/ui Components Required

```typescript
import { Table } from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { Tabs } from "@/components/ui/tabs"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"
```

**Components List**:
- ✅ `Table` - Client recoverability table
- ✅ `Tabs` - by Staff / by Client toggle
- ✅ `Button` - Sort icons in table headers
- ✅ `Select` - Client dropdown filter

#### Metabase Requirements

```yaml
Dashboard Name: "Client Recoverability"
Dashboard Slug: "client-recoverability"

Questions/Charts:
  1. Client WIP Table:
     SQL: |
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

     Display: "Table (Paginated)"
     Features:
       - Sortable columns
       - Search by client name
       - Export to CSV
```

#### Internal BI Alternative

```typescript
// components/dashboards/client-recoverability.tsx

export function ClientRecoverability() {
  const [view, setView] = useState<'by-client' | 'by-staff'>('by-client')
  const { data } = trpc.dashboards.getClientRecoverability.useQuery({ view })

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Client Recoverability</CardTitle>
          <Tabs value={view} onValueChange={(v) => setView(v as any)}>
            <TabsList>
              <TabsTrigger value="by-staff">by Staff</TabsTrigger>
              <TabsTrigger value="by-client">by Client</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={recoverabilityColumns}
          data={data || []}
          searchKey="client"
        />

        <div className="mt-4 flex justify-between border-t pt-4">
          <span className="font-bold">Total</span>
          <div className="flex gap-12 text-right">
            <span className="font-bold">${data?.totals.time.toLocaleString()}</span>
            <span className="font-bold">${data?.totals.disbursements.toLocaleString()}</span>
            <span className="font-bold text-red-600">
              (${Math.abs(data?.totals.interims || 0).toLocaleString()})
            </span>
            <span className="font-bold">${data?.totals.wip.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

#### MCP Integration Points

1. ✅ Real-time WIP updates (mcp__xero__get-jobs via XPM)
2. ✅ Click client → Drill-down to job-level WIP
3. ✅ Conversational: "Which clients have the highest unbilled WIP?"

---

## Shadcn/ui Component Library Inventory

### Complete Component List

Based on all 8 dashboards, here's the complete shadcn/ui component library needed:

#### Core Components (Required for MVP)

```typescript
// Layout & Navigation
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

// Data Display
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Forms & Inputs
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// Feedback
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Toast, ToastAction, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast"

// Utility
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
```

#### Custom Components (Build on top of shadcn)

```typescript
// Custom chart wrapper
import { ChartContainer, ChartTooltip, ChartLegend } from "@/components/ui/chart"

// Custom data table with sorting, filtering, pagination
import { DataTable } from "@/components/ui/data-table"

// Custom multi-select (extends Select)
import { MultiSelect } from "@/components/ui/multi-select"

// Custom date range picker (extends Calendar)
import { DateRangePicker } from "@/components/ui/date-range-picker"

// Custom radial progress (for Dashboard 5)
import { RadialProgress } from "@/components/ui/radial-progress"

// Custom stat card (KPI metrics)
import { StatCard } from "@/components/ui/stat-card"
```

#### Charting Libraries (Third-Party)

**Option A: Recharts** (Recommended for MVP)
```bash
npm install recharts
```
- ✅ Pros: React-native, composable, well-documented
- ✅ Best for: Bar, Line, Area, Donut charts
- ⚠️ Cons: Styling requires manual config

**Option B: Tremor** (Modern Alternative)
```bash
npm install @tremor/react
```
- ✅ Pros: Tailwind-native, beautiful defaults, built-in dark mode
- ✅ Best for: Dashboard-style charts with minimal config
- ⚠️ Cons: Less customizable than Recharts

**Option C: AG Grid Enterprise** (If Budget Allows)
```bash
npm install ag-grid-react ag-grid-enterprise
```
- ✅ Pros: Advanced table features (sorting, filtering, grouping, Excel export)
- ✅ Best for: Dashboard 4 WIP table, Dashboard 6 Services table
- ⚠️ Cons: Requires commercial license (~$1,000/year per developer)

**Recommendation**:
- Use **Recharts** for charts (free, flexible)
- Use **Tremor** for KPI cards and simple charts (better DX)
- Use **shadcn Table** for basic tables
- Upgrade to **AG Grid Enterprise** later if budget allows (Dashboard 4, 6 would benefit)

---

## Metabase Implementation Requirements

### Metabase Setup Checklist

#### 1. Metabase Instance Deployment

```yaml
Deployment: VPS (Hetzner Cloud recommended)
Docker Compose: Yes
Resources:
  - CPU: 2 vCPUs
  - RAM: 4 GB
  - Storage: 20 GB SSD

Services:
  - Metabase (latest)
  - PostgreSQL (Metabase metadata DB)
  - Redis (optional, for caching)
```

#### 2. Database Connection

```yaml
Database Type: PostgreSQL
Connection Details:
  - Host: [Supabase AU region endpoint]
  - Port: 5432
  - Database: postgres
  - Schema: public
  - User: [service_role user]
  - Password: [service_role password]
  - SSL: Required (verify-full)

Connection Pooling:
  - Min Pool Size: 5
  - Max Pool Size: 20
```

#### 3. Embedding Configuration

```yaml
Embedding Type: Signed Embedding (JWT)
Embedding Key: [Generate 64-character secret]
Session Duration: 1 hour
Auto-refresh: 30 minutes before expiry

Security Parameters (JWT Payload):
  organization_id: "{{ user.organization_id }}"
  role: "{{ user.role }}"
  assigned_clients: "{{ user.assigned_clients }}" (for staff users)
  team: "{{ user.team }}" (for team-filtered dashboards)
```

**JWT Signing Example** (Next.js API Route):

```typescript
// app/api/metabase/embed/route.ts

import jwt from 'jsonwebtoken'
import { getServerSession } from 'next-auth'

export async function GET(req: Request) {
  const session = await getServerSession()
  const { searchParams } = new URL(req.url)
  const dashboardId = searchParams.get('dashboardId')

  if (!session || !dashboardId) {
    return new Response('Unauthorized', { status: 401 })
  }

  const payload = {
    resource: { dashboard: parseInt(dashboardId) },
    params: {
      organization_id: session.user.organizationId,
      role: session.user.role,
      ...(session.user.role === 'staff' && {
        assigned_clients: session.user.assignedClients
      })
    },
    exp: Math.round(Date.now() / 1000) + (60 * 60) // 1 hour
  }

  const token = jwt.sign(payload, process.env.METABASE_SECRET_KEY!)
  const iframeUrl = `${process.env.METABASE_SITE_URL}/embed/dashboard/${token}#bordered=false&titled=false`

  return Response.json({ iframeUrl })
}
```

**Next.js Component**:

```typescript
// components/metabase/embedded-dashboard.tsx

'use client'

export function EmbeddedMetabaseDashboard({ dashboardId }: { dashboardId: number }) {
  const [iframeUrl, setIframeUrl] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/metabase/embed?dashboardId=${dashboardId}`)
      .then(res => res.json())
      .then(data => setIframeUrl(data.iframeUrl))
  }, [dashboardId])

  if (!iframeUrl) return <Skeleton className="h-[600px]" />

  return (
    <iframe
      src={iframeUrl}
      frameBorder="0"
      width="100%"
      height="600"
      allowTransparency
    />
  )
}
```

#### 4. Dashboard Creation Workflow

**For Each Dashboard**:

1. **Create Questions** (individual charts/tables)
   - Navigate to Metabase → New Question
   - Select "Custom Query" (SQL)
   - Write SQL with parameter placeholders: `{{organization_id}}`
   - Save Question with descriptive name

2. **Create Dashboard**
   - Navigate to Metabase → New Dashboard
   - Add Questions to Dashboard
   - Arrange layout (drag-and-drop)
   - Add Filters (Financial Year, Date Range, Team, etc.)

3. **Configure Filters**
   - Link filter to Question parameters
   - Set default values
   - Enable "Required" for critical filters

4. **Enable Embedding**
   - Dashboard Settings → Sharing & Embedding
   - Enable "Signed Embedding"
   - Configure locked parameters (organization_id, role)
   - Configure editable parameters (date ranges, team filters)

5. **Test Embedding**
   - Copy embedding code
   - Test in local Next.js environment
   - Verify RLS is working (switch user roles)

#### 5. Metabase Cache Strategy

```yaml
Cache Configuration:
  Default Cache Duration: 1 hour
  Dashboard-Specific:
    - Dashboard 1-3 (Financial): 30 minutes
    - Dashboard 4 (WIP): 15 minutes (more volatile)
    - Dashboard 5 (ATO): 24 hours (static)
    - Dashboard 6-8: 30 minutes

Cache Invalidation:
  - Manual: Admin can clear cache via Metabase UI
  - Automatic: n8n ETL completion webhook clears cache
  - Scheduled: Daily cache clear at 6 AM (before business hours)
```

**n8n Webhook to Clear Cache**:

```javascript
// n8n HTTP Request Node: Clear Metabase Cache

Method: POST
URL: {{$env.METABASE_URL}}/api/cache
Headers:
  X-Metabase-Session: {{$env.METABASE_API_KEY}}
Body:
  {
    "collection": "all"
  }
```

#### 6. Metabase Performance Optimization

**Database Indexes** (Supabase):

```sql
-- Indexes for Metabase query performance

-- Dashboard 1: Income vs Expenses
CREATE INDEX idx_financial_data_org_date
ON financial_data (organization_id, transaction_date DESC);

CREATE INDEX idx_financial_data_org_type_date
ON financial_data (organization_id, transaction_type, transaction_date DESC);

-- Dashboard 4: WIP Analysis
CREATE INDEX idx_project_data_org_status
ON project_data (organization_id, status)
WHERE status = 'in_progress';

CREATE INDEX idx_time_entries_job_billable
ON time_entries (job_id, billable, synced_at DESC);

-- Dashboard 7: Debtors Aging
CREATE INDEX idx_invoices_org_type_status
ON invoices (organization_id, type, status)
WHERE type = 'ACCREC' AND status IN ('AUTHORISED', 'PARTPAID');
```

**Materialized Views** (for complex calculations):

```sql
-- Materialized view for WIP aging (Dashboard 4)

CREATE MATERIALIZED VIEW mv_wip_aging AS
SELECT
  pd.organization_id,
  c.client_name,
  j.job_number,
  SUM(te.charge_value) AS time_value,
  SUM(co.amount) AS costs_value,
  SUM(inv.amount) AS invoiced_amount,
  (SUM(te.charge_value) + SUM(co.amount) - SUM(inv.amount)) AS wip_amount,
  CURRENT_DATE - j.start_date AS aging_days
FROM project_data pd
JOIN clients c ON pd.client_id = c.id
LEFT JOIN jobs j ON pd.id = j.id
LEFT JOIN time_entries te ON j.id = te.job_id
LEFT JOIN costs co ON j.id = co.job_id
LEFT JOIN invoices inv ON j.id = inv.job_id
WHERE pd.status = 'in_progress'
GROUP BY pd.organization_id, c.client_name, j.job_number, j.start_date;

-- Refresh daily at 5 AM (before cache clear at 6 AM)
CREATE UNIQUE INDEX idx_mv_wip_aging_unique ON mv_wip_aging (organization_id, job_number);
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_wip_aging;
```

---

## Internal BI Alternative Architecture

### Why Consider Internal BI?

**Pros**:
- ✅ Full design control (match brand identity)
- ✅ Better mobile responsiveness
- ✅ Real-time data updates (no iframe latency)
- ✅ MCP integration for conversational analytics
- ✅ Custom interactions (drill-downs, tooltips, animations)
- ✅ No Metabase licensing constraints

**Cons**:
- ⚠️ Longer development time (6-8 weeks vs 2-3 weeks)
- ⚠️ More frontend code to maintain
- ⚠️ Requires React charting library expertise
- ⚠️ No built-in query builder for non-developers

### Recommended Hybrid Approach

**Phase 1 (MVP - 3 weeks)**:
- Use Metabase for all 8 dashboards
- Focus on n8n ETL pipeline and data quality
- Get user feedback on dashboard utility

**Phase 2 (Enhancement - 4 weeks)**:
- Build internal BI for Dashboards 1, 2, 3 (simple charts)
- Keep Metabase for Dashboards 4, 6, 7, 8 (complex tables)
- Add MCP integration for conversational queries

**Phase 3 (Full Migration - 6 weeks)**:
- Migrate remaining dashboards to internal BI
- Build custom admin dashboard builder
- Deprecate Metabase (optional)

### Internal BI Tech Stack

```yaml
Frontend Framework: Next.js 15 (App Router)
UI Components: Shadcn/ui v4
Charting Libraries:
  - Recharts (primary - bar, line, area charts)
  - Tremor (secondary - KPI cards, simple charts)
  - Nivo (advanced - heat maps, calendar charts)

Data Layer:
  - tRPC 11 (type-safe API routes)
  - React Query (caching, optimistic updates)
  - Zustand (global state for filters)

Database:
  - Supabase PostgreSQL (data source)
  - Supabase Realtime (live data updates)
  - Supabase Functions (complex calculations)

Analytics:
  - PydanticAI (conversational analytics)
  - CopilotKit (chat interface)
  - MCP (Xero/XPM real-time data)
```

### Internal BI Code Organization

```
app/
├── (auth)/
│   └── login/
│       └── page.tsx
├── (dashboard)/
│   ├── layout.tsx                    # Dashboard shell with sidebar
│   ├── page.tsx                      # Dashboard home (overview)
│   └── dashboards/
│       ├── income-vs-expenses/
│       │   ├── page.tsx              # Dashboard 1
│       │   └── loading.tsx
│       ├── monthly-budget/
│       │   └── page.tsx              # Dashboard 2
│       ├── cumulative-budget/
│       │   └── page.tsx              # Dashboard 3
│       ├── wip-analysis/
│       │   └── page.tsx              # Dashboard 4
│       ├── ato-lodgment/
│       │   └── page.tsx              # Dashboard 5
│       ├── services-analysis/
│       │   └── page.tsx              # Dashboard 6
│       ├── debtors-aging/
│       │   └── page.tsx              # Dashboard 7
│       └── client-recoverability/
│           └── page.tsx              # Dashboard 8
├── api/
│   ├── trpc/
│   │   └── [trpc]/
│   │       └── route.ts              # tRPC API handler
│   └── metabase/
│       └── embed/
│           └── route.ts              # Metabase JWT signing
└── admin/
    ├── users/
    │   └── page.tsx
    └── sync-monitor/
        └── page.tsx

components/
├── ui/                                # Shadcn components
│   ├── card.tsx
│   ├── table.tsx
│   ├── button.tsx
│   └── ...
├── dashboards/                        # Dashboard-specific components
│   ├── income-expense-chart.tsx
│   ├── monthly-budget-chart.tsx
│   ├── wip-donut-charts.tsx
│   ├── services-analysis-table.tsx
│   └── ...
├── layout/
│   ├── dashboard-shell.tsx
│   ├── sidebar.tsx
│   └── header.tsx
└── shared/
    ├── data-table.tsx                # Reusable table with sorting/filtering
    ├── date-range-picker.tsx
    ├── multi-select.tsx
    └── export-button.tsx

lib/
├── trpc/
│   ├── client.ts                     # tRPC client setup
│   ├── server.ts                     # tRPC server setup
│   └── routers/
│       ├── dashboards.ts             # Dashboard data queries
│       ├── admin.ts                  # Admin queries
│       └── _app.ts                   # Root router
├── supabase/
│   ├── client.ts                     # Supabase client (browser)
│   ├── server.ts                     # Supabase client (server)
│   └── functions/                    # SQL function wrappers
│       ├── get-income-expense-data.ts
│       ├── get-wip-analysis.ts
│       └── ...
├── mcp/
│   ├── client.ts                     # MCP client wrapper
│   └── hooks/
│       ├── use-xero-invoices.ts
│       └── use-xpm-jobs.ts
└── utils/
    ├── chart-formatters.ts           # Currency, date formatters
    ├── export-to-excel.ts
    └── calculations.ts               # WIP, DSO calculations

server/
├── routers/
│   ├── dashboards.ts                 # tRPC dashboard router
│   ├── admin.ts                      # Admin panel router
│   └── _app.ts                       # Root tRPC router
└── middleware/
    ├── auth.ts                       # Session validation
    └── rls.ts                        # RLS context injection
```

### tRPC Router Example

```typescript
// server/routers/dashboards.ts

import { z } from 'zod'
import { protectedProcedure, router } from '../trpc'

export const dashboardsRouter = router({
  getIncomeExpense: protectedProcedure
    .input(z.object({
      financialYear: z.string(),
      timeRange: z.enum(['52weeks', '26weeks', '13weeks'])
    }))
    .query(async ({ input, ctx }) => {
      const orgId = ctx.session.user.organizationId

      const chartData = await ctx.supabase
        .rpc('get_income_expense_data', {
          org_id: orgId,
          fy: input.financialYear,
          weeks: parseInt(input.timeRange)
        })

      return {
        chartData: chartData.data,
        kpis: await calculateKPIs(ctx.supabase, orgId)
      }
    }),

  getMonthlyBudget: protectedProcedure
    .input(z.object({ financialYear: z.string() }))
    .query(async ({ input, ctx }) => {
      const data = await ctx.supabase
        .rpc('get_monthly_budget_variance', {
          org_id: ctx.session.user.organizationId,
          fy: input.financialYear
        })

      return data.data
    }),

  getWIPAnalysis: protectedProcedure
    .input(z.object({
      team: z.string().optional(),
      reportDate: z.string()
    }))
    .query(async ({ input, ctx }) => {
      const query = ctx.supabase
        .from('mv_wip_aging')
        .select('*')
        .eq('organization_id', ctx.session.user.organizationId)

      if (input.team && input.team !== 'all') {
        query.eq('team_name', input.team)
      }

      const { data } = await query

      // Transform data for donut charts
      const donutCharts = transformToDonutData(data, ['Accounting', 'Bookkeeping', 'SMSF', 'Support Hub'])

      return {
        donutCharts,
        clientDetails: data,
        trendData: await getWIPTrends(ctx.supabase, ctx.session.user.organizationId)
      }
    }),

  // ... other dashboard queries
})

// Helper function
async function calculateKPIs(supabase: SupabaseClient, orgId: string) {
  const { data: totalAR } = await supabase
    .rpc('get_total_ar', { org_id: orgId })

  const { data: totalWIP } = await supabase
    .rpc('get_total_wip', { org_id: orgId })

  return {
    totalAR: totalAR?.[0]?.total || 0,
    totalWIP: totalWIP?.[0]?.total || 0,
    // ... other KPIs
  }
}
```

### React Query Caching Strategy

```typescript
// app/(dashboard)/dashboards/income-vs-expenses/page.tsx

'use client'

import { trpc } from '@/lib/trpc/client'

export default function IncomeExpensePage() {
  const { data, isLoading, refetch } = trpc.dashboards.getIncomeExpense.useQuery(
    { financialYear: 'FY25', timeRange: '52weeks' },
    {
      staleTime: 5 * 60 * 1000,        // Data fresh for 5 minutes
      cacheTime: 30 * 60 * 1000,       // Cache persists for 30 minutes
      refetchOnWindowFocus: false,     // Don't refetch on tab focus
      refetchInterval: 15 * 60 * 1000  // Auto-refetch every 15 minutes
    }
  )

  return (
    <div>
      <Button onClick={() => refetch()}>Refresh</Button>
      <IncomeExpenseChart data={data?.chartData} />
    </div>
  )
}
```

---

## MCP Integration Points

### What is MCP?

**Model Context Protocol (MCP)** is a protocol for exposing data sources to AI applications. In XeroPulse, MCP servers provide real-time access to Xero and XPM APIs.

### Available MCP Servers

```yaml
Xero MCP Server:
  Tools:
    - mcp__xero__list-invoices
    - mcp__xero__list-payments
    - mcp__xero__list-contacts
    - mcp__xero__create-invoice
    - mcp__xero__get-budget-summary
    - ... (see full list in tool definitions)

  Use Cases:
    - Real-time invoice queries
    - Conversational analytics ("Show me unpaid invoices")
    - Drill-down data fetching

Supabase MCP Server:
  Tools:
    - mcp__supabase__execute_sql
    - mcp__supabase__list_tables
    - mcp__supabase__apply_migration

  Use Cases:
    - Ad-hoc SQL queries from AI chat
    - Schema exploration
    - Database migrations
```

### MCP Integration Architecture

```typescript
// lib/mcp/client.ts

import { MCPClient } from '@modelcontextprotocol/client'

export class XeroPulseMCP {
  private xeroClient: MCPClient
  private supabaseClient: MCPClient

  constructor() {
    this.xeroClient = new MCPClient({
      serverName: 'xero',
      transport: 'stdio' // or 'http'
    })

    this.supabaseClient = new MCPClient({
      serverName: 'supabase',
      transport: 'stdio'
    })
  }

  async queryXero(tool: string, params: any) {
    return await this.xeroClient.call(tool, params)
  }

  async querySupabase(sql: string) {
    return await this.supabaseClient.call('mcp__supabase__execute_sql', {
      query: sql
    })
  }
}

export const mcpClient = new XeroPulseMCP()
```

### MCP React Hook

```typescript
// lib/mcp/hooks/use-mcp-query.ts

import { useQuery } from '@tanstack/react-query'
import { mcpClient } from '../client'

export function useMCPQuery<T>(
  server: 'xero' | 'supabase',
  tool: string,
  params: any,
  options?: UseQueryOptions<T>
) {
  return useQuery({
    queryKey: [server, tool, params],
    queryFn: async () => {
      if (server === 'xero') {
        return await mcpClient.queryXero(tool, params)
      } else {
        return await mcpClient.querySupabase(params.sql)
      }
    },
    ...options
  })
}

// Usage example
export function useXeroInvoices(contactId?: string) {
  return useMCPQuery('xero', 'mcp__xero__list-invoices', {
    page: 1,
    contactIds: contactId ? [contactId] : undefined
  }, {
    enabled: !!contactId, // Only fetch if contactId provided
    staleTime: 5 * 60 * 1000
  })
}
```

### MCP Use Cases by Dashboard

#### Dashboard 1: Income vs Expenses
- ⚠️ **Not Recommended** for chart data (too slow)
- ✅ **Conversational**: "What was the biggest expense spike this year?"
- ✅ **Drill-down**: Click bar → MCP fetch transactions for that week

#### Dashboard 2-3: Budget Dashboards
- ⚠️ **Limited** - Budget data is static
- ✅ **Conversational**: "Are we on track to hit our FY25 budget?"

#### Dashboard 4: WIP Analysis
- ✅ **Real-time job updates**: Click client → MCP fetch job details
- ✅ **Conversational**: "Which jobs have been in progress for over 60 days?"
- ⚠️ **Performance**: Only use for drill-down, not initial table load

#### Dashboard 5: ATO Lodgment
- ❓ **Depends on Suntax API availability**
- ✅ **Conversational**: "How many ITR lodgments are still pending?"

#### Dashboard 6: Services Analysis
- ✅ **Real-time time entry updates**
- ✅ **Drill-down**: Click service → Show individual jobs
- ✅ **Conversational**: "Which service has the highest write-offs this month?"

#### Dashboard 7: Debtors Aging
- ✅ **Real-time invoice status**
- ✅ **Drill-down**: Click client → MCP fetch invoice details
- ✅ **Conversational**: "Which clients are overdue by more than 60 days?"

#### Dashboard 8: Client Recoverability
- ✅ **Real-time WIP calculations**
- ✅ **Drill-down**: Click client → MCP fetch job-level WIP
- ✅ **Conversational**: "Which clients have the highest unbilled time?"

### CopilotKit Integration

```typescript
// components/copilot/dashboard-assistant.tsx

import { CopilotKit, CopilotSidebar } from '@copilotkit/react-ui'
import { useCopilotAction } from '@copilotkit/react-core'

export function DashboardAssistant({ dashboardId }: { dashboardId: number }) {
  useCopilotAction({
    name: 'query-xero-data',
    description: 'Query Xero data in real-time',
    parameters: [
      { name: 'tool', type: 'string', description: 'MCP tool name' },
      { name: 'params', type: 'object', description: 'Tool parameters' }
    ],
    handler: async ({ tool, params }) => {
      const result = await mcpClient.queryXero(tool, params)
      return {
        success: true,
        data: result
      }
    }
  })

  useCopilotAction({
    name: 'analyze-dashboard',
    description: 'Analyze current dashboard data and provide insights',
    handler: async () => {
      // Get current dashboard data
      const data = await getDashboardData(dashboardId)

      // Use PydanticAI to generate insights
      const insights = await generateInsights(data)

      return { insights }
    }
  })

  return (
    <CopilotSidebar
      instructions="You are a financial analytics assistant. Help users understand their Xero data."
      defaultOpen={false}
    />
  )
}
```

**Example Conversational Queries**:

```
User: "Show me clients with WIP over $10,000"

AI: I'll query the WIP data for you...
[Calls mcp__supabase__execute_sql]

Results:
1. Molly Rose Brewing Company Pty Ltd - $10,534
2. Galco Group Pty Ltd - $16,000
3. Suntax Financial Planning P. - $12,000

User: "What's the status of the Molly Rose invoice?"

AI: Let me check the invoice details...
[Calls mcp__xero__list-invoices with contactId filter]

Molly Rose Brewing Company has 2 outstanding invoices:
- Invoice #12345: $5,234 (Due 2025-01-15) - OVERDUE
- Invoice #12387: $3,100 (Due 2025-02-20) - AUTHORISED
```

---

## Implementation Priorities

### MVP Scope (3 weeks)

**Week 1: Infrastructure & ETL**
- ✅ Set up Supabase database (run migrations)
- ✅ Deploy n8n to VPS
- ✅ Configure Xero OAuth2
- ✅ Build n8n workflows for Dashboards 1-3 data
- ✅ Test ETL pipeline

**Week 2: Metabase Dashboards 1-4**
- ✅ Deploy Metabase to VPS
- ✅ Connect Metabase to Supabase
- ✅ Create Dashboard 1: Income vs Expenses
- ✅ Create Dashboard 2: Monthly Budget
- ✅ Create Dashboard 3: Cumulative Budget
- ✅ Create Dashboard 4: WIP Analysis (complex)

**Week 3: Metabase Dashboards 5-8 & Portal Integration**
- ✅ Create Dashboard 5: ATO Lodgment (pending Suntax API)
- ✅ Create Dashboard 6: Services Analysis
- ✅ Create Dashboard 7: Debtors Aging
- ✅ Create Dashboard 8: Client Recoverability
- ✅ Build Next.js portal with Metabase embedding
- ✅ Implement authentication & RLS
- ✅ Deploy to Vercel

### Post-MVP Enhancements (4-6 weeks)

**Phase 2a: Internal BI for Simple Dashboards**
- ✅ Build internal version of Dashboard 1 (Recharts)
- ✅ Build internal version of Dashboard 2 (Recharts)
- ✅ Build internal version of Dashboard 3 (Tremor KPIs)
- ✅ Add MCP integration for conversational queries
- ✅ A/B test: Metabase vs Internal BI

**Phase 2b: Advanced Features**
- ✅ CopilotKit AI assistant integration
- ✅ Dashboard drill-down with MCP
- ✅ Export to Excel for all dashboards
- ✅ Mobile-optimized layouts
- ✅ Dark mode theme

**Phase 3: Full Migration (Optional)**
- ✅ Migrate remaining dashboards to internal BI
- ✅ Build custom dashboard builder for admins
- ✅ Advanced table features (AG Grid Enterprise)
- ✅ Real-time data updates (Supabase Realtime)
- ✅ Deprecate Metabase

---

## Conclusion

This checklist provides a comprehensive roadmap for implementing all 8 XeroPulse dashboards using either Metabase (recommended for MVP) or a custom internal BI solution using Shadcn/ui and React charting libraries.

### Key Takeaways:

1. **Use Metabase for MVP** - Faster time-to-market, proven technology
2. **Plan for Internal BI migration** - Better UX, full control, MCP integration
3. **Hybrid approach is optimal** - Use Metabase for complex tables, internal BI for simple charts
4. **MCP is powerful for drill-downs** - Not for initial data loading (too slow)
5. **Invest in data quality first** - n8n ETL pipeline is foundation for all dashboards

### Next Steps:

1. ✅ Review this checklist with stakeholders
2. ✅ Prioritize dashboard order based on business value
3. ✅ Set up development environment (Supabase, n8n, Metabase)
4. ✅ Start with Dashboard 1 as proof-of-concept
5. ✅ Iterate based on user feedback

---

**Document Status**: ✅ Complete - Ready for Implementation
**Last Updated**: 2025-10-22
**Next Review**: After MVP deployment
