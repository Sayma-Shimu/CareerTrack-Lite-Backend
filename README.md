# CareerTrack Lite — Backend API

A Node.js + Express + TypeScript REST API for CareerTrack Lite, backed by PostgreSQL via Prisma ORM.

---

## Live Links

- **Backend API:** _(add Render link after deployment)_
- **Health Check:** `GET /api/health`

---

## Tech Stack

- Node.js + Express.js
- TypeScript
- Prisma ORM
- PostgreSQL (hosted on Neon)
- bcrypt (password hashing)
- JSON Web Tokens (JWT)
- CORS

---

## Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/Sayma-Shimu/CareerTrack-Lite-Backend.git
cd CareerTrack-Lite-Backend

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env
# Fill in your DATABASE_URL, JWT_SECRET and CLIENT_URL

# 4. Run Prisma migrations
npx prisma migrate dev --name init

# 5. Generate Prisma client
npx prisma generate

# 6. Start development server
npm run dev
```

---

## Environment Variables

```env
PORT=5000
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
JWT_SECRET=your_strong_secret_key
CLIENT_URL=http://localhost:5173
```

---

## API Endpoints

### Auth

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user | Yes |

### Applications

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/applications` | Create application | Yes |
| GET | `/api/applications` | List own applications | Yes |
| GET | `/api/applications/:id` | Get one application | Yes |
| PATCH | `/api/applications/:id` | Update application | Yes |
| DELETE | `/api/applications/:id` | Delete application | Yes |

**Query params for GET `/api/applications`:**
- `search` — search by company name or job title
- `status` — filter by status (Saved, Applied, Assessment, Interview, Rejected, Offer)
- `source` — filter by source (LinkedIn, Bdjobs, etc.)
- `sort` — `newest` (default) or `oldest`

### Dashboard

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/dashboard/stats` | Get stats + recent apps | Yes |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | API health check |

---

## Database Schema

```prisma
model User {
  id           String        @id @default(uuid())
  name         String
  email        String        @unique
  passwordHash String
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  applications Application[]
}

model Application {
  id              String   @id @default(uuid())
  userId          String
  companyName     String
  jobTitle        String
  jobUrl          String?
  source          String
  status          String   @default("Saved")
  applicationDate DateTime @default(now())
  notes           String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

---

## Security

- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens expire in 7 days
- All application routes verify user ownership before read/write/delete
- Secrets stored in environment variables only — never committed

---

## Useful Prisma Commands

```bash
npx prisma migrate dev --name init   # Run migrations
npx prisma generate                  # Generate client
npx prisma studio                    # Open visual DB editor
```

---

## AI Tools Used

Kiro AI was used for code assistance, debugging and implementation guidance during development.
