# XeroPulse AI Prompts - Visual Index

**Purpose:** Quick visual reference showing all prompt files, their relationships, and when to use them.

---

## 📊 Prompt Hierarchy

```
XeroPulse Frontend
│
├── 🎯 OPTION 1: All-in-One (Fastest)
│   └── platform-ui-master-prompt.md
│       ├── Includes: Authentication
│       ├── Includes: Dashboard Shell
│       ├── Includes: Admin Panel
│       └── Includes: Responsive Design
│       ⏱️ 1-2 days total
│
└── 🎯 OPTION 2: Incremental (Most Control)
    │
    ├── 1️⃣ 01-authentication-system.md
    │   ├── Login page
    │   ├── Password reset
    │   ├── Middleware
    │   └── Session management
    │   ⏱️ 2-3 hours
    │
    ├── 2️⃣ 02-dashboard-shell-navigation.md
    │   ├── Header component
    │   ├── Sidebar navigation
    │   ├── Layout structure
    │   ├── iframe embedding
    │   └── RBAC filtering
    │   ⏱️ 3-4 hours
    │   ⚠️ Requires: 01 complete
    │
    ├── 3️⃣ 03-user-management-admin.md
    │   ├── Admin panel page
    │   ├── User table (search/filter)
    │   ├── Add user modal
    │   ├── Edit user modal
    │   ├── Delete confirmation
    │   └── Admin API routes
    │   ⏱️ 4-5 hours
    │   ⚠️ Requires: 01, 02 complete
    │
    └── 4️⃣ 04-responsive-accessibility.md
        ├── Mobile breakpoints
        ├── Hamburger menu
        ├── Touch targets
        ├── Keyboard navigation
        ├── ARIA labels
        └── WCAG AA compliance
        ⏱️ 3-4 hours
        ⚠️ Requires: 01, 02, 03 complete
```

---

## 🗺️ Epic to Prompt Mapping

```
┌─────────────────────────────────────────────────────────────┐
│ EPIC 1: Foundation & Data Pipeline (Weeks 1-2)             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Backend Focus: VPS, n8n, Superset, Xero API, Dashboard 1   │
│                                                             │
│ Frontend Stories:                                           │
│ └─ Story 1.8: Basic Authentication                         │
│    📄 Use: 01-authentication-system.md                      │
│    ⏱️ Day 8-9 (Week 2)                                      │
│                                                             │
│ └─ Story 1.9: Minimal Portal with Dashboard Embedding      │
│    📄 Use: 02-dashboard-shell-navigation.md                 │
│    ⏱️ Day 9-10 (Week 2)                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ EPIC 2: MVP Dashboard Suite & Portal Launch (Weeks 3-4)    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Backend Focus: Dashboards 2, 7 (Budget, AR Aging)          │
│                                                             │
│ Frontend Stories:                                           │
│ └─ Story 2.3: Implement RBAC System                        │
│    📄 Already in: 02-dashboard-shell-navigation.md          │
│    ⏱️ Day 11-12 (Week 3)                                    │
│                                                             │
│ └─ Story 2.4: Build Full Portal with Navigation            │
│    📄 Use: 02-dashboard-shell-navigation.md                 │
│    📄 + 04-responsive-accessibility.md                      │
│    ⏱️ Day 12-13 (Week 3)                                    │
│                                                             │
│ └─ Story 2.5: User Management Admin Panel                  │
│    📄 Use: 03-user-management-admin.md                      │
│    ⏱️ Day 16-17 (Week 4)                                    │
│                                                             │
│ 🚀 LAUNCH: October 31 (Day 20)                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ EPIC 3: Complete Dashboard Suite with XPM (Months 2-3)     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Backend Focus: XPM API, 5 more dashboards (3,4,5,6,8)      │
│                                                             │
│ Frontend Stories:                                           │
│ └─ Story 3.10: Update Navigation for 8 Dashboards          │
│    📄 Use: 02-dashboard-shell-navigation.md (config only)   │
│    ⏱️ Month 2, Week 3                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Workflow Comparison Matrix

| Aspect | AI-First (Master) | Component-by-Component | Manual |
|--------|------------------|------------------------|--------|
| **Prompt Used** | `platform-ui-master-prompt.md` | `01` → `02` → `03` → `04` | All as reference |
| **Time to Complete** | 1-2 days | 1.5-2 days | 4-6 days |
| **AI Tool Required** | ✅ Yes (v0/Lovable) | ✅ Yes (v0/Lovable) | ❌ Optional |
| **Learning Curve** | Low | Medium | High |
| **Code Quality** | Medium (needs review) | High (incremental review) | Highest (hand-crafted) |
| **Best For** | MVP sprint | Balanced approach | Learning/No AI budget |
| **Review Effort** | High (all at once) | Low (per component) | None (you wrote it) |
| **Debugging** | Hard (large codebase) | Easy (small chunks) | Easiest (you know code) |
| **Flexibility** | Low (regenerate all) | High (regenerate parts) | Highest (manual control) |

---

## 📂 File Relationship Diagram

```
docs/
│
├── front-end-spec.md ◄──────────┐
│   (Design specification)        │
│                                  │
├── prd.md ◄─────────────────────┤
│   (Business requirements)       │
│                                  │
├── GETTING-STARTED-FRONTEND.md ◄┤
│   (Quick start guide)            │
│                                  │
└── ai-prompts/                   │
    │                              │
    ├── README.md ◄────────────────┤ Main Guide
    │   (This comprehensive guide) │ References Everything
    │                              │
    ├── INDEX.md (You are here)    │
    │   (Visual reference)          │
    │                              │
    ├── platform-ui-master-prompt.md
    │   ├─ References: front-end-spec.md
    │   ├─ References: prd.md
    │   └─ Includes: All components below
    │
    ├── 01-authentication-system.md
    │   ├─ Maps to: Epic 1, Story 1.8
    │   ├─ Dependencies: None
    │   └─ Outputs: Auth components
    │
    ├── 02-dashboard-shell-navigation.md
    │   ├─ Maps to: Epic 1-2, Stories 1.9, 2.3, 2.4
    │   ├─ Dependencies: 01-authentication
    │   └─ Outputs: Layout components
    │
    ├── 03-user-management-admin.md
    │   ├─ Maps to: Epic 2, Story 2.5
    │   ├─ Dependencies: 01, 02
    │   └─ Outputs: Admin components
    │
    └── 04-responsive-accessibility.md
        ├─ Maps to: Epic 2, Story 2.4
        ├─ Dependencies: 01, 02, 03
        └─ Outputs: Responsive/a11y enhancements
```

---

## 🎬 Usage Scenarios

### Scenario 1: First-Time Setup (MVP Sprint)

**You:** "I need to launch XeroPulse in 2 weeks. Backend is done, need frontend ASAP."

**Path:** AI-First Workflow

**Steps:**
1. Read: `GETTING-STARTED-FRONTEND.md` (5 min)
2. Copy: `platform-ui-master-prompt.md` to v0.dev (5 min)
3. Generate: Let AI create all code (30 min)
4. Review: Fix environment variables, test auth (4 hours)
5. Deploy: Push to Vercel, test production (2 hours)

**Total:** Day 1 (6-7 hours) → Working prototype ✅

---

### Scenario 2: Iterative Development (Quality Focus)

**You:** "We want to review each component before moving to the next."

**Path:** Component-by-Component Workflow

**Steps:**
1. Read: `README.md` → [Component-by-Component section](./README.md#option-b-component-by-component-most-control)
2. Week 2, Day 1: Use `01-authentication-system.md` → Review → Merge
3. Week 2, Day 2: Use `02-dashboard-shell-navigation.md` → Review → Merge
4. Week 4, Day 1: Use `03-user-management-admin.md` → Review → Merge
5. Week 4, Day 2: Use `04-responsive-accessibility.md` → Review → Deploy

**Total:** Spread across 2 weeks, 12-16 hours coding → High quality ✅

---

### Scenario 3: Learning Project (No AI Tools)

**You:** "I'm a junior dev learning Next.js, want to code manually."

**Path:** Manual Development Workflow

**Steps:**
1. Read: `front-end-spec.md` (2 hours) - Understand UX design
2. Read: `prd.md` (1 hour) - Understand business requirements
3. Reference: `01-authentication-system.md` - Copy TypeScript interfaces, auth patterns
4. Code: Hand-write login page following spec (1 day)
5. Reference: `02-dashboard-shell-navigation.md` - Layout patterns
6. Code: Hand-write header, sidebar (1-2 days)
7. Continue with remaining components...

**Total:** 4-6 days coding → Deep learning ✅

---

### Scenario 4: Regenerating One Component

**You:** "Admin panel works, but I want to redesign it with a different layout."

**Path:** Selective Regeneration

**Steps:**
1. Keep: Existing auth (01) and shell (02) components
2. Delete: Admin panel code from `app/(dashboard)/admin/` and `components/`
3. Copy: `03-user-management-admin.md` to AI tool
4. Modify prompt: Add your custom layout requirements
5. Generate: New admin panel only
6. Integrate: Replace old admin files with new ones
7. Test: Verify user CRUD operations still work

**Total:** 2-3 hours → Fresh admin design ✅

---

## 🔍 Quick Lookup Table

### "I need to build..."

| Component | Use This Prompt | Time | Depends On |
|-----------|----------------|------|------------|
| Login page | `01-authentication-system.md` | 2-3h | Nothing |
| Password reset | `01-authentication-system.md` | ↑ included | Nothing |
| Header bar | `02-dashboard-shell-navigation.md` | 3-4h | Auth (01) |
| Sidebar navigation | `02-dashboard-shell-navigation.md` | ↑ included | Auth (01) |
| Dashboard layout | `02-dashboard-shell-navigation.md` | ↑ included | Auth (01) |
| iframe embedding | `02-dashboard-shell-navigation.md` | ↑ included | Auth (01) |
| Role-based filtering | `02-dashboard-shell-navigation.md` | ↑ included | Auth (01) |
| Admin panel | `03-user-management-admin.md` | 4-5h | Auth + Shell |
| User table | `03-user-management-admin.md` | ↑ included | Auth + Shell |
| Add user modal | `03-user-management-admin.md` | ↑ included | Auth + Shell |
| Mobile responsive | `04-responsive-accessibility.md` | 3-4h | All above |
| Accessibility | `04-responsive-accessibility.md` | ↑ included | All above |
| **EVERYTHING** | `platform-ui-master-prompt.md` | 1-2d | Nothing! |

---

## 🎯 Decision Helper

### Start Here:

```
Question 1: Do you have v0.dev or Lovable.ai access?
├─ YES → Question 2
└─ NO → Use Manual Development (Option C)
         Read: README.md → Manual section

Question 2: How much time do you have?
├─ 1-2 days → Use AI-First (Option A)
│             File: platform-ui-master-prompt.md
└─ 2+ weeks → Question 3

Question 3: Do you want maximum control?
├─ YES → Use Component-by-Component (Option B)
│        Files: 01 → 02 → 03 → 04
└─ NO → Use AI-First anyway (Option A)
        You'll save time even if you don't need max speed
```

---

## 📚 Learning Path

### New to the Project?

**Day 1: Understand Context**
1. Read: `docs/prd.md` - What is XeroPulse? (30 min)
2. Read: `docs/front-end-spec.md` - What should it look like? (1 hour)
3. Read: `docs/GETTING-STARTED-FRONTEND.md` - How do I build it? (15 min)

**Day 2: Choose Path & Start Building**
4. Read: `docs/ai-prompts/README.md` - Comprehensive guide (30 min)
5. Choose workflow: AI-First, Component-by-Component, or Manual
6. Start building! 🚀

---

## 🆘 Troubleshooting Quick Links

| Issue | Solution Link |
|-------|--------------|
| "Which prompt should I use?" | [README.md → Quick Reference](./README.md#quick-reference) |
| "Prompts have dependencies?" | [README.md → Dependencies](./README.md#-prompt-dependencies--order) |
| "How do I use with v0.dev?" | [README.md → AI-First Workflow](./README.md#option-a-ai-first-fastest---recommended-for-mvp) |
| "Want incremental control" | [README.md → Component Workflow](./README.md#option-b-component-by-component-most-control) |
| "No AI tools available" | [README.md → Manual Workflow](./README.md#option-c-manual-development-traditional) |
| "Supabase connection failing" | [README.md → Common Issues](./README.md#-common-issues--fixes) |
| "Role-based access broken" | [README.md → Common Issues](./README.md#issue-3-role-based-access-not-working) |
| "Which epic am I building?" | [README.md → Epic Mapping](./README.md#️-epic-mapping) |

---

## 📊 File Statistics

| File | Lines | Purpose | When to Read |
|------|-------|---------|--------------|
| `platform-ui-master-prompt.md` | ~7,500 | AI generation (all components) | Using AI-First |
| `01-authentication-system.md` | ~400 | Auth system prompt | First component |
| `02-dashboard-shell-navigation.md` | ~500 | Layout/nav prompt | Second component |
| `03-user-management-admin.md` | ~600 | Admin panel prompt | Third component |
| `04-responsive-accessibility.md` | ~500 | Mobile/a11y prompt | Fourth component |
| `README.md` | ~1,000 | Comprehensive guide | Before starting |
| `INDEX.md` (this file) | ~300 | Visual reference | Quick lookups |
| **Total** | **~10,800** | Complete guidance | Choose your path |

---

## ✅ Quick Start Checklist

Before you start, make sure:

- [ ] I've read `GETTING-STARTED-FRONTEND.md`
- [ ] I know which workflow I'm using (A, B, or C)
- [ ] I have Supabase project set up (if applicable)
- [ ] I have environment variables ready
- [ ] I have AI tool access (if using AI workflows)
- [ ] I understand prompt dependencies (if doing incremental)

**Ready?** Go to [README.md](./README.md) for detailed instructions!

---

**Last Updated:** October 15, 2025
**Maintained by:** UX Expert Team
