---
title: Pandi CRM Backend Architecture
updated: 2026-03-25
---

## Monorepo Layout

```
pandi-crm/
├─ apps/
│  ├─ web/               # Next.js frontend (existing)
│  └─ api/               # Next.js App Router backend (Edge + Node handlers)
├─ packages/
│  ├─ core-domain/       # Shared domain logic, entity models, value objects
│  ├─ data-access/        # Prisma client, repository adapters, migrations
│  ├─ workflow-engine/    # Ritual cadence engine + scheduler utilities
│  ├─ ai-services/        # AI transcription + summarisation orchestrators
│  └─ messaging/          # Message contracts, event bus wrappers
├─ infra/
│  ├─ terraform/          # Provision Netlify site, Neon/Postgres, QStash/Redis
│  └─ docker/             # Local dev containers (db, queue, transcription stub)
└─ docs/
   └─ backend-architecture.md
```

* `apps/api` runs in the same Next.js workspace using the App Router: `app/api/*/route.ts` for REST, `app/(rpc)` for RPC routes, and `app/(webhooks)` for third-party ingests.
* Shared packages are published locally via `pnpm workspaces` to keep domain logic independent of transport or UI frameworks.

## Core Domains & Services

| Domain            | Responsibilities                                                                 | Primary Entities                         |
|-------------------|----------------------------------------------------------------------------------|------------------------------------------|
| Tasks             | Capture, assign, and synchronize actionable work across deals and rituals.      | Task, TaskList, Assignment, Reminder     |
| AI Notes          | Process meeting recordings, generate transcripts, summarise, and surface action | Note, TranscriptAsset, Insight, Snippet  |
| Rituals           | Encode recurring cadences (daily/weekly/monthly), tie to goals & teams.         | Ritual, CadenceConfig, Run, HealthScore  |
| Identity & Teams  | Manage users, roles, orgs, and workspace membership.                            | User, Workspace, Team, RoleGrant         |
| Integrations      | Sync with calendars, Slack, CRMs, video providers.                              | IntegrationAccount, SyncJob, WebhookEvent|

Each domain exposes a service interface (Application Service) in `packages/core-domain`, with adapters for HTTP handlers, background jobs, and external integrations.

## Data Storage Strategy

* **Primary DB**: Postgres (Neon or Supabase). Prisma schema lives in `packages/data-access/prisma/schema.prisma`.
  * Tasks: `tasks`, `task_lists`, `task_assignments`, `task_activity`.
  * Notes: `notes`, `transcripts`, `insights`, `note_links` (task or ritual linkage).
  * Rituals: `rituals`, `ritual_runs`, `ritual_metrics`.
  * Shared: `users`, `workspaces`, `teams`, `integrations`, `events`.
* **Vector Store** (Phase 2): Pinecone or pgvector extension for semantic search across transcripts/insights.
* **Blob Storage**: S3-compatible bucket (e.g. R2) for audio uploads and generated summaries (Markdown/PDF).
* **Cache**: Upstash Redis (session cache, queue dedupe, ritual scoring cache).

## API Surface

1. **REST Endpoints** under `/api/*` for external webhook callbacks and public clients (e.g. `/api/tasks`, `/api/notes`).
2. **tRPC/RPC** routes for authenticated SPA calls, colocated in `app/(rpc)` using server actions.
3. **Webhooks** handlers for calendar providers, Slack slash commands, and transcription completions.
4. **Internal Events** emitted through the event bus (QStash, BullMQ) for async processing.

Authentication is backed by Clerk/Auth0 (pluggable). Middleware in `apps/api/middleware.ts` enforces workspace scoping and rate limiting.

## Workflow Overview

### Task Lifecycle
1. API receives create/update request → validates via Zod schema in `core-domain`.
2. Service persists via repository (`tasksRepository.upsert`).
3. Emits `task.updated` event → triggers notifications, ritual recalculations, and Slack sync jobs.
4. Background worker updates derived metrics (task completion rate, ritual score contribution).

### AI Note Processing
1. Upload meeting audio → stored in blob storage, metadata row created (`TranscriptAsset`).
2. Event `transcript.uploaded` queued to `ai-services` worker.
3. Worker sends audio to OpenAI Realtime or Deepgram → obtains transcript.
4. Summariser pipeline (LangChain or custom) produces key insights, action items, sentiment.
5. Persisted as `Note` + `Insight` records, cross-linked to tasks/rituals via embeddings.
6. Emits `note.ready` → notifies UI, publishes to Slack/email.

### Ritual Cadence Engine
1. Scheduler (Upstash QStash cron) triggers `RitualRunJob` daily/weekly/monthly.
2. Job reads ritual definitions (cadence windows, KPIs) and aggregates tasks & notes in scope.
3. Computes health metrics, generates briefing summary (AI optional), stores `ritual_runs`.
4. Emits `ritual.run.completed` for UI timeline and analytics dashboards.

## Background Processing

* `apps/api/queue` exports BullMQ processors for task reminders, integration syncs.
* `packages/workflow-engine` encapsulates reusable job blueprints (retry, tracing, logging).
* Distributed tracing via OpenTelemetry exporter → Grafana Tempo or Vercel Observability.

## Integration Patterns

* **Calendar**: OAuth tokens stored encrypted. Sync jobs fetch events, map to `tasks` / `ritual_runs`.
* **Slack/Email**: Webhook deliverability tracked in `integration_jobs`, with retry + DLQ via Redis streams.
* **CRM Imports**: Webhook ingestion pipeline normalises entities before invoking domain services.

## Security & Compliance

* Row-Level Security by workspace ID enforced in Prisma middleware.
* Secrets managed through Netlify environment groups + .env for local.
* Audit log table capturing mutations on key tables (tasks, notes, rituals).
* SOC 2 readiness: structured logging, backup schedules, access reviews documented in `/docs/compliance` (future).

## Local Development

* `pnpm dev:web` → Next.js frontend.
* `pnpm dev:api` → Next.js backend with hot reload.
* `pnpm dev:queue` → Runs background worker via tsx.
* `docker-compose -f infra/docker/dev.yml up` → Postgres + Redis + minio for local AI note pipeline.

## Deployment Flow

1. GitHub → Netlify monorepo build. Two pipelines:
   * `apps/web` deploys to Netlify edge.
   * `apps/api` builds serverless functions (Netlify Functions) with background functions for queues.
2. Prisma migrations run via Netlify pre-build hook hitting Neon.
3. Background workers deployed as Netlify Scheduled Functions or Fly.io VM for long-running processes.

## Next Steps

1. Scaffold `apps/api` Next.js project with shared tsconfig.
2. Define Prisma schema for core entities and generate migrations.
3. Implement task service + API route with integration tests (Vitest).
4. Stand up queue worker with a sample `task.reminder` job.
5. Document AI transcription pipeline contracts (`packages/ai-services/contracts.ts`).
