# Tech Stack

This is the DEFINITIVE technology selection for the entire project. All development must use these exact versions and specifications.

| Category | Technology | Version | Purpose | Rationale |
|----------|------------|---------|---------|-----------|
| **Frontend Language** | TypeScript | 5.0+ | Type-safe React development | Enhanced developer experience, compile-time error catching, better AI code generation |
| **Frontend Framework** | Next.js | 14+ (App Router) | React-based fullstack framework | Server-side rendering, API routes, optimal Vercel deployment, file-based routing |
| **UI Component Library** | AG-UI Enterprise | Latest | Data-intensive dashboard interfaces | Enterprise-grade data grids, charts, complex UI patterns optimized for financial data |
| **Base Components** | Shadcn/ui v4 | 4.0+ | Accessible component foundations | Headless, customizable, WCAG AA compliant, MCP integration support |
| **State Management** | React Server Components + Context | React 18+ | Client/server state coordination | Leverages Next.js 14 architecture, minimal client-side state, server-first approach |
| **CSS Framework** | Tailwind CSS | 3.4+ | Utility-first styling | Consistent design system, rapid development, AG-UI integration, responsive utilities |
| **Backend Language** | TypeScript | 5.0+ | Unified language across stack | Code sharing between frontend/backend, consistent tooling, type safety |
| **Backend Framework** | Next.js API Routes | 14+ | Serverless API endpoints | Unified deployment, automatic optimization, Vercel edge functions |
| **API Style** | REST + tRPC | tRPC 10+ | Type-safe API layer | End-to-end type safety, excellent DX, automatic client generation |
| **Database** | Supabase PostgreSQL | Latest | Managed PostgreSQL with RLS | Row Level Security, real-time subscriptions, authentication integration, AU region |
| **Cache** | Redis (Upstash) | 7.0+ | Session and query caching | Serverless Redis, API caching, session storage |
| **File Storage** | Supabase Storage | Latest | User uploads and assets | Integrated with auth, CDN delivery, secure access policies |
| **Authentication** | Supabase Auth | Latest | User authentication and authorization | OAuth providers, RLS integration, session management, password policies |
| **ETL Platform** | n8n | Latest | Workflow automation and data pipelines | Visual workflow builder, Xero/XPM connectors, scheduling, monitoring |
| **BI Platform** | Metabase | Latest | Embedded business intelligence | Dashboard creation, PostgreSQL integration, embedding capabilities, role-based access |
| **AI Backend** | PydanticAI + FastAPI | Latest | Conversational analytics service | Type-safe AI responses, FastAPI performance, independent scaling |
| **Chat Interface** | CopilotKit (Self-hosted) | Latest | Conversational UI components | React integration, customizable chat UI, fallback to custom implementation |
| **Frontend Testing** | Jest + React Testing Library | Latest | Component and unit testing | React-focused testing, accessibility testing, snapshot testing |
| **Backend Testing** | Jest + Supertest | Latest | API endpoint testing | Request/response testing, database mocking, integration testing |
| **E2E Testing** | Playwright | Latest | End-to-end user flows | Multi-browser testing, visual regression, CI/CD integration |
| **Build Tool** | Next.js built-in | 14+ | Compilation and bundling | Webpack abstraction, automatic optimization, tree shaking |
| **Bundler** | Webpack (via Next.js) | 5.0+ | Module bundling and optimization | Code splitting, dynamic imports, asset optimization |
| **IaC Tool** | Terraform | 1.5+ | Infrastructure as code | Repeatable deployments, version control, multi-environment |
| **CI/CD** | GitHub Actions | Latest | Automated testing and deployment | Vercel integration, automated testing, preview deployments |
| **Monitoring** | Vercel Analytics + Sentry | Latest | Performance and error tracking | Real-time monitoring, error reporting, performance insights |
| **Logging** | Pino + Better Stack | Latest | Structured logging | JSON logging, log aggregation, searchable logs |

---

**Detailed Rationale:**

**Trade-offs and Key Decisions:**

- **AG-UI vs. Pure Shadcn/ui**: AG-UI chosen for enterprise data grid capabilities required for complex financial dashboards, with Shadcn v4 as the foundation for other UI elements. This hybrid approach provides both enterprise functionality and design system consistency.

- **Metabase vs. Apache Superset**: Metabase selected for superior embedding capabilities, simpler deployment, and better commercial support. Note: This corrects the discrepancy in the front-end spec which mentioned Superset.

- **Next.js API Routes vs. Separate Backend**: Unified Next.js deployment chosen for development velocity and Vercel optimization. tRPC provides type safety between frontend and API routes.

- **PydanticAI as NFR**: AI service deployed separately to avoid blocking core BI functionality. FastAPI provides high performance for AI inference workloads.

- **Self-hosted CopilotKit**: Maintains data privacy and customization control while providing conversational interface capabilities.

**Key Assumptions:**
- 20 concurrent users don't require microservices architecture complexity
- Vercel platform provides sufficient scaling for projected usage
- AG-UI licensing model works for internal business intelligence application
- Australian data residency requirements met by Supabase AU region selection

**Areas Needing Validation:**
- Confirm AG-UI Enterprise licensing cost fits within budget constraints
- Validate Metabase embedding authentication with Supabase Row Level Security
- Verify CopilotKit self-hosting requirements and complexity
- Test tRPC performance with complex financial data queries

Perfect! I'll continue to the next section - **Data Models**. Let me proceed with defining the core data models that will be shared between frontend and backend.

---
