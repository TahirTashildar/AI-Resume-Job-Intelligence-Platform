# ResumeIQ — AI Resume & Job Intelligence Platform

A full-stack SaaS-style platform that helps job seekers score their resume, analyze job descriptions,
match a resume against a job, find skill gaps, generate tailored improvements, and prep for interviews —
all backed by a real LLM through a provider-agnostic LangChain layer.

## Table of Contents
1. [Features](#features)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Folder Structure](#folder-structure)
5. [Installation](#installation)
6. [Environment Variables](#environment-variables)
7. [MongoDB Atlas Setup](#mongodb-atlas-setup)
8. [LLM / Hugging Face API Setup](#llm--hugging-face-api-setup)
9. [Running the App](#running-the-app)
10. [API Overview](#api-overview)
11. [Test Credentials](#test-credentials)
12. [Known Limitations](#known-limitations)
13. [Future Improvements](#future-improvements)

---

## Features

- **Authentication** — register/login/logout, JWT, bcrypt password hashing, protected routes, persistent login.
- **Resume Management** — upload PDF/DOCX, multiple versions, rename, duplicate, set active, delete, ownership checks.
- **AI Resume Analyzer** — extracts contact info, career info, skills, experience, education, projects, certifications.
- **Resume Scoring** — 0–100 overall score broken into ATS, skills, experience, projects, education, impact,
  formatting, keywords, and summary sub-scores, all genuinely derived by the LLM from your resume's content.
- **ATS Analysis** — concrete problems + actionable recommendations (never fabricated).
- **Job Description Analyzer** — paste any JD, get structured requirements (required vs. preferred skills, etc.).
- **Resume ↔ Job Matching** — match score, skill/experience/education/keyword sub-scores, matched vs. missing
  skills, recommended skills, resume improvements, and interview-prep areas.
- **Job Intelligence Dashboard** — resume score trend, average match score, pipeline chart, top missing skills,
  recent activity — all computed from real stored data, never hardcoded.
- **Job Tracker** — Kanban board (Saved → Applied → Assessment → Interview → Offer / Rejected) with drag-and-drop.
- **AI Resume Improvement** — before/after rewrites for summary, bullets, and projects, tailored to a specific job,
  constrained to never invent companies, degrees, certifications, or metrics.
- **AI Bullet Improver** — strengthens a single weak bullet into 3 style variants (professional / technical /
  impact-focused / concise) without inventing numbers.
- **Career Skill Gap Analysis** — high/medium/low priority skill gaps with rationale and a learning direction.
- **AI Interview Preparation** — technical, behavioral, resume-based, project, and role-specific questions,
  each with why it's asked, what's expected, and key concepts to cover. Clearly labeled as practice questions.
- **Resume Version Control** — duplicate a resume into v2/v3/etc., each independently analyzable.

## Architecture

```
React (Vite) ── Axios ──▶ Express REST API
                              │
                ┌─────────────┼─────────────┐
                │             │             │
           Auth/JWT     Resume/Job/Match   Dashboard
              │           Services            │
              └─────────────┼─────────────────┘
                             ▼
                        AI Service (provider-agnostic facade)
                             │
                             ▼
                      LangChain Chains
                    (per-feature prompt + parse)
                             │
                             ▼
                    LLM Factory (server/ai/llm)
                             │
                 ┌───────────┼───────────┐
                 ▼           ▼           ▼
           Hugging Face   OpenAI     Anthropic
           (default via  (swap via   (swap via
            LLM_PROVIDER  env var)    env var)
           =huggingface)
```

**Key architectural rule:** controllers, services (`resumeService`, `jobService`, `matchingService`,
`dashboardService`), models, and routes never import a provider SDK or reference a specific provider
by name. They only call `server/ai/services/aiService.js`. Swapping providers means changing `LLM_PROVIDER`
and `LLM_MODEL` in `.env` — no application code changes required. See `server/ai/llm/llmFactory.js`.

Every AI response is validated against a strict Zod schema (`server/ai/parsers/structuredOutput.js`) before
it is ever written to MongoDB. Malformed or incomplete AI output is rejected with a clear error instead of
being silently stored.

Resume/job analyses are content-hashed (`server/utils/hash.js`) — re-running an analysis on unchanged content
returns the cached result instead of calling the LLM again, protecting against unnecessary spend and rate limits.

## Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, Framer Motion, React Router, Axios, Recharts, react-hot-toast, lucide-react.

**Backend:** Node.js, Express, MongoDB + Mongoose, JWT, bcryptjs, Multer, pdf-parse, mammoth, Helmet,
express-rate-limit, express-validator.

**AI:** LangChain (`langchain`, `@langchain/core`) with a Hugging Face Inference adapter,
`@langchain/openai`, and `@langchain/anthropic`. Structured output validated with Zod.

## Folder Structure

```
ai-resume-platform/
├── package.json                 # root convenience scripts (dev, install:all, etc.)
├── .gitignore
├── server/
│   ├── config/                  # env.js, db.js
│   ├── controllers/             # authController, resumeController, jobController, ...
│   ├── middleware/               # auth, errorHandler, upload, validate, rateLimiter
│   ├── models/                  # User, Resume, ResumeAnalysis, Job, JobAnalysis, Application, ResumeVersion
│   ├── routes/                  # authRoutes, resumeRoutes, jobRoutes, matchingRoutes, interviewRoutes, dashboardRoutes
│   ├── services/                 # resumeService, jobService, matchingService, dashboardService, documentParser
│   ├── ai/
│   │   ├── llm/                 # llmFactory.js (provider switch), config.js
│   │   ├── prompts/              # one file per AI feature
│   │   ├── chains/                # one LangChain chain per AI feature + shared runChain.js (retry/backoff)
│   │   ├── parsers/               # structuredOutput.js (Zod schemas + JSON validation)
│   │   └── services/              # aiService.js — the only import surface for the rest of the app
│   ├── utils/                    # ApiError, asyncHandler, apiResponse, logger, hash, token, seed
│   ├── uploads/                   # uploaded resumes (gitignored)
│   ├── app.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
└── client/
    ├── src/
    │   ├── components/
    │   │   ├── ui/                # ScoreRing, StatCard, Skeleton, EmptyState, ErrorState, ProgressBar, AiLoadingState
    │   │   ├── resume/             # BulletImprover, ResumeImproveModal
    │   │   └── layout/             # Sidebar, Topbar, ProtectedRoute
    │   ├── pages/                  # Landing, Login, Register, Dashboard, Resumes, ResumeDetail, JobAnalyzer,
    │   │                           # JobDetail, Matching, JobTracker, SkillGap, InterviewPrep, Profile, Settings
    │   ├── layouts/                # AppLayout, AuthLayout
    │   ├── context/                # AuthContext
    │   ├── services/                # api.js + one service file per feature
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── .env.example
```

## Installation

Prerequisites: Node.js 18+, a MongoDB connection string (Atlas or local), and an API key for your chosen LLM provider.

```bash
git clone <your-repo-url> ai-resume-platform
cd ai-resume-platform

# install both server and client dependencies
npm run install:all
```

## Environment Variables

Copy the example files and fill them in:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

**`server/.env`:**

| Variable | Description |
|---|---|
| `PORT` | Backend port (default `5000`) |
| `NODE_ENV` | `development` or `production` |
| `CLIENT_URL` | Frontend origin, for CORS (default `http://localhost:5173`) |
| `MONGO_URI` | MongoDB Atlas (or local) connection string |
| `JWT_SECRET` | Long random string used to sign JWTs |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d` |
| `LLM_PROVIDER` | `huggingface` \| `openai` \| `anthropic` |
| `LLM_MODEL` | Hugging Face model ID, e.g. `Qwen/Qwen2.5-7B-Instruct` |
| `HF_TOKEN` | Hugging Face access token |
| `LLM_TEMPERATURE` | Sampling temperature (default `0.3`) |
| `LLM_MAX_TOKENS` | Max output tokens (default `4096`) |
| `MAX_UPLOAD_MB` | Max resume upload size in MB (default `5`) |

**`client/.env`:**

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Backend API base URL, e.g. `http://localhost:5000/api` |

Never commit real `.env` files — only the `.env.example` templates are tracked.

## MongoDB Atlas Setup

1. Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. Under **Database Access**, create a user with a strong password.
3. Under **Network Access**, add your current IP (or `0.0.0.0/0` for local development only).
4. Under **Database → Connect → Drivers**, copy the connection string and paste it into `MONGO_URI`,
   replacing `<user>`, `<password>`, and the database name.

## LLM / Hugging Face API Setup

By default this project uses **Hugging Face Inference Providers** via `@huggingface/inference`:

1. Create an account at [huggingface.co](https://huggingface.co).
2. Create an access token with inference permissions at [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens).
3. Set in `server/.env`:
   ```
   LLM_PROVIDER=huggingface
   LLM_MODEL=Qwen/Qwen2.5-7B-Instruct
   HF_TOKEN=hf_your_token_here
   ```

**To switch providers** (e.g. to OpenAI or Anthropic), just change `LLM_PROVIDER`/`LLM_MODEL` and the
corresponding provider token —
no code changes needed:
```
LLM_PROVIDER=openai
LLM_MODEL=gpt-4o-mini
LLM_API_KEY=sk-...
```

## Running the App

From the project root:

```bash
npm run install:all   # installs server + client dependencies
npm run seed          # optional: creates a demo user (see Test Credentials below)
npm run dev           # runs backend (port 5000) and frontend (port 5173) concurrently
```

Or run them separately:
```bash
npm run server   # backend only, http://localhost:5000
npm run client   # frontend only, http://localhost:5173
```

Visit `http://localhost:5173`.

## API Overview

All endpoints are prefixed with `/api`. Protected endpoints require `Authorization: Bearer <token>`
(the frontend also supports an httpOnly cookie).

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Create an account |
| POST | `/auth/login` | Log in |
| POST | `/auth/logout` | Log out |
| GET | `/auth/me` | Current user |
| PUT | `/auth/me` | Update profile |
| POST | `/resumes/upload` | Upload a PDF/DOCX resume |
| GET | `/resumes` | List your resumes |
| GET | `/resumes/:id` | Get one resume + its analysis |
| DELETE | `/resumes/:id` | Delete a resume |
| PATCH | `/resumes/:id/rename` | Rename a resume |
| PATCH | `/resumes/:id/activate` | Set as active resume |
| POST | `/resumes/:id/duplicate` | Create a new version |
| POST | `/resumes/:id/analyze` | Run/refresh AI analysis (cached unless `?force=true`) |
| POST | `/resumes/:id/improve` | AI improvement suggestions for a target job |
| POST | `/resumes/bullet/improve` | Improve a single bullet point |
| POST | `/jobs/analyze` | Analyze a pasted job description (not saved) |
| POST | `/jobs` | Save a job |
| GET | `/jobs` | List saved jobs |
| GET | `/jobs/:id` | Get one job + its analysis |
| PUT | `/jobs/:id` | Update a job (status, notes, dates, etc.) |
| DELETE | `/jobs/:id` | Delete a job |
| POST | `/jobs/:id/analyze` | Analyze a saved job's description |
| POST | `/matching/analyze` | Match a resume to a job (`resumeId`, `jobId`) |
| GET | `/matching` | List your past match results |
| POST | `/matching/skill-gap` | Skill-gap analysis for a resume/job pair |
| POST | `/interview/generate` | Generate interview prep for a resume/job pair |
| GET | `/dashboard` | Aggregated dashboard data |

## Test Credentials

Running `npm run seed` creates:
- **Email:** `demo@resumeiq.local`
- **Password:** `DemoPass123!`

This account has no resumes or jobs pre-loaded (those require real file uploads and real AI calls against
your configured provider) — log in and upload a resume to try the full flow.

## Known Limitations

- No email verification or password-reset flow is implemented.
- No account-deletion endpoint (flagged in the Settings page).
- LangChain's native `withStructuredOutput` support varies by provider/model version; as a safety net every
  response is also run through explicit Zod validation in `structuredOutput.js` regardless.
- The job-tracker Kanban board uses native HTML5 drag-and-drop, which is desktop-friendly but touch support
  on mobile is limited — reordering also works via each job's detail page dropdown as a fallback.
- Rate limiting is in-memory (`express-rate-limit` defaults), which is fine for a single server instance but
  should move to a shared store (e.g. Redis) behind a load balancer in production.
- This codebase was authored without a live network connection to actually run `npm install` or call a real
  LLM/MongoDB Atlas endpoint — review and smoke-test the full flow in your own environment before relying on it.

## Future Improvements

- Embeddings + a vector store for RAG-based "career knowledge base" search.
- A job-market research agent (LangChain agent with web-search tool access).
- Team/recruiter-facing views.
- Resume PDF export of the "after" improvements.
- WebSocket-based real-time analysis progress instead of polling/loading states.
