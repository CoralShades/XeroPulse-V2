# XeroPulse - Executive Summary

**Project:** Multi-System Financial Intelligence Platform for Professional Services Firms
**Timeline:** 4 weeks MVP (Launch: October 31, 2025) | Month 2: Complete 8-Dashboard Suite
**Budget:** $200/month maximum | **Projected Cost:** $15/month (92% under budget)
**Team:** 1 Developer + 1 Tester
**Scope:** **8 Specialized Dashboards** (3 MVP, 5 Post-MVP)

---

## The Opportunity

**Professional services firms** (accounting, advisory, consulting) using **Xero + XPM/Workflow Max + Suntax** face a critical integration gap: financial data, work-in-progress tracking, service profitability, and tax compliance status live in separate systems. Finance teams spend **5-10 hours weekly** manually compiling cross-system reports, while partners and managers operate blind on:
- **Unbilled WIP** locked in client engagements (cash flow risk)
- **Service line profitability** (which services generate margin vs write-offs)
- **Tax lodgment compliance** status across client portfolio
- **Client recoverability** (which clients have high WIP but low collections)

**XeroPulse eliminates this bottleneck** by integrating Xero (accounting), XPM (practice management), and Suntax (tax compliance) into **8 unified dashboards** with automated 2-hour data sync and role-based access.

---

## The Solution

**Fully open-source multi-system integration** delivering enterprise BI capabilities at consumer pricing:

| Component | Technology | Data Sources | Cost |
|-----------|------------|--------------|------|
| Data Sync (ETL) | n8n (self-hosted) | Xero + XPM + Suntax APIs | $0 |
| Database + Auth | Supabase (free tier) | PostgreSQL centralized storage | $0 |
| Dashboard Engine | Apache Superset | 8 specialized dashboards | $0 |
| Web Portal | Next.js (Vercel free tier) | Role-based access | $0 |
| Hosting (VPS) | Hetzner/DigitalOcean | Docker containers | $10-20/month |
| **Total** | | **3-system integration** | **~$15/month** |

**vs. Commercial BI:** Power BI Embedded = $750/month minimum (98% cost reduction)
**Key Differentiator:** Native integration with Xero + XPM + Suntax (not generic database connectors)

---

## MVP Scope (4 Weeks) - Xero-Only Dashboards

**Week 1:** Infrastructure setup + technical validation (n8n, Superset, Xero API integration proof-of-concept)
**Week 2:** ETL pipeline build + Dashboard 1 prototype
**Week 3:** Dashboards 2 & 7 + Next.js portal build
**Week 4:** UAT with 20 users + training + production launch

**MVP Deliverables (Xero Integration Only):**
- ✅ **Dashboard 1: Income vs Expenses** - Weekly cash flow with 8-week rolling averages
- ✅ **Dashboard 2: Monthly Invoicing to Budget** - Actual vs Budget tracking
- ✅ **Dashboard 7: Debtors/AR Aging** - Collections monitoring with DSO trends
- ✅ 20 users onboarded with role-based access (executives, managers, staff)
- ✅ Full authentication system (user management, password policies, session security)
- ✅ 2-hour automated Xero data sync (95%+ reliability)
- ✅ Sub-60-second insight access (replace 3-7 day report turnaround)

**Complete 8-Dashboard Suite:**

| # | Dashboard | Data Source | Priority | Visual Mockups |
|---|-----------|-------------|----------|----------------|
| 1 | Income vs Expenses | Xero | MVP | ✅ `Dashboard-1-*.png` (7 images) |
| 2 | Monthly Invoicing to Budget | Xero | MVP | ✅ `Dashboard-2-*.png` (1 image) |
| 3 | YTD/MTD View | Xero | Post-MVP | ✅ `Dashboard-3-*.png` (4 images) |
| 4 | Work In Progress by Team | XPM | Post-MVP | ✅ `Dashboard-4-*.png` (6 images) |
| 5 | ATO Lodgment Status | Suntax | Post-MVP | ✅ `Dashboard-5-*.png` (1 image) |
| 6 | Services Analysis | XPM | Post-MVP | ✅ `Dashboard-6-*.png` (1 image) |
| 7 | Debtors/AR Aging | Xero | MVP | ✅ `Dashboard-7-*.png` (1 image) |
| 8 | Client Recoverability | XPM | Post-MVP | ✅ `Dashboard-8-*.png` (3 images) |

**Post-MVP (Month 2):**
- XPM/Workflow Max integration (Dashboards 4, 6, 8)
- Suntax integration (Dashboard 5 - API confirmation required)
- Dashboard 3 (extends Dashboard 2, Xero-only)
- Advanced features: mobile optimization, data export, real-time sync

**Visual Reference:** 22 dashboard mockup images in `docs/dashboard_images/word/media/`

---

## Business Impact

**Immediate ROI:**
- **5-10 hours weekly** reclaimed from finance team (~$15-30K annually in labor costs)
- **80% reduction** in manual report requests (from ~20/week to <4/week)
- **Sub-60-second** insight access for all 20 users (vs. 3-7 day wait)
- **99%+ uptime** operational target (reliable, always-available intelligence)

**Strategic Value:**
- Shift finance from data extraction → strategic analysis
- Enable proactive decision-making (spot trends before month-end close)
- Data-driven culture (evidence-based strategy vs. gut-feel decisions)
- Scalable foundation for AI-powered analytics, multi-source integration

---

## Key Risks & Mitigation

| Risk | Impact | Mitigation | Status |
|------|--------|------------|--------|
| **Learning curve delays timeline** | High | Week 1 rapid prototyping; fallback to simpler tools (Metabase) if Superset too complex | Active |
| **Dashboard requirements unclear** | Medium | **RESOLVED:** Complete mockups exist (22 images), all 8 dashboards fully specified | ✅ Closed |
| **XPM API integration complexity** | Med-High | Defer XPM dashboards to Month 2 (MVP uses Xero-only); validate XPM APIs Week 1 | Active |
| **Suntax API availability unknown** | Medium | Dashboard 5 deferred to Month 2 pending API confirmation; mockup exists | Active |
| **Supabase 500MB limit exceeded** | Low-Med | Monitor storage; Pro upgrade ($25/month) available within budget | Active |
| **VPS performance insufficient** | Medium | Start with 4GB RAM; upgrade to 8GB ($20-40/month) if needed, still under budget | Active |

**Total Risk Exposure:** Manageable within budget/timeline constraints; **dashboard requirements risk eliminated** (complete specifications available).

**Key Discovery:** All 8 dashboards have visual mockups and detailed specifications, significantly reducing requirements risk versus original "TBD" assumption.

---

## Critical Decisions Required (Week 1)

**Day 1 Stakeholder Meeting Must Resolve:**

1. **Dashboard Priority:** ✅ **RESOLVED** - MVP = Dashboards 1, 2, 7 (Xero-only); Post-MVP = Dashboards 3, 4, 5, 6, 8 (XPM/Suntax)
2. **User List:** Exact 20 users with names, emails, role assignments (HR/admin to provide)
3. **Timeline Stakes:** Hard deadline (business consequence if missed) or soft deadline (preference but flexible)?
4. **Approval Authority:** Who approves dashboard designs before development? (Single decision-maker vs. committee?)
5. **Data Latency:** Is 2-hour sync sufficient, or do decisions require hourly/real-time updates?
6. **XPM/Suntax API Access:** ✅ **NEW** - Confirm XPM API credentials and Suntax API availability for Month 2 dashboards
7. **Service Taxonomy:** ✅ **NEW** - Provide mapping of XPM task codes/categories to service types (EOFY, SMSF, Bookkeeping, ITR, BAS, Advisory, etc.)

**Status:** Dashboard requirements fully documented (22 mockup images analyzed); focus shifts to user access and API credentials.

---

## Why This Will Succeed

**1. Validated Architecture:** Based on comprehensive brainstorming analyzing 45+ technical options; direct Xero API integration via proven n8n node beats complex alternatives (rejected ODataLink approach after deep analysis)

**2. Cost Efficiency:** 89-94% under budget leaves $185/month headroom for monitoring, backups, scaling, emergency upgrades

**3. Proven Tools at Scale:** Apache Superset used by Airbnb, Netflix; n8n has 200+ integrations; Supabase widely adopted in production

**4. Clear Scope Discipline:** MVP-first philosophy (3 dashboards validate architecture before building 10); post-MVP refinement prevents over-engineering

**5. Risk-Aware Planning:** 10 identified risks, each with specific mitigation; 14 open questions documented with decision owners and deadlines

---

## Competitive Advantage

**vs. Commercial BI Platforms:**
- 98% cost savings ($15 vs. $750/month)
- Zero vendor lock-in (100% open-source stack)
- 4-week deployment (vs. 3-6 month implementations)

**vs. DIY Custom Development:**
- Leverages battle-tested tools (vs. building visualizations from scratch)
- 4 weeks (vs. 3-6 months development)
- Proven integrations (n8n Xero node vs. custom API work)

**vs. Xero Native Reporting:**
- Unlimited customization (vs. constrained Xero UI)
- Role-based dashboards (vs. all-or-nothing access)
- Cross-entity analysis impossible in Xero

**vs. Spreadsheet Workflows:**
- Automated (vs. manual 5-10 hours/week)
- Real-time-ish 2hr sync (vs. week-old snapshots)
- Professional visualizations (vs. basic Excel charts)

---

## Long-Term Vision (Beyond MVP)

**Year 1:** Complete internal platform (10 dashboards, real-time sync, mobile optimization, advanced RBAC)

**Year 2:** Predictive analytics (cash flow forecasting, anomaly detection), AI-powered insights (natural language queries, automated summaries)

**Future Expansion:**
- **White-label SaaS** for accounting firms (50,000+ firms globally managing 5-50 Xero clients each)
- **Vertical dashboard packs** (e-commerce, SaaS, professional services, nonprofits)
- **Embedded analytics API** for third-party apps (construction software, practice management tools)

**Market Validation:** Accounting firm segment represents 30-40% potential expansion opportunity with clear monetization path ($20-30/client/month pricing model)

---

## Recommendation

**APPROVE** XeroPulse MVP for immediate development with October 31, 2025 launch target.

**Rationale:**
- High-impact problem ($15-30K annual labor cost + decision latency) solved at minimal cost ($15/month)
- Aggressive but achievable timeline (4 weeks) with documented risk mitigation
- Scalable foundation enables long-term product evolution (predictive analytics, SaaS expansion)
- 92% budget headroom provides flexibility for unforeseen costs

**Next Actions:**
1. **Day 1:** Stakeholder kickoff to resolve 5 critical decisions (dashboard priority, user list, timeline stakes, approval authority, data latency requirements)
2. **Week 1:** Technical validation sprint (n8n Xero integration, Superset proof-of-concept, dashboard requirements workshop)
3. **Week 2-3:** Development sprint (ETL pipeline, dashboards, Next.js portal)
4. **Week 4:** UAT + training + production launch

**Success Criteria:** By October 31, deliver automated Xero dashboard platform eliminating 5-10 hours weekly manual reporting, providing sub-60-second insight access for 20 users, operating at <$20/month cost—all while maintaining 95%+ data sync reliability and 99%+ system uptime.

---

*For full details, see: `docs/brief.md` (comprehensive project brief with technical architecture, risk analysis, user personas, and roadmap)*
