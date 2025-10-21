# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**XeroPulse** is an open-source financial intelligence platform that transforms Xero accounting data into role-based dashboards. The platform combines Next.js, Supabase, n8n ETL workflows, Metabase BI, and PydanticAI to deliver automated financial reporting at $15/month operating cost (vs. $750+ for commercial BI platforms).

**Current Status**: Planning phase - comprehensive architecture and PRD documentation complete, implementation pending.

## Architecture

### Tech Stack

**Frontend**: Next.js 14+ (App Router), TypeScript 5.0+, AG-UI Enterprise + Shadcn/ui v4, Tailwind CSS 3.4+
**Backend**: Next.js API Routes + tRPC 10+, TypeScript 5.0+
**Database**: Supabase PostgreSQL (with Row Level Security)
**Authentication**: Supabase Auth
**ETL Pipeline**: n8n (Xero/XPM data sync every 2 hours)
**BI Platform**: Metabase (embedded dashboards)
**AI Service**: PydanticAI + FastAPI (conversational analytics, NFR)
**Chat Interface**: CopilotKit (self-hosted)
**Deployment**: Vercel (Next.js), AWS Sydney region (Supabase), VPS (n8n + Metabase)

### High-Level Architecture

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
│  Next.js    │◄─────────────────►│ Metabase │
│   Portal    │                   │Dashboard │
└─────────────┘                   └──────────┘
       │
       │ API calls
       ▼
┌─────────────┐
│ PydanticAI  │ (NFR - conversational analytics)
│   FastAPI   │
└─────────────┘
```

### Architectural Patterns

- **Jamstack**: Static site generation with serverless API routes
- **API-First Design**: All data access through well-defined tRPC contracts
- **Database-per-Service**: Logical separation via PostgreSQL schemas + RLS policies
- **Event-Driven ETL**: n8n workflows triggered by webhooks and schedules
- **Embedded Analytics**: Metabase dashboards via secure JWT-signed iframe embedding
- **Microservice Enhancement**: PydanticAI as separate service (non-blocking AI features)
- **Progressive Enhancement**: Core BI functionality works without AI layer

## Key Design Principles

### Security & Multi-Tenancy

- **Organization Isolation**: All data scoped by `organization_id` with Supabase Row Level Security
- **Role-Based Access**: 4 roles (executive, manager, staff, admin) with dashboard-level permissions
- **Staff Restrictions**: Staff users see only assigned clients and their own time entries
- **Session Management**: 8-hour JWT sessions with 30-minute auto-refresh
- **Embed Security**: Metabase dashboards signed with user-specific JWT containing security params

### Data Flow

1. **n8n** extracts Xero/XPM data via OAuth2 every 2 hours (scheduled) or via webhook (real-time)
2. Data transformed and loaded into **Supabase PostgreSQL** with audit logging
3. **Metabase** queries Supabase and generates interactive dashboards
4. **Next.js portal** embeds Metabase dashboards with JWT-signed URLs (user context + RLS params)
5. **PydanticAI** provides conversational analytics as optional enhancement layer

## Database Schema Key Points

### Core Tables

- `organizations` - Multi-tenant org data, Xero/XPM connection status
- `users` - User profiles with role-based access control
- `financial_data` - Unified financial transactions from Xero (invoices, payments, expenses)
- `project_data` - Time tracking and WIP data from XPM/Workflow Max
- `clients` - Master contact data reconciled from Xero and XPM
- `dashboard_configs` - Metabase dashboard metadata and access rules
- `sync_sessions` - ETL execution tracking with error handling
- `admin_actions` - Comprehensive audit trail

### Important Constraints

- All user-facing tables have RLS policies enabled
- Organization isolation enforced at database level via RLS
- Composite unique constraints on `(organization_id, source, source_id)` for idempotent syncs
- Partial indexes for active records only (performance optimization)
- Automatic `updated_at` triggers on all tables

### Performance Indexes

- Composite indexes for dashboard queries: `(organization_id, transaction_date DESC)`
- Covering indexes for auth lookups: `(email, organization_id) INCLUDE (id, role, active)`
- Partial indexes for recent data: `WHERE created_at > now() - INTERVAL '30 days'`

## Core Workflows

### 1. Data Synchronization (n8n → Supabase)

**Triggers**: Scheduled (2hr), Webhook (real-time), Manual (admin)
**Steps**: Extract Xero/XPM → Transform → Validate → Load → Update metadata → Refresh Metabase cache
**Error Handling**: Exponential backoff retry, auth token refresh, partial sync on data quality issues
**Logging**: `sync_sessions` table tracks status, `sync_logs` table for detailed debugging

### 2. User Authentication & Authorization

**Login**: Validate credentials → Create session → Generate JWT → Fetch role permissions → Get authorized dashboards
**Account Lockout**: 5 failed attempts = 15 minute lock
**Session**: 8-hour duration with auto-refresh at 30 minutes before expiry
**RLS**: User context automatically applied to all database queries via Supabase auth

### 3. Dashboard Embedding & Access

**Flow**: Validate session → Check dashboard permissions → Build user context → Generate signed Metabase JWT → Return iframe URL
**User Context**: Includes `organization_id`, role-specific filters (staff: `user_id` + `assigned_clients`, manager: `department` + `team_members`)
**Audit**: Every dashboard access logged to `dashboard_access` table

### 4. User Management & Provisioning

**Creation**: Admin validates → Create Supabase Auth user → Insert user record → Send invitation email
**Role Change**: Update role → Invalidate existing sessions → Log admin action
**Deactivation**: Soft delete (mark inactive) → Revoke sessions → Disable Supabase auth

## Development Commands

**Note**: No package.json exists yet. These commands will be relevant once implementation begins.

### Expected Commands (Future)

```bash
# Development
npm install              # Install dependencies
npm run dev             # Start Next.js dev server (http://localhost:3000)
npm run build           # Build for production
npm run start           # Start production server

# Testing
npm test                # Run Jest unit tests
npm run test:e2e        # Run Playwright E2E tests
npm run test:watch      # Jest watch mode

# Linting & Formatting
npm run lint            # ESLint check
npm run lint:fix        # Auto-fix linting issues
npm run format          # Prettier format

# Database
npm run db:migrate      # Run Supabase migrations
npm run db:seed         # Seed development data
npm run db:reset        # Reset local database

# Type Checking
npm run type-check      # TypeScript compiler check
```

## Important Documentation Files

### Product Requirements
- `docs/prd/index.md` - Unified PRD with all epics and user stories
- `docs/prd/epic-list.md` - Development phase strategy (6 epics)
- `docs/prd/requirements.md` - Functional and non-functional requirements

### Architecture
- `docs/architecture/index.md` - Complete architecture documentation
- `docs/architecture/tech-stack.md` - **DEFINITIVE** technology selection (all versions specified)
- `docs/architecture/database-schema.md` - Complete schema with RLS policies
- `docs/architecture/core-workflows.md` - Detailed workflow implementations
- `docs/architecture/frontend-architecture.md` - Next.js + AG-UI component patterns
- `docs/architecture/backend-architecture.md` - API routes + tRPC design

### AI Prompts (Code Generation Ready)
- `docs/ai-prompts/platform-ui-master-prompt.md` - Master prompt (generates entire platform in 1-2 days)
- `docs/ai-prompts/01-authentication-system.md` - Auth system (2-3 hours)
- `docs/ai-prompts/02-dashboard-shell-navigation.md` - Dashboard shell (3-4 hours)
- `docs/ai-prompts/03-user-management-admin.md` - Admin panel (4-5 hours)
- `docs/ai-prompts/04-responsive-accessibility.md` - Mobile + WCAG AA (3-4 hours)

### Project Documentation
- `README.md` - Project overview, roadmap, installation guide
- `docs/brief.md` - Comprehensive project brief (11 sections)
- `docs/executive-summary.md` - 1-page leadership overview
- `docs/front-end-spec.md` - Complete UX design specification

## Implementation Strategy

### Epic Sequencing

**Epic 1**: Foundation & Data Pipeline Infrastructure (4 weeks)
- Supabase setup, database schema, RLS policies, n8n Xero integration

**Epic 2**: MVP Dashboard Suite & Portal Launch (3 weeks)
- Next.js app, Supabase Auth, 3 core Metabase dashboards, iframe embedding

**Epic 3**: Complete Dashboard Suite with XPM Integration (4 weeks)
- 7 additional dashboards, XPM data integration, advanced RBAC

**Epic 4**: Platform Refinement & Advanced Features (3 weeks)
- Performance optimization, monitoring, AI integration (PydanticAI + CopilotKit)

### Critical Dependencies

- **Xero API Access**: Standard or Premium plan required for OAuth2 and data access
- **Workflow Max V2 API**: Required for XPM integration (Epic 3) - availability TBD
- **Metabase Embedding License**: Validate licensing model for commercial internal use
- **AG-UI Enterprise License**: Confirm licensing cost fits budget constraints
- **Supabase AU Region**: Required for Australian data residency compliance

## Common Gotchas

### Database

- **RLS Testing**: Always test with actual user sessions, not service role. RLS policies only enforce with authenticated users.
- **Organization Isolation**: Every query must filter by `organization_id` - RLS policies enforce this but validate manually.
- **Sync Idempotency**: Use `UPSERT` with `(organization_id, source, source_id)` composite key to handle duplicate sync attempts.

### Authentication

- **JWT Expiry**: Metabase embed tokens expire in 1 hour - implement auto-refresh before expiration.
- **Session Invalidation**: Role changes require session invalidation to update permissions immediately.
- **Staff Restrictions**: Staff users have client-level filtering - always include `assigned_clients` in security params.

### Dashboard Embedding

- **CORS Configuration**: Metabase must whitelist Next.js domain for iframe embedding.
- **Security Params**: Every dashboard embed URL must include user-specific security context in JWT payload.
- **Cache Management**: Trigger Metabase cache refresh after ETL sync completes to show latest data.

### ETL Pipeline

- **Rate Limits**: Xero API has rate limits - implement exponential backoff in n8n workflows.
- **Token Refresh**: OAuth tokens expire - store refresh tokens and handle renewal automatically.
- **Partial Syncs**: Don't fail entire sync on single record error - log and continue with partial sync.

## Project Status & Next Steps

**Current Phase**: Planning complete, implementation pending (as of October 2025)

**Before Starting Development**:

1. Validate Metabase embedding licensing for internal business use
2. Confirm AG-UI Enterprise licensing fits budget (<$20/month operating cost target)
3. Set up Xero Developer account and obtain OAuth2 credentials
4. Provision Supabase account (AU region) and obtain connection credentials
5. Set up VPS hosting for n8n and Metabase (Hetzner Cloud recommended)

**First Implementation Tasks**:

1. Initialize Next.js 14+ project with TypeScript and App Router
2. Set up Supabase project and run database migrations from `docs/architecture/database-schema.md`
3. Configure Supabase Auth with email/password provider
4. Implement basic authentication flow using `docs/ai-prompts/01-authentication-system.md`
5. Deploy n8n to VPS and configure Xero OAuth credentials

## Contact & Support

- **Repository**: https://github.com/santhuka/XeroPulse
- **Issues**: https://github.com/santhuka/XeroPulse/issues
- **Documentation**: `docs/` directory

## Key Constraints

- **Budget**: Target $15-20 AUD/month total operating cost
- **Performance**: Sub-3-second dashboard load times, 95%+ data sync reliability
- **Security**: Australian data residency, WCAG AA accessibility, enterprise auth
- **Scale**: Support 20+ concurrent users, millions of financial transactions
