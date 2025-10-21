# Epic List

Based on the comprehensive analysis of requirements and the unified Next.js + AG-UI + CopilotKit + PydanticAI + Supabase + n8n + Metabase architecture, here are the strategic development phases:

### Epic 1: Foundation & Authentication Infrastructure

**Epic Goal**: Establish the core Next.js application foundation with Supabase authentication, role-based access control, and basic dashboard framework using AG-UI components.

**Key Deliverables**:

- Next.js 14+ App Router application setup with TypeScript
- Supabase integration (auth, database, RLS policies)
- AG-UI component library integration with Shadcn v4 base components
- Role-based authentication system (Admin, Role A, Role B)
- Basic dashboard shell with iframe embedding capability

**Strategic Priority**: P0 (Critical Path) - All subsequent epics depend on this foundation

### Epic 2: Xero Integration & ETL Pipeline

**Epic Goal**: Implement comprehensive Xero data extraction using n8n workflows, establish automated data pipeline to Supabase, and create secure OAuth management for user connections.

**Key Deliverables**:

- n8n workflow configuration for Xero API data extraction
- Supabase database schema for financial data storage
- Next.js API routes for secure Xero OAuth token management
- Automated daily ETL scheduling and monitoring
- Self-service Xero account connection interface

**Strategic Priority**: P0 (Critical Path) - Required for all business intelligence functionality

### Epic 3: Metabase Integration & Core Dashboards

**Epic Goal**: Deploy and configure Metabase for embedded BI capabilities, create role-specific financial dashboards, and implement secure dashboard embedding with authentication passthrough.

**Key Deliverables**:

- Metabase deployment and Supabase database connection
- Core financial dashboards: Income vs Expenses, Monthly Invoicing to Budget, YTD/MTD Budget views
- Role-based dashboard permissions aligned with Supabase RLS
- Secure iframe embedding with authentication integration
- Dashboard loading states and error handling

**Strategic Priority**: P0 (Core Business Value) - Primary user-facing functionality

### Epic 4: Conversational AI Integration (NFR)

**Epic Goal**: Deploy PydanticAI FastAPI microservice and integrate conversational analytics capabilities through CopilotKit interface, enabling natural language queries about business data.

**Key Deliverables**:

- PydanticAI FastAPI service deployment (separate infrastructure)
- CopilotKit self-hosted integration (with fallback to custom chat UI)
- Natural language query processing for financial data
- Conversational interface integrated with existing dashboard views
- AI query history and context management

**Strategic Priority**: P1 (Value Enhancement) - Non-functional requirement that enhances user experience

### Epic 5: Advanced Analytics & Workflow Max Integration

**Epic Goal**: Integrate Workflow Max/XPM data sources (when V2 API available), implement advanced financial analytics, and create comprehensive WIP (Work in Progress) dashboards.

**Key Deliverables**:

- Workflow Max V2 API integration through n8n workflows
- WIP data extraction and transformation pipeline
- Advanced financial analytics dashboards (aging analysis, project profitability)
- Cross-platform data correlation and insights
- Enhanced reporting capabilities for leadership

**Strategic Priority**: P1 (Business Expansion) - Dependent on vendor API availability

### Epic 6: Platform Optimization & Advanced Features

**Epic Goal**: Implement performance optimizations, advanced user management, comprehensive monitoring and alerting, and prepare for production scaling.

**Key Deliverables**:

- Performance optimization (caching, lazy loading, CDN)
- Advanced user management and role administration
- Comprehensive monitoring and alerting systems
- Data backup and disaster recovery procedures
- Advanced security hardening and compliance features

**Strategic Priority**: P2 (Operational Excellence) - Production readiness and scalability
