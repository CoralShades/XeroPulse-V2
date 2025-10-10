# Project Brief: XeroPulse

## Executive Summary

XeroPulse is a secure, role-based dashboard platform that transforms raw Xero accounting data into actionable insights for 20 users across an organization. The platform automatically syncs data from Xero every 2 hours, presenting 10 custom financial dashboards through a modern web portal with granular access control.

**Core Problem Solved:** Organizations using Xero lack customizable, role-specific financial dashboards that present the right data to the right people without manual report generation or overwhelming users with irrelevant information.

**Target Market:** Small to medium businesses (SMBs) and accounting firms using Xero who need multi-user dashboard access with role-based permissions, serving teams of 10-50 people requiring real-time financial visibility.

**Key Value Proposition:** Automated financial intelligence at 89-94% below traditional BI platform costs (~$15/month vs. $750+ for Power BI Embedded), delivered in 4 weeks with fully open-source technology stack ensuring no vendor lock-in.

---

## Problem Statement

**Current State & Pain Points:**

Organizations using Xero for accounting face a critical gap between data collection and data utilization. While Xero excels at capturing financial transactions, its native reporting capabilities fall short for teams requiring customized, role-specific insights. Current workflows involve:

- **Manual report generation:** Finance teams spend hours each week extracting data from Xero, formatting in Excel, and distributing static reports to stakeholders
- **Information overload:** Users either see all Xero data (overwhelming) or none (limiting decision-making capability)
- **Delayed insights:** Static reports become outdated quickly; decisions made on stale data (week-old or month-old snapshots)
- **No role-based access:** Inability to show tailored dashboards to different roles (executives need high-level KPIs, managers need department-specific metrics, staff need operational data)
- **Reactive instead of proactive:** Stakeholders request reports after noticing problems, rather than dashboards surfacing issues automatically

**Quantified Impact:**

- Finance team invests 5-10 hours per week on manual reporting (20-25% of a full-time role, ~$15,000-30,000 annually in labor costs)
- Decision latency: 3-7 day lag between data availability in Xero and stakeholder visibility
- Poor adoption: Only 3-5 power users actually access Xero directly, leaving 15+ team members dependent on intermediaries

**Why Existing Solutions Fall Short:**

- **Commercial BI platforms (Power BI, Looker, Tableau):** Minimum $750 USD/month ($1,100+ AUD) - 5.5x over budget, with complex setup requiring specialized skills
- **Xero native reporting:** Limited customization, no embedded dashboards, basic visualizations, no granular role-based access
- **Spreadsheet workflows:** Manual, error-prone, time-intensive, no automation, poor visualization capabilities
- **DIY custom development:** Requires 3-6 months development time, ongoing maintenance burden, high technical debt risk

**Urgency & Importance:**

The organization has set an end-of-month launch deadline driven by:
- **Fiscal cycle alignment:** Need financial visibility operational before next quarter begins
- **Decision-making bottleneck:** Executive team currently flying blind between monthly financial reviews
- **Team growth:** Recent expansion from 10 to 20 users has overwhelmed manual reporting processes
- **Competitive pressure:** Need faster financial insights to respond to market opportunities within days, not weeks

Without automated dashboards, the organization risks missed opportunities, delayed decisions, and continued inefficient use of finance team resources.

---

## Proposed Solution

XeroPulse delivers automated financial intelligence through a fully open-source technology stack that syncs Xero data to custom dashboards every 2 hours, accessible via a modern web portal with role-based permissions.

**Core Concept & Approach:**

The solution follows a proven ETL (Extract, Transform, Load) architecture optimized for cost and simplicity:

1. **Automated Data Sync:** n8n workflow automation connects to Xero API every 2 hours, extracting invoices, contacts, transactions, payments, and account data
2. **Centralized Storage:** Supabase PostgreSQL database stores transformed Xero data (500MB free tier sufficient for 20 users)
3. **Business Intelligence Layer:** Apache Superset generates 10 custom financial dashboards with advanced analytics (KPIs, trend analysis, cohort reports)
4. **User Portal:** Next.js web application provides secure login, role-based dashboard access, and professional branding

**Technology Stack:**
- **Data Source:** Xero API (OAuth2 authentication)
- **ETL Pipeline:** n8n (self-hosted, native Xero integration)
- **Database + Auth:** Supabase (PostgreSQL + authentication)
- **Dashboard Tool:** Apache Superset (self-hosted BI platform)
- **Web Portal:** Next.js 14 (modern React framework)
- **Hosting:** VPS (DigitalOcean/Hetzner, ~$10-20 AUD/month)

**Key Differentiators from Existing Solutions:**

1. **Radical cost efficiency:** $15/month total operating cost vs. $750+ for Power BI Embedded (98% cost reduction)
2. **Zero vendor lock-in:** 100% open-source stack ensures full control and data portability
3. **Purpose-built for Xero:** Direct API integration via proven n8n Xero node (not generic database connectors)
4. **Team-built dashboards:** Professional analysts create dashboards for users (not self-service chaos)
5. **Rapid deployment:** 4-week timeline vs. 3-6 months for custom development or commercial BI implementation
6. **Scalable architecture:** Each component can upgrade independently (Supabase → Pro, larger VPS, add monitoring tools)

**Why This Solution Will Succeed Where Others Haven't:**

**Commercial BI platforms failed due to cost and complexity.** Power BI Embedded ($750/month minimum) exceeded budget by 5.5x. XeroPulse achieves identical functionality at $15/month by self-hosting open-source tools (n8n, Superset) on affordable VPS infrastructure.

**Xero native reporting failed due to limited customization.** XeroPulse stores all Xero data locally, enabling unlimited custom queries, complex visualizations, and cross-entity analysis impossible within Xero's constrained reporting UI.

**Spreadsheet workflows failed due to manual overhead.** XeroPulse automates the entire pipeline—data extraction, transformation, visualization, and distribution—eliminating 5-10 hours weekly of manual Excel work.

**DIY development failed due to timeline constraints.** XeroPulse leverages battle-tested open-source tools (Superset used by Airbnb, Netflix; n8n with 200+ integrations) rather than building visualizations from scratch, reducing development from 3-6 months to 4 weeks.

**High-Level Vision for the Product:**

XeroPulse transforms financial data from a reactive reporting burden into a proactive strategic asset. Users log in to see dashboards tailored to their role—executives view high-level KPIs and trends, department managers see budget vs. actual comparisons, and operational staff track invoices and payments in real-time (2-hour refresh).

The platform provides:
- **Immediate visibility:** Automatic data refresh eliminates waiting for reports
- **Contextual insights:** Role-based dashboards show only relevant information
- **Professional polish:** Team-built dashboards ensure consistency, quality, and alignment with business objectives
- **Future flexibility:** Open-source foundation enables unlimited customization, new dashboard types, additional data sources, and AI-powered analytics without vendor constraints

Success looks like: Finance team reclaims 5-10 hours weekly, decision-makers access insights within seconds instead of days, and the organization operates on fresh data (2-hour lag vs. week-old snapshots).

---

## Target Users

XeroPulse serves organizations using Xero that need multi-user financial visibility with role-specific dashboards. The platform is designed for two primary user segments:

### Primary User Segment: Internal Business Teams (SMB/Mid-Market)

**Demographic/Firmographic Profile:**
- **Organization size:** 10-50 employees, typically $2M-$20M annual revenue
- **Industries:** Professional services, SaaS/tech startups, e-commerce, agencies, consulting firms
- **Xero usage:** Active Xero subscribers (Standard or Premium plan) with 6-24 months of financial data
- **Team structure:** C-suite executives (2-3), department managers (3-7), operational staff (5-15), finance team (1-3)
- **Technical sophistication:** Mixed—finance users comfortable with Excel/Xero, but non-finance users need simplified interfaces

**Current Behaviors and Workflows:**
- Finance team extracts monthly/weekly reports from Xero, formats in Excel, emails PDFs to stakeholders
- Executives review financial performance during monthly board meetings or quarterly reviews (reactive, delayed)
- Department managers request custom reports ad-hoc ("Can you pull last month's expenses by category?")
- Operational staff rarely access financial data directly, relying on finance team intermediaries
- Critical decisions delayed while waiting for reports (3-7 day turnaround common)

**Specific Needs and Pain Points:**
- **Executives:** Need high-level KPIs at a glance (revenue trends, cash runway, profitability) without logging into Xero
- **Department Managers:** Need budget vs. actual comparisons, departmental P&L, project-specific financial tracking
- **Operational Staff:** Need invoice status, payment tracking, accounts receivable aging for daily operations
- **Finance Team:** Overwhelmed by manual reporting requests, seeking automation to reclaim 5-10 hours weekly
- **Security requirement:** Role-based access (not everyone should see all financial data—payroll, executive compensation, etc.)

**Goals They're Trying to Achieve:**
- **Faster decision-making:** Access financial insights within minutes, not days
- **Proactive management:** Spot trends, anomalies, and risks early (before month-end close)
- **Self-service visibility:** Empower non-finance users to answer their own questions without bothering finance team
- **Data-driven culture:** Shift from gut-feel decisions to evidence-based strategy using real-time dashboards
- **Cost control:** Achieve enterprise BI capabilities without enterprise pricing ($15/month vs. $750+)

---

### Secondary User Segment: Accounting Firms (Future Market Expansion)

**Demographic/Firmographic Profile:**
- **Firm size:** 3-20 accountants/bookkeepers serving 20-100 SMB clients
- **Service model:** Monthly bookkeeping, quarterly reviews, tax preparation, CFO advisory services
- **Xero usage:** Manage multiple Xero organizations (one per client) via Xero HQ or partner access
- **Geographic focus:** Primarily Australian/NZ firms (Xero's strongest market), expanding to UK/US
- **Value proposition:** Differentiate from competitors by offering "dashboard portal" as premium service tier

**Current Behaviors and Workflows:**
- Accountants create monthly board report packages for clients (manually compiled from Xero + Excel)
- Clients request reports between scheduled meetings ("What's my cash position this week?")
- High-value advisory services limited by time spent on manual reporting (low-margin work)
- Premium clients expect sophisticated dashboards but firms can't justify $750/month per client for BI tools

**Specific Needs and Pain Points:**
- **Multi-tenancy requirement:** Need to deploy XeroPulse for multiple clients with data isolation
- **White-label branding:** Want to brand portal with accounting firm logo/colors (not generic interface)
- **Scalability:** Need solution that works for 5 clients initially, expands to 50+ as service grows
- **Margin preservation:** Must keep costs under $20-30/client/month to maintain profitability

**Goals They're Trying to Achieve:**
- **Service differentiation:** Stand out from competitors by offering "real-time dashboard access" as premium tier
- **Higher-margin advisory:** Shift from low-margin data entry to high-margin strategic CFO services
- **Client retention:** Increase stickiness by providing valuable ongoing portal access (not just annual tax prep)
- **Scalable offering:** Build repeatable dashboard service that doesn't require custom development per client

---

## Goals & Success Metrics

### Business Objectives

- **Launch production platform by end of October 2025** with MVP (3 dashboards) operational, 20 users onboarded, and full authentication solution deployed
- **Complete full authentication system in Month 1** including role-based access control, user management, and security hardening
- **Achieve 90%+ cost savings vs. commercial BI platforms** by maintaining total operating costs under $20 AUD/month (target: $15/month vs. $750+ for Power BI Embedded)
- **Reclaim 5-10 hours weekly from finance team** by automating manual report generation, transforming finance role from data extraction to strategic analysis
- **Enable sub-60-second insight access** for all users (replace 3-7 day report turnaround with instant dashboard views)
- **Achieve 80%+ user adoption within 30 days post-launch** (16+ of 20 users actively accessing dashboards at least weekly)
- **Maintain 99%+ data sync reliability** with automated 2-hour Xero updates (less than 1 failed sync per week)

### User Success Metrics

- **Time to insight:** Users can answer financial questions (e.g., "What's our monthly recurring revenue?") within 60 seconds vs. 3-7 days previously
- **Self-service rate:** 70%+ of ad-hoc financial questions answered via dashboards without requiring finance team intervention
- **Report request reduction:** 80%+ decrease in manual report requests to finance team (from ~20 requests/week to <4 requests/week)
- **Dashboard engagement:** Each user accesses at least 2 dashboards per week on average (indicates relevance and utility)
- **Role-based satisfaction:** 90%+ of users report seeing "the right amount of information" (not overwhelmed, not lacking critical data)
- **Decision velocity:** Executives report 50%+ reduction in time spent gathering data for strategic decisions (more time analyzing, less time hunting)

### Key Performance Indicators (KPIs)

- **Active Users:** 16+ of 20 users (80%) logging into portal at least weekly
  - **Target:** Achieve within 30 days of launch
  - **Measurement:** Next.js authentication logs, unique weekly active users

- **Data Freshness:** 95%+ of data syncs complete successfully within 2-hour window
  - **Target:** Ongoing operational metric
  - **Measurement:** n8n workflow execution logs, sync success rate

- **Platform Cost Efficiency:** Operating costs remain under $20 AUD/month
  - **Target:** Ongoing through Q1 2026 (3 months post-launch)
  - **Measurement:** Monthly billing statements (VPS, domain, Supabase tier)

- **Finance Team Time Savings:** 5-10 hours reclaimed weekly (measured pre/post launch)
  - **Target:** Achieve within 60 days of launch (after user adoption stabilizes)
  - **Measurement:** Finance team time-tracking, report request tickets

- **Dashboard Load Performance:** 95%+ of dashboard views load within 3 seconds
  - **Target:** Ongoing operational metric
  - **Measurement:** Superset performance monitoring, user-reported load times

- **System Uptime:** 99%+ availability (less than 7.2 hours downtime per month)
  - **Target:** Ongoing operational metric
  - **Measurement:** VPS monitoring, uptime checks, incident logs

- **User Satisfaction Score:** 4.0+ average rating (5-point scale) in post-launch survey
  - **Target:** 60 days post-launch (first user feedback cycle)
  - **Measurement:** User survey (ease of use, relevance, visual quality, speed)

---

## MVP Scope

The MVP focuses on delivering core automation and dashboard functionality within the 4-week timeline, following a phased approach that validates technical architecture early and builds user-facing features incrementally.

### Core Features (Must Have)

- **Xero API Integration & Automated Data Sync**
  - n8n workflow automation with OAuth2 authentication to Xero API
  - Scheduled data extraction every 2 hours (invoices, contacts, transactions, payments, accounts)
  - Data transformation and loading into Supabase PostgreSQL database
  - Error handling, retry logic, and sync status monitoring
  - **Rationale:** Core technical foundation—without reliable data sync, dashboards are meaningless

- **Supabase Database & Authentication (Complete in Month 1)**
  - PostgreSQL schema for storing Xero financial data (normalized tables for entities)
  - **Full authentication system:** Email/password login, password reset, session management, security hardening
  - **Complete RBAC implementation:** Role-based user table (executives, managers, staff roles defined), role-to-dashboard permission mapping
  - **User management UI:** Admin panel for adding/removing users, assigning roles, managing permissions
  - Secure API access for Next.js portal
  - **Rationale:** Robust authentication foundation critical for multi-user security; completed in Month 1 ensures no security debt

- **Apache Superset Dashboard Engine**
  - Self-hosted Superset deployment on VPS (Docker-based)
  - Connection to Supabase PostgreSQL database
  - Minimum 3 production-ready dashboards (see dashboard list below)
  - Dashboard embedding configuration for Next.js portal
  - Basic RBAC: map user roles to dashboard access permissions
  - **Rationale:** 3 dashboards validate the full workflow while staying achievable in 4 weeks; remaining 7 added post-MVP

- **Next.js Web Portal (MVP Version)**
  - User login/logout functionality (Supabase Auth integration)
  - Role-based homepage displaying authorized dashboards only
  - Dashboard embedding via iframe (Superset dashboards)
  - Responsive design for desktop/tablet viewing
  - Basic branding (logo, color scheme, custom domain)
  - **Rationale:** Provides professional user experience without building dashboards from scratch

- **VPS Hosting Infrastructure**
  - DigitalOcean/Hetzner VPS provisioned ($10-20/month)
  - Docker Compose for n8n + Superset deployment
  - HTTPS configuration with SSL certificates (Let's Encrypt)
  - Basic monitoring and logging for services
  - **Rationale:** Self-hosted infrastructure keeps costs minimal and provides full control

- **Initial 3 MVP Dashboards**
  - **Dashboard 1: [TBD - Executive/Strategic Focus]**
  - **Dashboard 2: [TBD - Operational/Cash Management Focus]**
  - **Dashboard 3: [TBD - Revenue/Customer Focus]**
  - **Note:** Specific dashboard requirements, names, and KPIs to be defined during project kickoff with stakeholders
  - **Rationale:** 3 dashboards validate the full workflow while staying achievable in 4 weeks; specific content determined based on highest-priority business questions

### Out of Scope for MVP

- **Advanced RBAC features:** Department-level permissions, individual dashboard permissions, audit logging (use simple role-based access: executives see all dashboards, managers see subset, staff see operational only)
- **Custom dashboard builder UI:** Users cannot create their own dashboards within portal (team builds all dashboards in Superset directly)
- **Real-time data sync:** Webhooks or sub-2-hour sync frequency (2-hour scheduled sync sufficient for MVP)
- **Mobile-optimized views:** Native mobile app or mobile-specific dashboard layouts (desktop/tablet only for MVP)
- **Multi-tenant architecture:** Supporting multiple Xero organizations (single organization only)
- **Advanced analytics features:** Predictive analytics, AI-powered insights, anomaly detection (descriptive analytics only)
- **Remaining 7 dashboards:** Deferred to post-MVP (Month 2) to de-risk timeline
  - **Dashboard 4-10:** [TBD - Specific requirements to be defined based on user roles and business priorities]
  - Potential categories: Budget tracking, departmental analytics, expense analysis, customer insights, project profitability, inventory/COGS, payroll (if applicable)
  - Requirements gathering session needed to prioritize and name remaining dashboards
- **Data export functionality:** PDF/Excel export from dashboards (view-only for MVP)
- **Email alerts/notifications:** Automated alerts for KPI thresholds or anomalies (manual monitoring only)
- **Advanced security features:** SSO/SAML integration, IP whitelisting, two-factor authentication (basic email/password sufficient initially)
- **Staging environment:** Single production environment (add staging post-MVP for safer updates)

### MVP Success Criteria

**MVP is considered successful if, by end of Week 4:**

1. **Technical validation:**
   - Xero data syncs automatically every 2 hours with 95%+ success rate (tested over 7 days minimum)
   - All 3 MVP dashboards load within 3 seconds with live data
   - 20 users successfully authenticate and access role-appropriate dashboards
   - Zero critical security vulnerabilities (data encryption, secure authentication, no exposed credentials)

2. **User validation:**
   - 5+ test users (representing executives, managers, staff roles) complete user acceptance testing
   - 80%+ of test users rate dashboards "useful" or "very useful" for their role
   - Test users can answer 3 sample financial questions using dashboards in under 60 seconds
   - Finance team confirms 3 MVP dashboards eliminate at least 3 hours/week of manual reporting

3. **Business validation:**
   - Total operating costs remain under $20 AUD/month (VPS + domain + services)
   - Platform uptime exceeds 95% during Week 4 (minimal downtime during testing period)
   - Development timeline stays within 4 weeks (no major scope creep or technical blockers)

4. **Readiness for full launch:**
   - Architecture proven stable (no need for major refactoring to add remaining 7 dashboards)
   - User feedback gathered and documented for post-MVP improvements
   - Deployment process documented (enables adding dashboards, onboarding users, updating data schema)

**If MVP succeeds, proceed with:**
- Month 2: Define requirements for remaining 7 dashboards, build and deploy based on prioritized business needs
- Month 2-3: Full user onboarding (all 20 users), training sessions, feedback collection
- Month 3-4: Iterate based on user feedback, optimize performance, add polish features

---

## Post-MVP Vision

Beyond the initial MVP deployment, XeroPulse has a clear roadmap for evolution from internal dashboard tool to sophisticated financial intelligence platform, with potential expansion into SaaS product offerings.

### Phase 2 Features (Months 2-6)

**Complete Dashboard Suite (Month 2)**
- **Dashboard Requirements Definition Workshop:** Conduct stakeholder sessions to identify specific dashboard needs, KPIs, and visualization requirements
- Build remaining 7 dashboards to reach full 10-dashboard commitment based on prioritized requirements
- Potential dashboard categories (to be confirmed):
  - Budget tracking and variance analysis
  - Departmental/cost center analytics
  - Expense analysis and categorization
  - Customer insights and behavior
  - Project or product profitability
  - Inventory/COGS (if applicable)
  - Payroll/workforce analytics (if applicable, requires additional access controls)

**Enhanced Authentication & User Management (Month 1-2)**
- User management admin panel (add/remove users, assign roles, manage permissions)
- Password policies and enforcement (complexity requirements, expiration)
- Session management (configurable timeout, multi-device support)
- Security hardening (rate limiting, brute force protection, activity logging)

**Advanced RBAC System (Month 3)**
- Department-level permissions (Finance team sees all, Sales sees revenue/customer dashboards only)
- Individual dashboard permissions (grant specific users access to specific dashboards)
- Audit logging (track who accessed which dashboard when, for compliance)

**Real-Time Data Refresh (Month 4)**
- Reduce sync interval from 2 hours to near-real-time (webhook-based triggers)
- Xero webhook integration (receive notifications when invoices created, payments received)
- Incremental update logic (sync only changed records, not full refresh)
- Real-time dashboard refresh indicator ("Last updated 3 minutes ago")
- **Prerequisite:** Verify Xero plan supports webhooks (may require Xero Premium/Ultimate tier)

**Mobile-Responsive Dashboard Views (Month 5)**
- Optimize dashboard viewing experience for tablets and mobile devices
- Touch-friendly interactions (swipe for date ranges, tap-to-drill-down)
- Responsive layouts (charts stack vertically on small screens)
- Potential separate mobile dashboards (simplified KPI cards for phone viewing)

**Data Export & Sharing (Month 6)**
- PDF export from dashboards (scheduled or on-demand report generation)
- Excel export for raw data (enable users to analyze data offline)
- Scheduled email reports (daily/weekly dashboard snapshots sent to stakeholders)
- Public dashboard links (shareable URLs with expiration dates, for board meetings or investor updates)

### Long-term Vision (1-2 Years)

**Predictive Financial Analytics Platform**

Transform XeroPulse from descriptive analytics (what happened) to prescriptive analytics (what will happen, what should we do). Layer machine learning models on top of historical Xero data to:

- **Cash flow forecasting:** Predict cash runway with 90%+ accuracy using historical transaction patterns
- **Anomaly detection:** Automatically flag unusual expenses, revenue drops, or payment delays before they become critical
- **Trend identification:** Surface emerging patterns (e.g., "customer payment cycles lengthening," "seasonal expense spikes")
- **Scenario modeling:** "What if we lose our top 3 customers?" or "What if expenses grow 20%?"—simulate financial futures

**AI-Powered Dashboard Intelligence**

Integrate Claude/GPT-4 to shift from static dashboards to adaptive, conversational financial intelligence:

- **Natural language queries:** "What was Q3 revenue by customer?" → instant dashboard generation or data answer
- **Proactive insights:** AI analyzes dashboards weekly and surfaces recommendations ("Your top 5 customers represent 80% of revenue—consider diversification")
- **Smart dashboard recommendations:** Suggest relevant dashboards based on user role, recent activity, or business events (e.g., suggest Cash Flow dashboard when bank balance drops below threshold)
- **Automated narrative summaries:** Generate written summaries of dashboard data ("Revenue increased 15% MoM driven by 3 new enterprise customers")

**Cross-Platform Financial Hub**

Expand beyond Xero to become universal financial analytics platform integrating multiple data sources:

- **Multi-accounting platform support:** QuickBooks, MYOB, Sage, FreshBooks (unified financial view across platforms)
- **Bank feed integration:** Real-time bank transaction data (Plaid, Yodlee) for cash position monitoring
- **CRM integration:** Salesforce, HubSpot data layered with financial metrics (sales pipeline + revenue realization)
- **E-commerce platform integration:** Shopify, WooCommerce sales data for retail/e-commerce dashboards
- **Payroll system integration:** Gusto, BambooHR for advanced workforce analytics
- **Unified data model:** Normalize data across platforms for apples-to-apples comparisons

### Expansion Opportunities

**White-Label SaaS Product for Accounting Firms**

Transform single-tenant XeroPulse into multi-tenant SaaS platform targeting the accounting firm market:

- **Market opportunity:** 50,000+ accounting firms globally manage 5-50 Xero clients each, all needing dashboard solutions
- **Product evolution:** White-label portal (accounting firm branding), multi-tenant architecture (one XeroPulse instance serves 100+ client organizations), automated client onboarding workflow
- **Pricing model:** $20-30 per client/month (accounting firms charge clients $50-100/month, retain margin), or $200-500/month flat fee for unlimited clients (enterprise accounting firms)
- **Differentiation strategy:** Target firms offering CFO advisory services (dashboards become service delivery mechanism, not just reporting tool)
- **Go-to-market:** Partner with Xero ecosystem (Xero Partner Program, Xero app marketplace listing), target Xero Platinum/Gold partners first (established firms, existing client base)

**Vertical-Specific Dashboard Packs**

Create pre-built dashboard templates optimized for specific industries or use cases:

- **E-commerce pack:** Shopify/WooCommerce integration, inventory turnover, customer acquisition cost, cart abandonment financial impact
- **SaaS pack:** MRR/ARR tracking, churn analysis, customer lifetime value, unit economics (CAC, LTV:CAC ratio)
- **Professional services pack:** Utilization rates, billable vs. non-billable hours, project profitability, capacity planning
- **Franchise pack:** Multi-location P&L comparison, franchisee performance dashboards, royalty tracking
- **Nonprofit pack:** Fund accounting, donor contribution tracking, program expense allocation, grant compliance reporting

**Embedded Analytics API for Third-Party Apps**

Offer XeroPulse dashboard engine as embeddable component for other SaaS products:

- **Target customers:** Vertical SaaS platforms (construction management software, practice management tools) needing financial analytics
- **Product offering:** API for embedding XeroPulse dashboards in third-party apps, white-label dashboard builder, data connector SDKs
- **Pricing model:** Per-embed pricing ($50-200/month per embedded dashboard instance) or revenue share (10-20% of third-party product price)
- **Use case example:** Construction management SaaS embeds XeroPulse "Project Profitability Dashboard" to show contractors financial performance by job

---

## Technical Considerations

This section documents known technical constraints, preferences, and architectural decisions. These represent initial thinking and will be refined during development.

### Platform Requirements

- **Target Platforms:** Web-based application (no native mobile apps for MVP)
- **Browser/OS Support:**
  - Modern browsers: Chrome 100+, Firefox 100+, Safari 15+, Edge 100+
  - Operating systems: Windows 10+, macOS 11+, Linux (Ubuntu 20.04+)
  - Desktop and tablet viewing optimized (1024px+ screen width)
  - Mobile browsers: View-only capability (no responsive optimization in MVP)
- **Performance Requirements:**
  - Dashboard load time: <3 seconds for 95% of requests
  - Data sync completion: Within 2-hour window (95%+ success rate)
  - Concurrent users: Support 20 simultaneous users without degradation
  - Database query performance: <1 second for most dashboard queries

### Technology Preferences

**Frontend:**
- **Next.js 14** (App Router, React Server Components)
- **Rationale:** Team has JavaScript expertise, modern framework with excellent performance, Vercel free tier hosting
- **UI Framework:** Tailwind CSS (rapid styling), shadcn/ui components (professional look, accessible)
- **Authentication:** Supabase Auth client library (seamless integration)

**Backend:**
- **Supabase** (PostgreSQL database + authentication + auto-generated APIs)
- **Rationale:** Free tier sufficient for MVP (500MB DB, 10k MAU), eliminates need to build custom API layer, PostgreSQL compatibility with Superset
- **ETL Automation:** n8n (self-hosted workflow automation)
- **Rationale:** Native Xero integration node, open-source, self-hosted = $0 cost, visual workflow builder simplifies maintenance

**Database:**
- **PostgreSQL 14+** (via Supabase)
- **Rationale:** Superset requires PostgreSQL for metadata storage, relational structure suits financial data, excellent query performance
- **Schema design:** Normalized tables mirroring Xero entities (invoices, contacts, transactions, payments, accounts, line_items)
- **Data retention:** All historical data (no automatic purging), manual cleanup as needed if approaching 500MB limit

**Hosting/Infrastructure:**
- **VPS:** Hetzner Cloud (€4.51/month = ~$7.50 AUD) or DigitalOcean ($12/month)
- **Container orchestration:** Docker Compose (n8n + Superset on single VPS)
- **CDN/Domain:** Cloudflare (free tier for DNS + basic DDoS protection)
- **SSL/TLS:** Let's Encrypt (free automated certificates)
- **Next.js hosting:** Vercel free tier (hobby plan sufficient for 20 users)

### Architecture Considerations

**Repository Structure:**
- **Monorepo approach:** Single Git repository containing:
  - `/apps/web` - Next.js web portal
  - `/apps/n8n-workflows` - n8n workflow JSON exports (version control)
  - `/apps/superset-config` - Superset dashboard exports, configuration
  - `/docs` - Architecture diagrams, deployment guides, user documentation
  - `/infrastructure` - Docker Compose files, deployment scripts, VPS setup automation
- **Rationale:** Simpler coordination for 1-2 developer team, all XeroPulse code in one place

**Service Architecture:**
```
┌─────────────┐      OAuth2       ┌──────────┐
│  Xero API   │◄─────────────────►│   n8n    │
└─────────────┘                   └────┬─────┘
                                       │ ETL (every 2hrs)
                                       ▼
┌─────────────┐                   ┌──────────┐
│   Users     │◄──────Auth────────│ Supabase │
│ (Browsers)  │                   │ (DB+Auth)│
└──────┬──────┘                   └────┬─────┘
       │                               │
       │ HTTPS                         │ SQL Queries
       ▼                               ▼
┌─────────────┐    iframe embed   ┌──────────┐
│  Next.js    │◄─────────────────►│ Superset │
│   Portal    │                   │Dashboard │
└─────────────┘                   └──────────┘

VPS (n8n + Superset)    Cloud (Supabase + Vercel)
```

**Integration Requirements:**
- **Xero → n8n:** OAuth2 authentication, Xero API credentials (Client ID, Client Secret), n8n Xero node configuration
- **n8n → Supabase:** Supabase connection credentials (host, database, user, password), PostgreSQL node in n8n workflows
- **Supabase → Superset:** PostgreSQL connection string, Superset database connection configuration
- **Superset → Next.js:** Embedded dashboard URLs, authentication token passing (JWT or session-based)
- **Next.js → Supabase:** Supabase client library, environment variables for API keys

**Security/Compliance:**
- **Data encryption:**
  - At rest: Supabase provides encrypted storage (AES-256)
  - In transit: HTTPS/TLS for all communications (Let's Encrypt certificates)
  - Credentials: Environment variables (never committed to Git), n8n credential encryption
- **Access control:**
  - Role-based access in Next.js portal (middleware checks user role before rendering dashboards)
  - Supabase Row Level Security (RLS) policies for database access
  - Superset RBAC (map Supabase user roles to Superset permissions)
- **Authentication:**
  - Secure password hashing (bcrypt via Supabase Auth)
  - Session management (JWT tokens, configurable expiration)
  - Password reset workflow (email-based, secure token generation)
- **Compliance considerations:**
  - **Data residency:** Supabase region selection (choose AU/NZ region for Australian data sovereignty if required)
  - **Audit logging:** Basic access logs (who accessed which dashboard when), detailed audit logging deferred to Phase 2
  - **Backup strategy:** Supabase daily automated backups (free tier: 7-day retention), VPS manual backups (weekly snapshots)
  - **GDPR/Privacy:** User data minimization (only store emails + roles, no PII), data deletion capability (admin can remove users)

**Known Technical Constraints:**
- **Supabase 500MB limit:** Must monitor database size, optimize schema if approaching limit, upgrade to Pro ($25/month) if needed
- **Xero API rate limits:** 60 requests/minute, 10,000 requests/day (2-hour sync frequency designed to stay well within limits)
- **n8n execution limits:** Self-hosted = no limits, but VPS resources constrained (2-4GB RAM, 1-2 vCPU typical)
- **Vercel free tier limits:** 100GB bandwidth/month, 100 serverless function invocations/day (sufficient for 20 users)
- **VPS resources:** Single VPS running n8n + Superset requires monitoring, potential need to upgrade to 4GB+ RAM if dashboards are complex

**Mitigation Strategies:**
- **Database size:** Implement data archiving strategy (move old transactions to cold storage if needed), monitor growth weekly
- **API limits:** n8n workflow includes rate limit handling, exponential backoff on errors, sync duration monitoring
- **VPS performance:** Docker resource limits, monitoring alerts if CPU/RAM exceed 80%, documented upgrade path to larger VPS
- **Vercel limits:** Monitor usage monthly, upgrade to $20/month Pro plan if approaching limits (still under $200 budget)

---

## Constraints & Assumptions

### Constraints

**Budget: $200 AUD/month maximum operating cost**
- **Hard limit:** Cannot exceed budget without compromising project viability
- **Target:** $15/month actual cost leaves $185/month headroom for monitoring, backups, scaling, or emergency upgrades
- **Impact:** Eliminates commercial BI platforms (Power BI $750+/month), drives open-source tool selection, requires self-hosting strategy
- **Flexibility:** If Supabase 500MB limit reached, Pro upgrade ($25/month) still leaves $160/month buffer

**Timeline: End-of-month (October 2025) launch deadline**
- **Hard constraint:** MVP must launch by October 31, 2025 (4 weeks from project start)
- **Driver:** Fiscal cycle alignment, executive decision-making needs, team growth pressure
- **Impact:** Aggressive scope reduction (3 dashboards vs. 10), deferred features (mobile optimization, advanced RBAC, remaining 7 dashboards)
- **Risk:** Learning curve on new tools (n8n, Superset) could derail timeline—Week 1 critical for validating technical feasibility

**Resources: 1 full-time developer + 1 tester**
- **Team capacity:** Single developer = no parallel workstreams, sequential development
- **Skillset:** PHP + JavaScript expertise (matches Laravel/Next.js), but n8n/Superset learning curve unknown
- **Impact:** Limits architectural complexity (single VPS vs. distributed system), requires well-documented tools with strong community support
- **Tester availability:** 1 tester enables UAT during Week 4, but developer handles integration testing during Weeks 1-3

**Technical: Self-hosted VPS infrastructure required**
- **Constraint:** Budget eliminates managed cloud services (AWS RDS, managed n8n cloud = $50+/month)
- **Impact:** Team must handle VPS setup, Docker deployments, security hardening, monitoring, backups
- **Skill requirement:** Docker Compose proficiency needed (or rapid learning during Week 1)
- **Risk:** Single VPS = single point of failure (no redundancy for MVP)

### Key Assumptions

**Business Assumptions:**

1. **20 users is fixed requirement for MVP**
   - Assumption: Organization has identified specific 20 users needing dashboard access
   - Risk: If actual user count is 30-40, may impact Supabase free tier limits or VPS performance
   - Validation needed: Confirm exact user count and roles during project kickoff

2. **10 dashboards total (3 MVP, 7 post-MVP) is sufficient**
   - Assumption: Stakeholder requirements align with 10-dashboard scope
   - Risk: Requirements workshop in Month 2 might reveal need for 15-20 dashboards
   - Mitigation: Architecture supports unlimited dashboards; cost/timeline may increase if scope expands

3. **2-hour data sync frequency meets business needs**
   - Assumption: Users don't require real-time or sub-hourly data refresh
   - Risk: If critical decisions require hourly updates, architecture needs modification (webhooks, increased sync frequency)
   - Validation needed: Confirm acceptable data latency with stakeholders

4. **Dashboard requirements are definable upfront**
   - Assumption: Stakeholders can articulate KPIs, metrics, and visualization needs during requirements workshop
   - Risk: Vague requirements ("show me revenue") may require multiple iteration cycles
   - Mitigation: Plan for iterative dashboard refinement in Month 2-3

5. **Internal deployment only (no external users initially)**
   - Assumption: All 20 users are internal employees/stakeholders
   - Risk: If external users (clients, board members, investors) need access, security/compliance requirements increase
   - Impact: External access would require enhanced authentication (SSO, 2FA), stricter audit logging

**Technical Assumptions:**

6. **Supabase 500MB free tier sufficient for MVP**
   - Assumption: Xero data for 20 users + 6-12 months history fits within 500MB
   - Calculation needed: Estimate actual data volume (# invoices × avg size + contacts + transactions)
   - Fallback: Upgrade to Supabase Pro ($25/month) if limit approached

7. **n8n native Xero node works reliably for production use**
   - Assumption: n8n's Xero integration handles OAuth2, rate limits, error scenarios correctly
   - Risk: If Xero node has bugs or missing functionality, may require custom API integration (adds 1-2 weeks)
   - Validation: Week 1 priority = test Xero node thoroughly before committing architecture

8. **Superset embedding works seamlessly with Next.js**
   - Assumption: iframe embedding or Superset embedding SDK integrates without major authentication/CORS issues
   - Risk: If embedding proves complex, may need alternative approach (direct Superset access, custom dashboard rendering)
   - Validation: Week 2-3 priority = prove embedding works end-to-end

9. **Single VPS sufficient for n8n + Superset workloads**
   - Assumption: 2-4GB RAM VPS handles both services without performance degradation
   - Risk: Complex Superset dashboards with large datasets could require 8GB+ RAM (VPS upgrade = $20-40/month)
   - Monitoring: Set up resource monitoring Week 1 to catch performance issues early

10. **Team has (or can quickly acquire) Docker/VPS deployment skills**
    - Assumption: Developer comfortable with Docker Compose, SSH, Linux server administration
    - Risk: If skills gap exists, deployment delays or need for external DevOps consultant
    - Mitigation: Week 1 focus includes VPS setup; identify skill gaps immediately

11. **Xero API provides all required financial data**
    - Assumption: Xero API exposes invoices, contacts, transactions, payments, accounts with sufficient detail
    - Risk: If required fields missing from API (e.g., custom fields, specific report data), dashboards may lack needed metrics
    - Validation: Review Xero API documentation early, map desired dashboard metrics to API endpoints

12. **Vercel free tier won't hit bandwidth/invocation limits**
    - Assumption: 20 users generate <100GB bandwidth/month, <100 serverless invocations/day
    - Calculation: 100GB ÷ 20 users = 5GB per user/month (generous for dashboard portal)
    - Fallback: Vercel Pro upgrade ($20/month) if limits approached

**User/Stakeholder Assumptions:**

13. **Stakeholders available for requirements workshop and UAT**
    - Assumption: Key users (executives, finance team, managers) can dedicate time for requirements definition (Week 1) and testing (Week 4)
    - Risk: If stakeholders unavailable, developer makes dashboard decisions without input (misalignment risk)
    - Mitigation: Schedule requirements workshop and UAT sessions upfront

14. **Users comfortable with web-based dashboard interface**
    - Assumption: Users accustomed to SaaS tools, don't require desktop app or Excel-based workflows
    - Risk: If users demand offline access or Excel exports immediately, MVP scope incomplete
    - Mitigation: Set expectations that MVP is view-only; exports deferred to Month 2

15. **Finance team can articulate current manual reporting pain points**
    - Assumption: Finance team tracks time spent on reports, knows which reports are most requested
    - Impact: Informs dashboard prioritization (build dashboards that eliminate highest-burden reports first)
    - Validation: Interview finance team Week 1 to quantify pain points

**Data/Integration Assumptions:**

16. **Xero organization has 6-24 months of historical data**
    - Assumption: Sufficient data exists for meaningful trend analysis, YoY comparisons
    - Risk: If Xero recently adopted (<3 months data), dashboards lack historical context
    - Impact: Dashboards may show "insufficient data" messages for trend charts initially

17. **Xero data quality is good (minimal cleanup needed)**
    - Assumption: Invoices categorized correctly, contacts deduplicated, transactions reconciled
    - Risk: If data quality poor (uncategorized expenses, duplicate customers), dashboards show misleading insights
    - Mitigation: Data quality check during Week 2; flag cleanup needs for finance team

18. **No complex Xero customizations or add-ons impacting API**
    - Assumption: Standard Xero setup without third-party integrations that modify data structure
    - Risk: If Xero heavily customized (custom fields, inventory add-ons), API data mapping may require additional logic
    - Validation: Review Xero setup Week 1, identify any non-standard configurations

---

## Risks & Open Questions

### Key Risks

**1. Learning Curve Derails Timeline (HIGH RISK)**
- **Description:** Team has never deployed n8n or Apache Superset; unfamiliarity could cause Week 1-2 delays that cascade to miss October 31 deadline
- **Likelihood:** Medium-High (new tools always have surprises)
- **Impact:** High (timeline is tight, no buffer for extended learning)
- **Mitigation:**
  - Allocate Days 1-3 to rapid prototyping: n8n Xero connection + Superset "Hello World" dashboard
  - Identify blockers immediately; escalate to community forums or consider paid support if stuck >1 day
  - Have fallback plan: If Superset too complex, pivot to Metabase (simpler but less powerful)
  - Developer dedicates Week 1 full-time to infrastructure setup (no distractions)

**2. n8n Xero Node Limitations (MEDIUM-HIGH RISK)**
- **Description:** n8n's native Xero node may have bugs, missing API endpoints, or OAuth issues that force custom API integration development
- **Likelihood:** Medium (open-source nodes vary in completeness)
- **Impact:** High (custom integration adds 1-2 weeks to timeline)
- **Mitigation:**
  - Test Xero node thoroughly Week 1 with production Xero credentials (not sandbox)
  - Document specific Xero API endpoints needed for dashboards; verify n8n node supports all
  - If node insufficient, explore n8n HTTP Request node (direct API calls) vs. building custom Python/Node.js integration
  - Budget 2-3 extra days in Week 2 schedule as buffer for Xero integration complexity

**3. Supabase 500MB Limit Exceeded (MEDIUM RISK)**
- **Description:** Actual Xero data volume exceeds 500MB free tier, forcing upgrade to Supabase Pro ($25/month) or data archiving strategy
- **Likelihood:** Medium (depends on transaction volume, unknown until Week 2 sync)
- **Impact:** Low-Medium ($25/month upgrade still within $200 budget; archiving adds complexity)
- **Mitigation:**
  - Calculate estimated data volume Week 1: # invoices/year × avg invoice size + contacts + transactions
  - Monitor Supabase storage dashboard daily during Week 2-3 data sync
  - Implement selective sync if needed (e.g., sync last 12 months only, archive older data)
  - Budget for Supabase Pro upgrade ($25/month) in cost projections

**4. Dashboard Requirements Unclear or Changing (MEDIUM RISK)**
- **Description:** Stakeholders struggle to articulate dashboard needs, or requirements change mid-development ("Actually, we need real-time sync, not 2-hour")
- **Likelihood:** Medium (common in analytics projects; users don't know what they want until they see it)
- **Impact:** Medium (scope creep delays launch, or delivered dashboards don't meet needs)
- **Mitigation:**
  - Conduct structured requirements workshop Week 1 with specific prompts: "What questions do you need answered? What decisions require data?"
  - Build 1 dashboard Week 2 as prototype; get stakeholder feedback early before building remaining 2
  - Set clear expectations: MVP dashboards are starting point, refinement happens Month 2-3
  - Use change control: New requirements documented but deferred to post-MVP unless critical

**5. VPS Performance Insufficient (MEDIUM RISK)**
- **Description:** 2-4GB RAM VPS struggles with Superset + n8n workloads, causing slow dashboard loads or sync failures
- **Likelihood:** Medium (depends on dashboard complexity, data volume)
- **Impact:** Medium (VPS upgrade to 8GB = $20-40/month, still within budget; slow performance hurts user adoption)
- **Mitigation:**
  - Start with 4GB RAM VPS minimum (not 2GB) to reduce risk
  - Implement Docker resource limits (cap n8n at 1.5GB, Superset at 2GB) to prevent one service starving the other
  - Monitor CPU/RAM usage Week 3-4; upgrade VPS size if consistently >80% utilization
  - Optimize Superset dashboards (limit row fetching, use SQL aggregations vs. Python post-processing)

**6. Superset Embedding Authentication Complexity (MEDIUM RISK)**
- **Description:** Passing authentication from Next.js to embedded Superset dashboards proves complex (CORS issues, JWT token mismatches, session management)
- **Likelihood:** Medium (embedding authentication is notoriously tricky)
- **Impact:** Medium-High (if unsolved, users must log in twice: Next.js portal + Superset; poor UX)
- **Mitigation:**
  - Research Superset embedding SDK Week 2; identify recommended authentication pattern
  - Test iframe embedding early with mock Next.js app before building full portal
  - Fallback option: Direct Superset access (skip Next.js portal for MVP, add portal later) if embedding too complex
  - Allocate Week 3 buffer specifically for authentication integration debugging

**7. Xero API Rate Limits Hit (LOW-MEDIUM RISK)**
- **Description:** Initial data sync or 2-hour sync frequency exceeds Xero API rate limits (60 req/min, 10k req/day), causing sync failures
- **Likelihood:** Low-Medium (2-hour sync designed to stay within limits, but large datasets could trigger)
- **Impact:** Low (n8n retry logic handles transient failures; persistent limits require sync optimization)
- **Mitigation:**
  - Implement exponential backoff in n8n workflow (if 429 rate limit error, wait 5min and retry)
  - Batch API requests where possible (fetch 100 invoices per request vs. 1 at a time)
  - Monitor sync execution logs Week 2-3; identify any rate limit errors early
  - If limits hit consistently, reduce sync frequency to every 3-4 hours or implement incremental sync

**8. User Adoption Lower Than Expected (LOW-MEDIUM RISK)**
- **Description:** Despite launching on time, users don't adopt dashboards (< 50% login within 30 days), continuing to request manual reports
- **Likelihood:** Medium (common with internal tools; users resist change)
- **Impact:** Medium (project technically successful but fails business objective of reducing manual reporting)
- **Mitigation:**
  - Conduct user training sessions Week 4 (live demos, use case walkthroughs)
  - Create "Quick Start Guide" showing how to answer common questions with dashboards
  - Get executive sponsorship: Leadership communicates dashboards as primary reporting channel
  - Measure adoption weekly; identify low-engagement users and provide 1:1 support

**9. Data Quality Issues Undermine Dashboard Trust (LOW RISK)**
- **Description:** Xero data contains errors (duplicate customers, uncategorized expenses), causing dashboards to show incorrect insights; users distrust platform
- **Likelihood:** Low-Medium (most Xero users maintain reasonable data quality)
- **Impact:** Medium-High (loss of trust hard to recover; users revert to manual reporting)
- **Mitigation:**
  - Run data quality checks Week 2 after initial Xero sync (identify duplicates, null values, outliers)
  - Flag data quality issues to finance team with specific cleanup recommendations
  - Add data validation notes to dashboards ("Last updated [timestamp]," "Data quality score: 95%")
  - Defer dashboard launch if critical data quality issues found (better to delay than deliver bad data)

**10. Single VPS = Single Point of Failure (LOW RISK for MVP)**
- **Description:** VPS outage, hardware failure, or accidental deletion causes platform downtime; no redundancy
- **Likelihood:** Low (VPS providers have 99.9%+ uptime SLAs)
- **Impact:** Medium (hours of downtime acceptable for MVP; intolerable for production long-term)
- **Mitigation:**
  - Choose reputable VPS provider (DigitalOcean, Hetzner have strong uptime records)
  - Implement weekly VPS snapshots (automated backups, $1-2/month cost)
  - Document disaster recovery procedure (spin up new VPS from snapshot, update DNS)
  - Plan for high availability architecture post-MVP (load-balanced VPS, database replication)

### Open Questions

**Technical Questions:**

1. **What are the actual Xero API rate limits for our Xero plan tier?**
   - Need to verify: Does our Xero subscription have standard limits (60 req/min) or higher tier limits?
   - Who can answer: Finance team (check Xero plan details), Xero support
   - Decision impact: Determines sync frequency feasibility, may require architecture changes
   - Deadline: Week 1 (before committing to 2-hour sync design)

2. **Does n8n's Xero node support incremental updates, or only full refresh?**
   - Need to verify: Can we fetch only records modified since last sync (efficient) or must we re-fetch everything (slow, rate-limit prone)?
   - Who can answer: n8n documentation, n8n community forum, hands-on testing
   - Decision impact: Affects sync performance, API usage, Supabase storage growth
   - Deadline: Week 1 (during Xero node testing)

3. **What's the actual Xero data volume for our organization?**
   - Need to calculate: # invoices, contacts, transactions, payments, accounts × average record size
   - Who can answer: Run test sync Week 1, measure Supabase storage consumed
   - Decision impact: Determines if 500MB Supabase limit sufficient or Pro upgrade needed
   - Deadline: Week 2 (after initial full sync completes)

4. **Can Superset dashboards be parameterized by user context (role-based data filtering)?**
   - Need to verify: Can one "Revenue Dashboard" show different data based on logged-in user's role (execs see all, managers see their department only)?
   - Who can answer: Superset documentation, hands-on testing with RLS (Row-Level Security)
   - Decision impact: May reduce from 10 dashboards to 5-6 with parameterization (efficiency gain)
   - Deadline: Week 2 (during Superset architecture design)

5. **What's the recommended Superset embedding approach for Next.js?**
   - Need to research: iframe with token passing? Superset embedding SDK? Direct API access?
   - Who can answer: Superset docs, Next.js + Superset integration examples, Superset community
   - Decision impact: Determines Next.js portal architecture, authentication design
   - Deadline: Week 2 (before starting Next.js development)

6. **Does our team have Docker Compose and VPS deployment experience?**
   - Need to assess: Developer's actual skill level with Docker, Linux, SSH, nginx/Caddy reverse proxy
   - Who can answer: Direct conversation with developer Week 1
   - Decision impact: May need external DevOps support or managed alternatives if skills gap severe
   - Deadline: Day 1 (immediate assessment)

**Business Questions:**

7. **What are the specific 3 dashboard types for MVP, and who decides priority?**
   - Need to determine: Which dashboards eliminate most manual reporting burden? Which users benefit most?
   - Who can answer: Finance team (knows current reporting pain) + executives (strategic priorities)
   - Decision impact: Determines Week 2-3 dashboard development focus
   - Deadline: Week 1 (requirements workshop)

8. **What's the acceptable data latency for decision-making?**
   - Need to confirm: Is 2-hour sync truly sufficient, or do some decisions require hourly/real-time data?
   - Who can answer: Executives and managers (understand decision cadence)
   - Decision impact: May require real-time architecture (webhooks) if 2-hour unacceptable
   - Deadline: Week 1 (requirements workshop)

9. **Who are the exact 20 users, and what are their roles?**
   - Need to document: User names, email addresses, role assignments (executive, manager, staff)
   - Who can answer: HR/admin, finance team, department heads
   - Decision impact: Determines RBAC configuration, dashboard access mapping
   - Deadline: Week 1 (for Supabase user table setup)

10. **Is there budget flexibility if costs exceed $15/month but stay under $200/month?**
    - Need to clarify: If Supabase Pro ($25/month) + VPS upgrade ($40/month) = $65/month, is that acceptable?
    - Who can answer: Finance team, project sponsor
    - Decision impact: Determines upgrade triggers, architecture trade-offs
    - Deadline: Week 1 (before making cost-driven design decisions)

**Stakeholder/Process Questions:**

11. **Who has authority to approve dashboard designs before development?**
    - Need to clarify: Single decision-maker (CFO?) or committee approval (finance + exec team)?
    - Who can answer: Project sponsor, organizational leadership
    - Decision impact: Affects approval cycle speed, risk of design-by-committee delays
    - Deadline: Day 1 (establish governance immediately)

12. **What's the UAT process and timeline for Week 4?**
    - Need to define: How many test users? Testing duration (2 days? 5 days?)? Approval criteria?
    - Who can answer: Project sponsor, QA/test lead
    - Decision impact: Determines Week 4 schedule, when MVP can be declared "done"
    - Deadline: Week 3 (schedule UAT in advance)

13. **Is there a staging environment available, or is production-only acceptable for MVP?**
    - Need to confirm: Can we deploy directly to production, or must we test in staging first?
    - Who can answer: IT/infrastructure team, security/compliance officer
    - Decision impact: Staging environment adds infrastructure cost, complexity, but reduces production risk
    - Deadline: Week 1 (before VPS provisioning)

14. **What happens if MVP doesn't launch by October 31?**
    - Need to understand: Hard deadline (business consequence if missed) or soft deadline (preference but flexible)?
    - Who can answer: Project sponsor, executive team
    - Decision impact: Determines scope flexibility (can we cut features to hit deadline, or delay launch to ensure quality?)
    - Deadline: Day 1 (clarify stakes immediately)

### Areas Needing Further Research

**Xero Integration Deep Dive:**
- Map specific Xero API endpoints needed for each dashboard type
- Test Xero OAuth2 flow end-to-end with production credentials
- Understand Xero webhook availability and requirements (for future real-time sync)
- Research Xero API best practices (pagination, error handling, retry logic)

**Superset Architecture Research:**
- Review Superset security model (RBAC, RLS, dashboard permissions)
- Identify Superset embedding best practices for external authentication
- Understand Superset dashboard export/import process (for version control, disaster recovery)
- Test Superset performance with large datasets (10k+ rows) to validate VPS sizing

**Next.js Portal Design:**
- Define Next.js App Router structure (routes for login, dashboard home, embedded views)
- Research Supabase Auth + Next.js middleware patterns for protected routes
- Design role-based dashboard rendering logic (show/hide dashboards based on user role)
- Plan branding implementation (logo, color scheme, custom domain setup)

**Data Modeling & Schema Design:**
- Document Xero entity relationships (invoices → line_items, contacts → addresses)
- Design PostgreSQL schema optimized for dashboard queries (normalization vs. denormalization trade-offs)
- Plan indexing strategy (which fields users filter/sort by most frequently)
- Define data retention policy (archive old data, set up automated cleanup jobs)

**Security & Compliance:**
- Clarify data residency requirements (must Supabase be in AU region for compliance?)
- Understand audit logging requirements (who accessed what, when—needed for compliance?)
- Research HTTPS/SSL certificate automation (Let's Encrypt setup, renewal process)
- Define incident response plan (what to do if security breach detected)

**Deployment & DevOps:**
- Document VPS provisioning steps (server hardening, firewall rules, SSH key setup)
- Plan Docker Compose configuration (service dependencies, volume mounts, networking)
- Design monitoring strategy (what alerts needed? CPU/RAM/disk thresholds? uptime checks?)
- Create backup strategy (VPS snapshots, Supabase exports, n8n workflow backups, Superset config backups)

**User Training & Documentation:**
- Plan Week 4 training session format (live demo? recorded videos? written guides?)
- Outline "Quick Start Guide" content (how to log in, navigate portal, read dashboards)
- Document common dashboard use cases ("How to check monthly revenue," "How to view A/R aging")
- Create admin documentation (how to add users, update dashboards, troubleshoot sync issues)

---

## Next Steps

### Immediate Actions (Week 1)

**Day 1 - Project Kickoff & Critical Decisions**
1. Conduct stakeholder alignment meeting to answer critical questions:
   - Confirm exact 20 user list with names, emails, and role assignments
   - Clarify hard vs. soft deadline for October 31 launch
   - Establish decision-making authority for dashboard approvals
   - Confirm budget flexibility parameters
2. Assess development team capabilities:
   - Verify Docker Compose and VPS deployment experience
   - Identify skill gaps requiring external support or training
   - Confirm full-time developer availability (no competing priorities)
3. Review Xero environment:
   - Document current Xero plan tier and API rate limits
   - Identify any custom fields, add-ons, or non-standard configurations
   - Gather Xero OAuth2 credentials (Client ID, Client Secret)

**Days 2-5 - Technical Validation Sprint**
4. Provision VPS infrastructure (Hetzner Cloud 4GB RAM recommended):
   - Deploy n8n via Docker Compose
   - Configure HTTPS with Let's Encrypt
   - Set up basic monitoring (CPU, RAM, disk usage alerts)
5. Test n8n Xero integration thoroughly:
   - Configure OAuth2 connection to production Xero organization
   - Build test workflow: fetch 100 invoices from Xero
   - Verify data structure, authentication flow, error handling
   - Document any limitations or gaps in Xero node functionality
6. Set up Supabase project:
   - Create database with basic schema (invoices, contacts tables)
   - Configure authentication with test users
   - Estimate data volume: run initial Xero sync, measure storage consumed
7. Deploy Apache Superset:
   - Install Superset on VPS via Docker
   - Connect to Supabase PostgreSQL database
   - Build "Hello World" test dashboard with sample Xero data
   - Test iframe embedding with basic HTML page

**Week 1 Deliverables & Go/No-Go Decision**
- **Technical proof of concept:** n8n → Xero → Supabase → Superset pipeline working end-to-end
- **Dashboard requirements defined:** 3 MVP dashboards identified with specific KPIs and visualizations
- **Risk assessment updated:** Learning curve risks validated or invalidated based on Week 1 experience
- **Go/No-Go decision point:** If critical blockers discovered (Xero node broken, Superset too complex), decide to proceed, pivot tools, or abort project

### Week 2-4 - MVP Development

**Week 2: ETL Pipeline & Data Foundation**
- Build production n8n workflow (Xero → Supabase full ETL pipeline)
- Design and implement PostgreSQL schema for all Xero entities
- Configure 2-hour scheduled sync with error handling and retry logic
- Monitor initial data sync, validate data quality, calculate actual storage usage
- Build first MVP dashboard as prototype for stakeholder feedback

**Week 3: Dashboard Development & Portal Build**
- Complete remaining 2 MVP dashboards (3 total)
- Build Next.js web portal with authentication and role-based access
- Implement Superset dashboard embedding with authentication integration
- Apply branding (logo, colors, custom domain)
- Internal testing by development team

**Week 4: User Acceptance Testing & Launch**
- Deploy to production environment
- Onboard all 20 users (create accounts, assign roles, distribute credentials)
- Conduct UAT with 5+ representative users (executives, managers, staff)
- User training sessions (live demos, Quick Start Guide distribution)
- Address critical bugs and feedback from UAT
- **Production launch:** October 31, 2025

### Month 2-3 - Post-MVP Enhancements

**Month 2: Dashboard Suite Completion**
- Conduct requirements workshop for remaining 7 dashboards
- Prioritize dashboard development based on user feedback and business impact
- Build and deploy Dashboards 4-10
- Enhance authentication system (user management UI, password policies, session management)
- Collect user feedback on initial 3 dashboards, iterate based on insights

**Month 3: Refinement & Optimization**
- Optimize dashboard performance based on usage patterns
- Implement requested dashboard modifications from user feedback
- Add polish features (data export, scheduled reports if time permits)
- Measure success metrics: adoption rate, time savings, user satisfaction
- Document lessons learned, update architecture docs
- Plan Phase 2 roadmap (real-time sync, mobile optimization, advanced RBAC)

### PM Handoff

This Project Brief provides the full context for **XeroPulse**. The brief documents:

- **Business case:** Automated financial dashboards at 98% cost savings vs. commercial BI tools
- **Technical architecture:** Open-source stack (n8n, Supabase, Superset, Next.js) optimized for $15/month operating cost
- **MVP scope:** 3 dashboards, 20 users, 4-week timeline ending October 31, 2025
- **Validated approach:** Based on comprehensive brainstorming session analyzing 45+ technical options
- **Risk mitigation:** 10 identified risks with specific mitigation strategies
- **Open questions:** 14 critical questions requiring stakeholder input Week 1

**Key clarifications incorporated:**
- Full authentication system completes in Month 1 (not just basic auth)
- Dashboard requirements and names TBD during stakeholder workshop
- Remaining 7 dashboards deferred to Month 2 with requirements gathering session

**Recommended next actions:**
1. Schedule Day 1 stakeholder kickoff meeting to resolve open questions
2. Begin VPS provisioning and n8n/Superset technical validation immediately
3. Conduct dashboard requirements workshop Week 1 with finance team and executives
4. Establish weekly check-ins to monitor progress against aggressive 4-week timeline

**Success criteria:** By October 31, deliver automated Xero dashboard platform that eliminates 5-10 hours weekly of manual reporting, provides sub-60-second insight access for 20 users, and operates at <$20/month cost—all while maintaining 95%+ data sync reliability and 99%+ system uptime.

---

*Project Brief completed: Ready for stakeholder review and project kickoff*

