# XeroPulse Document Archive

This folder contains archived versions of XeroPulse documentation that has been superseded by the unified PRD.

## Archive Contents

### old-prd-v1.1/
Contains the original sharded PRD (version 1.1) that was created before architectural unification:

- checklist-results-report.md
- epic-1-foundation-data-pipeline-infrastructure.md  
- epic-2-mvp-dashboard-suite-portal-launch.md
- epic-3-complete-dashboard-suite-with-xpm-integration.md
- epic-4-platform-refinement-advanced-features.md
- epic-list.md
- goals-and-background-context.md
- index.md
- next-steps.md
- requirements.md
- technical-assumptions.md
- user-interface-design-goals.md

### old-bi-docs/
Contains the BI-specific documents and conflicting architecture files:

- prd.md (brownfield transformation PRD)
- architecture.md (Edge Functions architecture)
- supabase-cred.md
- ui-ux-spec.md
- dashboard_architecture/ (sharded architecture documents)

## Superseded By

All archived documents have been superseded by the unified **XeroPulse Unified Product Requirements Document (PRD) v2.0** located at docs/prd.md.

## Why Archived

These documents were archived on 2025-10-22 due to:

1. **Architectural Conflicts**: Multiple conflicting technology stacks (n8n+Superset vs Edge Functions+embedded BI)
2. **Document Fragmentation**: Requirements scattered across multiple files and formats  
3. **Architecture Finalization**: Final decision on Next.js + AG-UI + CopilotKit + PydanticAI + Supabase + n8n + Metabase stack
4. **Unified Vision**: Single comprehensive PRD now provides complete project guidance

## Historical Reference

These documents serve as historical reference for:

- Original stakeholder requirements and mockups
- Alternative architecture considerations that were evaluated
- Evolution of project scope and technical decisions
- Design rationale and requirement traceability

**Date Archived**: October 22, 2025  
**Archived By**: PM Agent (John)  
**Reason**: Unified PRD v2.0 creation and architectural consolidation
