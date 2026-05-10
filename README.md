# Iffy

A location-based dating app built with a modular monolith backend and a Next.js frontend.

## Overview

The backend is written in TypeScript with Express 5, organized into self-contained modules sharing infrastructure like MongoDB, Redis, and BullMQ. Real-time chat runs over Socket.io with JWT-based authentication. Images are processed server-side with face detection before upload to Cloudflare R2.

The frontend is a Next.js 15 App Router application using Redux Toolkit for state management, a custom httpOnly cookie session system, and a hand-rolled HTTP client that auto-injects auth tokens.

## Architecture

### Backend — Modular Monolith

- Self-contained modules: `user-management`, `chat-management`
- Shared infrastructure: MongoDB, Redis, BullMQ
- Real-time messaging via Socket.io with JWT auth middleware
- Server-side image face detection using TensorFlow.js + face-api.js before Cloudflare R2 upload
- Client-side image cropping and WebP conversion offloaded to the browser to reduce server memory usage

### Frontend — Next.js 15

- App Router with React Server Components
- Custom session management using httpOnly cookies — no NextAuth
- Redux Toolkit with `redux-persist` for client-side session mirroring
- Hand-rolled `HttpClient` class that auto-injects Bearer tokens from session
- Feature-based folder structure mirroring backend API domains
- Proxy-based route protection (previously middleware)

## Stack

| Layer | Technology |
|---|---|
| Language | TypeScript |
| Backend Framework | Express 5 |
| Frontend Framework | Next.js 15 (App Router) |
| Database | MongoDB + Mongoose |
| Cache / Queue | Redis + BullMQ |
| Real-time | Socket.io |
| Auth | Firebase Auth (client) + custom JWT (server) |
| Storage | Cloudflare R2 |
| Image Processing | Sharp, TensorFlow.js, face-api.js |
| State Management | Redux Toolkit + redux-persist |
| UI | shadcn/ui + Tailwind CSS |
