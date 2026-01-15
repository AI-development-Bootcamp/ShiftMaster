# Change: Add CI/CD Pipeline

## Why
The project requires automated quality checks and deployment workflows to ensure code quality, catch issues early, and enable reliable production deployments. Without CI/CD, manual testing and deployment processes are error-prone and time-consuming.

## What Changes
- Add GitHub Actions workflows for staging (main branch) and production (production branch)
- Implement automated linting, type checking, and testing for all projects (server, client, admin, shared)
- Add build and deployment steps for production workflow
- Document CI/CD pipeline in project.md

## Impact
- Affected specs:
  - `cicd-pipeline` (new)
- Affected code:
  - `.github/workflows/staging.yml` (new)
  - `.github/workflows/production.yml` (new)
  - `openspec/project.md` (updated with CI/CD documentation)
- Breaking changes: None
