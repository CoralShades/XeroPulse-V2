# Epic 1: Foundation & Data Pipeline Infrastructure

**Epic Goal:**

Establish the technical foundation for XeroPulse by provisioning VPS infrastructure, deploying containerized n8n and Metabase services, integrating Xero API with OAuth2 authentication, implementing automated 2-hour data sync to Supabase PostgreSQL, and delivering the first production-ready dashboard (Income vs Expenses) with basic user authentication. This epic proves the end-to-end technical stack (Xero → n8n → Supabase → Metabase → Next.js) while delivering immediate value to stakeholders through live financial insights from real Xero data.

### Story 1.1: Provision VPS Infrastructure and Docker Environment

**As a** DevOps engineer,
**I want** a production VPS with Docker Compose orchestration configured,
**So that** we have a secure, monitored hosting environment for n8n and Metabase services.

#### Acceptance Criteria

1. VPS provisioned on Hetzner Cloud (4GB RAM, 2 vCPU, 40GB storage) or DigitalOcean equivalent
2. SSH access configured with key-based authentication (password login disabled)
3. Basic firewall rules implemented (allow ports 22, 80, 443; deny all other inbound traffic)
4. Docker and Docker Compose installed and verified operational
5. HTTPS/SSL configured with Let's Encrypt wildcard certificate for domain
6. Basic monitoring established (CPU, RAM, disk usage alerts via simple script or free monitoring service)
7. Weekly automated VPS snapshot schedule configured
8. Documentation created: VPS access credentials, firewall rules, monitoring setup

### Story 1.2: Deploy n8n Workflow Automation Service

**As a** data engineer,
**I want** n8n deployed on VPS with persistent storage and web UI access,
**So that** I can build and schedule Xero data sync workflows.

#### Acceptance Criteria

1. n8n container running via Docker Compose with persistent volume for workflow storage
2. n8n web UI accessible at https://n8n.[domain] with HTTPS enabled
3. Basic authentication configured for n8n UI (username/password protection)
4. n8n credential encryption enabled with environment variable key
5. Docker resource limits configured (1.5GB RAM cap for n8n container)
6. n8n service auto-restarts on failure (Docker restart policy: unless-stopped)
7. Workflow storage directory backed up in weekly VPS snapshot
8. Test workflow created and executed successfully ("Hello World" HTTP request)

### Story 1.3: Configure Supabase Project and Database Schema

**As a** database administrator,
**I want** Supabase project initialized with normalized schema for Xero financial data,
**So that** n8n workflows can load synchronized data for dashboard queries.

#### Acceptance Criteria

1. Supabase project created with AU/NZ region selected for data residency
2. PostgreSQL database schema created with normalized tables: `invoices`, `line_items`, `contacts`, `transactions`, `payments`, `accounts`, `budgets`
3. Primary keys and foreign key relationships defined (e.g., `line_items.invoice_id` references `invoices.id`)
4. Indexes created on frequently filtered fields: `contact_id`, `invoice_date`, `payment_date`, `status` fields
5. Database migration files version-controlled in monorepo `/apps/web/supabase/migrations/`
6. Supabase connection credentials (host, database, user, password) documented securely
7. Test data inserted manually to verify schema (5 sample invoices with line items)
8. Database storage usage monitored (baseline measurement recorded, alert set for 400MB threshold)

### Story 1.4: Integrate Xero API with OAuth2 Authentication

**As a** data engineer,
**I want** n8n workflow successfully authenticating to Xero API and fetching financial data,
**So that** we can extract invoices, contacts, transactions, payments, and accounts for dashboard use.

#### Acceptance Criteria

1. Xero developer account created with OAuth2 app credentials (Client ID, Client Secret)
2. n8n Xero OAuth2 credentials configured and successfully authorized (OAuth flow completed)
3. Test workflow created fetching 100 invoices from production Xero organization
4. Xero API rate limit handling implemented (exponential backoff on 429 errors, batch requests where possible)
5. Workflow successfully extracts data from minimum 5 Xero API endpoints: Invoices, Contacts, Transactions (Bank Transactions), Payments, Accounts
6. Data structure validated (JSON responses match expected Xero API schema)
7. Error handling tested (network failures, invalid credentials, API rate limits trigger appropriate retries/alerts)
8. Documentation created: Xero API endpoints used, OAuth2 setup steps, rate limit strategy

### Story 1.5: Build Automated Xero-to-Supabase ETL Workflow

**As a** data engineer,
**I want** n8n workflow automatically syncing Xero financial data to Supabase every 2 hours,
**So that** dashboards display fresh data without manual intervention.

#### Acceptance Criteria

1. n8n workflow scheduled to run every 2 hours (cron: `0 */2 * * *`)
2. Workflow extracts data from Xero API endpoints: Invoices, Line Items, Contacts, Transactions, Payments, Accounts, Budgets
3. Data transformation logic implemented: Map Xero JSON to Supabase table columns, handle null values, parse dates correctly
4. Upsert logic configured: Update existing records if changed, insert new records, avoid duplicates
5. Sync execution logs generated: timestamp, records processed, errors encountered, duration
6. Workflow completes within 30 minutes for typical dataset (95% of syncs within 2-hour window)
7. Error handling: Retry failed API calls 3 times with exponential backoff, log failures for manual review
8. Success criteria: 7 consecutive days with 95%+ successful sync executions (tested Week 2)
9. Data freshness timestamp recorded in Supabase (`last_sync_at` metadata table)

### Story 1.6: Deploy Metabase Dashboard Engine

**As a** BI analyst,
**I want** Metabase deployed and connected to Supabase PostgreSQL,
**So that** I can build interactive dashboards from synchronized Xero data.

#### Acceptance Criteria

1. Metabase container running via Docker Compose with persistent volume for metadata storage
2. Metabase web UI accessible at https://metabase.[domain] with HTTPS enabled
3. Metabase connected to Supabase PostgreSQL database (connection string configured, test query successful)
4. Admin user created for Metabase with documented credentials
5. Docker resource limits configured (2GB RAM cap for Metabase container)
6. Metabase service auto-restarts on failure (Docker restart policy: unless-stopped)
7. Basic RBAC configured in Metabase (roles: Admin, Dashboard Viewer created)
8. Test chart created from Supabase data (e.g., simple bar chart of invoice totals by month)
9. Query result caching enabled (15-minute cache TTL to reduce database load)

### Story 1.7: Build Income vs Expenses Dashboard (Dashboard 1)

**As a** finance team member,
**I want** an interactive dashboard showing cash flow with income and expense trends,
**So that** I can monitor weekly financial performance and 8-week rolling averages.

#### Acceptance Criteria

1. Metabase dashboard created with title "Income vs Expenses"
2. Chart 1: Weekly income trend line (source: Xero Payments API, filtered for invoice payments received)
3. Chart 2: Weekly expenses trend line (source: Xero Payments API, filtered for bill payments made)
4. Chart 3: 8-week rolling average calculation for wages expense (source: Xero Transactions, filtered by account category)
5. Chart 4: 8-week rolling average for general expenses (source: Xero Transactions, aggregated by expense categories)
6. Date range filter widget (default: last 6 months, user-adjustable)
7. KPI cards displaying: Total Income (current period), Total Expenses (current period), Net Cash Flow (Income - Expenses)
8. Dashboard loads in <3 seconds with 6 months of data
9. Visual design: Clean layout, color-coded income (green) vs expenses (red), clear labels and legends
10. "Last updated" timestamp displayed prominently (sourced from `last_sync_at` metadata)
11. Dashboard exported to version control (`/apps/metabase-config/dashboards/dashboard-1-income-expenses.json`)

### Story 1.8: Implement Basic Authentication with Supabase Auth

**As a** platform administrator,
**I want** secure email/password authentication enabled,
**So that** only authorized users can access dashboards via Next.js portal.

#### Acceptance Criteria

1. Supabase Auth enabled with email/password provider configured
2. User table created in Supabase with fields: `id`, `email`, `role` (enum: executive, manager, staff), `created_at`, `last_login`
3. Password policies configured: Minimum 8 characters, requires uppercase, lowercase, number
4. Password reset workflow enabled via Supabase Auth (email-based reset link)
5. Test users created for 3 roles: 1 executive, 1 manager, 1 staff (for development/testing)
6. Session management configured: JWT tokens with 24-hour expiration, refresh token enabled
7. Security: Passwords hashed via bcrypt (Supabase default), credentials stored securely
8. Authentication tested: Login successful, logout clears session, password reset flow completes end-to-end

### Story 1.9: Build Minimal Next.js Portal with Dashboard Embedding

**As a** dashboard user,
**I want** a web portal where I can log in and view the Income vs Expenses dashboard,
**So that** I can access financial insights without navigating multiple tools.

#### Acceptance Criteria

1. Next.js 15 project initialized with App Router, Tailwind CSS, shadcn/ui components
2. Login page implemented: Email/password form integrated with Supabase Auth client
3. Protected dashboard route (`/dashboards/income-expenses`) requiring authentication (middleware checks session)
4. Income vs Expenses dashboard embedded via iframe from Metabase URL
5. Authentication token passed from Next.js to Metabase (seamless single sign-on, no double login)
6. Logout functionality implemented (clears session, redirects to login page)
7. Basic branding applied: XeroPulse logo, blue/gray color scheme, clean typography
8. Responsive layout for desktop (1920px) and tablet (1024px) screen sizes
9. Error handling: 401 redirect to login, 404 page for invalid routes, dashboard load failures show error message
10. Deployed to Vercel (production URL accessible, HTTPS enabled)
11. 5 internal team members successfully log in and view dashboard during Week 2 demo

---
