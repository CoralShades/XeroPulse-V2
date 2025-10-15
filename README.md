# XeroPulse

> **Automated Financial Intelligence for Xero Users**

Transform your Xero accounting data into actionable insights with role-based dashboards—at 98% lower cost than commercial BI platforms.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Status: Planning](https://img.shields.io/badge/Status-Planning-yellow.svg)]()
[![Cost: $15/month](https://img.shields.io/badge/Cost-$15%2Fmonth-green.svg)]()

---

## 🚀 Overview

**XeroPulse** is an open-source dashboard platform that automates financial reporting for organizations using Xero. Instead of spending 5-10 hours weekly on manual Excel reports, finance teams can deliver instant, role-based insights to 20+ users through a modern web portal.

### Key Benefits

- ⚡ **Sub-60-second insight access** (vs. 3-7 day report turnaround)
- 💰 **$15/month operating cost** (vs. $750+ for Power BI Embedded)
- 🔄 **Automated 2-hour data sync** from Xero
- 🔐 **Role-based access control** (executives, managers, staff see different dashboards)
- 📊 **10 custom financial dashboards** (3 in MVP, 7 post-MVP)
- ⏱️ **5-10 hours weekly saved** for finance teams

---

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Documentation](#documentation)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## ✨ Features

### MVP (Month 1)
- ✅ **Automated Xero Data Sync** - ETL pipeline syncs data every 2 hours via n8n
- ✅ **3 Financial Dashboards** - Executive overview, cash flow, revenue analytics (specific requirements TBD)
- ✅ **Role-Based Access Control** - Secure authentication with user management
- ✅ **Modern Web Portal** - Next.js interface with embedded Apache Superset dashboards
- ✅ **20 User Support** - Multi-user deployment with role assignments

### Post-MVP (Months 2-6)
- 📊 **Complete Dashboard Suite** - 7 additional dashboards (budget tracking, departmental P&L, expenses, customer insights, projects, inventory, payroll)
- 📱 **Mobile Optimization** - Responsive design for tablets and phones
- 🔄 **Real-Time Sync** - Webhook-based updates (sub-2-hour refresh)
- 📤 **Data Export** - PDF/Excel export, scheduled email reports
- 🔒 **Advanced RBAC** - Audit logging, department-level permissions

### Future Vision (Year 1-2)
- 🤖 **AI-Powered Insights** - Natural language queries, automated recommendations
- 📈 **Predictive Analytics** - Cash flow forecasting, anomaly detection
- 🔗 **Multi-Platform Integration** - QuickBooks, MYOB, bank feeds, CRM, e-commerce

---

## 🛠️ Technology Stack

### 100% Open-Source Architecture

| Component | Technology | Purpose | Cost |
|-----------|------------|---------|------|
| **ETL Pipeline** | [n8n](https://n8n.io/) (self-hosted) | Xero API integration, scheduled workflows | $0 |
| **Database & Auth** | [Supabase](https://supabase.com/) (free tier) | PostgreSQL database, user authentication | $0 |
| **Dashboard Engine** | [Apache Superset](https://superset.apache.org/) | Business intelligence, data visualization | $0 |
| **Web Portal** | [Next.js 14](https://nextjs.org/) (Vercel free tier) | User interface, dashboard embedding | $0 |
| **Hosting** | Hetzner Cloud / DigitalOcean VPS | n8n + Superset deployment | $10-20/month |
| **SSL/CDN** | Let's Encrypt + Cloudflare | HTTPS certificates, DNS | $0 |

**Total Operating Cost:** ~$15/month (vs. $750+ for commercial BI platforms)

---

## 🏗️ Architecture

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

### Data Flow

1. **n8n** connects to Xero API via OAuth2, extracts financial data every 2 hours
2. Data is transformed and loaded into **Supabase PostgreSQL** database
3. **Apache Superset** connects to Supabase, generates interactive dashboards
4. **Next.js portal** embeds Superset dashboards, handles user authentication and role-based access
5. Users log in via **Supabase Auth**, see only dashboards authorized for their role

---

## 🚦 Getting Started

### Prerequisites

- **Xero Account** with API access (Standard or Premium plan)
- **VPS** with 4GB+ RAM (Hetzner Cloud, DigitalOcean, or similar)
- **Supabase Account** (free tier)
- **Vercel Account** (free tier)
- **Docker & Docker Compose** installed on VPS
- **Node.js 18+** for Next.js development

### Installation

> **Note:** Detailed setup instructions will be added as the project progresses through development.

#### Quick Start (Planned)

```bash
# 1. Clone the repository
git clone https://github.com/santhuka/XeroPulse.git
cd XeroPulse

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your Xero, Supabase, and VPS credentials

# 3. Deploy n8n and Superset to VPS
cd infrastructure
docker-compose up -d

# 4. Configure Xero OAuth credentials in n8n
# (Instructions TBD)

# 5. Set up Supabase database schema
# (Migration scripts TBD)

# 6. Deploy Next.js portal to Vercel
cd apps/web
vercel deploy

# 7. Import n8n workflows
# (Workflow files TBD)

# 8. Import Superset dashboards
# (Dashboard exports TBD)
```

---

## 📚 Documentation

### Project Documentation

- **[Product Requirements Document (PRD)](docs/prd.md)** - Complete PRD with 38 user stories across 4 epics
- **[Project Brief](docs/brief.md)** - Comprehensive project documentation (11 sections covering problem, solution, architecture, risks, roadmap)
- **[Executive Summary](docs/executive-summary.md)** - 1-page overview for leadership approval
- **[Presentation Deck](docs/presentation.md)** - 23-slide stakeholder presentation
- **[Brainstorming Results](docs/brainstorming-session-results.md)** - Research analyzing 45+ technical options

### Frontend Development Guides ⚡ **NEW**

- **[🚀 Getting Started - Frontend](docs/GETTING-STARTED-FRONTEND.md)** - Quick start guide: Choose your path (AI-First, Component-by-Component, or Manual)
- **[📖 AI Prompts Usage Guide](docs/ai-prompts/README.md)** - Comprehensive guide: Which prompt to use, when, and how they relate to epics
- **[🎯 Visual Index](docs/ai-prompts/INDEX.md)** - Quick visual reference with decision trees and scenario examples
- **[🎨 Frontend Specification](docs/front-end-spec.md)** - Complete UX design specification with wireframes, user flows, and component library

### AI Prompt Files (Ready to Use)

Generate production-ready code with these AI prompts:

- **[Master Prompt (All-in-One)](docs/ai-prompts/platform-ui-master-prompt.md)** - Generate entire platform in 1-2 days (7,500 lines)
- **[Authentication System](docs/ai-prompts/01-authentication-system.md)** - Login, password reset, middleware (2-3 hours)
- **[Dashboard Shell & Navigation](docs/ai-prompts/02-dashboard-shell-navigation.md)** - Header, sidebar, layout, iframe (3-4 hours)
- **[User Management Admin](docs/ai-prompts/03-user-management-admin.md)** - Admin panel with CRUD operations (4-5 hours)
- **[Responsive & Accessibility](docs/ai-prompts/04-responsive-accessibility.md)** - Mobile optimization, WCAG AA (3-4 hours)

**Total:** 10,800+ lines of production-ready AI prompts with code examples, workflows, and epic mapping

### Key Sections

- [Problem Statement](docs/brief.md#problem-statement) - Why we're building this
- [Technical Architecture](docs/brief.md#technical-considerations) - Platform requirements, tech stack, security
- [MVP Scope](docs/brief.md#mvp-scope) - What's in/out for initial 4-week build
- [Risks & Mitigation](docs/brief.md#risks--open-questions) - 10 identified risks with mitigation strategies
- [Roadmap](docs/brief.md#post-mvp-vision) - Phase 2 features and long-term vision

---

## 🗺️ Roadmap

### Phase 1: MVP (Month 1 - October 2025)

**Timeline:** 4 weeks (Launch: October 31, 2025)

- [x] Brainstorming & research (45+ options analyzed)
- [x] Project brief & documentation
- [ ] Week 1: Infrastructure setup (n8n, Supabase, Superset deployment)
- [ ] Week 2: ETL pipeline (Xero → Supabase sync)
- [ ] Week 3: Dashboard development (3 MVP dashboards) + Next.js portal
- [ ] Week 4: UAT, training, production launch

**Deliverables:**
- 3 financial dashboards (requirements TBD in stakeholder workshop)
- 20 users onboarded with role-based access
- Full authentication system (user management, password policies, session security)
- 2-hour automated Xero sync (95%+ reliability target)

### Phase 2: Enhancement (Months 2-6)

- [ ] Month 2: Complete dashboard suite (7 additional dashboards based on prioritized requirements)
- [ ] Month 3: Advanced RBAC (audit logging, department-level permissions)
- [ ] Month 4: Real-time data sync (webhooks, sub-2-hour refresh)
- [ ] Month 5: Mobile optimization (tablet/phone responsive design)
- [ ] Month 6: Data export & sharing (PDF/Excel, scheduled reports)

### Phase 3: Intelligence (Year 1-2)

- [ ] Predictive analytics (cash flow forecasting, anomaly detection)
- [ ] AI-powered insights (natural language queries, automated recommendations)
- [ ] Cross-platform integration (QuickBooks, MYOB, bank feeds, CRM)

### Expansion Opportunities

- [ ] White-label SaaS for accounting firms
- [ ] Vertical-specific dashboard packs (e-commerce, SaaS, professional services)
- [ ] Embedded analytics API for third-party apps

---

## 🎯 Target Users

### Primary: Internal Business Teams (SMB/Mid-Market)

- **Organization Size:** 10-50 employees, $2M-$20M annual revenue
- **Industries:** Professional services, SaaS/tech, e-commerce, agencies, consulting
- **User Roles:**
  - **Executives (2-3 users):** High-level KPIs, revenue trends, cash runway
  - **Department Managers (3-7 users):** Budget vs. actual, departmental P&L
  - **Operational Staff (5-15 users):** Invoice status, payment tracking, A/R aging
  - **Finance Team (1-3 users):** Automated reporting (5-10 hours weekly saved)

### Secondary: Accounting Firms (Future)

- **Firm Size:** 3-20 accountants managing 20-100 SMB clients
- **Use Case:** White-label dashboard portal as premium service tier
- **Market Opportunity:** 50,000+ firms globally needing Xero dashboard solutions

---

## 📊 Success Metrics

### Operational KPIs

- **Active Users:** 80%+ (16 of 20 users) logging in weekly within 30 days
- **Data Freshness:** 95%+ of syncs complete successfully within 2-hour window
- **Performance:** 95%+ of dashboards load within 3 seconds
- **Uptime:** 99%+ availability (less than 7.2 hours downtime/month)
- **Cost Efficiency:** Operating costs <$20 AUD/month through Q1 2026

### Business Outcomes

- **Time Savings:** 5-10 hours reclaimed weekly for finance team
- **Report Reduction:** 80%+ decrease in manual report requests (from ~20/week to <4/week)
- **User Satisfaction:** 4.0+ average rating (5-point scale) at 60 days post-launch

---

## 🤝 Contributing

**Status:** Project currently in planning phase. Contributions welcome once MVP development begins (November 2025).

### How to Contribute (Coming Soon)

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines (TBD)

- Code style guide
- Testing requirements
- Documentation standards
- PR review process

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

### Powered By

- **[BMAD™ Core](https://github.com/your-org/bmad-core)** - Brainstorming methodology and agent framework
- **Business Analyst Mary** - Strategic analysis and project documentation
- **[Claude Code](https://claude.com/claude-code)** - AI-assisted development and planning

### Inspired By

- **Apache Superset** - Open-source BI platform by Airbnb
- **n8n** - Fair-code workflow automation
- **Supabase** - Open-source Firebase alternative

---

## 📞 Contact & Support

- **Project Repository:** [https://github.com/santhuka/XeroPulse](https://github.com/santhuka/XeroPulse)
- **Issues:** [GitHub Issues](https://github.com/santhuka/XeroPulse/issues)
- **Documentation:** [docs/](docs/)

---

## 🔗 Quick Links

- [Project Brief](docs/brief.md) - Full technical and business documentation
- [Executive Summary](docs/executive-summary.md) - 1-page leadership overview
- [Presentation Deck](docs/presentation.md) - Stakeholder presentation
- [Brainstorming Research](docs/brainstorming-session-results.md) - Technical analysis

---

**Built with ❤️ using 100% open-source technology**

*Transforming financial data into strategic insights—one dashboard at a time.*
