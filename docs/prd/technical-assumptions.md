# Technical Assumptions

### Repository Structure: Monorepo

The project will use a monorepo structure with Next.js App Router, containing the main application, API routes, and supporting configurations in a single repository for streamlined development and deployment.

**Monorepo Tool:** npm workspaces (lightweight, Next.js native)

**Package Organization:**
- Core Next.js app contains frontend, API routes, and shared utilities
- Separate repositories for PydanticAI service and n8n workflows
- Shared TypeScript types package for API contracts between services

### Service Architecture: Hybrid (Frontend Monolith + Microservice AI Backend)

- **Frontend**: Next.js 14+ application serving as the primary user interface and dashboard portal
- **AI Backend**: Separate PydanticAI FastAPI microservice for conversational analytics (deployed as NFR)
- **Database & Auth**: Supabase PostgreSQL with Row Level Security and authentication (AU region for data residency)
- **Cache Layer**: Redis (Upstash) for session storage and query result caching
- **ETL Pipeline**: n8n cloud instance for primary data extraction and transformation workflows
- **BI Engine**: Metabase for embedded dashboard generation and data visualization

**Platform & Infrastructure:**
- **Primary Deployment:** Vercel (Next.js optimization, global edge network)
- **Database & Auth:** Supabase (PostgreSQL with RLS, Auth, Real-time subscriptions)
- **Region:** AWS Asia-Pacific (Sydney) for Australian financial compliance
- **CDN:** Global edge locations via Vercel network

### Testing Requirements: Comprehensive Multi-Layer Testing

- **Unit Testing**: Jest + React Testing Library for component and utility function testing
- **Integration Testing**: API route testing with Next.js test utilities and Supabase client mocking
- **E2E Testing**: Playwright for critical user journeys (authentication, dashboard access, Xero OAuth)
- **AI Testing**: Separate test suite for PydanticAI conversational interface validation

### Frontend Technology Stack

- **Framework**: Next.js 14+ with App Router for modern React development patterns
- **UI Components**:
  - **Primary**: Chakra UI 2.8+ with MCP integration for accessible, type-safe UI components (95% coverage)
  - **Data Grids**: AG-UI Enterprise for complex tables only (4 tables: user management, WIP analysis, services analysis, client recoverability)
- **Animation**: Chakra UI Motion (integrated Framer Motion) for transitions and micro-interactions
- **Styling**: Chakra UI style props (type-safe, no Tailwind dependency) with custom theme configuration
- **State Management**: React Server Components + Chakra UI hooks (useColorMode, useDisclosure, useToast) + React Context
- **Type Safety**: TypeScript 5+ with strict configuration for enhanced developer experience

### Backend & Data Architecture

- **Database**: Supabase PostgreSQL with Row Level Security (RLS) for role-based data access
  - Instance: Australia Pacific (Sydney) region for data residency
  - Tier: Supabase Pro with auto-scaling (4 vCPU, 8GB RAM baseline)
  - Connection pooling via PgBouncer (transaction pooling mode)
- **Authentication**: Supabase Auth with OAuth providers and session management
- **API Layer**:
  - **Primary**: tRPC 10+ for type-safe API procedures with end-to-end TypeScript
  - **Secondary**: Next.js API Routes for REST endpoints and external webhooks
  - **Serverless Functions**: Vercel edge functions with configurable timeouts and memory
- **Cache**: Redis (Upstash) for session storage, API response caching, and query result caching
- **Real-time Features**: Supabase Realtime for live dashboard updates and collaboration features

### Conversational AI Integration (NFR Implementation)

- **AI Service**: PydanticAI FastAPI microservice deployed separately from main application
- **Communication**: REST API integration between Next.js frontend and PydanticAI backend
- **Chat Interface**:
  - **Primary**: Self-hosted CopilotKit for conversational UI components
  - **Fallback**: Custom chat implementation if CopilotKit doesn't meet functionality requirements
- **Data Privacy**: AI queries processed through internal infrastructure, no external AI service dependencies

### ETL & Data Pipeline

- **Primary ETL**: n8n workflows for Xero API data extraction and transformation
- **Scheduling**: n8n's built-in cron scheduling for automated daily data pipeline execution
- **Data Flow**: Xero API → n8n transformation → Supabase PostgreSQL → Metabase dashboards
- **Monitoring**: n8n workflow execution logs and Supabase database monitoring

### Business Intelligence & Visualization

- **BI Platform**: Metabase for embedded dashboard creation and data visualization
- **Dashboard Embedding**: Metabase iframe integration with authentication passthrough
- **Data Sources**: Direct connection from Metabase to Supabase PostgreSQL database
- **Role-Based Access**: Metabase permissions aligned with Supabase RLS policies

### External Integrations

- **Primary Data Sources**:
  - Xero API (OAuth 2.0) for financial data extraction
  - Workflow Max / XPM (V2 API when available) for project management data
- **OAuth Management**: Server-side token handling through Next.js API routes with secure storage
- **API Rate Limiting**: Implemented at application level to respect external service limits

### Deployment & Infrastructure

- **Frontend Hosting**: Vercel for Next.js application deployment
  - Region: Sydney (syd1) for Australian compliance
  - Edge functions with 30-60s timeouts for API routes
  - CDN distribution for global performance
  - Automatic HTTPS with SSL certificates
- **AI Backend Hosting**: AWS Lambda (Serverless) for PydanticAI FastAPI service
  - Region: Australia Pacific (Sydney)
  - Runtime: Python 3.11 on ARM64 (Graviton2)
  - Memory: 1024 MB with 30s timeout
  - Auto-scaling: 2 provisioned instances, up to 50 concurrent
- **Database**: Supabase managed PostgreSQL with automatic backups
  - Point-in-time recovery (7 days)
  - Automated daily backups
  - Database monitoring and performance tracking
- **ETL Infrastructure**: n8n Cloud Pro
  - Region: Australia Southeast
  - Memory: 4GB, CPU: 2 vCPU
  - Workflow execution monitoring and logging
- **BI Infrastructure**: Metabase (Docker deployment)
  - Self-hosted on VPS or containerized service
  - Integrated with Supabase PostgreSQL
  - JWT-based dashboard embedding with security
- **Monitoring & Logging**:
  - Application: Vercel Analytics + Sentry for error tracking
  - Database: Supabase built-in monitoring + custom queries
  - Logs: Pino + Better Stack for structured logging
- **CI/CD**: GitHub Actions for automated testing and deployment
  - Automated testing on pull requests
  - Preview deployments on staging branch
  - Production deployments on main branch

### Development & Quality Assurance

- **Development Environment**: Local development with Docker Compose for service orchestration
- **Code Quality**: ESLint + Prettier for code formatting, Husky for pre-commit hooks
- **Type Checking**: TypeScript strict mode with path mapping and barrel exports
- **Performance Monitoring**: Next.js built-in analytics and Core Web Vitals tracking
- **Security**: OWASP guidelines implementation, dependency scanning, and security headers

### Data Governance & Privacy

- **Data Protection**: All financial data processed and stored within controlled infrastructure
- **Access Control**: Multi-layered security with Supabase RLS, role-based UI rendering, and API authentication
- **Audit Logging**: Comprehensive logging of data access and user actions for compliance
- **Backup Strategy**: Automated daily backups with point-in-time recovery capabilities

### Scalability Considerations

- **Frontend Scaling**: Vercel's edge network and CDN for global performance
  - Automatic scaling based on traffic
  - Edge caching for static assets
  - Serverless function auto-scaling
- **Database Scaling**: Supabase's automatic scaling with read replicas for heavy dashboard queries
  - Vertical scaling: 4 vCPU → 8 vCPU as needed
  - Connection pooling to handle concurrent users
  - Query optimization via indexes and materialized views
- **ETL Scaling**: n8n horizontal scaling for increased data processing volumes
  - Workflow concurrency limits configurable
  - Queue-based execution for reliability
- **AI Scaling**: Independent PydanticAI service scaling based on conversational query volume
  - AWS Lambda auto-scaling (2-50 concurrent instances)
  - Provisioned concurrency for warm starts
  - Independent resource allocation from core app

### Architecture Reference

**📄 For detailed architecture specifications, see:**

**[XeroPulse Fullstack Architecture Document](../architecture/index.md)**

The architecture document provides comprehensive technical details including:
- Complete tech stack with versions and rationale
- Data models and TypeScript interfaces
- API specifications (tRPC procedures and REST endpoints)
- Database schema with tables, indexes, and RLS policies
- Frontend component architecture
- Backend API route structure
- Deployment configurations for all services
- Security architecture and authentication flows
- Core workflows and ETL processes
- External API integration specifications

**All development should reference both this PRD and the Architecture Document for complete project understanding.**

---
