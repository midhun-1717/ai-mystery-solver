# SPEC.md — AI Mystery Room

> Blueprint for the whole project. Any developer or AI coding assistant should be able to build the app from this file alone. Build in the order given in section 12.

---

## 1. Overview

**AI Mystery Room** is a full-stack web app where a player types a mystery premise, picks a difficulty, and Gemini generates a complete whodunit: a story, suspects, clues, and hints. The player investigates, discovers clues, optionally requests hints, then accuses one suspect. The backend reveals the verdict, the culprit, the explanation, and a score.

**Problem it solves:** a replayable detective game where every case is new, but the culprit is never leaked until the player commits to an accusation.

**Target users:** students and casual players who enjoy puzzle or detective games. No account needed.

**Expected experience:** generate a case in under ~20 seconds, play for 5–10 minutes, get a clear verdict, start another.

---

## 2. Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React, Vite, Tailwind CSS, React Router, Axios |
| Backend | Node.js, Express, CORS, dotenv |
| Database | MongoDB (Atlas), Mongoose |
| AI | Gemini API via `@google/genai` |
| Validation | Zod (AI output and request bodies) |
| Hosting | Frontend: Vercel · Backend: Render (or similar) · DB: MongoDB Atlas |

---

## 3. Features

**Core**
- Generate a mystery from a premise and difficulty (Easy / Medium / Hard).
- Investigation Room: story, suspect cards, clue list, hint button, progress.
- Discover clues one at a time.
- Request hints (limited per difficulty).
- Accuse a suspect (one accusation per case).
- Results page: verdict, culprit, explanation, score.
- Start a new mystery.

**Optional enhancements (only after core is done)**
- Rate limiting on generation (`express-rate-limit`).
- Timer shown during investigation.
- Case history list stored in the browser.
- Share link for a finished case.

---

## 4. User Flow

1. User opens the website (Home).
2. User goes to Create Mystery, enters a premise, selects difficulty.
3. Backend asks Gemini to generate the mystery; validates it; saves it.
4. User lands in the Investigation Room for that case.
5. User discovers clues.
6. User requests hints if needed.
7. User goes to Accusation and picks a suspect.
8. Backend checks the accusation, calculates the score, locks the case.
9. Results page shows verdict, culprit, explanation, score.
10. User starts another mystery.

---

## 5. Pages and UI

Routes keep the case id in the URL so a page refresh does not lose the game.

| Page | Route | Purpose | Essential elements |
|---|---|---|---|
| Home | `/` | Introduce the game | Title, short description, "Start Investigation" button |
| Create Mystery | `/create` | Collect input | Premise textarea (10–300 chars), difficulty selector, Generate button |
| Investigation Room | `/case/:id` | Main gameplay | Title, story, suspect cards, clue list, hints panel, progress (clues found / total, hints used / allowed), "Make Accusation" button |
    | Results | `/case/:id/result` | Show outcome | Verdict (correct / wrong), culprit, explanation, score breakdown, "New Mystery" button |

**Loading states**
- Generation takes 5–20 seconds: show a themed loader ("Gathering evidence…") and disable the Generate button.
- Clue discovery, hints, and accusation: disable the triggering button while the request is in flight.

**Error states**
- Generation failed: "The case file got lost. Please try again." with a retry button.
- Case not found (404): message plus link to Home.
- Network / server error: non-technical message, never show raw errors.
- Accusing an already-completed case: redirect to Results.

**Navigation:** a header link to Home on every page. If a case is already completed, `/case/:id` links to its result.

**Responsive behavior:** mobile-first. Suspect cards and clues stack in one column on phones, two or three columns on larger screens. Buttons are touch-friendly.

**UI design:** a dark, detective / noir theme. An initial design may be generated with Stitch AI; each screen must still map to the pages above.

---

## 6. Backend API

Base path: `/api`. All bodies are JSON. All errors use this shape:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Human-readable message" } }
```

### 6.1 `POST /api/cases` — generate a mystery
**Request**
```json
{ "premise": "A theft during a college fest", "difficulty": "medium" }
```
**Validation:** `premise` is a trimmed string of 10–300 chars; `difficulty` is one of `easy | medium | hard`.
**Response `201`:** the *public case* (see 6.7) including its `id`.
**Errors:** `400 VALIDATION_ERROR`, `502 AI_GENERATION_FAILED` (Gemini failed or output invalid after retries).

### 6.2 `GET /api/cases/:id` — get an active case
**Response `200`:** the public case with current progress. Works for completed cases too (status `completed`), still without the solution.
**Errors:** `400 INVALID_ID`, `404 CASE_NOT_FOUND`.

### 6.3 `POST /api/cases/:id/clues/:clueId/discover`
Marks the clue as discovered (idempotent: discovering twice does not add points twice).
**Response `200`**
```json
{ "clue": { "id": "c3", "title": "...", "text": "..." }, "discoveredCount": 4 }
```
**Errors:** `404 CASE_NOT_FOUND`, `404 CLUE_NOT_FOUND`, `409 CASE_COMPLETED`.

### 6.4 `POST /api/cases/:id/hints`
Reveals the next unused hint, in order.
**Response `200`**
```json
{ "hint": { "id": "h2", "text": "..." }, "hintsUsed": 2, "hintsRemaining": 1 }
```
**Errors:** `404 CASE_NOT_FOUND`, `409 NO_HINTS_LEFT`, `409 CASE_COMPLETED`.

### 6.5 `POST /api/cases/:id/accuse`
**Request**
```json
{ "suspectId": "s2" }
```
**Validation:** `suspectId` must be one of the case's suspect ids.
**Behavior:** checks against the hidden culprit, calculates the score, saves the accusation, sets status to `completed`. Only one accusation is allowed.
**Response `200`:** the full result (see 6.6).
**Errors:** `400 VALIDATION_ERROR`, `404 CASE_NOT_FOUND`, `409 CASE_COMPLETED`.

### 6.6 `GET /api/cases/:id/result`
Returns the result only if the case is completed.
**Response `200`**
```json
{
  "correct": true,
  "accusedSuspectId": "s2",
  "culprit": { "id": "s2", "name": "..." },
  "explanation": "...",
  "score": {
    "base": 150, "cluesFound": 5, "clueBonus": 25,
    "hintsUsed": 1, "hintPenalty": 10, "total": 165
  }
}
```
**Errors:** `404 CASE_NOT_FOUND`, `403 CASE_NOT_COMPLETED` (this is how the solution stays private).

### 6.7 The "public case" shape (what the frontend may ever see before accusation)
```json
{
  "id": "…",
  "title": "…",
  "story": "…",
  "difficulty": "medium",
  "status": "active",
  "suspects": [{ "id": "s1", "name": "…", "role": "…", "description": "…", "alibi": "…" }],
  "clues": [
    { "id": "c1", "title": "…", "discovered": true,  "text": "…" },
    { "id": "c2", "title": "…", "discovered": false }
  ],
  "hintsUsed": 1,
  "hintsAllowed": 3,
  "revealedHints": [{ "id": "h1", "text": "…" }]
}
```
Undiscovered clues expose only `id`, `title`, `discovered: false`. **Never** include: `solution`, `culpritId`, `explanation`, `pointsTo`, unrevealed hints, or undiscovered clue text.

---

## 7. Database Model

**Collection: `cases`** (Mongoose schema)

| Field | Type | Notes |
|---|---|---|
| `premise` | String | User input |
| `title` | String | From Gemini |
| `story` | String | From Gemini |
| `difficulty` | enum `easy/medium/hard` | |
| `suspects` | `[{ id, name, role, description, alibi }]` | |
| `clues` | `[{ id, title, text, pointsTo }]` | `pointsTo` = suspect id this clue implicates, or `null` for a red herring |
| `hints` | `[{ id, text }]` | Ordered |
| `solution` | `{ culpritId, explanation }` | **`select: false`** — excluded from queries by default |
| `progress` | `{ discoveredClueIds: [String], hintsUsed: Number }` | |
| `accusation` | `{ suspectId, correct, accusedAt }` | Empty until accused |
| `score` | `{ base, clueBonus, hintPenalty, total }` | Empty until accused |
| `status` | enum `active/completed` | Default `active` |
| `createdAt / updatedAt` | Date | Mongoose timestamps |

Rule: the solution is loaded only with an explicit `.select('+solution')` inside the accuse and result handlers.

---

## 8. AI Behavior

### 8.1 Difficulty configuration

| Difficulty | Suspects | Clues | Hints | Min. clues pointing at culprit |
|---|---|---|---|---|
| Easy | 3 | 5 | 2 | 2 |
| Medium | 4 | 7 | 3 | 3 |
| Hard | 5 | 9 | 3 | 3 |

### 8.2 Expected Gemini output (JSON only)
```json
{
  "title": "string",
  "story": "string",
  "suspects": [{ "id": "s1", "name": "", "role": "", "description": "", "alibi": "" }],
  "clues": [{ "id": "c1", "title": "", "text": "", "pointsTo": "s1 or null" }],
  "hints": [{ "id": "h1", "text": "" }],
  "solution": { "culpritId": "s1", "explanation": "" }
}
```

### 8.3 Prompt rules (sent from the backend only)
- Output valid JSON only, matching the schema above, with the exact suspect/clue/hint counts for the chosen difficulty.
- Use the player's premise as the setting; the story must be fictional, non-graphic, and must not use real people.
- Exactly one culprit. The solution must be derivable from the clues.
- Include red-herring clues (`pointsTo: null` or pointing at innocent suspects) but never enough to make an innocent suspect equally plausible.
- Hints are ordered from vague to more specific and must **never** name the culprit directly.
- The explanation must reference the clues that prove the culprit.

### 8.4 Validation before saving (Zod + custom checks)
1. Parse as JSON; strip code fences if present.
2. Zod schema: all fields present, correct types, non-empty strings, ids unique.
3. Exact counts of suspects, clues, hints for the difficulty.
4. `solution.culpritId` matches an existing suspect id.
5. Every `pointsTo` is `null` or a valid suspect id.
6. At least the minimum number of clues point at the culprit (table above).
7. No hint or clue **title** contains the culprit's full name (title is shown before discovery).
8. If any check fails, retry generation up to **2 more times**, then return `502 AI_GENERATION_FAILED`. Nothing invalid is ever saved.

---

## 9. Scoring Rules (backend only)

- Base points for a **correct** accusation: Easy 100, Medium 150, Hard 200.
- Base points for a **wrong** accusation: 0.
- Each discovered clue: **+5**.
- Each hint used: **−10**.
- Minimum total: **0**.

```
total = max(0, base + 5 × cluesDiscovered − 10 × hintsUsed)
```

The frontend never sends or computes a score. Scores are calculated and stored once, at accusation time.

---

## 10. Security and Reliability

- `GEMINI_API_KEY` and `MONGODB_URI` exist only in backend environment variables. `.env` is in `.gitignore`.
- CORS allows only `CLIENT_URL`.
- The solution never leaves the backend until the case is completed (see 6.7 and section 7).
- All request bodies and params are validated (Zod, plus a valid-ObjectId check).
- A global Express error handler returns the standard error shape and never leaks stack traces.
- Gemini calls have a timeout (~30 s); failures return a friendly error.
- Case ids are unguessable MongoDB ObjectIds. There is no auth: anyone with a case link can play it.

---

## 11. Acceptance Criteria

- [ ] Mysteries can be generated at all three difficulty levels with the correct number of suspects, clues, and hints.
- [ ] Invalid or malformed Gemini output is rejected and retried; it is never saved or shown.
- [ ] Players can discover clues; discovering the same clue twice gives no extra points.
- [ ] Players can request hints up to the difficulty limit; further requests fail gracefully.
- [ ] Players can submit exactly one accusation per case.
- [ ] Before accusation, no API response or database read contains the culprit, explanation, `pointsTo`, undiscovered clue text, or unrevealed hints.
- [ ] Score is calculated and validated on the backend and matches section 9.
- [ ] Results show the correct culprit and a clue-based explanation.
- [ ] Refreshing any page keeps the game state.
- [ ] API failures show friendly messages, not crashes.
- [ ] The full flow works on the deployed website.

---

## 12. Project Structure and Build Order

```
ai-mystery-room/
├── client/          # React + Vite + Tailwind
├── server/          # Express API
│   ├── .env         # never committed
│   └── src/
│       ├── config/      # db connection, env, difficulty config
│       ├── models/      # Mongoose schemas
│       ├── routes/      # endpoint definitions
│       ├── controllers/ # request handlers
│       ├── services/    # gemini service, scoring service, validation
│       └── middleware/  # error handler
├── SPEC.md
└── .gitignore
```

**Build order (test each step before the next)**
1. Project setup: folders, Vite client, Express server, `.env`, `.gitignore`.
2. Express server + MongoDB connection + health route.
3. Case model.
4. Gemini service: generate and validate a mystery (test in isolation first).
5. `POST /api/cases` and `GET /api/cases/:id`; confirm the solution is hidden.
6. Clue discovery, hints, accusation, result endpoints + scoring.
7. React routing and pages, connected to the API.
8. Loading and error states, responsive polish.
9. Full test against section 11.
10. Deploy: Atlas, backend host, Vercel; set environment variables; test on production.

---

## 13. Environment Variables

**Server**
```
PORT=5000
MONGODB_URI=
GEMINI_API_KEY=
GEMINI_MODEL=
CLIENT_URL=http://localhost:5173
```
**Client**
```
VITE_API_URL=http://localhost:5000/api
```
In production, `CLIENT_URL` is the Vercel URL and `VITE_API_URL` is the deployed backend URL. The client needs a `vercel.json` rewrite so React Router routes work on refresh.

---

## 14. Limitations and Deliverables

**Limitations**
- No user accounts or login; cases are anonymous.
- One accusation per case; no undo.
- Free-tier hosting may cold-start (first request can take ~30–60 s) and Gemini free-tier rate limits may apply.
- Mystery quality depends on the AI; validation guarantees structure and consistency checks, not literary quality.

**Final deliverables**
- GitHub repository with the complete source and this `SPEC.md`.
- Live deployed website URL with a mystery generated and solved on it.
- Submission by **2 November, 11:59 PM** via the project submission form.
