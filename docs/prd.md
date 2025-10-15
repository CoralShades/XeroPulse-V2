# XeroPulse Product Requirements Document (PRD)

## Goals and Background Context

### Goals

- Deliver automated financial intelligence dashboards that sync Xero/XPM/Suntax data every 2 hours to eliminate 5-10 hours weekly of manual reporting
- Launch MVP with 3 production dashboards by October 31, 2025, supporting 20 users with complete authentication and role-based access control
- Achieve 90%+ cost savings versus commercial BI platforms by maintaining total operating costs under $20 AUD/month
- Enable sub-60-second insight access for all stakeholders, replacing 3-7 day report turnaround times
- Establish scalable open-source architecture supporting 8 total dashboards with zero vendor lock-in
- Achieve 80%+ user adoption within 30 days post-launch with 99%+ data sync reliability

### Background Context

Professional services firms using Xero (accounting) and XPM/Workflow Max (practice management) face a critical gap between data collection and actionable insights. Finance teams spend 5-10 hours weekly manually extracting data, formatting reports in Excel, and distributing static snapshots that become outdated within days. Current workflows involve information overload (users see all Xero data or none), delayed insights (3-7 day lag), and no role-based access for tailored dashboards.

XeroPulse solves this through a fully open-source ETL architecture: n8n workflows sync data from Xero/XPM/Suntax APIs every 2 hours into Supabase PostgreSQL, Apache Superset generates 8 specialized dashboards (Income vs Expenses, WIP tracking, AR Aging, Service profitability, Tax compliance status, etc.), and a Next.js web portal provides secure login with granular role-based permissions. The platform achieves $15/month operating cost (98% below Power BI's $750/month) while delivering faster deployment (4 weeks vs. 3-6 months) and complete control through self-hosted infrastructure.

**Discovered Context:** Based on comprehensive analysis of dashboard mockups and requirements (22 visual references), XeroPulse addresses unique professional services needs: client billing and WIP tracking, service line profitability (EOFY, SMSF, Bookkeeping, ITR, BAS, Advisory), tax lodgment compliance status, client recoverability, and budget/cash flow monitoring.

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-10-15 | 1.0 | Initial PRD creation from Project Brief | PM Agent |

---

## Requirements

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

## User Interface Design Goals

### Overall UX Vision

XeroPulse delivers a **clean, professional dashboard portal** that prioritizes clarity and speed over complexity. The UX philosophy centers on "zero-click insights"—users log in and immediately see their role-appropriate dashboards without navigation friction. The interface adopts a **minimal chrome approach**: simple header with logo and user menu, sidebar navigation listing available dashboards, and full-width embedded Superset visualizations as the primary content.

The portal feels like a **professional financial intelligence platform**, not a generic admin panel. Visual hierarchy emphasizes data over decoration, with ample whitespace, clear typography, and subtle animations only where they aid comprehension (loading states, transitions). Users should experience a sense of **trust and confidence**—this is authoritative financial data presented with polish and precision.

**Key UX Principles:**
- **Immediate value delivery:** Dashboard loads on login (no empty state or "select a dashboard" friction)
- **Role-aware personalization:** Users never see dashboards they can't access (reduces cognitive load)
- **Performance transparency:** Loading indicators and "last updated" timestamps manage expectations around 2-hour sync lag
- **Progressive disclosure:** Simple dashboard list for most users; admin features (user management) tucked behind role-gated menu

### Key Interaction Paradigms

**1. Dashboard-Centric Navigation**
- Primary navigation is a vertical sidebar listing dashboard names (e.g., "Income vs Expenses," "AR Aging," "WIP by Team")
- Active dashboard highlighted; click switches embedded Superset view in main content area
- No multi-level menus or complex navigation trees—flat structure matches 8-dashboard scope

**2. Embedded Analytics (iframe/SDK)**
- Superset dashboards render as embedded iframes within Next.js portal
- Users interact directly with Superset visualizations (date filters, drill-downs, chart interactions) without leaving portal
- Authentication passed seamlessly from Next.js to Superset (single sign-on experience)

**3. Responsive Grid Layouts**
- Dashboards use Superset's responsive grid system for automatic layout adaptation
- Desktop (1920px): Multi-column dashboard layouts with side-by-side charts
- Tablet (1024px): Stacked layouts with preserved chart readability
- Mobile (phone screens): View-only capability acknowledged as degraded experience for MVP

**4. Role-Based Conditional Rendering**
- Middleware checks user role on every page load
- Sidebar navigation dynamically renders only authorized dashboards
- Admin menu item appears only for admin role (user management UI)

**5. Minimal User Inputs**
- No complex forms or data entry—this is a read-only analytics platform
- Primary inputs: Login form, password reset form, admin user management (add/edit users)
- Dashboard interactions handled entirely by Superset (date pickers, filters, toggles)

### Core Screens and Views

**1. Login Screen**
- Centered card layout with XeroPulse logo, email/password fields, "Forgot Password" link
- Clean, minimal design—no marketing copy or distractions
- Error states for invalid credentials displayed inline

**2. Dashboard Home (Post-Login Default View)**
- User lands on first authorized dashboard automatically
- Sidebar navigation visible with full dashboard list
- Header shows user name/email with logout dropdown

**3. Individual Dashboard Views (8 Total)**
- Full-width embedded Superset dashboard as primary content
- Breadcrumb or page title indicating current dashboard name
- "Last updated: [timestamp]" displayed prominently (builds trust around 2-hour sync)

**4. User Management Admin Panel** *(Admin role only)*
- Table view listing all users with columns: Name, Email, Role, Last Login, Actions (Edit/Delete)
- "Add User" button opens modal with fields: Email, Role dropdown, auto-generated password
- Role assignment dropdown: Executive, Manager, Staff (maps to dashboard permissions)

**5. Password Reset Flow**
- Email entry screen → Confirmation message → Email with reset link → New password entry screen
- Standard Supabase Auth flow with minimal custom UI

**6. Error States**
- 404 page for invalid routes
- "Dashboard unavailable" message if Superset sync fails or dashboard not found
- "Insufficient permissions" page if user attempts to access unauthorized dashboard

### Accessibility: WCAG AA

**Target:** WCAG 2.1 Level AA compliance (industry standard for enterprise applications)

**Key Requirements:**
- Keyboard navigation support (tab order, focus indicators, no mouse-only interactions)
- Color contrast ratios meet 4.5:1 minimum for text, 3:1 for UI components
- Alt text for logos/icons; ARIA labels for interactive elements
- Form validation errors announced to screen readers
- Responsive text sizing (users can zoom to 200% without breaking layouts)

**Rationale:** Professional services firms may have diverse user needs; AA compliance ensures accessibility without the implementation burden of AAA (which requires 7:1 contrast, sign language videos, etc.).

**Assumption:** Superset dashboards inherit accessibility from Superset's default rendering; custom accessibility work limited to Next.js portal UI.

### Branding

**Brand Identity:** Professional, trustworthy, modern financial software aesthetic

**Visual Style:**
- **Color palette:** Deep blues and grays (conveys financial professionalism and trust)
  - Primary: Deep blue (#1E3A8A or similar) for headers, CTAs, active states
  - Secondary: Slate gray (#64748B) for body text, borders
  - Accent: Subtle teal or green for success states, positive metrics
  - Background: Off-white (#F8FAFC) to reduce eye strain vs. pure white
- **Typography:**
  - Headings: Inter or similar geometric sans-serif (modern, clean)
  - Body: System font stack for performance (SF Pro on macOS, Segoe UI on Windows)
  - Dashboard text: Inherit from Superset defaults (typically Roboto or Open Sans)
- **Logo:** "XeroPulse" wordmark with subtle pulse/heartbeat icon element (suggests real-time data flow)
- **Iconography:** Minimal use of icons; where needed, use Heroicons or Lucide (consistent with modern web apps)

**Assumptions Made:**
- No existing brand guidelines provided—proposing financial software standard palette
- Logo does not exist yet—will need design (or use text-only wordmark for MVP)
- Branding should feel cohesive with Xero's UI (blue/white palette) to signal integration, but distinct enough to be standalone product

### Target Device and Platforms: Web Responsive (Desktop/Tablet Primary)

**Supported Platforms:**
- **Desktop browsers (primary):** Chrome 100+, Firefox 100+, Safari 15+, Edge 100+ on Windows 10+, macOS 11+, Linux (Ubuntu 20.04+)
- **Tablet browsers (secondary):** iPad Safari, Android Chrome on 1024px+ tablets
- **Mobile browsers (degraded experience):** iPhone Safari, Android Chrome—view-only capability, no responsive optimization for MVP

**Screen Size Optimization:**
- **Desktop (1920px+):** Multi-column dashboard layouts, optimal chart visibility
- **Laptop (1366-1920px):** Slightly condensed layouts, still comfortable viewing
- **Tablet (1024-1366px):** Stacked single-column layouts, charts sized for readability
- **Phone (<1024px):** Basic rendering without layout breaks, but suboptimal experience (small charts, horizontal scrolling possible)

**Rationale:** Professional services users primarily work on desktop/laptop during business hours; mobile optimization deferred to Phase 2 (Month 5 per roadmap).

**Deployment:** Web application only (no native mobile apps, no desktop Electron app)

---

## Technical Assumptions

### Repository Structure: Monorepo

**Decision:** Single Git repository containing all XeroPulse components.

**Structure:**
```
xeropulse/
├── apps/
│   ├── web/                 # Next.js web portal
│   ├── n8n-workflows/       # n8n workflow JSON exports (version control)
│   ├── superset-config/     # Superset dashboard exports, configuration
├── docs/                    # Architecture diagrams, deployment guides, user docs
├── infrastructure/          # Docker Compose files, deployment scripts, VPS setup
├── .bmad-core/             # BMAD agent configurations and templates
└── README.md
```

**Rationale:**
- **Team coordination:** Simpler for 1-2 developer team—all XeroPulse code in one place
- **Version control:** Changes to portal, workflows, and dashboards tracked together (easier rollbacks)
- **Deployment sync:** Infrastructure-as-code ensures reproducible deployments across environments
- **Documentation proximity:** Architecture docs live alongside code they describe

**Alternative Considered:** Polyrepo (separate repos for web, workflows, infrastructure)
- **Rejected because:** Adds coordination overhead for small team; cross-component changes require multiple PRs

### Service Architecture

**Decision:** Distributed services architecture with self-hosted components coordinated via Docker Compose on single VPS.

**Architecture Pattern:**
```
┌─────────────┐      OAuth2       ┌──────────┐
│  Xero API   │◄─────────────────►│   n8n    │ (VPS)
│  XPM API    │                   └────┬─────┘
│ Suntax API  │                        │ ETL (every 2hrs)
└─────────────┘                        ▼
┌─────────────┐                   ┌──────────┐
│   Users     │◄──────Auth────────│ Supabase │ (Cloud)
│ (Browsers)  │                   │ (DB+Auth)│
└──────┬──────┘                   └────┬─────┘
       │                               │
       │ HTTPS                         │ SQL Queries
       ▼                               ▼
┌─────────────┐    iframe embed   ┌──────────┐
│  Next.js    │◄─────────────────►│ Superset │ (VPS)
│   Portal    │  (Vercel Cloud)   │Dashboard │
└─────────────┘                   └──────────┘
```

**Components:**
- **ETL Layer:** n8n (self-hosted on VPS) - Workflow automation, API orchestration
- **Data Layer:** Supabase (cloud managed) - PostgreSQL database + authentication
- **BI Layer:** Apache Superset (self-hosted on VPS) - Dashboard engine
- **Presentation Layer:** Next.js 15 (Vercel cloud) - User-facing web portal

**Rationale:**
- **Hybrid cloud approach:** Balances cost (self-hosted n8n/Superset) with reliability (managed Supabase/Vercel)
- **Not microservices:** Single VPS runs multiple services via Docker Compose (sufficient for 20 users, simpler ops)
- **Not serverless:** ETL requires stateful workflows, long-running syncs incompatible with FaaS time limits
- **Scalability path:** Each component upgrades independently (Supabase → Pro, larger VPS, Vercel → Pro) without refactoring

**Technology Stack Details:**

**Frontend:**
- **Next.js 15** (App Router, React 19, Server Components)
  - *Rationale:* Latest stable version (12+ months old by October 2025 project start), better performance, longer support window, improved caching and async APIs
- **Tailwind CSS** (utility-first styling)
- **shadcn/ui** (accessible component library, Next.js 15 compatible)
- **Supabase Auth Client** (authentication integration)

**Backend/Database:**
- **Supabase** (PostgreSQL 14+ with Auth service)
- **n8n** (workflow automation, self-hosted)
- **Apache Superset** (BI platform, self-hosted)

**Infrastructure:**
- **VPS:** Hetzner Cloud (€4.51/month = ~$7.50 AUD, 4GB RAM minimum) or DigitalOcean ($12/month)
  - *Alternative Considered:* **GCP (Google Cloud Platform)** - Rejected due to 3-6x higher cost ($45-65/month vs $10-20/month), see "Cloud Provider Comparison" below
- **Container Orchestration:** Docker Compose (n8n + Superset on single VPS)
- **CDN/DNS:** Cloudflare (free tier)
- **SSL/TLS:** Let's Encrypt (free automated certificates)
- **Next.js Hosting:** Vercel free tier (100GB bandwidth/month, 100 serverless invocations/day)

**API Integrations:**
- **Xero API:** OAuth2 authentication, invoices, contacts, transactions, payments, accounts, budgets
- **XPM/Workflow Max API:** OAuth2/API key, jobs, time entries, costs, billable rates, WIP
- **Suntax API:** TBD (pending API availability confirmation)

### Testing Requirements

**Decision:** Unit + Integration testing with manual UAT; E2E testing deferred to post-MVP.

**Testing Strategy:**

**Unit Testing:**
- **Next.js components:** React Testing Library + Jest for critical auth/navigation components
- **API routes:** Jest for Next.js API endpoint testing (if custom endpoints created)
- **Scope:** Focus on authentication flows, role-based rendering logic, error boundaries
- **Coverage target:** 60%+ for custom code (excluding third-party components)

**Integration Testing:**
- **ETL workflows:** Manual testing of n8n workflows in Week 1-2 (Xero → Supabase data flow)
- **Dashboard rendering:** Manual verification that Superset queries return correct data
- **Authentication flow:** Test Supabase Auth → Next.js → Superset token passing
- **No automated integration tests for MVP** (time constraint; manual testing sufficient for 20-user internal deployment)

**User Acceptance Testing (Week 4):**
- **Participants:** 5+ representative users (executives, managers, staff roles)
- **Scenarios:** Login, navigate dashboards, verify data accuracy, test role permissions
- **Format:** Live sessions with test script, feedback collection
- **Success criteria:** 80%+ users rate dashboards "useful" or "very useful"

**Manual Testing Conveniences:**
- **Test users:** Pre-seeded Supabase database with test accounts for each role
- **Test data:** Sample Xero data loaded for dashboard development (Week 2)
- **Docker dev environment:** Local Docker Compose setup for n8n/Superset testing before VPS deployment

**E2E Testing (Post-MVP):**
- **Deferred to Month 2:** Playwright or Cypress for end-to-end user flows
- **Rationale:** 4-week timeline prioritizes functional delivery over test automation; internal deployment reduces risk of skipping E2E initially

**Monitoring/Observability:**
- **n8n execution logs:** Track sync success/failure rates
- **Superset query logs:** Monitor dashboard load performance
- **Vercel analytics:** Track portal page load times
- **VPS monitoring:** CPU/RAM/disk usage alerts (Docker stats, simple monitoring script)

### Additional Technical Assumptions and Requests

**Database Design:**
- **Schema:** Normalized tables mirroring Xero/XPM entities (invoices, line_items, contacts, jobs, time_entries, etc.)
- **Indexing:** Primary keys + indexes on frequently filtered fields (contact_id, date ranges, status fields)
- **Data retention:** All historical data preserved (no automatic purging); manual cleanup if approaching 500MB Supabase limit
- **Migrations:** Supabase migration files version-controlled in monorepo

**Security & Compliance:**
- **Data encryption at rest:** Supabase AES-256 (managed)
- **Data encryption in transit:** HTTPS/TLS for all communications (Let's Encrypt)
- **Credential management:** Environment variables (never committed to Git), n8n credential encryption
- **Row-Level Security:** Supabase RLS policies for database access control (if needed beyond app-level auth)
- **Password hashing:** bcrypt via Supabase Auth
- **Session management:** JWT tokens with configurable expiration
- **Data residency:** Supabase region selection (AU/NZ preferred for Australian data sovereignty if required)
- **Backup strategy:** Supabase daily automated backups (7-day retention on free tier), weekly VPS snapshots

**Performance Optimization:**
- **Database queries:** SQL aggregations in Supabase (not Python post-processing in Superset)
- **Superset caching:** Enable query result caching to reduce DB load
- **Docker resource limits:** n8n capped at 1.5GB RAM, Superset at 2GB RAM (prevents resource starvation on 4GB VPS)
- **CDN:** Cloudflare for static asset caching (Next.js images, CSS, JS)

**API Rate Limit Handling:**
- **Xero limits:** 60 req/min, 10,000 req/day
- **Strategy:** Batch requests (fetch 100 records per call), exponential backoff on 429 errors, 2-hour sync designed to stay within limits
- **Monitoring:** n8n workflow logs track rate limit errors

**Development Workflow:**
- **Local development:** Docker Compose for n8n/Superset, Supabase cloud for DB (shared dev instance), Next.js local dev server
- **Version control:** Git with feature branches, PR reviews for production changes
- **Deployment:** Manual deployment for MVP (SSH to VPS, docker-compose pull/up); CI/CD deferred to Month 2
- **Environment management:** `.env` files for local, environment variables on VPS/Vercel for production

**Cloud Provider Comparison (VPS vs GCP):**

| Factor | VPS (Hetzner/DigitalOcean) | GCP (Google Cloud Platform) | Decision |
|--------|---------------------------|----------------------------|----------|
| **Monthly Cost** | $10-20 AUD | $45-65 AUD | **VPS** |
| **Predictability** | Flat rate | Usage-based (egress charges) | **VPS** |
| **Setup Complexity** | Simple (SSH + Docker) | Moderate (multiple services, IAM) | **VPS** |
| **Monitoring** | Basic (Docker logs, manual) | Advanced (Cloud Monitoring built-in) | **GCP** |
| **Auto-scaling** | Manual VM resize | Cloud Run, autoscaling VMs | **GCP** |
| **Vendor Lock-in** | Low (Docker Compose portable) | Moderate (GCP-specific services) | **VPS** |
| **Sufficient for 20 users?** | ✅ Yes | ✅ Yes (but overkill) | **VPS** |

**Decision: VPS (Hetzner preferred at €4.51/month, DigitalOcean fallback at $12/month)**

**Rationale:**
- **Cost alignment:** VPS hits $15/month target; GCP would be 3-6x over budget
- **Simplicity:** Docker Compose on single VM vs. orchestrating Cloud Run, Cloud SQL, Compute Engine
- **Predictable billing:** No surprise egress charges (VPS includes 4-20TB bandwidth)
- **MVP-appropriate:** GCP's power (auto-scaling, multi-region) not needed for 20-user internal tool
- **Project Brief constraint:** Budget limit ($200 max, $15 target) drives VPS choice

**GCP Reconsidered If:**
- Scale exceeds 100+ users (auto-scaling valuable)
- Need BigQuery integration for advanced analytics
- Enterprise security requirements (VPC Service Controls, Cloud Armor)
- Operating budget increases to $100-200/month (GCP benefits justify cost)

---

## Epic List

### Epic 1: Foundation & Data Pipeline Infrastructure
*Goal:* Establish VPS infrastructure, deploy n8n and Superset, integrate Xero API with automated 2-hour sync to Supabase, implement basic authentication, and deliver first production dashboard (Income vs Expenses) to prove end-to-end technical stack.

### Epic 2: MVP Dashboard Suite & Portal Launch
*Goal:* Complete remaining 2 MVP dashboards (Monthly Invoicing to Budget, Debtors/AR Aging), build Next.js role-based portal with embedded Superset visualizations, implement user management system, onboard 20 users, and launch production platform by October 31, 2025.

### Epic 3: Complete Dashboard Suite with XPM Integration
*Goal:* Integrate XPM/Workflow Max API for practice management data, build remaining 5 dashboards (YTD/MTD View, Work In Progress by Team, ATO Lodgment Status, Services Analysis, Client Recoverability), enhance authentication with admin panel and security hardening, and deliver complete 8-dashboard platform.

### Epic 4: Platform Refinement & Advanced Features
*Goal:* Optimize dashboard performance based on user feedback, implement data export capabilities, add mobile-responsive views, explore real-time sync via webhooks, establish staging environment, and iterate based on measured success metrics (adoption, time savings, user satisfaction).

---

## Epic 1: Foundation & Data Pipeline Infrastructure

**Epic Goal:**

Establish the technical foundation for XeroPulse by provisioning VPS infrastructure, deploying containerized n8n and Apache Superset services, integrating Xero API with OAuth2 authentication, implementing automated 2-hour data sync to Supabase PostgreSQL, and delivering the first production-ready dashboard (Income vs Expenses) with basic user authentication. This epic proves the end-to-end technical stack (Xero → n8n → Supabase → Superset → Next.js) while delivering immediate value to stakeholders through live financial insights from real Xero data.

### Story 1.1: Provision VPS Infrastructure and Docker Environment

**As a** DevOps engineer,
**I want** a production VPS with Docker Compose orchestration configured,
**So that** we have a secure, monitored hosting environment for n8n and Superset services.

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

### Story 1.6: Deploy Apache Superset Dashboard Engine

**As a** BI analyst,
**I want** Apache Superset deployed and connected to Supabase PostgreSQL,
**So that** I can build interactive dashboards from synchronized Xero data.

#### Acceptance Criteria

1. Superset container running via Docker Compose with persistent volume for metadata storage
2. Superset web UI accessible at https://superset.[domain] with HTTPS enabled
3. Superset connected to Supabase PostgreSQL database (connection string configured, test query successful)
4. Admin user created for Superset with documented credentials
5. Docker resource limits configured (2GB RAM cap for Superset container)
6. Superset service auto-restarts on failure (Docker restart policy: unless-stopped)
7. Basic RBAC configured in Superset (roles: Admin, Dashboard Viewer created)
8. Test chart created from Supabase data (e.g., simple bar chart of invoice totals by month)
9. Query result caching enabled (15-minute cache TTL to reduce database load)

### Story 1.7: Build Income vs Expenses Dashboard (Dashboard 1)

**As a** finance team member,
**I want** an interactive dashboard showing cash flow with income and expense trends,
**So that** I can monitor weekly financial performance and 8-week rolling averages.

#### Acceptance Criteria

1. Superset dashboard created with title "Income vs Expenses"
2. Chart 1: Weekly income trend line (source: Xero Payments API, filtered for invoice payments received)
3. Chart 2: Weekly expenses trend line (source: Xero Payments API, filtered for bill payments made)
4. Chart 3: 8-week rolling average calculation for wages expense (source: Xero Transactions, filtered by account category)
5. Chart 4: 8-week rolling average for general expenses (source: Xero Transactions, aggregated by expense categories)
6. Date range filter widget (default: last 6 months, user-adjustable)
7. KPI cards displaying: Total Income (current period), Total Expenses (current period), Net Cash Flow (Income - Expenses)
8. Dashboard loads in <3 seconds with 6 months of data
9. Visual design: Clean layout, color-coded income (green) vs expenses (red), clear labels and legends
10. "Last updated" timestamp displayed prominently (sourced from `last_sync_at` metadata)
11. Dashboard exported to version control (`/apps/superset-config/dashboards/dashboard-1-income-expenses.json`)

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
4. Income vs Expenses dashboard embedded via iframe from Superset URL
5. Authentication token passed from Next.js to Superset (seamless single sign-on, no double login)
6. Logout functionality implemented (clears session, redirects to login page)
7. Basic branding applied: XeroPulse logo, blue/gray color scheme, clean typography
8. Responsive layout for desktop (1920px) and tablet (1024px) screen sizes
9. Error handling: 401 redirect to login, 404 page for invalid routes, dashboard load failures show error message
10. Deployed to Vercel (production URL accessible, HTTPS enabled)
11. 5 internal team members successfully log in and view dashboard during Week 2 demo

---

## Epic 2: MVP Dashboard Suite & Portal Launch

**Epic Goal:**

Complete the MVP by building the remaining two dashboards (Monthly Invoicing to Budget and Debtors/AR Aging), developing a full-featured Next.js web portal with role-based navigation and user management capabilities, implementing comprehensive RBAC to control dashboard access by user role, onboarding all 20 production users, conducting user acceptance testing with representative stakeholders, and launching the production platform by October 31, 2025. This epic transforms the technical proof-of-concept from Epic 1 into a professional, multi-user financial intelligence platform ready for organizational adoption.

### Story 2.1: Build Monthly Invoicing to Budget Dashboard (Dashboard 2)

**As a** finance manager,
**I want** a dashboard comparing actual invoicing performance against budget targets by month,
**So that** I can track revenue goals and identify budget variances quickly.

#### Acceptance Criteria

1. Superset dashboard created with title "Monthly Invoicing to Budget"
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
12. Dashboard exported to version control (`/apps/superset-config/dashboards/dashboard-2-budget.json`)

### Story 2.2: Build Debtors/AR Aging Dashboard (Dashboard 7)

**As a** accounts receivable manager,
**I want** a dashboard showing aged receivables with aging buckets and debtor details,
**So that** I can prioritize collection efforts and monitor DSO trends.

#### Acceptance Criteria

1. Superset dashboard created with title "Debtors/AR Aging"
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
13. Dashboard exported to version control (`/apps/superset-config/dashboards/dashboard-7-ar-aging.json`)

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
7. Superset RBAC configured: Map Supabase roles to Superset dashboard permissions (executives → all dashboards, managers → subset, staff → limited)
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
5. Click dashboard name in sidebar loads embedded Superset dashboard in main content area
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
   - Superset query performance: Dashboard load times tracked, alert on >5 second loads
   - Vercel Next.js monitoring: Built-in Vercel analytics tracking page views, errors
3. Backup verification: Weekly VPS snapshots tested (restore snapshot to verify integrity)
4. Supabase database size monitored: Current usage displayed, alert at 400MB (80% of 500MB free tier)
5. Uptime monitoring: External service (UptimeRobot or similar) pings portal URL every 5 minutes, alerts on downtime
6. Alert channels configured: Email notifications to admin team for critical alerts
7. Incident response runbook documented: Common issues and remediation steps (n8n sync failure, Superset down, VPS resource exhaustion, etc.)
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
   - Superset cache hit rate monitored (target: >60% cache hits to reduce DB load)
   - Large datasets causing slow renders (implement pagination or query limits)
3. Optimizations implemented:
   - Database query optimization: Add missing indexes on filtered columns
   - Superset query result caching tuned (increase cache TTL if data freshness allows)
   - Dashboard chart limits: Cap table rows to 100, use pagination for detail views
4. Post-optimization measurements:
   - 95%+ of dashboard loads complete in <3 seconds (measured over 7 days)
   - Database query times reduced by 30%+ on average
   - VPS CPU/RAM usage remains <70% during peak usage hours
5. Performance metrics documented as baseline for Month 2-3 monitoring
6. User satisfaction check: No performance complaints in support channel during Week 5

---

## Epic 3: Complete Dashboard Suite with XPM Integration

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

1. Superset dashboard created with title "YTD/MTD Budget Performance"
2. Toggle widget (filter): User selects "MTD" (Month-to-Date) or "YTD" (Year-to-Date)
3. Chart 1: Actual vs Budget comparison chart (extends Dashboard 2 logic) with MTD or YTD aggregation based on toggle
4. Chart 2: Variance percentage displayed: ((Actual - Budget) / Budget) × 100
5. Chart 3: Performance trend: Compare current MTD/YTD to same period prior year
6. KPI cards: Total Actual, Total Budget, Variance $, Variance %
7. Date context displayed: "Month to Date: October 1-15, 2025" or "Year to Date: Jan 1 - Oct 15, 2025"
8. Dashboard loads in <3 seconds with YTD data
9. Visual design: Consistent with Dashboards 1-2 styling
10. "Last updated" timestamp displayed
11. Dashboard exported to version control (`/apps/superset-config/dashboards/dashboard-3-ytd-mtd.json`)

### Story 3.5: Build Work In Progress by Team Dashboard (Dashboard 4)

**As a** practice manager,
**I want** a dashboard showing unbilled WIP across service teams with aging breakdown,
**So that** I can identify bottlenecks in billing and prioritize WIP conversion to invoices.

#### Acceptance Criteria

1. Superset dashboard created with title "Work In Progress by Team"
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
13. Dashboard exported to version control (`/apps/superset-config/dashboards/dashboard-4-wip-team.json`)

### Story 3.6: Build ATO Lodgment Status Dashboard (Dashboard 5)

**As a** tax compliance manager,
**I want** a dashboard tracking tax lodgment status by client type,
**So that** I can monitor compliance obligations and identify overdue lodgments.

#### Acceptance Criteria

1. **PREREQUISITE CONFIRMED:** Suntax API availability validated (if API unavailable, this story deferred or replaced with manual data entry approach)
2. Superset dashboard created with title "ATO Lodgment Status"
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
13. Dashboard exported to version control (`/apps/superset-config/dashboards/dashboard-5-ato-lodgment.json`)
14. **NOTE:** If Suntax API unavailable, implement manual CSV upload workflow for lodgment status data as interim solution

### Story 3.7: Build Services Analysis Dashboard (Dashboard 6)

**As a** practice manager,
**I want** a dashboard analyzing service line profitability with time added, invoiced amounts, and charge rates,
**So that** I can identify most/least profitable service offerings and optimize resource allocation.

#### Acceptance Criteria

1. Superset dashboard created with title "Services Analysis"
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
13. Dashboard exported to version control (`/apps/superset-config/dashboards/dashboard-6-services.json`)

### Story 3.8: Build Client Recoverability Dashboard (Dashboard 8)

**As a** practice manager,
**I want** a dashboard showing client-level WIP and profitability tracking,
**So that** I can identify problematic clients with high WIP or low recoverability rates.

#### Acceptance Criteria

1. Superset dashboard created with title "Client Recoverability"
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
15. Dashboard exported to version control (`/apps/superset-config/dashboards/dashboard-8-recoverability.json`)

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

## Epic 4: Platform Refinement & Advanced Features

**Epic Goal:**

Optimize XeroPulse based on real-world usage data and user feedback collected during Months 1-2, implement advanced features that enhance platform value (data export, mobile-responsive views, real-time sync exploration), establish a staging environment for safer deployments, measure success against defined KPIs (adoption rate, time savings, user satisfaction), and create a sustainable foundation for long-term platform evolution. This epic transforms XeroPulse from a feature-complete product into a mature, optimized platform with documented processes for continuous improvement and future expansion.

### Story 4.1: Collect and Analyze User Feedback

**As a** product manager,
**I want** structured user feedback collected and analyzed from 30+ days of production usage,
**So that** we prioritize optimization and feature enhancements based on actual user needs.

#### Acceptance Criteria

1. User feedback survey deployed to all 20 users (via email or in-portal banner) at 30-day post-launch mark
2. Survey questions covering:
   - Overall satisfaction (1-5 scale)
   - Dashboard usefulness by dashboard (which dashboards used most/least)
   - Performance perception (load times acceptable? Any slowness?)
   - Feature requests (what's missing? What would make dashboards more useful?)
   - Usability issues (any confusing UI, navigation problems, errors encountered?)
   - Data accuracy (do numbers match expectations? Any discrepancies noticed?)
3. Response rate target: 70%+ of users complete survey (14+ of 20 users)
4. Usage analytics analyzed:
   - Dashboard view counts (which dashboards most popular?)
   - User login frequency (daily, weekly, monthly active users)
   - Feature usage (filters, drill-downs, date ranges)
   - Error logs reviewed (any recurring errors or crashes?)
5. Finance team interview: Quantify time savings achieved (actual hours reclaimed vs. 5-10 hour target)
6. Feedback synthesized into prioritized backlog:
   - High priority: Blockers, critical usability issues, widely requested features
   - Medium priority: Nice-to-have enhancements, performance improvements
   - Low priority: Edge cases, individual preferences
7. Stakeholder presentation: Feedback summary with recommended priorities for Month 3-4
8. Documentation: User feedback report with quotes, statistics, prioritized recommendations

### Story 4.2: Optimize Dashboard Query Performance

**As a** platform engineer,
**I want** database queries and dashboard rendering optimized based on production usage patterns,
**So that** all dashboards consistently load in <3 seconds meeting performance SLA.

#### Acceptance Criteria

1. Slow query analysis: Identify SQL queries taking >2 seconds (from Superset query logs)
2. Database optimization implemented:
   - Add missing indexes on frequently filtered columns (identified from slow query analysis)
   - Rewrite complex queries using CTEs, subqueries, or materialized views for better performance
   - Implement query result caching in Superset (tune cache TTL based on data freshness requirements)
3. Chart optimization:
   - Limit row counts for large datasets (e.g., tables capped at 100 rows with pagination)
   - Use aggregated queries instead of fetching all records and aggregating in Superset
   - Optimize date range filters (default to 6 months instead of "all time" if causing slowness)
4. Superset configuration tuning:
   - Increase cache hit rate to >70% (measure before/after optimization)
   - Configure query timeout thresholds (kill runaway queries after 30 seconds)
   - Enable SQL Lab query history limits (prevent unbounded memory usage)
5. VPS resource optimization:
   - Review Docker resource limits (adjust n8n/Superset RAM caps if needed)
   - Monitor CPU/RAM during peak usage (ensure <70% utilization)
   - Consider VPS upgrade to 8GB RAM if 4GB insufficient (document decision rationale)
6. Performance testing:
   - Simulate 20 concurrent users loading dashboards (load testing with JMeter or similar)
   - Measure 95th percentile load times before and after optimization
7. Success criteria:
   - 95%+ of dashboard loads complete in <3 seconds (measured over 7 days post-optimization)
   - Database query times reduced by 30%+ on average
   - Zero timeout errors or dashboard load failures during testing period
8. Documentation: Performance optimization changelog, query tuning decisions, monitoring baselines

### Story 4.3: Implement PDF Export for Dashboards

**As a** dashboard user,
**I want** ability to export dashboards as PDF reports,
**So that** I can share insights with stakeholders who don't have portal access or prefer offline reports.

#### Acceptance Criteria

1. Export functionality added to each dashboard: "Export to PDF" button in dashboard header or toolbar
2. PDF generation implemented using Superset's built-in export feature or headless browser (Puppeteer/Playwright)
3. PDF layout optimized:
   - Dashboard title and date range included in header
   - All charts render correctly in PDF (no truncation, proper sizing)
   - Footer displays: "Generated from XeroPulse on [date/time]" and "Data as of [last sync timestamp]"
4. PDF quality settings: High resolution (300 DPI) for print quality
5. Export performance: PDF generation completes within 10 seconds for typical dashboard
6. File naming convention: `{dashboard-name}_{date-range}_{timestamp}.pdf` (e.g., `Income-vs-Expenses_2025-Q1_2025-10-15.pdf`)
7. Download delivery: Browser downloads PDF file automatically after generation
8. Email distribution (optional enhancement): "Email PDF" option sends report to specified email addresses
9. Error handling: If export fails, user sees error message with retry option
10. Testing: All 8 dashboards successfully export to PDF with correct formatting
11. User documentation updated: "How to Export Dashboards" guide added to help section

### Story 4.4: Implement Excel/CSV Data Export

**As a** power user,
**I want** ability to export dashboard data as Excel or CSV files,
**So that** I can perform custom analysis, create pivot tables, or integrate data into other tools.

#### Acceptance Criteria

1. Data export functionality added: "Export Data" dropdown menu with options: CSV, Excel (.xlsx)
2. Export scope options:
   - "Current View" exports data currently displayed on dashboard (respects filters, date ranges)
   - "Full Dataset" exports all underlying data (ignores filters, may be large)
3. CSV export: Plain text format, comma-delimited, headers included
4. Excel export: Formatted .xlsx file with:
   - Sheet name matching dashboard/chart name
   - Column headers formatted (bold, background color)
   - Date columns formatted correctly
   - Number columns formatted with appropriate decimal places and currency symbols
5. Multi-chart dashboards: Export creates Excel file with multiple sheets (one per chart)
6. Row limits: Export capped at 10,000 rows to prevent performance issues (warning displayed if dataset exceeds limit)
7. File naming convention: `{dashboard-name}_data_{timestamp}.csv` or `.xlsx`
8. Download delivery: Browser downloads file automatically after generation
9. Performance: Export completes within 10 seconds for datasets <5,000 rows
10. Testing: All 8 dashboards successfully export data with correct formatting and complete data
11. User documentation updated: "How to Export Data" guide added to help section

### Story 4.5: Implement Mobile-Responsive Dashboard Views

**As a** executive user,
**I want** dashboards optimized for mobile phone viewing,
**So that** I can check financial insights on-the-go from my iPhone or Android device.

#### Acceptance Criteria

1. Portal responsive design enhanced for phone screens (<768px width)
2. Mobile navigation: Hamburger menu replaces sidebar on mobile devices
3. Dashboard layouts optimized for mobile:
   - Charts stack vertically (single column layout)
   - Chart sizing adjusted for mobile screens (legible without pinch-zoom)
   - KPI cards remain readable (font sizes appropriate)
   - Tables use horizontal scroll or collapsed view for many columns
4. Touch interactions optimized:
   - Filter widgets accessible via touch (date pickers, dropdowns work correctly)
   - Chart interactions work with touch (tap to drill-down, swipe gestures if applicable)
   - No hover-dependent features (tooltips appear on tap instead)
5. Performance on mobile: Dashboard loads in <5 seconds on 4G connection (slightly relaxed from desktop 3-second SLA)
6. Testing on real devices: Verified on iPhone (iOS Safari), Android (Chrome), minimum screen sizes (iPhone SE 375px, Android 360px)
7. Responsive breakpoints defined:
   - Desktop: 1024px+ (multi-column layouts)
   - Tablet: 768-1023px (single/dual column, collapsible sidebar)
   - Mobile: <768px (single column, hamburger menu)
8. User testing: 3+ users successfully navigate dashboards on mobile devices without major usability issues
9. Known limitations documented: Some complex charts may require landscape orientation for optimal viewing
10. User documentation: "Mobile Access" guide explaining best practices for phone viewing

### Story 4.6: Explore Real-Time Sync with Xero Webhooks

**As a** data engineer,
**I want** feasibility study and prototype for real-time Xero data sync using webhooks,
**So that** we can evaluate reducing data latency from 2 hours to near-real-time for future enhancement.

#### Acceptance Criteria

1. Xero webhook documentation reviewed: Confirm Xero plan supports webhooks (may require Premium/Ultimate tier)
2. Webhook events identified: Which Xero events would trigger sync (invoice created, payment received, contact updated, etc.)
3. Webhook receiver endpoint created: n8n webhook node or custom Next.js API route to receive Xero webhook notifications
4. Webhook authentication implemented: Verify webhook signatures to ensure requests from Xero (not spoofed)
5. Incremental sync logic designed: Update only changed records (not full refresh) when webhook received
6. Prototype workflow built: Xero invoice created → Webhook → n8n → Supabase update → Dashboard refreshes within 1 minute
7. Testing: Create test invoice in Xero, verify webhook fires and dashboard updates within acceptable timeframe
8. Cost-benefit analysis:
   - Xero plan upgrade cost (if required): $X/month
   - Development effort: Y hours to implement full webhook integration
   - Infrastructure changes: Webhook endpoint hosting, monitoring, error handling
   - User value: How critical is real-time data? Do business decisions require <2 hour latency?
9. Recommendation documented:
   - **Option 1:** Implement webhooks now (if high value, low cost/complexity)
   - **Option 2:** Defer to Month 6+ (if current 2-hour sync sufficient)
   - **Option 3:** Do not implement (if Xero plan doesn't support or cost too high)
10. Stakeholder decision: Present findings and recommendation, get approval for next steps

### Story 4.7: Establish Staging Environment

**As a** DevOps engineer,
**I want** separate staging environment for testing changes before production deployment,
**So that** we reduce risk of bugs or breaking changes impacting live users.

#### Acceptance Criteria

1. Staging VPS provisioned: Separate VPS or separate Docker containers on existing VPS (lower cost option)
2. Staging environment deployed with identical configuration to production:
   - n8n staging instance (workflows mirror production)
   - Superset staging instance (dashboards mirror production)
   - Supabase staging project (separate database with test data)
   - Next.js staging deployment (separate Vercel preview deployment or staging branch)
3. Staging data strategy:
   - Option 1: Copy of production data (anonymized if contains sensitive info)
   - Option 2: Synthetic test data (realistic but not production data)
   - Decision documented with rationale
4. Deployment workflow established:
   - Changes tested in staging first (dashboard updates, schema changes, code deployments)
   - Staging approval required before production deployment
   - Rollback procedure documented (revert to previous version if issue detected)
5. Staging access controlled: Only admin/developer access to staging (not all 20 users)
6. Staging URL: `staging.xeropulse.com` or similar (clearly distinguished from production)
7. Testing: Deploy a test change to staging, verify it works, then promote to production
8. Cost tracking: Staging environment cost documented (if separate VPS, adds $10-20/month to operating costs)
9. Documentation: Staging environment setup guide, deployment procedures, testing checklist

### Story 4.8: Measure Success Metrics and KPIs

**As a** product manager,
**I want** success metrics measured against goals defined in Project Brief,
**So that** we can quantify platform impact and demonstrate ROI to stakeholders.

#### Acceptance Criteria

1. Success metrics measured at 60 days post-launch (end of Month 3):

   **Business Objectives:**
   - ✅ **Launch date:** Platform launched by October 31, 2025 (verify milestone met)
   - ✅ **Cost savings:** Total operating costs under $20 AUD/month (measure actual: VPS + Supabase + Vercel + domain)
   - ✅ **Time savings:** Finance team reclaims 5-10 hours weekly (interview finance team, quantify actual hours saved)

   **User Success Metrics:**
   - **Active Users:** 16+ of 20 users (80%) logging in at least weekly (measure from Next.js auth logs)
   - **Time to insight:** Users answer financial questions within 60 seconds (user survey: "How quickly can you find answers?")
   - **Self-service rate:** 70%+ of ad-hoc questions answered via dashboards without finance team (measure report request tickets pre/post launch)
   - **Dashboard engagement:** Each user accesses 2+ dashboards per week on average (measure from usage analytics)
   - **User satisfaction:** 90%+ report seeing "right amount of information" (user survey)

   **Key Performance Indicators:**
   - **Data Freshness:** 95%+ of syncs complete successfully within 2-hour window (measure from n8n execution logs)
   - **Dashboard Performance:** 95%+ of loads complete in <3 seconds (measure from Superset/Vercel logs)
   - **System Uptime:** 99%+ availability (measure from uptime monitoring service)
   - **User Satisfaction Score:** 4.0+ average rating (5-point scale survey)

2. Metrics dashboard created (internal): Single view showing all KPIs with red/yellow/green status indicators
3. Metrics report generated: Document summarizing performance against each goal with supporting data
4. Gaps identified: Any metrics not meeting targets analyzed with root cause and improvement plan
5. Success story documented: Quantified impact (e.g., "$180/month cost vs. $750 Power BI = 76% savings, Finance team saves 8 hours/week = $20,800/year labor savings")
6. Stakeholder presentation: Metrics review meeting with executives, celebrate wins, discuss improvements
7. Recommendations for Month 4+: Based on metrics, prioritize next enhancements (performance optimization, feature additions, user training)

### Story 4.9: Create Comprehensive Documentation

**As a** platform administrator,
**I want** complete documentation for users, admins, and developers,
**So that** platform can be maintained and evolved without dependency on original developer.

#### Acceptance Criteria

1. **User Documentation** created (audience: dashboard users):
   - Getting Started Guide (login, navigation, basic usage)
   - Dashboard User Guides (one page per dashboard explaining metrics, filters, how to interpret data)
   - FAQ (common questions, troubleshooting, password reset, etc.)
   - Mobile Access Guide (how to use on phone/tablet)
   - Export Guide (PDF, Excel/CSV export instructions)

2. **Admin Documentation** created (audience: platform administrators):
   - User Management Guide (add users, assign roles, manage permissions)
   - RBAC Configuration (how to modify role-to-dashboard mappings)
   - Monitoring Guide (how to check sync status, VPS health, errors)
   - Incident Response Runbook (common issues and fixes: sync failures, VPS down, Superset errors)
   - Backup and Disaster Recovery (how to restore from snapshot, database export/import)

3. **Developer Documentation** created (audience: future developers/maintainers):
   - Architecture Overview (system diagram, component descriptions, data flow)
   - Deployment Guide (VPS setup, Docker Compose, Next.js deployment to Vercel)
   - Development Environment Setup (local dev setup, testing procedures)
   - n8n Workflow Documentation (workflow logic, API endpoint mappings, error handling)
   - Superset Dashboard Documentation (dashboard definitions, query logic, chart configurations)
   - Database Schema Documentation (ERD, table descriptions, relationships, indexes)
   - Code Repository Guide (repo structure, branching strategy, PR process)
   - Troubleshooting Guide (debugging n8n, Superset, Next.js issues)

4. Documentation hosted accessibly:
   - User docs: In-portal help section or public docs site (docs.xeropulse.com)
   - Admin/developer docs: GitHub repo `/docs` folder or internal wiki

5. Documentation format: Markdown files (version-controlled), optionally rendered with MkDocs or similar for web viewing
6. Screenshots and diagrams included where helpful (architecture diagrams, UI screenshots, workflow visualizations)
7. Documentation reviewed by 2+ team members for accuracy and clarity
8. Documentation maintenance plan: Who updates docs when features change?

### Story 4.10: Plan Future Roadmap and Handoff

**As a** product manager,
**I want** future roadmap defined and platform formally handed off to operations team,
**So that** XeroPulse continues to evolve and deliver value beyond initial development.

#### Acceptance Criteria

1. **Future Roadmap** documented (6-12 month vision):

   **Phase 2 Enhancements (Months 4-6):**
   - Real-time sync implementation (if Story 4.6 recommended)
   - Advanced RBAC (department-level permissions, individual dashboard permissions)
   - Email alerts and notifications (KPI threshold alerts, daily digest emails)
   - Scheduled reports (automated PDF email delivery)
   - Additional dashboards based on user requests from Story 4.1 feedback

   **Long-term Vision (6-12 months):**
   - Predictive analytics (cash flow forecasting, anomaly detection)
   - AI-powered insights (Claude/GPT-4 integration for natural language queries)
   - Multi-tenant architecture (support multiple Xero organizations for accounting firm market)
   - Mobile native app (iOS/Android apps for better mobile UX)
   - API for third-party integrations (embed XeroPulse dashboards in other tools)

2. **Prioritization framework** established:
   - User impact (high/medium/low)
   - Development effort (hours estimated)
   - Technical complexity (risk assessment)
   - Business value (ROI, strategic alignment)
   - Prioritized backlog created using framework

3. **Handoff checklist** completed:
   - ✅ All documentation delivered (Story 4.9)
   - ✅ Admin team trained on user management, monitoring, incident response
   - ✅ Developer team (if different from original) onboarded to codebase
   - ✅ Access credentials transferred securely (VPS, Supabase, Xero, XPM, Superset)
   - ✅ Monitoring and alerting confirmed operational
   - ✅ Support processes established (who handles user questions? Who fixes bugs?)
   - ✅ Budget and cost tracking transferred to operations team

4. **Lessons learned** session conducted:
   - What went well? (celebrate successes)
   - What could be improved? (identify process gaps)
   - What would we do differently next time? (capture learnings for future projects)
   - Lessons documented for organizational knowledge base

5. **Formal handoff meeting:** Present roadmap, complete handoff, transition support responsibility
6. **Post-handoff support:** Original developer available for 30 days post-handoff for questions/issues (define support hours/SLA)

---

## Checklist Results Report

*This section will be populated after running the PM quality checklist.*

---

## Next Steps

### UX Expert Prompt

*This section will contain the prompt for the UX Expert to initiate architecture creation using this PRD as input.*

### Architect Prompt

*This section will contain the prompt for the Architect to initiate architecture creation using this PRD as input.*
