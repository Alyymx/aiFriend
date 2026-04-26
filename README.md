# Mochi AI Desktop Demo

A desktop-style web demo where a cat agent named **Mochi** can take voice or text commands, do research, and return:

- a concise research answer,
- useful source links,
- and a downloadable report document.

This project is intentionally lightweight for demo purposes.

## What This Demo Includes

- Desktop simulation UI (icons, top search, taskbar)
- Cat agent window ("Mochi Agent")
- Voice command button (browser speech recognition)
- Text command input + quick action prompts
- Research output panel with clickable links
- Downloadable research file (`.md`)
- Backend endpoint using Anthropic API when available
- Fallback research mode when no API key is configured

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- AI: Anthropic SDK (`@anthropic-ai/sdk`)

## Project Structure

```text
mochi-desktop-only/
  index.html
  package.json
  server.mjs
  vite.config.ts
  src/
    main.tsx
    App.tsx
    App.css
```

## Setup

### 1) Install dependencies

```bash
npm install
```

### 2) (Optional) Configure Anthropic API key

Create a `.env` file in the project root:

```env
ANTHROPIC_API_KEY=your_anthropic_key_here
PORT=8787
```

If `ANTHROPIC_API_KEY` is not set, Mochi still works in fallback mode.

### 3) Run backend API

```bash
npm run dev:api
```

### 4) Run frontend app (new terminal)

```bash
npm run dev
```

Open the local Vite URL shown in terminal (usually `http://localhost:5173`).

## How The Demo Works

1. User sends a request by voice (Mic button) or text (Ask input).
2. Frontend sends `POST /api/research` with `{ query }`.
3. Backend:
   - uses Anthropic (if key exists), or
   - returns fallback research links + report text.
4. UI shows answer + links.
5. User can click **Download report** to save a markdown brief.

## API

### `POST /api/research`

Request:

```json
{
  "query": "Research topic here"
}
```

Response shape:

```json
{
  "answer": "Short synthesis",
  "links": [{ "title": "Source", "url": "https://..." }],
  "docText": "# Markdown report...",
  "suggestedFileName": "mochi-research-topic.md"
}
```

## Voice Command Notes

- Uses browser Speech Recognition API.
- Best support: Chrome / Edge.
- If voice is unavailable, you can still use text commands.

## Demo Prompts You Can Try

- "Research AI productivity tools for developers."
- "Give me trusted sources about current AI regulation."
- "Explain transformers simply with examples."
- "Find learning roadmap for machine learning beginner."

## Quick GitHub Upload

Inside this folder:

```bash
git init
git add .
git commit -m "Add Mochi AI desktop demo"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo>.git
git push -u origin main
```

## Demo Scope

This is an MVP demo focused on UX and workflow. It is not intended to be a production-grade autonomous agent system yet.
