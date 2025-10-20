# Goals and Background Context

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
| 2025-10-15 | 1.1 | Added comprehensive PM validation report (94% quality score, READY FOR ARCHITECT) | PM Agent |
| 2025-10-15 | 1.0 | Initial PRD creation from Project Brief | PM Agent |

---
