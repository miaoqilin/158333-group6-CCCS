# GitHub Workflow

## Purpose
This document defines how the team will collaborate on GitHub during the development of the Campus Coffee and Catering Services Web Application.

## Branch Strategy
We use a feature branch workflow.

### Main Branches
- `main`  
  Stable branch for completed and reviewed code

- `dev`  
  Integration branch for ongoing development

### Feature Branches
Each new task should be developed in a separate feature branch.

Naming format:
- `feature/frontend-routing`
- `feature/login-page`
- `feature/auth-api`
- `feature/catering-workflow`
- `feature/database-schema`

### Fix Branches
For bug fixes:
- `fix/cart-bug`
- `fix/api-validation`

## Basic Workflow
1. Pull the latest code from `dev`
2. Create a new feature branch
3. Develop and commit changes
4. Push the branch to GitHub
5. Open a Pull Request into `dev`
6. Request review from teammates
7. Merge after review
8. Periodically merge `dev` into `main` when stable

## Commit Message Convention
Use clear and consistent commit messages.

Recommended formats:
- `init: create frontend project structure`
- `feat: add login page layout`
- `feat: add auth route placeholders`
- `docs: add project scope document`
- `fix: correct cart state update`
- `chore: update dependencies`

### Prefix Guide
- `init` = initial setup
- `feat` = new feature
- `fix` = bug fix
- `docs` = documentation
- `chore` = maintenance/configuration
- `refactor` = code cleanup without changing behavior
- `test` = testing-related changes

## Pull Request Rules
Each PR should:
- Have a clear title
- Describe what was changed
- Link to related issue if available
- Be reviewed before merge
- Avoid mixing unrelated changes in one PR

## Issue Management
The project manager should create issues for:
- Documentation tasks
- Frontend tasks
- Backend tasks
- Database tasks
- Testing tasks

Suggested labels:
- `frontend`
- `backend`
- `database`
- `documentation`
- `bug`
- `enhancement`
- `week1`
- `week2`

## Review Rules
- At least one teammate should review a PR before merge
- Large features should be discussed before implementation
- Code should match agreed project structure and naming style

## Documentation Rules
The team should continuously maintain:
- README
- scope document
- meeting notes
- API drafts
- database design notes
- deployment notes later in the project

## File Structure Guidance
Suggested root structure:

```text
.
├── docs/
├── frontend/
└── backend/