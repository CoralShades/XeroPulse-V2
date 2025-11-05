# Requirements

### Functional Requirements

**FR1:** The system shall provide secure user authentication using Supabase Auth with email/password login, automated password reset workflow, and session management with role-based access control.

**FR2:** The system shall implement role-based access control (RBAC) with three primary roles: Admin (full access), Role A/Sales (sales performance dashboards), and Role B/Finance (financial health dashboards).

**FR3:** The system shall authenticate to Xero API using OAuth2 and extract financial data (invoices, contacts, transactions, payments, accounts, budgets) via scheduled n8n workflows.

**FR4:** The system shall authenticate to XPM/Workflow Max API and extract practice management data (jobs, time entries, costs, billable rates, WIP) for integration with financial data.

**FR5:** The system shall sync data from all connected sources (Xero, XPM) to Supabase PostgreSQL database daily with automated retry logic and error handling.

**FR6:** The system shall provide 8 specialized business intelligence dashboards via Metabase:

- **Dashboard 1: Income vs Expenses** - Cash flow monitoring with 8-week rolling averages
- **Dashboard 2: Monthly Invoicing to Budget** - Actual vs budget comparison with variance analysis  
- **Dashboard 3: YTD/MTD Budget Views** - Time-aggregated performance with toggle capability
- **Dashboard 4: Work In Progress by Team** - Unbilled WIP with aging breakdown (<30, 31-60, 61-90, 90+ days)
- **Dashboard 5: ATO Lodgment Status** - Tax compliance tracking by client type and lodgment deadlines
- **Dashboard 6: Services Analysis** - Service line profitability across EOFY, SMSF, Bookkeeping, ITR, BAS, Advisory
- **Dashboard 7: Debtors/AR Aging** - Collections monitoring with DSO trends and top debtors analysis  
- **Dashboard 8: Client Recoverability** - Client-level WIP and profitability assessment

**FR7:** The Next.js web portal shall display only dashboards authorized for the logged-in user's role, with embedded Metabase visualizations via secure iframe integration.

**FR8:** The system shall provide user management interface allowing administrators to add/remove users, assign roles, and manage dashboard permissions.

**FR9:** The system shall calculate and display Work In Progress (WIP) values using formula: (Time Value + Billable Costs) - Progress Invoices, with team-based aging breakdown.

**FR10:** The system shall integrate PydanticAI conversational analytics capabilities, enabling natural language queries about business data through CopilotKit interface (implemented as NFR enhancement).

**FR11:** The system shall support self-service Xero OAuth connections, allowing users to securely connect their own Xero accounts via guided wizard interface.

**FR12:** The system shall provide manual ETL trigger functionality for administrators to refresh data on-demand outside of scheduled sync intervals.

**FR13:** The system shall log all sync execution status, errors, data freshness timestamps, and user access for monitoring, troubleshooting, and audit purposes.

**FR14:** The system shall support responsive design optimized for desktop and tablet viewing (1024px+ screen width) with basic mobile browser compatibility.

**FR15:** The system shall display last updated timestamp on all dashboards to indicate data freshness and sync status.

### Non-Functional Requirements

**NFR1:** Dashboard load time shall be <3 seconds for 95% of requests under normal operating conditions with 20 concurrent users.

**NFR2:** Data sync success rate shall maintain >99% reliability over rolling 7-day periods, completing within scheduled daily window.

**NFR3:** System uptime shall exceed 99% availability (less than 7.2 hours downtime per month) for production environment.

**NFR4:** Total monthly operating costs shall remain under $50 AUD/month, targeting optimal balance of functionality and cost efficiency.

**NFR5:** All data transmission shall use HTTPS/TLS encryption; credentials shall be stored securely with proper environment variable management.

**NFR6:** Supabase shall provide encrypted storage at rest (AES-256) for all financial and business data with appropriate backup strategies.

**NFR7:** User authentication shall use industry-standard security practices with bcrypt password hashing and secure JWT token session management.

**NFR8:** The system shall support 20 simultaneous users without performance degradation during dashboard viewing and data interaction.

**NFR9:** Database queries for dashboard rendering shall complete in <2 seconds for standard visualizations, <5 seconds for complex aggregations.

**NFR10:** The platform shall comply with Xero API rate limits (60 requests/minute, 10,000 requests/day) through intelligent batching and exponential backoff strategies.

**NFR11:** **PydanticAI Integration (Non-Functional Requirement):** The system shall integrate PydanticAI FastAPI microservice for conversational analytics as an enhancement feature that does not impact core BI functionality.

**NFR12:** **CopilotKit Integration:** The system shall use self-hosted CopilotKit for conversational interface with fallback to custom chat implementation if functionality requirements are not met.

**NFR13:** The system shall use Chakra UI 2.8+ (with MCP integration) for 95% of UI components and AG-UI Enterprise for complex data grids only (4 tables: user management, WIP analysis, services analysis, client recoverability).

**NFR14:** The codebase shall use monorepo structure with version-controlled workflows, dashboard configurations, and infrastructure-as-code for reproducible deployments.

**NFR15:** The architecture shall support horizontal scaling (database upgrade, larger infrastructure, load balancing) without requiring fundamental refactoring.

---
