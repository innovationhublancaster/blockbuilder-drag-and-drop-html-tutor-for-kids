# BlockBuilder — Architecture Overview

This document describes the high-level architecture for BlockBuilder (MVP scope). It assumes the non-negotiable tech stack: Next.js 16 (App Router + React Server Components + Turbopack), BetterAuth (email/password), NeonDB + Drizzle ORM, Azure AI Foundry via the Vercel AI SDK (@ai-sdk/azure), UI libs (shadcn/ui, @dnd-kit, zustand, recharts, react-markdown, mermaid), hosted on Vercel with Upstash Redis, Vercel Blob, and Sentry.

Key architectural goals (MVP):
- Fast interactive canvas (drag/drop, property panels) on low-end devices
- Safe sandboxed preview (no external network requests from student projects)
- Deterministic one-way block→HTML code generation, autosave & versioning
- Teacher dashboard with class management, CSV/ZIP export, and student submissions
- Accessible, offline-capable (PWA) lesson packs
- Privacy-first telemetry and rate-limited AI hints

C4 System Context (actors and system boundaries)

```mermaid
graph TD
  A[Student (8–14) - Uses Canvas & Lessons] -->|Uses| WebApp[BlockBuilder Web App (Next.js 16)]
  B[Teacher/Parent] -->|Manages classes & views reports| WebApp
  C[Admin] -->|Uploads assets, reviews moderation| WebApp
  subgraph Platform
    WebApp -->|Auth| Auth[BetterAuth (email/password)]
    WebApp -->|Primary DB| DB[NeonDB (Postgres) + Drizzle ORM]
    WebApp -->|AI hints| AzureAI[Azure AI Foundry via Vercel AI SDK (@ai-sdk/azure)]
    WebApp -->|Blob storage| Blob[Vercel Blob]
    WebApp -->|Cache & rate-limits| Redis[Upstash Redis]
    WebApp -->|Monitoring| Sentry[Sentry]
  end
  External[Third-party services blocked from student projects] -.->|Blocked by sandbox & proxy| WebApp
  Note1[Export: single-file HTML/CSS bundle, ZIP export] --> WebApp
  style WebApp fill:#f9f,stroke:#333,stroke-width:2px
```

Container / Component Diagram (major subsystems & interactions)

```mermaid
graph TD
  subgraph Vercel Platform
    A[Next.js App (App Router + RSC + Server Actions + Turbopack)]
    B[Edge Functions (Auth middleware, short latency APIs)]
    C[Serverless Functions (API handlers, file upload presigned, validators)]
    D[Background Jobs (scheduled backups, analytics summarization)]
    E[Vercel Blob]
  end

  A -->|auth flows| BetterAuth[BetterAuth]
  A -->|DB queries (Drizzle)| Neon[NeonDB + Drizzle ORM]
  A -->|cache, rate-limit, queue| Upstash[Upstash Redis]
  A -->|AI requests (server-only via SDK)| Azure[@ai-sdk/azure]
  C -->|store uploaded assets| E
  C -->|validate projects & grade| Neon
  A -->|error telemetry| Sentry[Sentry]

  subgraph Client (Browser)
    UI_Root[Next.js Client Components: Canvas, Property Panel, Toolbar]
    SandboxIFR[Sandboxed iframe (preview)]
    ServiceWorker[Service Worker / PWA cache]
  end

  UI_Root -->|dnd events| @dndkit[@dnd-kit (drag/drop)]
  UI_Root -->|local state| Zustand[Zustand]
  UI_Root -->|send autosave| A
  UI_Root -->|preview update (postMessage/srcdoc)| SandboxIFR
  ServiceWorker -->|serve offline lesson packs| UI_Root

  style A fill:#e3f2fd,stroke:#0d47a1
  style C fill:#fff3e0,stroke:#ef6c00
```

Deployment Topology (how components map to infra)

```mermaid
graph TD
  subgraph Vercel
    edge1[Edge Network / CDN]
    web[Next.js App (Edge + Serverless Lambdas)]
    blob[Vercel Blob Storage]
    functions[Serverless Functions]
    edgeFns[Edge Functions]
  end

  neon[NeonDB (managed serverless Postgres)]
  upstash[Upstash Redis (global managed)]
  azure[Azure AI Foundry (region-bound)]
  better[BetterAuth (Auth provider)]
  sentry[Sentry]

  Client[Browser (Chromebook, tablet, phone)] -->|HTTPS| edge1
  edge1 -->|SSR/Server Components| web
  web -->|DB connection (pooled / serverless best-practices)| neon
  web -->|Redis operations (rate-limits, caching)| upstash
  web -->|AI hints (server-only, proxied)| azure
  web -->|auth API| better
  web -->|blob uploads/downloads (presigned + proxy)| blob
  web -->|error logs| sentry
  Client -->|preview iframe (sandboxed)| functions
  functions -->|asset proxy| blob

  style web fill:#e8f5e9,stroke:#2e7d32
  style neon fill:#fff9c4,stroke:#f9a825
```

Notes on data flows
- Student edits: Client (zustand) -> optimistic client updates -> autosave (Next.js server action to API) -> Neon snapshots & version stored (JSONB) + ephemeral cache in Upstash for immediate UI restoration.
- Preview: client generates canonical AST (blocks tree) and sends minimal snapshot to preview iframe (srcdoc or postMessage). Preview iframe requests assets only through the serverless asset-proxy endpoint which enforces CSP and strips external origins.
- Teacher assignment: Teacher triggers assignment creation -> Next.js server action persists assignment and notifies students via teacher dashboard; exports initiated create ephemeral ZIPs in Vercel Serverless and store in Vercel Blob for retrieval.
- AI hints: client requests hint -> Next.js server handler enforces rate-limit & content filter, then calls Azure AI via @ai-sdk/azure; responses cached in Upstash for identical prompts and anonymized telemetry.

