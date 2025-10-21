# Goals and Background Context

### Goals

- **Centralize BI Access**: Provide a single, user-friendly portal for all 20 team members to access business intelligence dashboards with role-based security
- **Automate Data Pipeline**: Maintain a fully automated daily data pipeline from Xero and Workflow Max to Supabase with >99% uptime using n8n workflows
- **Enable Conversational Analytics**: Integrate PydanticAI-powered natural language querying capabilities for intuitive data exploration and insights
- **Achieve Cost Efficiency**: Maintain total operating costs under $50 AUD/month while delivering enterprise-grade functionality
- **Ensure Scalable Architecture**: Build modern Next.js + AG-UI + Metabase platform supporting 8 specialized dashboards with zero vendor lock-in
- **Deliver Rapid ROI**: Launch MVP with core financial dashboards by December 31, 2025, achieving 80%+ user adoption within 30 days

### Background Context

Professional services firms using Xero (accounting) and XPM/Workflow Max (practice management) face a critical gap between data collection and actionable insights. Current workflows involve fragmented access to business intelligence, with finance teams spending 5-10 hours weekly manually extracting data, formatting reports in Excel, and distributing static snapshots that become outdated within days.

XeroPulse solves this through a modern, conversational-first BI architecture: n8n workflows extract data from Xero/XPM APIs into Supabase PostgreSQL, Metabase generates embedded dashboards with role-based access, Next.js provides the secure web portal with AG-UI enterprise components, and PydanticAI enables natural language queries about business data. The platform delivers sub-60-second insight access, eliminates manual reporting overhead, and provides conversational analytics capabilities that transform how teams interact with financial data.

**Unified Architecture Context**: This PRD resolves architectural conflicts between previous documents by establishing Next.js + AG-UI + CopilotKit + PydanticAI + Supabase + n8n + Metabase as the definitive technology stack, balancing modern development capabilities with enterprise-grade data processing requirements.

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-10-22 | 2.0 | Unified PRD incorporating final architecture decisions (Next.js + AG-UI + CopilotKit + PydanticAI + Supabase + n8n + Metabase), resolved document conflicts, comprehensive epic planning | John (PM) |
| 2025-10-15 | 1.1 | Added comprehensive PM validation report (94% quality score, READY FOR ARCHITECT) | PM Agent |
| 2025-10-15 | 1.0 | Initial PRD creation from Project Brief | PM Agent |

---
