<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript" />
  <img src="https://img.shields.io/badge/Prisma-5.20-2D3748?style=for-the-badge&logo=prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=for-the-badge&logo=postgresql" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss" />
</p>

# 🚀 StartupHub

A modern full-stack platform where **founders** list their startups to attract talent and funding, and **contributors** discover projects to invest in or pitch their skills to. Built with Next.js 15, React 19, Prisma ORM, and Neon PostgreSQL.

---

## ✨ Features

### For Contributors
- **Discover Startups** — Browse a curated feed of listed startups with search, category filters, and sorting
- **Upvote / Downvote** — Vote on startups you believe in (or don't) with real-time vote counts
- **Pitch Contributions** — Submit talent or funding contribution tickets directly to startup founders
- **Startup Detail Pages** — View rich startup profiles with markdown summaries, tech stacks, and performance metrics

### For Founders
- **Startup Onboarding Wizard** — Register your startup with name, slug, logo, one-liner, and tech stack
- **Founder Console** — Dedicated dashboard with real-time telemetry: upvotes, downvotes, and active tickets
- **Contribution Ticket Management** — Accept or reject incoming talent and funding proposals
- **Full Profile Editor** — Edit every aspect of your startup's public page: name, bio, technologies, metrics
- **Page Layout Customization** — Choose themes (light/dark/glass), accent colors, layout styles, section ordering, and toggle metric visibility

### Platform
- **Role-Based Access** — Middleware-enforced route protection for Founder vs. Contributor dashboards
- **Session Management** — Cookie-based authentication with protected routes and automatic redirects
- **Responsive Sidebar Navigation** — Collapsible sidebar with role-aware navigation links
- **Dark Mode** — Full dark mode support via `next-themes`

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router, Server Actions) |
| **Frontend** | [React 19](https://react.dev/), [TypeScript 5.6](https://www.typescriptlang.org/) |
| **UI Library** | [NextUI v2](https://nextui.org/) + [Tailwind CSS 3.4](https://tailwindcss.com/) |
| **Animations** | [Framer Motion 11](https://www.framer.com/motion/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **ORM** | [Prisma 5.20](https://www.prisma.io/) |
| **Database** | [Neon PostgreSQL](https://neon.tech/) (serverless) |
| **Validation** | [Zod](https://zod.dev/) + [React Hook Form](https://react-hook-form.com/) |
| **State** | React Context + [TanStack React Query](https://tanstack.com/query) |

---

## 📁 Project Structure

```
fund_startup/
├── prisma/
│   └── schema.prisma          # Database schema (User, Startup, Vote, ContributionTicket)
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx  # Login page with email/password auth
│   │   │   └── signup/page.tsx # Registration with role selection
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx      # Sidebar layout wrapper
│   │   │   ├── dashboard/      # Contributor dashboard (startup feed)
│   │   │   ├── founder/        # Founder console (telemetry + profile editor)
│   │   │   ├── startup/[id]/   # Dynamic startup detail pages
│   │   │   └── tickets/        # Contributor's submitted tickets
│   │   ├── actions/            # Server Actions (auth, startups, contributions)
│   │   ├── layout.tsx          # Root layout with providers
│   │   ├── page.tsx            # Landing redirect (session check)
│   │   └── globals.css         # Global styles + Tailwind directives
│   ├── components/
│   │   ├── dashboard/          # Filter panel
│   │   ├── founder/            # Layout builder
│   │   ├── layout/             # Sidebar navigation
│   │   └── startup/            # Startup card, contribution modal
│   ├── lib/
│   │   ├── db.ts               # Prisma client singleton
│   │   ├── types/              # TypeScript type definitions
│   │   ├── utils.ts            # Utility functions
│   │   └── validations/        # Zod schemas
│   ├── middleware.ts            # Route protection & auth guards
│   └── providers/              # App context providers (auth, theme)
├── .env.example                # Environment variable template
├── tailwind.config.ts          # Tailwind + NextUI theme config
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** or **yarn**
- A **PostgreSQL** database (we recommend [Neon](https://neon.tech/) for serverless)

### 1. Clone the Repository

```bash
git clone https://github.com/Jedi3301/startup_hub.git
cd startup_hub
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example env file and fill in your database URL:

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
AUTH_SECRET="your-super-secure-secret-at-least-32-chars"
JWT_SECRET="your-jwt-signing-secret"
```

### 4. Set Up the Database

```bash
# Generate the Prisma client
npx prisma generate

# Push schema to your database
npx prisma db push
```

### 5. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Authentication

The app uses a simple cookie-based session system:

| Action | Details |
|--------|---------|
| **Register** | `/signup` — Create an account as Founder or Contributor |
| **Login** | `/login` — Email + password authentication |
| **Founder Access** | Use an email containing `"founder"` to register as a Founder |
| **Session** | Stored in `session_token` cookie + `localStorage` |
| **Route Guard** | `middleware.ts` redirects unauthenticated users to `/login` |

---

## 📊 Database Schema

```mermaid
erDiagram
    User ||--o{ Startup : "founds"
    User ||--o{ Vote : "casts"
    User ||--o{ ContributionTicket : "submits"
    Startup ||--o{ Vote : "receives"
    Startup ||--o{ ContributionTicket : "receives"

    User {
        uuid id PK
        string legalName
        string email UK
        string passwordHash
        enum role
        datetime createdAt
    }

    Startup {
        uuid id PK
        uuid founderId FK
        string name
        string slug UK
        string logoUrl
        string oneLiner
        text summaryMarkdown
        string[] technologies
        json metricsJson
        json customizationLayout
        int upvoteCount
        int downvoteCount
        datetime createdAt
    }

    Vote {
        uuid id PK
        uuid userId FK
        uuid startupId FK
        enum voteType
        datetime createdAt
    }

    ContributionTicket {
        uuid id PK
        uuid startupId FK
        uuid userId FK
        string title
        text pitchDescription
        string[] skillsOffered
        enum status
        decimal financialFundingAmount
        datetime createdAt
    }
```

---

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on `localhost:3000` |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx prisma studio` | Open Prisma database GUI |
| `npx prisma db push` | Sync schema to database |

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
