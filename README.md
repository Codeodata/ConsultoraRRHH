# ConsultoraRRHH

[![CI](https://github.com/Codeodata/ConsultoraRRHH/actions/workflows/ci.yml/badge.svg)](https://github.com/Codeodata/ConsultoraRRHH/actions)
![Docker](https://img.shields.io/badge/docker-ready-2496ED?logo=docker&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

> Multi-tenant HR Tech SaaS for consulting firms. Centralizes service management, employee records, and client portals — with an active roadmap toward AI-powered ATS and workflow automation.

## Product Overview

HR consulting firms manage their operations across disconnected tools: spreadsheets for employee records, email threads for service updates, shared drives for documents. ConsultoraRRHH replaces all of that with a single platform where the consulting firm, their clients, and the HR team operate from the same source of truth.

**Current state:** Production-ready MVP with multi-tenancy, role-based access, and full service/employee lifecycle management.  
**Direction:** Evolving into an AI-powered ATS platform with automated candidate screening, workflow automation via n8n, and deployment scaling on AWS EKS.

## Architecture

Multi-tenant from day one — every table carries `tenant_id`, ensuring complete data isolation between consulting firms on a shared infrastructure.

```
Tenant (consulting firm)
  ├── Users           (Super Admin / RRHH / Client roles)
  ├── Companies       (client companies)
  │     ├── Services  (engagements with progress tracking)
  │     │     └── Documents
  │     └── Employees
  │           ├── Goals     (performance objectives)
  │           └── Documents (employee records)
  └── [ATS] Candidates → Pipeline → AI Screening  ← in progress
```

## Features

### Consulting Panel (Admin / RRHH)
- **Dashboard** — KPIs: active companies, services by status, recent activity
- **Companies** — full CRUD, linked to services and employees
- **Services** — engagement tracking with progress bar, status workflow, document uploads
- **Employees** — digital HR file: personal data, org hierarchy, performance goals, document manager
- **Users** — role assignment (Super Admin / RRHH / Client)

### Client Portal
- Read-only view of their company's services and progress
- Document download for contracts, reports, proposals
- No edit access — clean separation of concerns

## Roadmap

### Now — Production deployment
- [ ] File storage migration to AWS S3 / Cloudflare R2
- [ ] Managed PostgreSQL (Neon / RDS)
- [ ] Deploy on AWS EKS via [eks-platform-aws](https://github.com/Codeodata/eks-platform-aws)
- [ ] Custom domain + SSL
- [ ] GitHub Actions CI/CD pipeline

### Next — Pre-sales critical
- [ ] Tenant self-registration (onboarding flow)
- [ ] Password recovery via email
- [ ] Email notifications (document upload, status change, new user)
- [ ] Audit logs

### Core product — ATS module
- [ ] Candidate pipeline (kanban by hiring stage)
- [ ] Job postings management
- [ ] AI-powered CV screening (integrated with local LLM stack via [n8n-local-ai-stack](https://github.com/Codeodata/n8n-local-ai-stack))
- [ ] Automated candidate scoring and ranking
- [ ] Interview scheduling with calendar sync

### Scaling
- [ ] Workflow automation engine (n8n integration)
- [ ] Tenant admin panel (manage all consulting firms)
- [ ] White-label per tenant (logo, colors)
- [ ] Export reports (PDF / Excel)
- [ ] Billing & subscription management

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Database | PostgreSQL via Prisma ORM |
| Auth | NextAuth.js with role-based middleware |
| Styling | Tailwind CSS |
| Containerization | Docker + Docker Compose |
| File storage | Local filesystem → S3 (roadmap) |
| CI/CD | GitHub Actions |
| Scaling target | AWS EKS (Terraform) |

## Infrastructure

The production scaling strategy connects directly to [eks-platform-aws](https://github.com/Codeodata/eks-platform-aws) — a production-grade EKS cluster with Terraform, autoscaling node groups, and Prometheus + Grafana monitoring. The ATS automation layer will use [n8n-local-ai-stack](https://github.com/Codeodata/n8n-local-ai-stack) for AI-powered workflows.

## Getting Started

### Prerequisites
- Node.js 18+
- Docker

### Run locally

```bash
# Clone and install
git clone https://github.com/Codeodata/ConsultoraRRHH.git
cd ConsultoraRRHH
npm install

# Start database
npm run docker:up

# Set up environment
cp .env.example .env.local

# Initialize database
npm run db:push
npm run db:seed

# Start development server
npm run dev
# → http://localhost:3000
```

### Demo credentials (loaded by seed)

| Role | Email | Password |
|---|---|---|
| Super Admin | admin@consultora.com | Admin1234! |
| RRHH | rrhh@consultora.com | Rrhh1234! |
| Client | cliente@acme.cl | Client1234! |

### Docker (full stack)

```bash
docker compose up --build
# → http://localhost:3000
```

### Useful commands

```bash
npm run db:studio    # Prisma Studio — visual DB browser at :5555
npm run db:seed      # Reload seed data
npm run db:reset     # Wipe and re-seed
npm run docker:up    # Start PostgreSQL container
npm run docker:down  # Stop PostgreSQL container
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/login/          # Auth flow
│   ├── (dashboard)/           # Consulting panel
│   │   ├── dashboard/
│   │   ├── companies/
│   │   ├── services/
│   │   ├── employees/
│   │   └── users/
│   ├── (portal)/portal/       # Client portal
│   └── api/                   # REST endpoints
├── components/                # Reusable UI components
├── lib/
│   ├── auth.ts                # Auth config
│   ├── db.ts                  # Prisma client
│   └── validations.ts         # Zod schemas
└── types/
prisma/
├── schema.prisma              # Data model
└── seed.ts                    # Demo data
```
