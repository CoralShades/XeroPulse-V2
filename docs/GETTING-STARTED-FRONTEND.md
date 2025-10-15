# XeroPulse Frontend - Getting Started Guide

**Quick Start:** Choose your path below to start building the XeroPulse frontend UI.

---

## 🚀 Three Ways to Build

### 1. AI-First (Fastest - 1-2 days)

**Perfect for:** MVP sprint, need working prototype ASAP

```bash
# 1. Copy the master prompt
cat docs/ai-prompts/platform-ui-master-prompt.md

# 2. Paste into v0.dev or Lovable.ai
# 3. Generate code (30 minutes)
# 4. Download and customize (4-6 hours)
# 5. Deploy to Vercel (2 hours)

# Total: 1-2 days to working platform ✅
```

**📄 Full Instructions:** See [AI-First Workflow](./ai-prompts/README.md#option-a-ai-first-fastest---recommended-for-mvp)

---

### 2. Component-by-Component (Balanced - 1.5-2 days)

**Perfect for:** Want control, incremental development, code reviews

```bash
# Day 1 Morning: Authentication
Use: docs/ai-prompts/01-authentication-system.md
Delivers: Login, password reset, middleware (2-3 hours)

# Day 1 Afternoon: Dashboard Shell
Use: docs/ai-prompts/02-dashboard-shell-navigation.md
Delivers: Header, sidebar, navigation, iframe (3-4 hours)

# Day 2 Morning: Admin Panel
Use: docs/ai-prompts/03-user-management-admin.md
Delivers: User management CRUD (4-5 hours)

# Day 2 Afternoon: Mobile & Accessibility
Use: docs/ai-prompts/04-responsive-accessibility.md
Delivers: Responsive design, WCAG AA (3-4 hours)

# Total: 12-16 hours across 2 days ✅
```

**📄 Full Instructions:** See [Component-by-Component Workflow](./ai-prompts/README.md#option-b-component-by-component-most-control)

---

### 3. Manual Development (Traditional - 4-6 days)

**Perfect for:** No AI tools, prefer hand-coding, learning project

```bash
# Read the design spec first
docs/front-end-spec.md

# Reference prompts as implementation guides
docs/ai-prompts/01-authentication-system.md  # Auth patterns
docs/ai-prompts/02-dashboard-shell-navigation.md  # Layout patterns
docs/ai-prompts/03-user-management-admin.md  # CRUD patterns
docs/ai-prompts/04-responsive-accessibility.md  # Responsive patterns

# Code components manually following specifications
# Total: 4-6 days of hand-coding ✅
```

**📄 Full Instructions:** See [Manual Development Workflow](./ai-prompts/README.md#option-c-manual-development-traditional)

---

## 📊 Epic Timeline & Prompt Mapping

### Week 1-2: Epic 1 - Foundation (Backend Focus)

**Backend Team:**
- ✅ VPS setup, n8n, Superset deployment
- ✅ Xero API integration
- ✅ Dashboard 1 (Income vs Expenses)

**Frontend Team (Days 8-10):**
- 📄 Use: `01-authentication-system.md` → Login/auth (Day 8-9)
- 📄 Use: `02-dashboard-shell-navigation.md` → Layout/iframe (Day 9-10)

**Deliverable:** Users can login and view Dashboard 1

---

### Week 3-4: Epic 2 - MVP Launch (Frontend Focus)

**Backend Team:**
- ✅ Dashboards 2, 7 (Budget, AR Aging)

**Frontend Team (Days 11-20):**
- 📄 Use: `03-user-management-admin.md` → Admin panel (Day 16-17)
- 📄 Use: `04-responsive-accessibility.md` → Mobile/a11y (Day 19-20)
- 🧪 UAT with 5 users (Day 17-18)
- 🚀 **LAUNCH** on Day 20 (October 31)

**Deliverable:** Production platform with 3 dashboards, 20 users

---

### Month 2-3: Epic 3 - Full Suite (Backend Focus)

**Backend Team:**
- ✅ XPM API integration
- ✅ Dashboards 3, 4, 5, 6, 8 (5 more dashboards)

**Frontend Team:**
- 📄 Use: `02-dashboard-shell-navigation.md` → Update config for 8 dashboards
- 🎨 Minor UI tweaks for new dashboards

**Deliverable:** Complete 8-dashboard platform

---

## 🎯 Decision Tree: Which Path is Right for You?

```
START: Need to build frontend
│
├─ Do you have AI tool access (v0.dev/Lovable)?
│  │
│  ├─ YES → Do you need it FAST or want CONTROL?
│  │  │
│  │  ├─ FAST (1-2 days) → AI-First
│  │  │  Use: platform-ui-master-prompt.md
│  │  │  Generate entire platform at once
│  │  │
│  │  └─ CONTROL (1.5-2 days) → Component-by-Component
│  │     Use: 01 → 02 → 03 → 04 prompts
│  │     Generate and review each component
│  │
│  └─ NO → Manual Development
│     Use: front-end-spec.md as guide
│     Hand-code components (4-6 days)
│
END: Frontend complete! 🎉
```

---

## 📋 Prerequisites Checklist

Before starting, ensure you have:

### ✅ Backend Setup Complete

- [ ] Supabase project created
- [ ] `users` table created with schema:
  ```sql
  create table users (
    id uuid references auth.users primary key,
    email text unique not null,
    role text not null check (role in ('executive', 'manager', 'staff', 'admin')),
    created_at timestamp with time zone default now(),
    last_login timestamp with time zone
  );
  ```
- [ ] Superset deployed on VPS
- [ ] At least Dashboard 1 created in Superset
- [ ] Dashboard embed URLs working

### ✅ Development Environment

- [ ] Node.js 18+ installed
- [ ] Git installed and configured
- [ ] Code editor (VS Code recommended)
- [ ] Access to Supabase dashboard
- [ ] Environment variables ready:
  ```env
  NEXT_PUBLIC_SUPABASE_URL=your_url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
  NEXT_PUBLIC_SUPERSET_BASE_URL=your_superset_url
  ```

### ✅ AI Tools (If Using AI Workflow)

- [ ] v0.dev account (Option 1) OR
- [ ] Lovable.ai account (Option 2) OR
- [ ] Claude/ChatGPT Plus for code generation

---

## 🔗 Quick Links

| Resource | Link | Purpose |
|----------|------|---------|
| **Comprehensive Prompt Guide** | [ai-prompts/README.md](./ai-prompts/README.md) | Detailed usage instructions |
| **Master Prompt (All-in-One)** | [ai-prompts/platform-ui-master-prompt.md](./ai-prompts/platform-ui-master-prompt.md) | Generate entire platform |
| **Auth Prompt** | [ai-prompts/01-authentication-system.md](./ai-prompts/01-authentication-system.md) | Login & session management |
| **Shell Prompt** | [ai-prompts/02-dashboard-shell-navigation.md](./ai-prompts/02-dashboard-shell-navigation.md) | Layout & navigation |
| **Admin Prompt** | [ai-prompts/03-user-management-admin.md](./ai-prompts/03-user-management-admin.md) | User CRUD operations |
| **Responsive Prompt** | [ai-prompts/04-responsive-accessibility.md](./ai-prompts/04-responsive-accessibility.md) | Mobile & accessibility |
| **Frontend Specification** | [front-end-spec.md](./front-end-spec.md) | Complete UX design spec |
| **Product Requirements** | [prd.md](./prd.md) | Business requirements & epics |

---

## 💡 Pro Tips

### For AI-First Workflow:

1. **Review Generated Code Carefully**
   - AI can hallucinate non-existent APIs
   - Check all Supabase method calls against docs
   - Verify environment variables aren't hardcoded

2. **Test Incrementally**
   - Don't wait until everything is generated
   - Test auth flow first
   - Then navigation
   - Then admin features

3. **Keep Prompts Updated**
   - If you make changes, update the prompt files
   - Document any deviations from generated code

### For Component-by-Component:

1. **Commit After Each Component**
   ```bash
   git commit -m "feat: implement authentication system"
   git commit -m "feat: add dashboard shell and navigation"
   git commit -m "feat: implement admin user management"
   git commit -m "feat: add responsive design and accessibility"
   ```

2. **Test Integration Between Components**
   - Auth → Shell (does login redirect to dashboard?)
   - Shell → Admin (does admin link appear for executives?)
   - Shell → Mobile (does hamburger menu work?)

3. **Code Review Each Component**
   - Don't merge until reviewed
   - Easier to fix issues in small chunks

### For Manual Development:

1. **Start with Smallest Component**
   - Login page is simplest
   - Build confidence with small wins
   - Add complexity gradually

2. **Copy TypeScript Types from Prompts**
   - Don't reinvent interfaces
   - Prompts have correct types defined
   - Copy and paste liberally

3. **Reference Code Examples**
   - Each prompt has working code snippets
   - Use as templates for your implementation
   - Adapt to your needs

---

## 🐛 Common First-Time Issues

### "Supabase connection failing"

**Fix:**
```bash
# Check .env.local has correct values
cat .env.local

# Verify Supabase URL format
# Should be: https://xxxxx.supabase.co
# NOT: https://app.supabase.com/project/xxxxx
```

### "Dashboard iframe not loading"

**Fix:**
```bash
# Test Superset URL directly in browser
# Format: https://superset.your-domain.com/superset/dashboard/1/?standalone=true

# Check CORS settings in Superset superset_config.py
ENABLE_CORS = True
CORS_OPTIONS = {
    'supports_credentials': True,
    'allow_headers': ['*'],
    'origins': ['*']
}
```

### "Role-based access not working"

**Fix:**
```typescript
// Check user role is in database
// Query Supabase:
select * from users where email = 'your@email.com';

// Verify role matches DASHBOARD_CONFIG
// Executive should see all 8 dashboards
// Staff should see only dashboard-7
```

---

## 📞 Get Help

**Stuck?** Check these resources in order:

1. **Comprehensive README:** [ai-prompts/README.md](./ai-prompts/README.md) - 90% of questions answered
2. **Frontend Spec:** [front-end-spec.md](./front-end-spec.md) - Design decisions explained
3. **PRD:** [prd.md](./prd.md) - Business context
4. **Common Issues:** [ai-prompts/README.md#common-issues--fixes](./ai-prompts/README.md#-common-issues--fixes)

Still stuck?
- File an issue in GitHub
- Ask in project Slack/Discord
- Review Supabase/Next.js docs

---

## ✅ Success Checklist

You're done when:

- [ ] Users can login with email/password
- [ ] Login redirects to first authorized dashboard
- [ ] Dashboard iframe loads and displays Superset visualization
- [ ] Sidebar shows correct dashboards based on role
- [ ] Executives see all 8 dashboards
- [ ] Staff see only dashboard-7
- [ ] Admin panel accessible to executives only
- [ ] Admin can add new users with role assignment
- [ ] Mobile view works (375px width, hamburger menu)
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Lighthouse accessibility score 90+

**Time to launch:** 1-6 days depending on workflow chosen

---

## 🎉 Next Steps After Frontend Complete

1. **User Onboarding** → Add 20 production users via Admin Panel
2. **UAT Testing** → 5 users test all flows (Story 2.7)
3. **Performance Optimization** → Lighthouse audit, fix issues
4. **Production Deployment** → Deploy to Vercel, test end-to-end
5. **Launch** → Send announcement to organization

---

**Ready to start?** Pick your workflow above and begin! 🚀

**Questions?** Read the [comprehensive guide](./ai-prompts/README.md) for detailed instructions.

**Feedback?** Update this guide as you learn - help future developers!
