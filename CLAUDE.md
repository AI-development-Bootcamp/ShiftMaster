<!-- OPENSPEC:START -->

# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:

- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:

- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

---

# ShiftMaster Project Rules

## Project Overview
Read `@/openspec/project.md` first to understand the full context of this time reporting application with mobile PWA client, web admin interface, and Express backend.

## Critical Project Constraints

### Architecture Rules
- **Monorepo Structure**: Use npm workspaces with flat structure (no apps/ directory)
- **Separate Frontends**: Client (mobile PWA) and Admin (web) are completely independent
- **No State Sharing**: Client and Admin have separate Redux stores
- **Direct Development**: No Docker for local development
- **Database First**: Always check database schema in project.md before modifying data models

### Authentication & Security
- JWT-based authentication only
- Users receive passwords without required change initially
- Validate admin-only operations at both middleware and service layers
- Never expose password_hash in API responses
- Check month locks before allowing entry modifications

### Data Model Rules
- **One entry per user per day**: Enforced by unique constraint (user_id, work_date)
- **Soft deletes**: Users, clients, and projects use `active` flag
- **Time format enforcement**: Respect project's time_format_type (start_end vs sum)
- **Task assignments**: Users can only report time on assigned tasks
- **Month locking**: Locked months prevent ALL entry/assignment modifications
- **Vacation ranges**: Backend creates multiple entry rows (one per day)

### Code Style & Quality
- TypeScript strict mode enabled everywhere
- ESLint + Prettier for all workspaces
- 2-space indentation, single quotes, semicolons required
- Colocate test files: `*.test.ts`, `*.test.tsx`
- Use Conventional Commits format
- Always include error handling with proper error codes

### API Conventions
- Base URL: `/api/v1`
- Consistent response format with `success`, `data`, and `error` fields
- Use proper HTTP status codes
- Document all endpoints in project.md
- Swagger documentation required

### Development Workflow
- Feature branches: `feature/description`
- Pull requests required for all changes
- Test before commit
- Update project.md when adding new API endpoints

### Claude Skills (Project-Scoped Plugins)

#### `/code-review` - Command
- **Usage**: `/code-review` (no arguments needed)
- **Purpose**: Automated code review for pull requests
- **When**: Run before submitting PRs to catch bugs, security issues, and convention violations

#### `/frontend-design` - Skill
- **Usage**: `/frontend-design [describe the component you want]`
- **Purpose**: Generate distinctive, production-grade UI components with high design quality
- **Example**: `/frontend-design create a mobile-friendly time entry card with date, hours, and status`

#### `/feature-dev` - Command + Sub-Agents
- **Usage**: `/feature-dev` (main command for full workflow)
- **Purpose**: Guided feature development with codebase understanding and architecture focus
- **Sub-Agents**:
  - `/feature-dev:code-explorer` - Analyze existing codebase patterns and architecture
  - `/feature-dev:code-architect` - Design feature architecture and implementation plans
  - `/feature-dev:code-reviewer` - Review code for bugs, quality, and conventions

## Sub-Agent Specializations

When working on specific areas, consult these specialized guides:

### Feature Development
For complex multi-file features spanning frontend, backend, and database:
- **`/feature-dev`** - Full guided workflow from exploration to implementation
- **`/feature-dev:code-explorer`** - Understand existing patterns before starting
- **`/feature-dev:code-architect`** - Plan feature architecture and file structure
- **`/feature-dev:code-reviewer`** - Review implemented code for issues

Use when: building features that span multiple layers, need to understand existing patterns, or require architectural planning.

### Frontend Development
For client or admin UI work, see `@/.claude/agents/frontend-agent.md`
- **`/frontend-design [task]`** - Generate polished UI components with design quality
- Follow frontend-agent.md for integration (Redux, routing, API, testing)

### Backend API Development
For server routes, controllers, services, see `@/.claude/agents/backend-agent.md`

### Testing
For test writing and debugging, see `@/.claude/agents/testing-agent.md`

### Code Review
Before submitting pull requests, run **`/code-review`** for automated analysis

## Quick Decision Tree

**Complex Feature?** → Use `/feature-dev` (or `/feature-dev:code-explorer` first) → Create OpenSpec proposal if needed

**Understanding Codebase?** → Use `/feature-dev:code-explorer` to analyze existing patterns

**Planning Architecture?** → Use `/feature-dev:code-architect` for implementation blueprint

**New Feature?** → Create OpenSpec proposal → Follow AGENTS.md workflow

**Bug Fix?** → Fix directly if restoring spec behavior, otherwise create proposal

**API Endpoint?** → Check project.md for existing routes → Document in project.md

**Need UI Component?** → Use `/frontend-design [describe component]` → Follow frontend-agent.md for integration

**Frontend Change?** → Identify client vs admin → Check separate Redux stores

**Entry Modification?** → Verify month not locked → Check user task assignments

**Ready for PR?** → Run `/code-review` → Address feedback → Submit
