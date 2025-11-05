# XeroPulse Source Tree

**Last Updated**: 2025-10-24
**Project Status**: Planning Phase - Next.js MVP initialized

---

## Root Directory Structure

```
XeroPulse/
├── .bmad-core/                 # BMAD Core framework configuration
├── .claude/                    # Claude Code slash commands
├── .github/                    # GitHub chatmodes and CI/CD
├── .next/                      # Next.js build output (generated)
├── app/                        # Next.js 14+ App Router pages
├── components/                 # React components
├── docs/                       # Comprehensive project documentation
├── lib/                        # Utility libraries and Supabase clients
├── node_modules/               # NPM dependencies (generated)
├── public/                     # Static assets
├── scripts/                    # Automation scripts
├── .env.local                  # Environment variables (gitignored)
├── .gitignore                  # Git ignore patterns
├── CLAUDE.md                   # Claude Code instructions
├── LICENSE                     # MIT License
├── README.md                   # Project overview
├── middleware.ts               # Next.js middleware (auth)
├── next.config.ts              # Next.js configuration
├── package.json                # NPM dependencies
└── tsconfig.json               # TypeScript configuration
```

---

## App Directory (`/app`)

**Pattern**: Next.js 14 App Router with Route Groups

```
app/
├── auth/                       # Authentication routes
│   ├── confirm/
│   │   └── route.ts           # Email confirmation callback
│   ├── error/
│   │   └── page.tsx           # Auth error page
│   ├── forgot-password/
│   │   └── page.tsx           # Password reset request
│   ├── login/
│   │   └── page.tsx           # Login page
│   ├── sign-up/
│   │   └── page.tsx           # User registration
│   ├── sign-up-success/
│   │   └── page.tsx           # Registration success page
│   └── update-password/
│       └── page.tsx           # Password update page
├── protected/                  # Authenticated routes
│   ├── layout.tsx             # Protected layout wrapper
│   └── page.tsx               # Protected dashboard (placeholder)
├── globals.css                # Global styles
├── layout.tsx                 # Root layout
└── page.tsx                   # Landing page
```

**Future Structure** (Post-MVP):
```
app/
├── (dashboard)/               # Dashboard route group
│   ├── dashboard-1/           # Income vs Expenses
│   ├── dashboard-2/           # Monthly Budget
│   ├── dashboard-3/           # Cumulative Budget
│   ├── dashboard-4/           # WIP by Team
│   ├── dashboard-5/           # ATO Lodgment
│   ├── dashboard-6/           # Services Analysis
│   ├── dashboard-7/           # Debtors Aging
│   └── dashboard-8/           # Client Recoverability
├── (admin)/                   # Admin route group
│   ├── users/                 # User management
│   ├── sync/                  # ETL sync status
│   └── settings/              # Organization settings
└── api/                       # API routes (tRPC)
    ├── trpc/
    │   └── [trpc]/
    │       └── route.ts       # tRPC handler
    └── webhooks/
        └── n8n/
            └── route.ts       # n8n webhook receiver
```

---

## Components Directory (`/components`)

**Pattern**: Atomic Design with Chakra UI

```
components/
├── chakra/                    # Chakra UI theme and providers
│   ├── theme/                 # Custom theme configuration
│   │   ├── index.ts           # Main theme (extends Chakra)
│   │   ├── colors.ts          # Brand color palette
│   │   ├── components.ts      # Component style overrides
│   │   └── foundations.ts     # Typography, spacing
│   └── provider.tsx           # ChakraProvider wrapper
├── ui/                        # Custom Chakra UI wrapper components
│   ├── motion.tsx             # MotionBox, MotionFlex wrappers
│   ├── data-table.tsx         # Chakra Table wrapper
│   └── stat-card.tsx          # Custom stat card component
├── ag-grid/                   # AG-UI Enterprise components (4 tables)
│   ├── user-grid.tsx          # User management table
│   ├── wip-grid.tsx           # WIP analysis table
│   ├── services-grid.tsx      # Services analysis table
│   └── recovery-grid.tsx      # Client recoverability table
├── auth/                      # Auth-specific components
│   ├── auth-button.tsx
│   ├── forgot-password-form.tsx
│   ├── login-form.tsx
│   ├── logout-button.tsx
│   ├── sign-up-form.tsx
│   └── update-password-form.tsx
├── tutorial/                  # Tutorial components (MVP only)
│   ├── code-block.tsx
│   ├── connect-supabase-steps.tsx
│   ├── fetch-data-steps.tsx
│   ├── sign-up-user-steps.tsx
│   └── tutorial-step.tsx
├── deploy-button.tsx
├── env-var-warning.tsx
├── hero.tsx
├── next-logo.tsx
├── supabase-logo.tsx
└── theme-switcher.tsx
```

**Future Components** (Post-MVP):
```
components/
├── dashboards/                # Dashboard-specific components
│   ├── dashboard-1/
│   │   ├── income-chart.tsx
│   │   ├── expense-chart.tsx
│   │   └── rolling-avg-chart.tsx
│   ├── dashboard-2/
│   │   └── budget-bar-chart.tsx
│   └── ...
├── charts/                    # Reusable chart components
│   ├── bar-chart.tsx
│   ├── line-chart.tsx
│   ├── area-chart.tsx
│   ├── donut-chart.tsx
│   └── radial-progress.tsx
├── tables/                    # Reusable table components
│   ├── data-table.tsx
│   ├── sortable-header.tsx
│   └── pagination.tsx
└── filters/                   # Reusable filter components
    ├── date-range-picker.tsx
    ├── fiscal-year-selector.tsx
    └── multi-select.tsx
```

---

## Library Directory (`/lib`)

**Pattern**: Utility functions and API clients

```
lib/
├── supabase/                  # Supabase client configurations
│   ├── client.ts             # Browser client
│   ├── middleware.ts         # Middleware client
│   └── server.ts             # Server client
└── utils.ts                   # Utility functions (cn, etc.)
```

**Future Structure** (Post-MVP):
```
lib/
├── api/                       # API client wrappers
│   ├── xero.ts               # Xero API utilities
│   └── xpm.ts                # XPM API utilities
├── auth/                      # Authentication utilities
│   ├── session.ts            # Session management
│   └── rbac.ts               # Role-based access control
├── trpc/                      # tRPC configuration
│   ├── client.ts             # tRPC client
│   └── server.ts             # tRPC server
└── formatters/                # Data formatters
    ├── currency.ts           # Currency formatting
    └── date.ts               # Date formatting
```

---

## Documentation Directory (`/docs`)

**Pattern**: Comprehensive project documentation

```
docs/
├── architecture/              # System architecture
│   ├── api-specification.md
│   ├── backend-architecture.md
│   ├── components.md
│   ├── core-workflows.md
│   ├── dashboard-specifications.md  # NEW: 1200+ lines
│   ├── database-schema.md
│   ├── deployment-architecture.md
│   ├── external-apis.md
│   ├── frontend-architecture.md
│   ├── high-level-architecture.md
│   ├── index.md
│   ├── security-architecture.md
│   ├── source-tree.md         # THIS FILE
│   └── tech-stack.md
├── prd/                       # Product Requirements
│   ├── epic-1-foundation-data-pipeline-infrastructure.md
│   ├── epic-2-mvp-dashboard-suite-portal-launch.md
│   ├── epic-3-complete-dashboard-suite-with-xpm-integration.md
│   ├── epic-4-platform-refinement-advanced-features.md
│   ├── epic-list.md
│   ├── index.md
│   └── requirements.md
├── stories/                   # User stories (Epic 1)
│   ├── 1.0.nextjs-project-init.md
│   ├── 1.1.vps-infrastructure.md
│   ├── 1.2.n8n-deployment.md
│   ├── 1.3.supabase-database-schema.md
│   ├── 1.4.xero-api-integration.md
│   ├── 1.5.xero-supabase-etl.md
│   ├── 1.6.metabase-deployment.md
│   ├── 1.7.income-expenses-dashboard.md
│   ├── 1.8.supabase-auth.md
│   └── 1.9.nextjs-portal-embedding.md
├── ai-prompts/                # AI code generation prompts
│   ├── 01-authentication-system.md
│   ├── 02-dashboard-shell-navigation.md
│   ├── 03-user-management-admin.md
│   ├── 04-responsive-accessibility.md
│   └── platform-ui-master-prompt.md
├── bi_docs/                   # BI platform documentation
│   └── supabase-cred.md      # Supabase credentials
├── archon_ai.md               # ⭐ READ FIRST - Archon MCP workflow
├── brief.md                   # Comprehensive project brief
├── dashboard-implementation-checklist.md  # Implementation tracking
├── DOCUMENTATION-UPDATE-PLAN.md  # Documentation update strategy
├── executive-summary.md       # 1-page leadership overview
├── front-end-spec.md          # Complete UX design spec
├── xero-api-endpoint-mapping.md  # 1077 lines - API mappings
└── xero-api-endpoint-mapping-expanded.md  # 2674 lines - ETL architecture
```

---

## Configuration Files

### Next.js & React
- `next.config.ts` - Next.js configuration
- `middleware.ts` - Supabase auth middleware
- `tsconfig.json` - TypeScript configuration

### Styling & Theme
- `components/chakra/theme/index.ts` - Chakra UI theme configuration
- `app/globals.css` - Global CSS and resets

### BMAD Core
- `.bmad-core/core-config.yaml` - Project structure configuration
- `.bmad-core/agents/` - BMAD agent definitions
- `.bmad-core/tasks/` - BMAD task templates

### Environment
- `.env.local` - Local environment variables (gitignored)
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

---

## Technology Stack Summary

| Layer | Technology | Configuration |
|-------|------------|---------------|
| **Frontend** | Next.js 14.2.5 | App Router, TypeScript |
| **UI Components** | Chakra UI 2.8+ | Type-safe style props, WCAG 2.0 AA |
| **Data Grids** | AG-UI Enterprise | 4 complex tables only |
| **Animation** | Chakra UI Motion | Integrated Framer Motion |
| **Database** | Supabase PostgreSQL | Sydney AU region |
| **Authentication** | Supabase Auth | Email/password, RLS |
| **State Management** | React Server Components | Server-first architecture |
| **Type Safety** | TypeScript 5.0+ | Strict mode enabled |
| **Package Manager** | npm | v10+ |
| **Deployment** | Vercel | Free tier (planned) |

---

## File Naming Conventions

### Pages (App Router)
- `page.tsx` - Route page component
- `layout.tsx` - Layout wrapper
- `route.ts` - API route handler
- `loading.tsx` - Loading UI
- `error.tsx` - Error boundary

### Components
- `kebab-case.tsx` for all React component files (e.g., `login-form.tsx`)
- `*.tsx` for React components
- `*.ts` for utilities and configurations

### Documentation
- `kebab-case.md` for all markdown files
- Numbered stories: `1.0.story-name.md`
- Epic prefixes: `epic-1-name.md`

---

## Future Directories (Not Yet Created)

```
/apps                          # Monorepo structure (future)
├── web/                       # Next.js frontend
├── api/                       # PydanticAI FastAPI backend
├── n8n-workflows/             # n8n workflow exports
└── metabase-config/           # Metabase dashboard exports

/packages                      # Shared packages (future)
├── ui/                        # Shared UI components
├── types/                     # Shared TypeScript types
└── utils/                     # Shared utilities

/infrastructure                # IaC and deployment (future)
├── docker/                    # Docker Compose files
├── terraform/                 # Terraform scripts (if needed)
└── scripts/                   # Deployment automation
```

---

## Key Files by Use Case

### Starting Development
1. `CLAUDE.md` - Claude Code instructions
2. `docs/archon_ai.md` - Archon MCP workflow
3. `docs/architecture/tech-stack.md` - Technology decisions
4. `package.json` - Install dependencies

### Understanding Architecture
1. `docs/architecture/index.md` - Architecture overview
2. `docs/architecture/high-level-architecture.md` - System design
3. `docs/architecture/database-schema.md` - Database structure
4. `docs/architecture/core-workflows.md` - Data flows

### Building Dashboards
1. `docs/architecture/dashboard-specifications.md` - Visual components (1200+ lines)
2. `docs/xero-api-endpoint-mapping.md` - API endpoints (1077 lines)
3. `docs/xero-api-endpoint-mapping-expanded.md` - ETL architecture (2674 lines)
4. `docs/dashboard-implementation-checklist.md` - Implementation tracking

### Implementing Stories
1. `docs/prd/index.md` - All user stories
2. `docs/stories/1.X.story-name.md` - Story details
3. `docs/ai-prompts/platform-ui-master-prompt.md` - Code generation

---

## Notes

- **Monorepo Ready**: Current structure is flat but can be migrated to monorepo (apps/, packages/) in Epic 4
- **Next.js 14+**: Using App Router exclusively (no Pages Router)
- **Chakra UI 2.8+**: Type-safe style props with WCAG 2.0 AA compliance
- **AG-UI Enterprise**: Limited to 4 complex data grids
- **TypeScript Strict Mode**: All files must be type-safe
- **Supabase Client Types**: Auto-generated from database schema

**Status**: MVP initialization complete, Epic 1 implementation pending

---

**Maintained by**: Architect Agent (Winston)
**Documentation Standard**: Follow `docs/DOCUMENTATION-UPDATE-PLAN.md`
