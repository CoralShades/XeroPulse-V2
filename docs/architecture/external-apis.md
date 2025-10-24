# External APIs

### Overview

XeroPulse integrates with three primary external APIs to deliver comprehensive financial intelligence. Each integration follows specific patterns for authentication, data retrieval, and error handling while maintaining data consistency and security throughout the ETL pipeline.

### Xero Accounting API Integration

**API Version & Endpoint**
- Xero API v2.0 (current stable version)
- Base URL: `https://api.xero.com/api.xro/2.0/`
- Authentication: OAuth 2.0 with PKCE flow
- Rate Limits: 10,000 API calls per day, 5 calls per second

**Key Endpoints Used**
```yaml
# Core accounting data endpoints
GET /Accounts: Chart of accounts and account balances
GET /Contacts: Customer and supplier information
GET /Invoices: Sales and purchase invoices
GET /Payments: Payment transactions and allocations
GET /BankTransactions: Bank account transactions
GET /Items: Inventory items and services
GET /Organisations: Organization settings and preferences

# Reporting endpoints
GET /Reports/TrialBalance: Trial balance data for specific periods
GET /Reports/ProfitAndLoss: P&L statements with comparative data
GET /Reports/BalanceSheet: Balance sheet positions
GET /Reports/CashSummary: Cash flow summaries
GET /Reports/AgedReceivablesByContact: AR aging analysis
```

**Authentication Flow**
```typescript
// OAuth 2.0 PKCE implementation for Xero
interface XeroAuthConfig {
  clientId: string;           // Xero app client ID
  redirectUri: string;        // Callback URL for auth code
  scopes: string[];          // Required permissions
  codeVerifier: string;      // PKCE code verifier
  codeChallenge: string;     // PKCE code challenge
}

interface XeroTokenResponse {
  access_token: string;       // API access token (30 min expiry)
  refresh_token: string;      // Token refresh (60 day expiry)
  expires_in: number;         // Token lifetime in seconds
  token_type: 'Bearer';       // Always Bearer for Xero
  scope: string;             // Granted permissions
}

// Required scopes for XeroPulse
const REQUIRED_SCOPES = [
  'accounting.transactions',   // Read transaction data
  'accounting.contacts',       // Read customer/supplier data  
  'accounting.reports.read',   // Access to standard reports
  'accounting.settings'        // Organization preferences
];
```

**Data Retrieval Patterns**
```python
# Python implementation for n8n workflows
class XeroDataExtractor:
    async def extract_invoices(self, tenant_id: str, modified_since: datetime) -> List[Invoice]:
        """Extract invoices with pagination and filtering"""
        params = {
            'page': 1,
            'If-Modified-Since': modified_since.isoformat(),
            'order': 'UpdatedDateUTC DESC'
        }
        
        all_invoices = []
        while True:
            response = await self.make_request(f'/Invoices', params)
            invoices = response.get('Invoices', [])
            
            if not invoices:
                break
                
            all_invoices.extend(invoices)
            params['page'] += 1
            
        return all_invoices

    async def extract_trial_balance(self, tenant_id: str, date: date) -> TrialBalance:
        """Extract trial balance for specific date"""
        params = {'date': date.isoformat()}
        response = await self.make_request(f'/Reports/TrialBalance', params)
        return self.parse_trial_balance(response)
```

**Error Handling & Rate Limiting**
```python
# Xero-specific error handling
class XeroAPIHandler:
    async def make_request(self, endpoint: str, params: dict) -> dict:
        """Make rate-limited request with retry logic"""
        
        # Rate limiting: 5 calls per second max
        await self.rate_limiter.acquire()
        
        try:
            response = await self.http_client.get(
                f"{self.base_url}{endpoint}",
                headers=self.get_auth_headers(),
                params=params
            )
            
            if response.status_code == 429:  # Rate limited
                retry_after = int(response.headers.get('Retry-After', 60))
                await asyncio.sleep(retry_after)
                return await self.make_request(endpoint, params)
                
            elif response.status_code == 401:  # Token expired
                await self.refresh_token()
                return await self.make_request(endpoint, params)
                
            response.raise_for_status()
            return response.json()
            
        except XeroAPIException as e:
            logger.error(f"Xero API error: {e}")
            raise
```

### XPM Practice Management API Integration

**API Version & Endpoint**
- XPM API v3.1 (latest available)
- Base URL: `https://api.xpmpracticemanager.com/v3.1/`
- Authentication: API Key + Basic Auth
- Rate Limits: 1,000 requests per hour per API key

**Key Endpoints Used**
```yaml
# Project and time tracking endpoints
GET /clients: Client contact information and settings
GET /jobs: Project/job details and status
GET /time: Time sheet entries and billing rates
GET /costs: Project costs and expenses
GET /quotes: Quotes and estimates
GET /invoices: Invoiced amounts and payment status

# Reporting endpoints  
GET /reports/timedetails: Detailed time tracking reports
GET /reports/wip: Work in progress analysis
GET /reports/profitability: Job profitability analysis
GET /reports/budget: Budget vs actual comparisons
```

**Authentication Implementation**
```python
# XPM API authentication using API key
class XPMAuthenticator:
    def __init__(self, api_key: str, username: str):
        self.api_key = api_key
        self.username = username
        
    def get_auth_headers(self) -> dict:
        """Generate authentication headers for XPM API"""
        auth_string = f"{self.username}:{self.api_key}"
        encoded_auth = base64.b64encode(auth_string.encode()).decode()
        
        return {
            'Authorization': f'Basic {encoded_auth}',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
```

**Data Synchronization Patterns**
```python
class XPMDataExtractor:
    async def extract_time_entries(self, modified_since: datetime) -> List[TimeEntry]:
        """Extract time entries with date filtering"""
        params = {
            'modifiedSince': modified_since.isoformat(),
            'pageSize': 100  # XPM max page size
        }
        
        time_entries = []
        page = 1
        
        while True:
            params['page'] = page
            response = await self.make_request('/time', params)
            
            entries = response.get('items', [])
            if not entries:
                break
                
            time_entries.extend(entries)
            
            # Check if more pages available
            if len(entries) < params['pageSize']:
                break
                
            page += 1
            
        return time_entries

    async def extract_wip_data(self, client_id: Optional[str] = None) -> WIPReport:
        """Extract work in progress data"""
        params = {'detailed': True}
        if client_id:
            params['clientId'] = client_id
            
        response = await self.make_request('/reports/wip', params)
        return self.parse_wip_report(response)
```

### Metabase API Integration

**API Version & Endpoint**
- Metabase API v1 (REST API)
- Base URL: `https://your-metabase-instance.com/api/`
- Authentication: API Key or Session Token
- Rate Limits: No published limits (reasonable use expected)

**Key Operations**
```yaml
# Dashboard management
GET /dashboard/{id}: Retrieve dashboard configuration
POST /dashboard/{id}/cards: Update dashboard cards
GET /dashboard/{id}/params: Get dashboard parameters

# Embedding operations
POST /embed/dashboard/{token}: Generate signed embed URLs
GET /embed/dashboard/{token}: Validate embed permissions
PUT /embed/dashboard/{token}: Update embed parameters

# Data refresh operations
POST /database/{id}/sync: Trigger database schema sync
GET /database/{id}/sync_status: Check sync progress
POST /table/{id}/rescan: Rescan specific table
```

**Embed URL Generation**
```python
# Metabase signed embed URL generation
class MetabaseEmbedService:
    def __init__(self, secret_key: str, site_url: str):
        self.secret_key = secret_key
        self.site_url = site_url
        
    def generate_dashboard_url(self, dashboard_id: int, user_context: dict) -> str:
        """Generate signed embed URL for dashboard"""
        
        # Create payload with user context for row-level security
        payload = {
            'resource': {'dashboard': dashboard_id},
            'params': self.build_user_params(user_context),
            'exp': int(time.time()) + 3600  # 1 hour expiry
        }
        
        # Sign with Metabase secret key
        token = jwt.encode(payload, self.secret_key, algorithm='HS256')
        
        return f"{self.site_url}/embed/dashboard/{token}"
        
    def build_user_params(self, user_context: dict) -> dict:
        """Build dashboard parameters based on user role and organization"""
        params = {
            'organization_id': user_context['organization_id']
        }
        
        # Role-based data filtering
        if user_context['role'] == 'staff':
            params['user_id'] = user_context['user_id']  # Restrict to user's data
        elif user_context['role'] == 'manager':
            params['department'] = user_context.get('department')
            
        return params
```

### Webhook Integration Patterns

**Xero Webhook Implementation**
```python
# Webhook handler for Xero data change notifications
class XeroWebhookHandler:
    def __init__(self, webhook_key: str):
        self.webhook_key = webhook_key
        
    async def handle_webhook(self, request: Request) -> Response:
        """Process Xero webhook notification"""
        
        # Verify webhook signature
        signature = request.headers.get('X-Xero-Signature')
        if not self.verify_signature(request.body, signature):
            raise HTTPException(status_code=401, detail="Invalid signature")
            
        payload = await request.json()
        
        # Process each event in the payload
        for event in payload.get('events', []):
            await self.process_event(event)
            
        return Response(status_code=200)
        
    async def process_event(self, event: dict):
        """Process individual Xero event"""
        event_type = event.get('eventType')
        resource_url = event.get('resourceUrl')
        
        if event_type in ['CREATE', 'UPDATE']:
            # Trigger incremental sync for affected resource
            await self.trigger_sync(resource_url)
            
    def verify_signature(self, body: bytes, signature: str) -> bool:
        """Verify webhook signature using Xero webhook key"""
        expected = hmac.new(
            self.webhook_key.encode(),
            body,
            hashlib.sha256
        ).hexdigest()
        
        return hmac.compare_digest(signature, expected)
```

**n8n Integration Triggers**
```javascript
// n8n webhook node configuration for external API coordination
const webhookConfig = {
  xero: {
    url: '/webhooks/xero',
    method: 'POST',
    authentication: 'signature',
    responseMode: 'immediately',
    options: {
      rawBody: true,  // Required for signature verification
      allowedOrigins: ['*.xero.com']
    }
  },
  
  xpm: {
    url: '/webhooks/xpm',
    method: 'POST', 
    authentication: 'apiKey',
    responseMode: 'immediately',
    options: {
      allowedOrigins: ['*.xpmpracticemanager.com']
    }
  }
};

// Workflow trigger logic
function processWebhookTrigger(source, payload) {
  // Route to appropriate data sync workflow
  switch(source) {
    case 'xero':
      return triggerXeroSync(payload.events);
    case 'xpm':
      return triggerXPMSync(payload.changes);
    default:
      throw new Error(`Unknown webhook source: ${source}`);
  }
}
```

### API Monitoring & Health Checks

**External API Health Monitoring**
```python
class APIHealthMonitor:
    async def check_xero_health(self) -> HealthStatus:
        """Check Xero API connectivity and auth status"""
        try:
            # Simple test request to validate connection
            response = await self.xero_client.get('/Organisations')
            return HealthStatus(
                service='xero',
                status='healthy',
                response_time=response.elapsed.total_seconds(),
                last_check=datetime.utcnow()
            )
        except Exception as e:
            return HealthStatus(
                service='xero',
                status='unhealthy',
                error=str(e),
                last_check=datetime.utcnow()
            )
            
    async def check_xpm_health(self) -> HealthStatus:
        """Check XPM API connectivity"""
        try:
            response = await self.xpm_client.get('/clients', params={'pageSize': 1})
            return HealthStatus(
                service='xpm',
                status='healthy',
                response_time=response.elapsed.total_seconds(),
                last_check=datetime.utcnow()
            )
        except Exception as e:
            return HealthStatus(
                service='xpm', 
                status='unhealthy',
                error=str(e),
                last_check=datetime.utcnow()
            )
```

### Detailed Rationale

**API Selection Strategy**: Xero API v2.0 chosen for stability and comprehensive endpoint coverage. XPM API v3.1 is the current version for project management data. Metabase API selected for programmatic dashboard management and signed embedding capabilities.

**Authentication Patterns**: OAuth 2.0 with PKCE for Xero provides secure, user-authorized access without storing credentials. XPM API key authentication is simpler but requires secure key management. Metabase signed embedding eliminates need for user authentication while maintaining security.

**Rate Limiting Approach**: Exponential backoff with jitter for rate limit handling prevents thundering herd problems. Different strategies per API accommodate varying rate limit structures (per-second vs per-hour).

**Webhook Strategy**: Real-time webhook notifications from Xero trigger incremental syncs, reducing API calls and improving data freshness. XPM webhook support is limited, so polling fallback is required.

**Error Handling Philosophy**: Circuit breaker patterns prevent cascade failures when external APIs are down. Graceful degradation allows dashboard viewing even when sync is temporarily unavailable.

**Key Assumptions**: Xero API rate limits remain at current levels (10k/day). XPM API v3.1 will maintain backward compatibility. Metabase signed embedding supports row-level security parameters. Webhook delivery from external APIs is reliable but not guaranteed.

**Validation Needs**: Load testing with realistic API call volumes to validate rate limiting. Webhook reliability testing with simulated failures. Security testing of signed embed URLs. Integration testing with actual Xero/XPM sandbox environments.

---

## Dashboard-Specific API Endpoint Mappings

### Dashboard 1: Income vs Expenses

**Data Requirements**: Weekly income bars + 52-week rolling averages for wages and expenses

**Xero API Endpoints**:

```yaml
Income (Blue Bars):
  Endpoint: GET /api.xro/2.0/Payments
  Parameters:
    where: "Status=='AUTHORISED' AND PaymentType=='ACCRECPAYMENT'"
    page: 1 (paginate as needed)
  Transformation:
    - Filter accounts receivable payments
    - Group by week using Date field
    - Sum Amount per week
  ETL Frequency: Every 2 hours
  ETL Pattern: Incremental (ModifiedAfter parameter)

Wages Rolling Average (Yellow Line):
  Endpoint: GET /api.xro/2.0/Reports/ProfitAndLoss
  Parameters:
    fromDate: YYYY-MM-DD (52 weeks ago)
    toDate: YYYY-MM-DD (current date)
    timeframe: WEEK
    periods: 1
  Account Code: 500 (Wages and Salaries)
  Transformation:
    - Extract "Wages and Salaries" rows
    - Calculate 52-week rolling average using window function
    - Formula: AVG(Amount) OVER (ORDER BY week ROWS BETWEEN 51 PRECEDING AND CURRENT ROW)
  ETL Frequency: Every 2 hours
  ETL Pattern: Full refresh (report-based)

Expenses Rolling Average (Gray Line):
  Endpoint: GET /api.xro/2.0/Reports/ProfitAndLoss
  Parameters: Same as Wages
  Account Codes: Total Cost of Sales + Total Operating Expenses
  Transformation:
    - Sum "Total Cost of Sales" + "Total Operating Expenses"
    - Apply same 52-week rolling average
  ETL Frequency: Every 2 hours
  ETL Pattern: Full refresh (report-based)
```

---

### Dashboard 2: Monthly Invoicing to Budget

**Data Requirements**: Monthly actual vs budget comparison with variance

**Xero API Endpoints**:

```yaml
Actual Invoicing (Orange Bars):
  Endpoint: GET /api.xro/2.0/Payments
  Parameters:
    where: "PaymentType=='ACCRECPAYMENT' AND Status=='AUTHORISED'"
  Transformation:
    - Group by month using Date field
    - Sum Amount per month
  ETL Frequency: Every 2 hours
  ETL Pattern: Incremental sync

Budget Targets (Blue Bars):
  Endpoint: GET /api.xro/2.0/Reports/BudgetSummary
  Parameters:
    budgetID: (optional - use default budget)
    periods: 12
  Transformation:
    - Extract "Service Revenue" or "Total Trading Income" budget line
    - Expand nested Amounts table (Date, Amount)
    - Return 12 months of budget values
  ETL Frequency: Daily
  ETL Pattern: Full refresh (budgets change infrequently)

Variance Calculation:
  Formula: ((Actual - Budget) / Budget) × 100
  Color Coding: Green if Actual > Budget, Red if under
```

---

### Dashboard 4: Work In Progress by Team

**Data Requirements**: WIP by team with aging, unbilled time/costs, progress invoices

**XPM API Endpoints**:

```yaml
Jobs List:
  Endpoint: GET /practicemanager/3.1/job.api/list
  Additional: GET /practicemanager/3.1/job.api/get/{jobNumber}
  Filter: status IN ('In Progress', 'Active')
  Key Fields:
    - jobNumber: Unique identifier
    - clientUuid: Link to client
    - startDate: For aging calculation
  ETL Frequency: Every 2 hours
  ETL Pattern: Incremental sync

Time Entries (Unbilled):
  Endpoint: GET /practicemanager/3.1/time.api/list?from=YYYYMMDD&to=YYYYMMDD
  Alternative: GET /practicemanager/3.1/time.api/job/{jobNumber}
  Filter: billable==true AND not invoiced
  Key Fields:
    - jobUuid: Link to job
    - chargeAmount: Billable value (hours × rate)
    - minutes: Hours worked
    - staffUuid: Staff member
  Transformation:
    - Sum chargeAmount by jobUuid = "Time $"
  ETL Frequency: Every 2 hours
  ETL Pattern: Incremental (from last sync date)

Costs/Disbursements:
  Endpoint: GET /practicemanager/3.1/cost.api/list
  Filter: billable==true AND not invoiced
  Key Fields:
    - jobUuid: Link to job
    - amount: Disbursement value
  Transformation:
    - Sum amount by jobUuid = "Disbursements"
  ETL Frequency: Every 2 hours
  ETL Pattern: Incremental

Progress Invoices (Interims):
  Endpoint: GET /practicemanager/3.1/invoice.api/list
  Filter: type=='progress' OR type=='interim'
  Key Fields:
    - jobUuid: Link to job
    - amount: Invoice amount
  Transformation:
    - Sum amount by jobUuid = "Interims"
  ETL Frequency: Every 2 hours
  ETL Pattern: Incremental

Staff/Team Data:
  Endpoint: GET /practicemanager/3.1/staff.api/list
  Key Fields:
    - uuid: Staff ID
    - name: Staff name
    - team: Custom field or department (Accounting, Bookkeeping, SMSF, Support Hub)
  ETL Frequency: Daily
  ETL Pattern: Full refresh

WIP Calculation:
  Formula: (Time Value + Billable Costs) - Progress Invoices

Aging Calculation:
  Formula: CURRENT_DATE - MIN(Time Entry Date, Job Start Date)
  Buckets: <30, 31-60, 61-90, 90+ days
```

---

### Dashboard 6: Services Analysis

**Data Requirements**: Service profitability, time added, invoiced amounts, charge rates

**XPM API Endpoints**:

```yaml
Time Entries by Service:
  Endpoint: GET /practicemanager/3.1/time.api/list?from=YYYYMMDD&to=YYYYMMDD
  Filter: billable==true
  Key Fields:
    - chargeAmount: Time Added $
    - minutes: Time (Hours) = minutes/60
    - taskUuid: Link to task for service categorization
  Transformation:
    - Join to Tasks to get service type
    - Sum chargeAmount by service_type = "Time Added $"
    - Sum minutes/60 by service_type = "Time (Hours)"
  ETL Frequency: Every 2 hours
  ETL Pattern: Incremental

Task/Category Mapping:
  Endpoint: GET /practicemanager/3.1/task.api/list
  Additional: GET /practicemanager/3.1/category.api/list
  Service Type Taxonomy:
    - EOFY Financials & Tax Returns
    - SMSF Financials & Tax Return
    - Bookkeeping
    - ITR, BAS, Advisory, ASIC, FBT, Tax Planning
  Transformation:
    - Create lookup table mapping XPM task codes to service types
    - Store in service_type_mappings table
  ETL Frequency: Daily
  ETL Pattern: Full refresh

Invoices by Service:
  Endpoint: GET /practicemanager/3.1/invoice.api/list
  Additional: GET /practicemanager/3.1/invoice.api/get/{invoiceNumber}
  Transformation:
    - Link to jobs → tasks → service types
    - Sum invoice amounts by service_type = "Invoiced $"
    - If no line-item allocation, apportion pro-rata by time value
  ETL Frequency: Every 2 hours
  ETL Pattern: Incremental

Calculations:
  Net Write Ups: Invoiced $ - Time Added $
  Avg Charge Rate: Time Revenue $ ÷ Time (Hours)
```

---

### Dashboard 7: Debtors/AR Aging

**Data Requirements**: Aged receivables, DSO trends, top debtors

**Xero API Endpoints**:

```yaml
Invoices (Accounts Receivable):
  Endpoint: GET /api.xro/2.0/Invoices
  Parameters:
    where: "Type=='ACCREC' AND (Status=='AUTHORISED' OR Status=='PARTPAID')"
    page: Pagination
  Key Fields:
    - InvoiceID, InvoiceNumber
    - ContactID: Debtor
    - Date, DueDate
    - AmountDue: Outstanding balance
  Transformation:
    - Filter for AmountDue > 0
    - Calculate days_overdue = CURRENT_DATE - DueDate
    - Assign to aging buckets (<30, 31-60, 61-90, 90+)
    - Sum AmountDue by bucket
  ETL Frequency: Every 2 hours
  ETL Pattern: Incremental sync

Contacts (Debtors):
  Endpoint: GET /api.xro/2.0/Contacts
  Key Fields:
    - ContactID
    - Name: Contact name
  Transformation:
    - Join with invoices on ContactID
  ETL Frequency: Daily
  ETL Pattern: Full refresh

Payments (for DSO):
  Endpoint: GET /api.xro/2.0/Payments
  Key Fields:
    - InvoiceID: Link to invoice
    - Date: Payment date
    - Amount: Payment amount
  Transformation:
    - Calculate days_to_collect = MAX(PaymentDate) - InvoiceDate
    - Calculate rolling 12-month DSO
    - Formula: (Avg AR Balance / Credit Sales) × Days in Period
  ETL Frequency: Every 2 hours
  ETL Pattern: Incremental

Top Debtors:
  Transformation:
    - Group invoices by ContactID
    - Sum AmountDue per contact
    - Sort DESC, return top 15
```

---

### Dashboard 8: Client Recoverability

**Data Requirements**: Client WIP, profitability tracking, staff/client toggle views

**XPM API Endpoints**:

```yaml
Time Entries by Client:
  Endpoint: GET /practicemanager/3.1/time.api/list?from=YYYYMMDD&to=YYYYMMDD
  Filter: billable==true AND not invoiced
  Key Fields:
    - jobUuid → clientUuid
    - staffUuid: For "By Staff" view
    - chargeAmount: Time $
  Transformation:
    - Join to jobs to get clientUuid
    - Sum chargeAmount by client = "Time ($)"
    - Alternative: Sum by staffUuid for "By Staff" view
  ETL Frequency: Every 2 hours
  ETL Pattern: Incremental

Costs by Client:
  Endpoint: GET /practicemanager/3.1/cost.api/list
  Filter: billable==true AND not invoiced
  Transformation:
    - Sum amount by client = "Disbursements"
  ETL Frequency: Every 2 hours
  ETL Pattern: Incremental

Progress Invoices:
  Endpoint: GET /practicemanager/3.1/invoice.api/list
  Filter: type IN ('progress', 'interim')
  Transformation:
    - Sum amount by client = "Interims"
  ETL Frequency: Every 2 hours
  ETL Pattern: Incremental

Calculations:
  Net WIP: (Time $ + Disbursements) - Interims
  Recoverability %: (Invoiced / (Time + Costs)) × 100

Problematic Clients Criteria:
  - WIP > 90 days old
  - Recoverability < 70%
  - High WIP (>$50K) with aging >60 days
```

---

## ETL Pipeline Patterns

### Pattern 1: Incremental Sync (Transactional Data)

**Used For**: Payments, Invoices, Time Entries, Costs
**Frequency**: Every 2 hours
**Implementation**:

```python
# n8n workflow pattern
def incremental_sync(endpoint, entity_type):
    # Get last sync timestamp
    last_sync = get_last_sync_timestamp(entity_type)

    # Xero/XPM request with ModifiedAfter filter
    params = {
        'If-Modified-Since': last_sync.isoformat(),
        'order': 'UpdatedDateUTC DESC',
        'page': 1
    }

    while True:
        response = api_request(endpoint, params)
        records = response.get(entity_type, [])

        if not records:
            break

        # Transform and upsert
        for record in records:
            transformed = transform_record(record)
            upsert_to_supabase(transformed, composite_key)

        params['page'] += 1

    # Update sync metadata
    update_sync_timestamp(entity_type, datetime.utcnow())
```

### Pattern 2: Full Refresh (Report-Based Data)

**Used For**: P&L Reports, Budget Summary
**Frequency**: Every 2 hours (reports) or Daily (budgets)
**Implementation**:

```python
def full_refresh_report(report_endpoint, params):
    # Fetch full report
    report_data = api_request(report_endpoint, params)

    # Parse report structure
    parsed_data = parse_report_rows(report_data)

    # Truncate existing data for period
    truncate_period_data(params['fromDate'], params['toDate'])

    # Bulk insert new data
    bulk_insert_to_supabase(parsed_data)
```

### Pattern 3: Master Data Refresh

**Used For**: Contacts, Staff, Tasks, Categories
**Frequency**: Daily
**Implementation**:

```python
def master_data_refresh(endpoint, entity_type):
    # Fetch all active records
    all_records = fetch_all_pages(endpoint)

    # Soft delete records not in response
    existing_ids = get_existing_ids(entity_type)
    returned_ids = [r['id'] for r in all_records]
    deleted_ids = set(existing_ids) - set(returned_ids)

    soft_delete_records(deleted_ids)

    # Upsert all records
    for record in all_records:
        upsert_to_supabase(record)
```

---

**Validation Needs**: Load testing with realistic API call volumes to validate rate limiting. Webhook reliability testing with simulated failures. Security testing of signed embed URLs. Integration testing with actual Xero/XPM sandbox environments.

---
