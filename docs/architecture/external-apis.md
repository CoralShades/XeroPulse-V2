# External APIs

### Overview

XeroPulse integrates with three primary external APIs to deliver comprehensive financial intelligence. Each integration follows specific patterns for authentication, data retrieval, and error handling while maintaining data consistency and security throughout the ETL pipeline.

### Xero Accounting API Integration

**API Version & Endpoint**
- Xero API v3.0 (current stable version)
- Base URL: `https://api.xero.com/api.xro/3.0/`
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
- XPM API v2 (latest available)
- Base URL: `https://api.xpmpracticemanager.com/v2/`
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

**API Selection Strategy**: Xero API v3.0 chosen for stability and comprehensive endpoint coverage. XPM API v2 is the only available version for project management data. Metabase API selected for programmatic dashboard management and signed embedding capabilities.

**Authentication Patterns**: OAuth 2.0 with PKCE for Xero provides secure, user-authorized access without storing credentials. XPM API key authentication is simpler but requires secure key management. Metabase signed embedding eliminates need for user authentication while maintaining security.

**Rate Limiting Approach**: Exponential backoff with jitter for rate limit handling prevents thundering herd problems. Different strategies per API accommodate varying rate limit structures (per-second vs per-hour).

**Webhook Strategy**: Real-time webhook notifications from Xero trigger incremental syncs, reducing API calls and improving data freshness. XPM webhook support is limited, so polling fallback is required.

**Error Handling Philosophy**: Circuit breaker patterns prevent cascade failures when external APIs are down. Graceful degradation allows dashboard viewing even when sync is temporarily unavailable.

**Key Assumptions**: Xero API rate limits remain at current levels (10k/day). XPM API v3 will maintain backward compatibility when available. Metabase signed embedding supports row-level security parameters. Webhook delivery from external APIs is reliable but not guaranteed.

**Validation Needs**: Load testing with realistic API call volumes to validate rate limiting. Webhook reliability testing with simulated failures. Security testing of signed embed URLs. Integration testing with actual Xero/XPM sandbox environments.

---
Perfect! Continuing to the **Core Workflows** section.
