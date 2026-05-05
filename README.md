# ✦  AI Career Advisor

> Personalized, AI-powered career guidance using **LLaMA 3.1** on **Groq** (free & fast).

---

## Features

- 🎯 **Personalized Career Blueprint** — 3 tailored recommendations with salary, demand, and match score
- 🗺️ **Step-by-step Roadmaps** — Actionable paths for each career
- 🔍 **Smart Field Search** — If a form field is empty, Groq searches for the best answer automatically
- 💬 **AI Chat Follow-up** — Ask follow-up questions with full conversation context
- 📊 **Trending Careers** — Browse 9 pre-loaded high-growth career paths
- ⚡ **Groq-powered** — Sub-5-second responses with LLaMA 3.1 8B Instant

---

## Setup on Replit

### 1. Import the project
Upload all files or fork this Repl.

### 2. Add your Groq API key
Go to **Replit → Secrets (🔒)** and add:

| Key | Value |
|-----|-------|
| `GROQ_API_KEY` | `gsk_your_key_here` |

Get a **free** Groq API key at [console.groq.com](https://console.groq.com) — no credit card required.

### 3. Run
Click the green **Run** button. Replit will install dependencies and start the server.

---

## File Structure

```
lumina/
├── server.js              # Express server entry point
├── package.json
├── .env.example           # Copy to .env for local dev
├── .replit                # Replit configuration
│
├── routes/
│   ├── career.js          # POST /api/career/advice  — blueprint generation
│   │                      # POST /api/career/chat    — follow-up chat
│   └── search.js          # POST /api/search/missing-field — auto-fill empty fields
│                          # POST /api/search/career-info   — career deep-dive
│
├── utils/
│   └── groq.js            # Shared Groq API caller + JSON extractor
│
└── public/
    ├── index.html         # Main HTML (single page, two views)
    ├── css/
    │   └── style.css      # All styles
    └── js/
        ├── trending.js    # Trending careers data + renderer
        ├── search.js      # Smart field search (auto-suggest on empty fields)
        └── app.js         # Core app logic: form, results, chat
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/health` | Server + key status check |
| `POST` | `/api/career/advice` | Generate career blueprint |
| `POST` | `/api/career/chat` | Follow-up chat with context |
| `POST` | `/api/search/missing-field` | AI-suggests values for empty fields |
| `POST` | `/api/search/career-info` | Deep info on a specific career |

---

## Local Development

```bash
cp .env.example .env
# Add your GROQ_API_KEY to .env

npm install
npm start
# Open http://localhost:3000
```

---

## Tech Stack

- **Backend:** Node.js + Express
- **AI:** Groq API · LLaMA 3.1 8B Instant (free tier)
- **Frontend:** Vanilla JS + custom CSS (no frameworks needed)
- **Fonts:** Playfair Display + DM Sans (Google Fonts)
- **Deploy:** Replit (free tier compatible)
