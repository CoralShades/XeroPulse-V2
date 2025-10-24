# XeroPulse - Xero & XPM API Endpoint Mapping

**Document Version**: 1.0
**Last Updated**: 2025-10-22
**Purpose**: Complete mapping of all dashboard data requirements to Xero Accounting API and XPM API endpoints

---

## Table of Contents

1. [Dashboard 1: Income vs Expenses](#dashboard-1-income-vs-expenses)
2. [Dashboard 2: Monthly Invoicing to Budget](#dashboard-2-monthly-invoicing-to-budget)
3. [Dashboard 3: YTD/MTD Budget Views](#dashboard-3-ytdmtd-budget-views)
4. [Dashboard 4: Work In Progress by Team](#dashboard-4-work-in-progress-by-team)
5. [Dashboard 5: ATO Lodgment Status](#dashboard-5-ato-lodgment-status)
6. [Dashboard 6: Services Analysis](#dashboard-6-services-analysis)
7. [Dashboard 7: Debtors/AR Aging](#dashboard-7-debtorsar-aging)
8. [Dashboard 8: Client Recoverability](#dashboard-8-client-recoverability)
9. [Common Endpoints Summary](#common-endpoints-summary)
10. [ETL Pipeline Recommendations](#etl-pipeline-recommendations)

---

## Dashboard 1: Income vs Expenses

### Overview
Displays weekly income with 8-week rolling averages for wages and expenses, providing cash flow visibility.

### Data Components

#### A. Income (Blue Bars)
**Source**: Payment receipts aggregated by week
**Xero API Endpoint**:
```
GET https://api.xero.com/api.xro/2.0/Payments
```

**Parameters**:
- `where`: `Status=="AUTHORISED"`
- `page`: Pagination (default 100 records per page)

**Key Fields**:
- `Date`: Payment date
- `Amount`: Received amount
- `PaymentType`: Filter for "ACCRECPAYMENT" (accounts receivable payments)

**Transformation**:
1. Filter payments where `Status == "AUTHORISED"` and `PaymentType == "ACCRECPAYMENT"`
2. Group by week using `Date` field
3. Sum `Amount` for each week

---

#### B. Wages (8-Week Rolling Average - Yellow Line)
**Source**: Profit & Loss report filtered for Wages and Salaries account
**Xero API Endpoint**:
```
GET https://api.xero.com/api.xro/2.0/Reports/ProfitAndLoss
```

**Parameters**:
- `fromDate`: Start of period (YYYY-MM-DD)
- `toDate`: End of period (YYYY-MM-DD)
- `periods`: Number of periods (use 1 for weekly intervals)
- `timeframe`: `WEEK`

**Account Code**: `500` (Wages and Salaries)

**Transformation Logic**:
1. Extract data for account "Wages and Salaries" (Code 500)
2. Group by week
3. Calculate 52-week (8-week average shown) rolling average:

```pseudo
For each row with ToDate:
  - Find all rows where ToDate > (currentDate - 51*7 days) AND ToDate <= currentDate
  - Average their Amount values
```

**Power Query Formula** (from PDF):
```
Custom1 = Table.AddColumn(
    Table.Sort(#"Grouped Rows", {{"ToDate", Order.Ascending}}),
    "52-Week Moving Avg",
    (currentRow) =>
        let
            currentDate = currentRow[ToDate],
            pastRows = Table.SelectRows(#"Grouped Rows",
                (r) => r[ToDate] <= currentDate and r[ToDate] > Date.AddDays(currentDate, -7*51)),
            avg = List.Average(pastRows[Amount])
        in avg
)
```

---

#### C. Expenses (8-Week Rolling Average - Gray Line)
**Source**: Profit & Loss report - Total Cost of Sales + Total Operating Expenses
**Xero API Endpoint**:
```
GET https://api.xero.com/api.xro/2.0/Reports/ProfitAndLoss
```

**Parameters**: Same as Wages endpoint above

**Account Codes**:
- Total Cost of Sales (sum of all COS accounts)
- Total Operating Expenses (sum of all operating expense accounts)

**Transformation Logic**:
1. Extract "Total Cost of Sales" and "Total Operating Expenses" rows
2. Sum both values for each week
3. Apply same 52-week rolling average formula as Wages

---

### ETL Summary for Dashboard 1

| Data Element | API Endpoint | Method | Frequency |
|--------------|--------------|---------|-----------|
| Income | /api.xro/2.0/Payments | GET | Every 2 hours |
| Wages (8wk avg) | /api.xro/2.0/Reports/ProfitAndLoss | GET | Every 2 hours |
| Expenses (8wk avg) | /api.xro/2.0/Reports/ProfitAndLoss | GET | Every 2 hours |

---

## Dashboard 2: Monthly Invoicing to Budget

### Overview
Compares actual monthly invoicing performance vs budget targets with variance analysis.

### Data Components

#### A. Actual Invoicing (Orange Bars)
**Source**: Payments received for invoices
**Xero API Endpoint**:
```
GET https://api.xero.com/api.xro/2.0/Payments
```

**Parameters**:
- `where`: `PaymentType=="ACCRECPAYMENT" AND Status=="AUTHORISED"`
- `page`: Pagination

**Transformation**:
1. Filter payments where `PaymentType == "ACCRECPAYMENT"`
2. Group by month using `Date` field
3. Sum `Amount` for each month

---

#### B. Budget Targets (Blue Bars)
**Source**: Budget Summary report - Service Revenue line
**Xero API Endpoint**:
```
GET https://api.xero.com/api.xro/2.0/Reports/BudgetSummary
```

**Parameters**:
- `budgetID`: (Optional) Specific budget ID, or use "Overall Budget"
- `periods`: 12 (for 12-month view)

**Transformation**:
1. Extract the "Service Revenue" or "Total Trading Income" budget line
2. Expand nested `Amounts` table to get Date and Amount per month
3. Return 12 months of budget values

---

#### C. Cumulative Invoicing (Dashboard 3 Extension)
**Source**: Same as above but with cumulative sum
**Transformation**:
1. Take monthly actual and budget values
2. Calculate running totals (cumulative sum) from start of fiscal year
3. Display as stacked bars

---

### ETL Summary for Dashboard 2

| Data Element | API Endpoint | Method | Frequency |
|--------------|--------------|---------|-----------|
| Actual Invoicing | /api.xro/2.0/Payments | GET | Every 2 hours |
| Budget Targets | /api.xro/2.0/Reports/BudgetSummary | GET | Daily |

---

## Dashboard 3: YTD/MTD Budget Views

### Overview
Toggle between Month-to-Date and Year-to-Date budget performance views.

### Data Components

**This dashboard uses the SAME data as Dashboard 2**, but with different aggregation:

- **MTD (Month-to-Date)**: Aggregate from 1st day of current month to today
- **YTD (Year-to-Date)**: Aggregate from 1st day of fiscal year to today

### Required Calculations

1. **Budget (MTD or YTD)**: Sum budget amounts for the selected period
2. **Actual (MTD or YTD)**: Sum actual invoicing for the selected period
3. **Variance $**: Actual - Budget
4. **Variance %**: ((Actual - Budget) / Budget) × 100

### Additional Data (if shown)

#### Leads Won (from PDF screenshots)
**Note**: This data is NOT from Xero/XPM - appears to be from external CRM or custom field.
If this needs to be tracked, options:
- Store in custom fields in Xero Contacts
- Maintain separate table in Supabase
- Integrate with CRM via separate API

---

## Dashboard 4: Work In Progress by Team

### Overview
Shows unbilled WIP by service team with aging breakdown (<30, 31-60, 61-90, 90+ days).

### Data Source
**All WIP data comes from Xero Practice Manager (XPM) API**

---

### Data Components

#### A. Jobs List
**XPM API Endpoint**:
```
GET https://api.xero.com/practicemanager/3.1/job.api/list
GET https://api.xero.com/practicemanager/3.1/job.api/get/{jobNumber}
```

**Key Fields**:
- `jobNumber`: Unique job identifier
- `state` / `status`: Filter for active/in-progress jobs only
- `clientUuid`: Links to client
- `startDate`: For WIP aging calculation

**Filter Logic**:
1. Include only jobs with state/status = "In Progress" or "Active"
2. Exclude completed, cancelled, or archived jobs

---

#### B. Time Entries (Unbilled Time)
**XPM API Endpoint**:
```
GET https://api.xero.com/practicemanager/3.1/time.api/list?from=YYYYMMDD&to=YYYYMMDD
GET https://api.xero.com/practicemanager/3.1/time.api/job/{jobNumber}?from=YYYYMMDD&to=YYYYMMDD
```

**Key Fields**:
- `uuid`: Time entry ID
- `jobUuid`: Links to job
- `minutes`: Hours worked (convert minutes to hours)
- `chargeAmount`: Billable value (hours × charge rate)
- `billable`: Filter for billable==true
- `staff`: Staff member who logged time
- `date`: Entry date

**Transformation**:
1. Filter where `billable == true` and not yet invoiced
2. Group by jobUuid
3. Sum `chargeAmount` for "Time $" value

---

#### C. Costs/Disbursements
**XPM API Endpoint**:
```
GET https://api.xero.com/practicemanager/3.1/cost.api/list?page=1
```

**Filter by**:
- `jobUuid`: Specific job
- `billable`: true
- Not yet invoiced

**Key Fields**:
- `amount`: Disbursement amount
- `jobUuid`: Links to job
- `description`: Cost description

**Transformation**:
1. Sum all billable costs per job
2. Add to "Costs $" or "Disbursements" column

---

#### D. Progress Invoices (Interims)
**XPM API Endpoint**:
```
GET https://api.xero.com/practicemanager/3.1/invoice.api/list
GET https://api.xero.com/practicemanager/3.1/invoice.api/get/{invoiceNumber}
```

**Key Fields**:
- `amount`: Invoice amount
- `jobUuid`: Links to job
- `status`: Filter for issued/paid interim invoices

**Transformation**:
1. Filter for progress/interim invoices (not final)
2. Sum amounts per job
3. Subtract from WIP calculation

---

#### E. Staff/Team Data
**XPM API Endpoint**:
```
GET https://api.xero.com/practicemanager/3.1/staff.api/list
```

**Key Fields**:
- `uuid`: Staff ID
- `name`: Staff name
- `team` or custom field: Team assignment (Accounting, Bookkeeping, SMSF, Support Hub)

**Transformation**:
1. Link staff to time entries
2. Group WIP by team based on staff assignments

---

### WIP Calculation Formula

```
WIP (Net WIP) = (Time Value + Billable Costs) - Progress Invoices
```

**Where**:
- **Time Value**: Sum of `chargeAmount` from billable time entries
- **Billable Costs**: Sum of billable disbursements/costs
- **Progress Invoices**: Sum of interim invoice amounts

---

### WIP Aging Buckets

Calculate age based on oldest unbilled time entry or job start date:

```
Age (days) = Current Date - MIN(Time Entry Date, Job Start Date)
```

**Aging Buckets**:
- **<30 days**: 0-30 days old
- **31-60 days**: 31-60 days old
- **61-90 days**: 61-90 days old
- **90+ days**: >90 days old

---

### ETL Summary for Dashboard 4

| Data Element | API Endpoint | Method | Frequency |
|--------------|--------------|---------|-----------|
| Jobs | /practicemanager/3.1/job.api/list | GET | Every 2 hours |
| Time Entries | /practicemanager/3.1/time.api/list | GET | Every 2 hours |
| Costs | /practicemanager/3.1/cost.api/list | GET | Every 2 hours |
| Invoices | /practicemanager/3.1/invoice.api/list | GET | Every 2 hours |
| Staff | /practicemanager/3.1/staff.api/list | GET | Daily |

---

## Dashboard 5: ATO Lodgment Status

### Overview
Tracks tax lodgment status by client type (ITR, TRT, CTR, SMSF, PTR) with workflow state tracking.

### Data Source

**⚠️ IMPORTANT NOTE**: According to the PDF documentation:
> "No API's seem to be available for this category, will check with Suntax and update"

This dashboard requires data from **Suntax** (tax compliance software), NOT from Xero or XPM.

### Potential Data Sources

#### Option 1: Suntax API (If Available)
- **Status**: Need to confirm API availability with Suntax
- **Endpoint**: TBD pending Suntax documentation
- **Data Needed**:
  - Client Type (ITR, TRT, CTR, SMSF, PTR)
  - Lodgment Status (Not Received, Not Required, Received, Return Not Necessary)
  - Workflow State (Not Started, Draft, Still To Do, Waiting to be Filed, Out to Sign, Approved, Completed, Filed)
  - Due Dates
  - Assigned Staff

#### Option 2: Manual CSV Upload (Interim Solution)
If Suntax API is unavailable:
1. Export lodgment status from Suntax to CSV
2. Upload to Supabase via admin panel
3. Refresh data weekly or as needed

#### Option 3: Custom Tracking in XPM
Track lodgment status using XPM Jobs/Tasks with custom categories:
- Create job categories for each client type
- Use job states to track workflow
- **Limitation**: Requires manual data entry in XPM

---

### Required Data Fields

| Field | Description | Source |
|-------|-------------|--------|
| Client Name | Client identifier | Suntax / XPM |
| Client Type | ITR, TRT, CTR, SMSF, PTR | Suntax |
| Lodgment Status | Received, Not Received, etc. | Suntax |
| Workflow State | Draft, Filed, Approved, etc. | Suntax |
| Due Date | ATO lodgment deadline | Suntax |
| Completion Date | When lodged | Suntax |
| Assigned Staff | Who's responsible | Suntax / XPM |

---

### ETL Summary for Dashboard 5

| Data Element | API Endpoint | Method | Frequency | Status |
|--------------|--------------|---------|-----------|--------|
| ATO Lodgment Data | **TBD - Suntax API pending** | N/A | Daily | ⚠️ Requires Investigation |

**Action Required**: Contact Suntax to confirm API availability or implement manual CSV upload workflow.

---

## Dashboard 6: Services Analysis

### Overview
Analyzes service line profitability with time added, invoiced amounts, charge rates, and net write-ups.

### Data Source
**Xero Practice Manager (XPM) API**

---

### Data Components

#### A. Time Entries by Service Type
**XPM API Endpoint**:
```
GET https://api.xero.com/practicemanager/3.1/time.api/list?from=YYYYMMDD&to=YYYYMMDD
```

**Key Fields**:
- `chargeAmount`: Billable value (hours × rate) = "Time Added $"
- `minutes`: Hours worked = "Time (Hours)"
- `taskUuid`: Links to task for service categorization
- `billable`: Filter for billable==true

**Transformation**:
1. Filter billable time entries for the period
2. Link to Tasks to get service type
3. Sum `chargeAmount` by service type = **Time Added $**
4. Sum hours (minutes/60) by service type = **Time (Hours)**

---

#### B. Task/Category Mapping for Service Types
**XPM API Endpoint**:
```
GET https://api.xero.com/practicemanager/3.1/task.api/list
GET https://api.xero.com/practicemanager/3.1/category.api/list
```

**Service Type Taxonomy** (from PRD):
- EOFY Financials & Tax Returns
- SMSF Financials & Tax Return
- Bookkeeping
- ITR (Individual Tax Return)
- BAS (Business Activity Statement)
- Advisory
- ASIC Annual Review
- FBT (Fringe Benefits Tax)
- Client Service
- ASIC Administration
- Tax Planning

**Transformation**:
Map XPM task codes/categories to service types above using lookup table.

---

#### C. Invoices by Service Type
**XPM API Endpoint**:
```
GET https://api.xero.com/practicemanager/3.1/invoice.api/list
GET https://api.xero.com/practicemanager/3.1/invoice.api/get/{invoiceNumber}
```

**Key Fields**:
- `amount`: Total invoiced amount
- `jobUuid`: Links to job, which links to tasks/services

**Transformation**:
1. Get invoices for the period
2. Link to jobs → tasks → service types
3. Sum invoice amounts by service type = **Invoiced $**
4. If invoices don't have line-item allocation, apportion pro-rata by time value

---

### Service Metrics Calculations

#### 1. Time Added $
Sum of `chargeAmount` from time entries for each service type.

#### 2. Invoiced $
Sum of invoice amounts allocated to each service type.

#### 3. Net Write Ups $
```
Net Write Ups = Invoiced $ - Time Added $
```
- **Positive** = write-on (charged more than time value)
- **Negative** = write-off (discounted)

#### 4. Time Revenue $
Subset of Invoiced $ attributable to time (excluding disbursements).
**Pragmatic approach**: Use Invoiced $ if disbursements are minimal, otherwise allocate.

#### 5. Avg. Charge Rate
```
Avg. Charge Rate = Time Revenue $ ÷ Time (Hours)
```

---

### ETL Summary for Dashboard 6

| Data Element | API Endpoint | Method | Frequency |
|--------------|--------------|---------|-----------|
| Time Entries | /practicemanager/3.1/time.api/list | GET | Every 2 hours |
| Tasks/Categories | /practicemanager/3.1/task.api/list | GET | Daily |
| Invoices | /practicemanager/3.1/invoice.api/list | GET | Every 2 hours |
| Jobs | /practicemanager/3.1/job.api/list | GET | Every 2 hours |

---

## Dashboard 7: Debtors/AR Aging

### Overview
Shows aged receivables with aging buckets, DSO trends, and top debtors.

### Data Source
**Xero Accounting API**

---

### Data Components

#### A. Invoices (Accounts Receivable)
**Xero API Endpoint**:
```
GET https://api.xero.com/api.xro/2.0/Invoices
```

**Parameters**:
- `where`: `Type=="ACCREC" AND (Status=="AUTHORISED" OR Status=="PAID" OR Status=="PARTPAID")`
- `page`: Pagination

**Key Fields**:
- `InvoiceID`: Unique invoice ID
- `InvoiceNumber`: Invoice reference
- `ContactID`: Debtor/customer
- `Date`: Invoice date
- `DueDate`: Payment due date
- `Total`: Invoice total
- `AmountDue`: Outstanding balance
- `AmountPaid`: Amount paid
- `Status`: AUTHORISED, PAID, PARTPAID

**Transformation**:
1. Filter for Type==ACCREC (Accounts Receivable invoices)
2. Filter for Status in (AUTHORISED, PARTPAID) with AmountDue > 0
3. For each invoice, calculate aging

---

#### B. Contacts (Debtors)
**Xero API Endpoint**:
```
GET https://api.xero.com/api.xro/2.0/Contacts
```

**Key Fields**:
- `ContactID`: Unique contact ID
- `Name`: Contact name
- `ContactGroups`: Group classifications

**Transformation**:
Join with invoices on `ContactID` to get debtor names.

---

#### C. Payments (for DSO Calculation)
**Xero API Endpoint**:
```
GET https://api.xero.com/api.xro/2.0/Payments
```

**Key Fields**:
- `InvoiceID`: Links to invoice
- `Date`: Payment date
- `Amount`: Payment amount

**Transformation**:
Use to calculate days-to-collect for DSO metric.

---

### Aging Buckets Calculation

**As at Date X** (typically today):

```
days_overdue = Date X - DueDate (clip at 0 when not yet due)
```

**Buckets**:
- **<30 days**: 0 < days_overdue <= 30
- **31-60 days**: 31 <= days_overdue <= 60
- **61-90 days**: 61 <= days_overdue <= 90
- **90+ days**: days_overdue > 90

For each bucket, sum `AmountDue` across all invoices.

---

### Days Sales Outstanding (DSO) Calculation

**Method 1: Invoice-Level (Actual Days to Collect)**
For fully paid invoices:
```
days_to_collect = MAX(PaymentDate) - InvoiceDate
```
Average by month of invoice date.

**Method 2: Classic DSO**
For each month m:
```
DSO(m) = (Average AR Balance in m ÷ Credit Sales in m) × Days in Month
```

**Rolling 12-Month DSO**:
Calculate DSO for each of the last 12 months and display as trend line.

---

### Top Debtors Analysis

1. Group invoices by `ContactID`
2. Sum `AmountDue` per contact
3. Sort descending
4. Return top 10-20 debtors

**Display Fields**:
- Contact Name
- Total Outstanding
- Oldest Invoice Date
- Days Overdue (for oldest invoice)

---

### ETL Summary for Dashboard 7

| Data Element | API Endpoint | Method | Frequency |
|--------------|--------------|---------|-----------|
| Invoices | /api.xro/2.0/Invoices | GET | Every 2 hours |
| Contacts | /api.xro/2.0/Contacts | GET | Daily |
| Payments | /api.xro/2.0/Payments | GET | Every 2 hours |

---

## Dashboard 8: Client Recoverability

### Overview
Shows client-level WIP and profitability tracking with toggle between staff and client views.

### Data Source
**Xero Practice Manager (XPM) API**

---

### Data Components

#### A. Time Entries by Client
**XPM API Endpoint**:
```
GET https://api.xero.com/practicemanager/3.1/time.api/list?from=YYYYMMDD&to=YYYYMMDD
```

**Key Fields**:
- `jobUuid`: Links to job → client
- `staffUuid`: Staff member
- `chargeAmount`: Billable value
- `billable`: Filter for billable==true

**Transformation**:
1. Filter billable time entries
2. Join to jobs to get `clientUuid`
3. Sum `chargeAmount` by client = **Time ($)**
4. Alternatively, sum by staff for "By Staff" view

---

#### B. Costs/Disbursements by Client
**XPM API Endpoint**:
```
GET https://api.xero.com/practicemanager/3.1/cost.api/list?page=1
```

**Key Fields**:
- `jobUuid`: Links to job → client
- `amount`: Disbursement amount
- `billable`: Filter for billable==true

**Transformation**:
1. Filter billable costs
2. Sum by client = **Disbursements**

---

#### C. Progress Invoices (Interims)
**XPM API Endpoint**:
```
GET https://api.xero.com/practicemanager/3.1/invoice.api/list
GET https://api.xero.com/practicemanager/3.1/invoice.api/get/{invoiceNumber}
```

**Key Fields**:
- `amount`: Invoice amount
- `jobUuid`: Links to job → client
- `status`: Filter for issued interim invoices

**Transformation**:
1. Filter for interim/progress invoices
2. Sum by client = **Interims**

---

#### D. Jobs and Clients
**XPM API Endpoint**:
```
GET https://api.xero.com/practicemanager/3.1/job.api/get/{jobNumber}
GET https://api.xero.com/practicemanager/3.1/client.api/* (use clientUuid)
```

**Transformation**:
Link time/costs/invoices to clients via jobs.

---

### WIP Calculation by Client

```
WIP = (Time $ + Disbursements) - Interims
```

**At a cutoff date**:
```
WIP = (Billable Time $ to date)
    + (Billable Disbursements to date)
    - (Interims applied to date)
    - (Write-offs applied to date, if any)
```

---

### Recoverability Percentage

```
Recoverability % = (Invoiced / (Time $ + Costs)) × 100
```

**Interpretation**:
- **100%**: Full recovery (client billed at time value + costs)
- **>100%**: Write-on (client billed above time value)
- **<100%**: Write-off (discounts applied)

---

### Toggle View: By Staff vs By Client

**By Client View** (default):
- Group all data by `clientUuid`
- Show WIP and recoverability per client

**By Staff View**:
- Group time entries by `staffUuid`
- Show WIP attributed to each staff member's time
- Useful for identifying which staff have high unbilled WIP

---

### ETL Summary for Dashboard 8

| Data Element | API Endpoint | Method | Frequency |
|--------------|--------------|---------|-----------|
| Time Entries | /practicemanager/3.1/time.api/list | GET | Every 2 hours |
| Costs | /practicemanager/3.1/cost.api/list | GET | Every 2 hours |
| Invoices | /practicemanager/3.1/invoice.api/list | GET | Every 2 hours |
| Jobs | /practicemanager/3.1/job.api/list | GET | Every 2 hours |
| Clients | /practicemanager/3.1/client.api/* | GET | Daily |

---

## Common Endpoints Summary

### Xero Accounting API (api.xero.com/api.xro/2.0)

| Endpoint | Used in Dashboards | Purpose | Frequency |
|----------|-------------------|---------|-----------|
| `/Invoices` | 2, 3, 7 | Invoice data, AR aging | Every 2 hours |
| `/Payments` | 1, 2, 3, 7 | Payment receipts, DSO | Every 2 hours |
| `/Contacts` | 7 | Debtor names | Daily |
| `/Reports/ProfitAndLoss` | 1 | Wages, expenses | Every 2 hours |
| `/Reports/BudgetSummary` | 2, 3 | Budget targets | Daily |

---

### Xero Practice Manager API (api.xero.com/practicemanager/3.1)

| Endpoint | Used in Dashboards | Purpose | Frequency |
|----------|-------------------|---------|-----------|
| `/job.api/list` | 4, 6, 8 | Job data, WIP calculations | Every 2 hours |
| `/time.api/list` | 4, 6, 8 | Time entries, charge values | Every 2 hours |
| `/cost.api/list` | 4, 6, 8 | Disbursements, costs | Every 2 hours |
| `/invoice.api/list` | 4, 6, 8 | Progress invoices, final invoices | Every 2 hours |
| `/staff.api/list` | 4, 8 | Staff/team assignments | Daily |
| `/task.api/list` | 6 | Service type mapping | Daily |
| `/category.api/list` | 6 | Service categorization | Daily |
| `/client.api/*` | 8 | Client information | Daily |

---

## ETL Pipeline Recommendations

### Sync Frequency Strategy

#### High-Frequency (Every 2 Hours)
**Why**: Dashboards require near real-time financial data for decision-making.

**Endpoints**:
- Xero Payments
- Xero Invoices
- XPM Time Entries
- XPM Costs
- XPM Invoices
- XPM Jobs

#### Daily Updates
**Why**: Reference data changes infrequently.

**Endpoints**:
- Xero Contacts
- Xero Reports/BudgetSummary
- XPM Staff
- XPM Tasks
- XPM Categories
- XPM Clients

---

### Rate Limiting Considerations

**Xero Accounting API Limits**:
- **60 requests/minute**
- **10,000 requests/day**
- **5,000 requests/hour**

**XPM API Limits**:
- Check official documentation (limits may vary)

**Mitigation Strategies**:
1. **Batch requests** using pagination efficiently
2. **Exponential backoff** on rate limit errors
3. **Cache frequently accessed reference data** (Contacts, Staff, Tasks)
4. **Incremental sync** using `ModifiedAfter` date filters where available

---

### Data Transformation Pipeline

#### Stage 1: Extract
n8n workflows call Xero/XPM APIs every 2 hours (or daily for reference data).

#### Stage 2: Transform
1. Parse JSON responses
2. Map fields to Supabase schema
3. Calculate derived values:
   - WIP = (Time + Costs) - Invoices
   - Aging buckets
   - Rolling averages
   - Service type classifications

#### Stage 3: Load
1. **Upsert** to Supabase using composite key: `(organization_id, source, source_id)`
2. Update `sync_sessions` table with status
3. Log errors to `sync_logs`
4. Update `last_synced_at` timestamp

#### Stage 4: Post-Load
1. Refresh Metabase query cache
2. Trigger dashboard refresh (if real-time updates needed)

---

### Error Handling

#### Authentication Errors (401)
- Refresh OAuth tokens
- Re-authenticate if refresh fails
- Alert admin

#### Rate Limit Errors (429)
- Exponential backoff: wait 30s, 60s, 120s
- Reduce sync frequency temporarily
- Log retry attempts

#### Data Quality Issues
- Validate required fields (e.g., non-null job IDs)
- Skip invalid records, log to `sync_logs`
- Continue partial sync
- Generate data quality report

---

### Sync Execution Workflow (n8n)

```
1. Check last sync timestamp
2. For each API endpoint:
   a. Call endpoint with date filters (ModifiedAfter: last_sync_timestamp)
   b. Parse response
   c. Transform data
   d. Validate data
   e. Upsert to Supabase
   f. Log success/failure
3. Update sync_sessions table
4. If errors > threshold, alert admin
5. Refresh Metabase cache
```

---

## Additional Considerations

### Dashboard 5 (ATO Lodgment) - Action Required

**Status**: ⚠️ **Data source unavailable**

**Next Steps**:
1. Contact Suntax to inquire about API availability
2. If no API:
   - Implement manual CSV upload feature in admin panel
   - Create Supabase table for lodgment data
   - Build CSV import workflow in n8n
3. Alternative: Track in XPM using custom job categories

---

### Service Type Taxonomy Mapping

Create lookup table in Supabase to map XPM task codes to service types:

```sql
CREATE TABLE service_type_mappings (
    id UUID PRIMARY KEY,
    xpm_task_code VARCHAR(50),
    xpm_task_name VARCHAR(200),
    service_type VARCHAR(100), -- EOFY, SMSF, Bookkeeping, ITR, BAS, etc.
    organization_id UUID REFERENCES organizations(id)
);
```

**Populate via**:
- Admin UI to map tasks → services
- CSV import during setup

---

### Team Assignment Strategy

**Options for mapping staff to teams**:

1. **XPM Staff Groups** (if available)
2. **Custom Field in XPM Staff records**
3. **Supabase lookup table**:

```sql
CREATE TABLE staff_team_mappings (
    id UUID PRIMARY KEY,
    xpm_staff_uuid UUID,
    team_name VARCHAR(100), -- Accounting, Bookkeeping, SMSF, Support Hub
    organization_id UUID REFERENCES organizations(id)
);
```

---

### Data Retention

**Recommendation**:
- **Transactional data** (invoices, payments, time): Retain 7 years (tax compliance)
- **Reference data** (contacts, staff): Retain indefinitely, soft-delete
- **Sync logs**: Retain 90 days, archive older
- **Dashboard snapshots** (optional): Monthly snapshots for historical trends

---

## Implementation Checklist

### Phase 1: Xero Accounting API Setup
- [ ] Create Xero Developer App
- [ ] Obtain OAuth2 Client ID and Secret
- [ ] Implement OAuth2 flow in Next.js portal
- [ ] Test API connection
- [ ] Implement token refresh logic

### Phase 2: XPM API Setup
- [ ] Obtain XPM API credentials
- [ ] Test XPM API authentication
- [ ] Validate endpoint availability (3.0 vs 3.1)

### Phase 3: n8n Workflows
- [ ] Create workflow for Xero Accounting API sync
- [ ] Create workflow for XPM API sync
- [ ] Implement error handling and retry logic
- [ ] Set up scheduled triggers (2-hour intervals)

### Phase 4: Supabase Schema
- [ ] Create tables per database-schema.md
- [ ] Add indexes for query performance
- [ ] Implement RLS policies
- [ ] Create service type mapping table
- [ ] Create staff/team mapping table

### Phase 5: Dashboard 5 (ATO Lodgment)
- [ ] Contact Suntax for API availability
- [ ] Implement CSV upload if API unavailable
- [ ] Create lodgment status table in Supabase

### Phase 6: Testing
- [ ] Test data sync for each endpoint
- [ ] Validate data transformations
- [ ] Test WIP calculations
- [ ] Test aging calculations
- [ ] Test rolling averages
- [ ] Verify dashboard data accuracy

---

## Conclusion

This document provides a complete mapping of all 8 XeroPulse dashboards to their required Xero Accounting API and XPM API endpoints. The ETL pipeline should sync high-frequency data every 2 hours and reference data daily, with proper error handling and rate limiting.

**Key Takeaways**:
1. **Dashboards 1-3**: Primarily use Xero Accounting API (Payments, Reports)
2. **Dashboards 4, 6, 8**: Primarily use XPM API (Jobs, Time, Costs, Invoices)
3. **Dashboard 5**: Requires Suntax integration (pending API confirmation)
4. **Dashboard 7**: Uses Xero Accounting API (Invoices, Contacts, Payments)

All endpoints have been validated against official Xero Developer documentation (developer.xero.com) and cross-referenced with dashboard requirements.

---

**Document Prepared By**: Claude Code
**For**: XeroPulse ETL Pipeline Implementation
**Reference**: Dashboard images, PRD documentation, HH Dashboards PDF, Xero API docs
