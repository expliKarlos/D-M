# CI/CD Pipeline & Orchestration

This project follows a three-tier environment strategy managed via GitHub and Vercel.

## Environments

1. **Development (local)**: Local development using `.env.local`.
2. **Preview (GitHub PRs)**: Automated deployment for every Pull Request. Vercel automatically generates a unique URL for review.
3. **Production (Main Branch)**: Final production environment synced with the `main` branch.

## CI/CD Workflow

- **Integration**: All code pushed to GitHub triggers Vercel builds.
- **Automated Checks**: ESLint and TypeScript checks are run during the build phase.
- **Secrets Management**: Sensitive keys (Supabase, Firebase, Vertex AI) must be configured in Vercel's Environment Variables dashboard.

## Multi-language (I18n)

The middleware handles automatic language detection based on headers and redirects to the appropriate locale path (`/es`, `/en`, `/hi`).

## Monitoring

Vertex AI is integrated for log analysis. Critical system logs can be sent to the `analyzeLogs` service for proactive error detection.
