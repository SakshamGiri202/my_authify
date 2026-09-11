# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Developers and tech teams building web applications, microservices, and custom internal tools who need a self-hosted, lightweight, type-safe authentication and API key management server (inspired by BetterAuth).

## Product Purpose

Provide a fully-functional, plug-and-play authentication and session management service with email verification, password reset, active session revocation, multi-tenant API key management, and robust Express/Prisma/PostgreSQL backend integration.

## Positioning

"Instant Auth & API Key Management for Modern Web Apps" — A developer-first, type-safe, self-hosted authentication service combining session security with API key credentials for microservices and modern web applications.

## Operating Context

Used by web applications and client services as a standalone authentication server and plugin API (`/api/v1/auth/*`), supporting HttpOnly cookies, Bearer tokens, and `x-api-key` header verification.

## Capabilities and Constraints

- **Backend Stack**: Node.js, Express, TypeScript, Prisma ORM, PostgreSQL.
- **Frontend Stack**: React, TypeScript, Vite, Tailwind CSS.
- **Core Capabilities**:
  - Email/Password Sign Up & Sign In with bcrypt password hashing.
  - HttpOnly Cookie & Bearer Token session management with revocation.
  - Email Verification & Password Reset via single-use tokens.
  - Scoped API Key generation & header verification (`x-api-key`).
  - Zod request schema validation & IP rate limiting.
  - Client SDK plugin wrapper (`AuthifyClient`).

## Brand Commitments

- **Name**: MyAuthify
- **Visual Aesthetic**: Sleek obsidian dark-mode interface inspired by BetterAuth, with electric indigo/violet accents, glassmorphic translucent cards, monospaced code snippets, and responsive developer tools dashboard.

## Evidence on Hand

- Verified, 100% passing backend server endpoints (`server/src/routes/auth.ts`, `server/test-backend.ts`).
- Production-ready database schema (`server/prisma/schema.prisma`).
- Render deployment setup (`render.yaml`).

## Product Principles

1. **Developer First**: Clean APIs, type safety out of the box, and transparent session/token mechanics.
2. **Zero Security Compromise**: Salted password hashing, hashed token lookup, strict rate-limiting, and sanitized JSON error responses.
3. **Seamless Integration**: Supports both web app user sessions (cookies) and microservice machine-to-machine access (API Keys).

## Accessibility & Inclusion

- Follow WCAG AA standards for contrast in dark mode.
- Accessible keyboard navigation for forms, modals, tabs, and code sandboxes.
