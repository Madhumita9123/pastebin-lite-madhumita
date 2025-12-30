# Pastebin-Lite

A minimal "Pastebin"-like application where users can create text pastes with optional TTL (Time-to-Live) and view count constraints.

## Persistence Layer

This application uses **@vercel/kv** (Redis) as its persistence layer. 
- It tracks paste content, creation time, TTL, and view counts.
- It uses Redis hashes (`HSET`, `HGETALL`) and atomic increments (`HINCRBY`) to ensure consistency and enforce view limits even under concurrent load.

## Local Setup

### Prerequisites

- Node.js (v18 or higher)
- A Vercel KV database (or a local Redis instance)

### Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in a `.env.local` file:
   ```env
   KV_URL=your_kv_url
   KV_REST_API_URL=your_kv_rest_api_url
   KV_REST_API_TOKEN=your_kv_rest_api_token
   KV_REST_API_READ_ONLY_TOKEN=your_kv_rest_api_read_only_token
   TEST_MODE=1 (optional, for deterministic testing)
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## Design Decisions

- **Atomic counting**: To prevent over-serving pastes with view limits, the application increments the view count atomically using Redis before serving the content.
- **Next.js 16 (App Router)**: The application leverages the latest Next.js features, including server components for viewing pastes and API routes for management.
- **Deterministic Time**: Supports the `x-test-now-ms` header when `TEST_MODE=1` to allow for precise automated testing of expiry logic.
