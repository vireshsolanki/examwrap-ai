# Migration Guide: Next.js + Rust

## 1. Backend (Rust)
1. Navigate to `rust-backend`.
2. Create `.env` file with `GEMINI_API_KEY=your_key`.
3. Run `cargo run`.
   - Server will start at `http://localhost:8080`.

## 2. Frontend (Next.js)
1. Navigate to `nextjs-frontend`.
2. Run `npm install`.
3. Copy your `components/` folder from the React app to `nextjs-frontend/components/`.
4. Create `.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:8080/api`.
5. Run `npm run dev`.

## Key Changes
- PDF parsing is now handled by Rust (`pdf-extract`).
- API calls to Gemini are proxied through Rust (Hidden API Key).
- Next.js handles routing and SSR.
