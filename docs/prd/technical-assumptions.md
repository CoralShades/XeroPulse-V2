# Technical Assumptions

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
