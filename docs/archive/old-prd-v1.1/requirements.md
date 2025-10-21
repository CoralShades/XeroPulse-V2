# Requirements

### Functional

**FR1:** The system shall authenticate to Xero API using OAuth2 and extract financial data (invoices, contacts, transactions, payments, accounts, budgets) via scheduled n8n workflows.

**FR2:** The system shall authenticate to XPM/Workflow Max API and extract practice management data (jobs, time entries, costs, billable rates, WIP) for integration with financial data.

**FR3:** The system shall sync data from all connected sources (Xero, XPM, Suntax) to Supabase PostgreSQL database every 2 hours with automated retry logic on failures.

**FR4:** The system shall provide 8 specialized dashboards via Apache Superset:
- Dashboard 1: Income vs Expenses (cash flow with 8-week rolling averages)
- Dashboard 2: Monthly Invoicing to Budget (actual vs budget comparison)
- Dashboard 3: YTD/MTD View (time-aggregated performance toggle)
- Dashboard 4: Work In Progress by Team (unbilled WIP with aging breakdown)
- Dashboard 5: ATO Lodgment Status (tax compliance by client type)
- Dashboard 6: Services Analysis (service line profitability metrics)
- Dashboard 7: Debtors/AR Aging (collections monitoring with DSO trends)
- Dashboard 8: Client Recoverability (client-level WIP and profitability)

**FR5:** The MVP shall deliver Dashboards 1, 2, and 7 (Xero-only data) by October 31, 2025, with remaining dashboards delivered in Month 2.

**FR6:** The system shall provide secure user authentication with email/password login, password reset workflow, and session management via Supabase Auth.

**FR7:** The system shall implement role-based access control (RBAC) with minimum three roles: executives (all dashboard access), managers (subset access), and staff (operational dashboards only).

**FR8:** The system shall provide user management UI allowing administrators to add/remove users, assign roles, and manage dashboard permissions.

**FR9:** The Next.js web portal shall display only dashboards authorized for the logged-in user's role, with embedded Superset visualizations via iframe or SDK.

**FR10:** The system shall calculate and display Work In Progress (WIP) values using formula: (Time Value + Billable Costs) - Progress Invoices, with aging breakdown by team.

**FR11:** The system shall track service line profitability metrics including Time Added $, Invoiced Amount, Net Write-Ups, Time Revenue, and Average Charge Rate across service categories (EOFY, SMSF, Bookkeeping, ITR, BAS, Advisory, ASIC, FBT, Client Service, Tax Planning).

**FR12:** The system shall provide Accounts Receivable aging analysis with buckets (<30 days, 31-60 days, 61-90 days, 90+ days), DSO trends, and top debtors list.

**FR13:** The system shall log sync execution status, errors, and data freshness timestamps for monitoring and troubleshooting.

**FR14:** The system shall support responsive design for desktop and tablet viewing (1024px+ screen width) with basic mobile browser compatibility (view-only, no optimization for MVP).

**FR15:** The system shall display last updated timestamp on all dashboards to indicate data freshness (2-hour sync interval).

### Non-Functional

**NFR1:** Dashboard load time shall be <3 seconds for 95% of requests under normal operating conditions with 20 concurrent users.

**NFR2:** Data sync success rate shall maintain 95%+ reliability over rolling 7-day periods, completing within 2-hour window.

**NFR3:** System uptime shall exceed 99% availability (less than 7.2 hours downtime per month) for production environment.

**NFR4:** Total monthly operating costs shall remain under $20 AUD/month, targeting $15/month baseline (VPS + Supabase + domain + services).

**NFR5:** All data transmission shall use HTTPS/TLS encryption; credentials shall be stored as environment variables with n8n credential encryption.

**NFR6:** Supabase shall provide encrypted storage at rest (AES-256) for all financial data.

**NFR7:** User passwords shall be hashed using bcrypt via Supabase Auth with secure session management using JWT tokens.

**NFR8:** The system shall support 20 simultaneous users without performance degradation during dashboard viewing.

**NFR9:** Database queries for dashboard rendering shall complete in <1 second for most visualizations.

**NFR10:** The platform shall comply with Xero API rate limits (60 requests/minute, 10,000 requests/day) through batching and exponential backoff on 429 errors.

**NFR11:** VPS infrastructure shall run Docker Compose orchestration with resource limits (n8n capped at 1.5GB RAM, Superset at 2GB RAM on 4GB VPS minimum).

**NFR12:** The codebase shall use monorepo structure with version-controlled n8n workflows, Superset dashboard exports, and infrastructure-as-code for reproducible deployments.

**NFR13:** The system shall implement automated weekly VPS snapshots for disaster recovery with documented restoration procedure.

**NFR14:** Supabase database schema shall use normalized tables mirroring Xero entities with appropriate indexing for query performance optimization.

**NFR15:** The architecture shall support horizontal scaling post-MVP (Supabase Pro upgrade, larger VPS, load balancing) without requiring fundamental refactoring.

---
