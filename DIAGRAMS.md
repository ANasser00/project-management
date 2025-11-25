```mermaid
flowchart LR

  subgraph CLIENT["Client (Next.js / React)"]
    UI[UI Pages & Components: Home, Projects, Tasks, Timeline, Chat]
    STATE[App State: Redux + RTK Query]
    AI_CHAT[AI Task Chat UI (AiTaskChatBox)]
    AUTH_UI[Auth UI: Login / Register]
  end

  subgraph SERVER["Backend API (Express + Prisma)"]
    AUTH_API[Auth Routes /auth/*]
    USER_API[User Routes /users/*]
    PROJECT_API[Project Routes /projects/*]
    TASK_API[Task Routes /tasks/*]
    SEARCH_API[Search Routes /search/*]
    TEAM_API[Team Routes /teams/*]
    AI_API[AI Routes /ai/chat]
    PRISMA[(Prisma ORM)]
  end

  subgraph DB["Database (PostgreSQL)"]
    DB_USERS[(User)]
    DB_TEAMS[(Team, ProjectTeam)]
    DB_PROJECTS[(Project)]
    DB_TASKS[(Task)]
    DB_TASK_ASSIGN[(TaskAssignment)]
    DB_ATTACH[(Attachment)]
    DB_COMMENTS[(Comment)]
    DB_ACTIVITY[(TaskActivity)]
  end

  subgraph EXTERNAL["External Services"]
    GEMINI[Google Gemini: Task understanding and actions]
    AVATARS[DiceBear: Placeholder avatars]
  end

  %% Client <-> Server
  UI -->|HTTP (fetch, RTK Query)| AUTH_API
  UI --> USER_API
  UI --> PROJECT_API
  UI --> TASK_API
  UI --> SEARCH_API
  UI --> TEAM_API
  AI_CHAT -->|HTTP JSON| AI_API

  STATE <-->|Data caching and normalization| UI

  %% Server <-> DB
  AUTH_API --> PRISMA
  USER_API --> PRISMA
  PROJECT_API --> PRISMA
  TASK_API --> PRISMA
  SEARCH_API --> PRISMA
  TEAM_API --> PRISMA

  PRISMA --> DB_USERS
  PRISMA --> DB_TEAMS
  PRISMA --> DB_PROJECTS
  PRISMA --> DB_TASKS
  PRISMA --> DB_TASK_ASSIGN
  PRISMA --> DB_ATTACH
  PRISMA --> DB_COMMENTS
  PRISMA --> DB_ACTIVITY

  %% AI flow
  AI_API -->|Prompt + context (tasks, users, projects)| GEMINI
  GEMINI -->|Structured JSON (action, fields)| AI_API
  AI_API --> AI_CHAT

  %% Avatars
  UI -->|Image URLs| AVATARS
```