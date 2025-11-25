```mermaid
flowchart LR
  %% Top-level actors
  U[User (Browser / Client)]

  %% Client subgraph
  subgraph CLIENT["Client — Next.js + Tailwind (client/)"]
    C[Next.js app client/src]
    STATIC[Static assets client/public]
  end

  %% Server subgraph
  subgraph SERVER["Server — TypeScript (Bun/Node) (server/)"]
    API[API server server/src]
    PRISMA[Prisma ORM & schema server/prisma]
    ENV[Environment config server/.env.example]
  end

  %% Database and external services
  subgraph DB["Database (relational)"]
    DATABASE[(Relational DB)]
  end

  subgraph EXTERNAL["External Services"]
    EX1[Email / SMTP]
    EX2[Object Storage (S3)]
    EX3[Third-party APIs]
  end

  %% Connections
  U -->|HTTP / Browser requests| C
  C -->|API calls (REST / GraphQL / Fetch)| API
  C --> STATIC
  API -->|ORM calls| PRISMA
  PRISMA -->|DB connection (from env)| DATABASE
  API -->|env variables| ENV
  API --> EXTERNAL
  EXTERNAL --> EX2
```
--- 

Diagram notes (mapped to repository structure observed):
- Client: Next.js + Tailwind front-end. Key files/indicators found: client/next.config.mjs, client/tailwind.config.ts, client/package.json, client/src, client/public.
- Server: TypeScript backend. Key files/indicators found: server/src, server/package.json, server/tsconfig.json, server/ecosystem.config.js, server/.env.example.
- Prisma: server/prisma directory is present (Prisma schema and migrations live here).
- Runtime/packaging: bun.lock files exist for client and server (Bun used in project workflows).
- External services: left generic (email, storage, third-party APIs) — common integrations for project-management apps; adapt if you want specific services added.

What I produced: a Mermaid flowchart that captures the major blocks (User, Client, Server, Prisma, Database, External services) and how they connect, with repo-path references for each block.

If you’d like, I can:
- produce a PlantUML version,
- expand this into a C4-style container diagram,
- or generate a more detailed component diagram showing routes, major frontend pages, or Prisma models (if you want me to parse specific files).