# MyAuthify - Authentication Backend Service

**MyAuthify** is a production-ready authentication server inspired by **BetterAuth**, built with **Express**, **TypeScript**, and **Prisma ORM** connected to **PostgreSQL**.

---

## Features

- 🔐 **Authentication & Sessions**: Email/Password Sign Up & Sign In, HttpOnly cookies & Bearer tokens.
- 🛡️ **Security**: Password hashing with `bcrypt`, SHA-256 token hashing, strict Zod schema validation, and Express rate limiting.
- ✉️ **Verification & Reset**: Email verification and single-use password reset tokens.
- 🔑 **API Key Management**: Multi-tenant / service API keys for downstream app integration.
- 🗄️ **Database**: Clean Prisma ORM schema over PostgreSQL (`users`, `sessions`, `accounts`, `verification_tokens`, `api_keys`).

---

## Hosting on Render (Step-by-Step Guide)

You can host this backend server on [Render](https://render.com) for free using either **Render Blueprints** or manual setup.

### Option 1: Render Blueprint (Recommended)

1. Push your repository to **GitHub**.
2. Log in to your [Render Dashboard](https://dashboard.render.com).
3. Click **New +** ➔ **Blueprint**.
4. Connect your GitHub repository. Render will automatically detect the [render.yaml](file:///home/shaggy/dev/projects/my_authify/render.yaml) blueprint file.
5. Enter your environment variable values when prompted:
   - `DATABASE_URL`: Your PostgreSQL database URL (Neon PostgreSQL, Render Postgres, etc.)
   - `CLIENT_URL`: Your frontend URL (e.g. `https://your-app.onrender.com`)
6. Click **Apply**. Render will automatically build, apply database migrations, and deploy your server!

---

### Option 2: Manual Web Service Setup on Render

1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** ➔ **Web Service**.
3. Connect your repository.
4. Fill in the deployment details:
   - **Name**: `my-authify-backend`
   - **Runtime**: `Node`
   - **Root Directory**: `server`
   - **Build Command**: `npm run render-build`
   - **Start Command**: `npm run render-start`
5. Scroll down to **Environment Variables** and add:
   - `NODE_ENV` = `production`
   - `DATABASE_URL` = `postgresql://...` (Your Neon / Render PostgreSQL connection string)
   - `CLIENT_URL` = `https://your-frontend-domain.com`
6. Click **Create Web Service**.

---

## Local Development & Testing

```bash
cd server

# Install dependencies
npm install

# Push database schema
npx prisma db push

# Start dev server
npm run dev

# Run automated integration test suite
npx tsx test-backend.ts
```
