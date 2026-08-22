# KASU Biometric Gate Access

**Secure Hybrid Multi-Biometric Authentication System for Student Campus
Gate Access Control — Kaduna State University**

A final-year project implementing fingerprint-first, face-fallback
biometric verification for campus gate access, built as a single Next.js
14 application.

---

## 1. Overview

Students are verified at a gate console (`/gate`) using a hybrid
biometric flow:

1. **Identify** — student enters their matric number.
2. **Fingerprint verification** — the primary method.
3. **Facial verification (fallback)** — triggered automatically if
   fingerprint fails or isn't enrolled for that student.
4. **Every attempt is logged**, granted or denied, for audit and
   reporting.

Administrators manage the system through a separate, authenticated panel
(`/dashboard`, `/students`, `/logs`, `/reports`) — the gate itself
requires no login, since it's the interface students use directly.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), React, JSX (no TypeScript), CSS Modules |
| Backend | Next.js API Routes (no Express — see §4) |
| Database | MongoDB Atlas + Mongoose |
| Authentication | JWT (httpOnly cookie) + bcryptjs |
| Facial Recognition | face-api.js (`@vladmandic/face-api`) |
| Fingerprint | Mock adapter, DigitalPersona U.are.U 4500-ready interface (see §4) |
| File Uploads | Native `request.formData()` (no Multer — see §4) |
| Reports | `pdfkit` (PDF), `exceljs` (Excel) |
| Charts | `recharts` |
| Forms | `react-hook-form` |

---

## 3. Architecture

```
kasu-biometric-gate/
├── app/
│   ├── (auth)/login/          Admin login (public)
│   ├── (dashboard)/           Admin panel — server-guarded, requires session
│   │   ├── dashboard/         Stats, chart, activity feed
│   │   ├── students/          CRUD, enrolment
│   │   ├── logs/              Access log search/filter
│   │   └── reports/           PDF/Excel report generation
│   ├── gate/                  Public kiosk console — no login required
│   └── api/                   All backend logic (Next.js API routes)
│       ├── auth/               Login, session, logout
│       ├── students/           Student CRUD
│       ├── biometrics/         Enrolment (fingerprint + face)
│       ├── verify/             Gate verification (public)
│       ├── access-logs/        Admin log queries
│       ├── reports/            PDF/Excel generation
│       └── dashboard/stats/    Dashboard aggregates
├── components/                 UI, organized by feature area
├── lib/
│   ├── auth/                   JWT, bcrypt, route-protection helper
│   ├── biometric/               Fingerprint adapter, face model loader, face matcher
│   ├── db/                     MongoDB connection
│   ├── reports/                 Date ranges, PDF/Excel generation
│   ├── upload/                  Native FormData file handling
│   └── validators/              Input validation
├── models/                      Mongoose schemas (Admin, Student, Biometric, AccessLog)
└── scripts/seedAdmin.js         The only way to create an admin account
```

### Data model

Four MongoDB collections, matching Chapter 3.10:

- **Admin** — login credentials, bcrypt-hashed password (never returned
  by default queries — `select: false`)
- **Student** — profile data, `isActive` (soft-delete flag), `isEnrolled`
  (true only once both biometrics are captured)
- **Biometric** — fingerprint template + quality, face descriptor +
  snapshot. Kept in a **separate collection** from Student, so biometric
  data isolation holds even if the Student collection is queried broadly
- **AccessLog** — every verification attempt, granted or denied, with
  method, timestamp, and remarks (e.g. match score, or "no fingerprint
  enrolled")

---

## 4. Deviations from the Project Documentation

Three deliberate deviations were made from what Chapters 1–3 originally
specified. Each is justified below — be ready to explain these to the
panel.

### 4.1 No Express.js — Next.js API routes instead

Chapter 3 names Express.js as the backend framework, with a separate
Node.js server. This build folds the backend into **Next.js API routes**
(`app/api/*`) within the same application.

**Justification:** Next.js API routes fulfil the same responsibilities
Chapter 3 assigns to the Application/Backend Layer — routing,
authentication, validation, database communication — but run inside
Next.js's own server. This removes the need for a second server process,
CORS configuration between frontend and backend, and duplicate
deployment steps, while keeping every route individually testable and
organized by resource, exactly as an Express router would be.

### 4.2 No Multer — native FormData instead

Multer is Express-middleware-specific and doesn't attach to Next.js API
route handlers, which don't use Express's middleware model.

**Justification:** File uploads (passport photos, face enrolment
snapshots) are read directly from `request.formData()`, a Web-standard
API Next.js route handlers support natively. `lib/upload/handleFormData.js`
validates file type/size and writes to `/public/uploads/` — functionally
equivalent to what Multer would do, without depending on Express.

### 4.3 Fingerprint hardware is mocked

Chapter 3.7.4 names DigitalPersona U.are.U 4500 SDK integration as a
**stretch goal**, with the system "structured to allow full integration
… without redesigning." No physical scanner or SDK was available in this
build environment.

**Justification:** `lib/biometric/fingerprintAdapter.js` is the *only*
module that talks to fingerprint hardware. `captureFingerprint()` and
`matchFingerprint()` define the exact interface a real SDK integration
would implement. Every other part of the system — enrolment UI,
verification flow, database storage — calls only this interface and
would need **zero changes** if real hardware were connected; only this
one file would be replaced.

Because two mock captures of "the same finger" can't produce identical
data the way real minutiae would, `matchFingerprint()` simulates a
realistic ~90% success rate rather than literal string comparison. A
small **Demo Controls** panel on the gate's fingerprint step (clearly
labeled, visually separated from the real UI) lets the fallback path be
demonstrated reliably during a live defense — this is a testing aid tied
to the absence of hardware, not a hidden feature.

### 4.4 A related design decision: 1:1 verification, not 1:N identification

Chapter 3 doesn't specify whether fingerprint/face matching should be
**identification** (1:N — "whose print is this, out of every enrolled
student?") or **verification** (1:1 — "does this match the person who
claims to be U20CS1001?"). This build does 1:1 verification, after the
student identifies themselves by matric number at the gate.

**Justification:** this mirrors how real hybrid access-control systems
typically work (ID claim + biometric confirmation), is the only approach
meaningful given mocked fingerprint data (true 1:N identification needs
real minutiae data), and matches how a DigitalPersona SDK integration
would actually be used — it's built for 1:1 verification, not
large-scale identification search.

---

## 5. Setup & Installation

### Prerequisites
- Node.js 18+
- A MongoDB Atlas cluster (free tier is sufficient)
- A webcam (for facial enrolment/verification)

### Steps

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment** — edit `.env.local`:
   ```
   MONGODB_URI=<your Atlas connection string>
   JWT_SECRET=<any long random string>
   ADMIN_EMAIL=<your choice>
   ADMIN_PASSWORD=<your choice>
   ```

3. **Seed the admin account** (the only way to create one — there is no
   public registration route, by design, for security):
   ```bash
   npm run seed:admin
   ```

4. **Run the app**
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000`.

5. **(Recommended before defense day) Set up offline face models** —
   face-api.js loads ~15MB of model weights from a CDN by default, which
   needs internet on first load. To avoid depending on venue Wi-Fi:
   ```bash
   # Windows
   xcopy node_modules\@vladmandic\face-api\model public\models /E /I
   # macOS/Linux
   cp -r node_modules/@vladmandic/face-api/model public/models
   ```
   Then uncomment in `.env.local`:
   ```
   NEXT_PUBLIC_FACE_MODELS_URL=/models
   ```

---

## 6. Features (mapped to Chapter 3)

| Feature | Chapter Reference | Status |
|---|---|---|
| Admin authentication (JWT + bcrypt) | 3.9 | ✅ |
| Student registration/CRUD, soft-delete | 3.9.2 | ✅ |
| Two-step biometric enrolment | 3.7 | ✅ |
| Fingerprint-first, face-fallback verification | 3.7 | ✅ |
| Access logging (every attempt) | 3.9.5, 3.10.5 | ✅ |
| Log search/filter | 3.9.5 | ✅ |
| Daily/weekly/monthly reports, PDF/Excel export | 3.9 | ✅ |
| Admin dashboard (stats, chart, activity) | 3.9 | ✅ |
| Fingerprint SDK extensibility | 3.7.4 | ✅ (adapter interface ready) |
| Physical gate hardware (Arduino/relay/lock) | — | ❌ Out of scope, per Chapter 1 |

---

## 7. Security Design

- Passwords hashed with **bcryptjs**, never stored or returned in plain
  text (`select: false` on the schema field)
- Sessions via **JWT in an httpOnly cookie** — not accessible to
  JavaScript, reducing XSS exposure compared to localStorage
- Admin routes protected **server-side** (`app/(dashboard)/layout.jsx`
  checks the token on the server before rendering anything — not a
  client-side check that could be bypassed)
- Gate verification routes (`/api/verify/*`) are intentionally public —
  no login — since students use the gate directly, but they never expose
  raw biometric templates/descriptors, only grant/deny decisions
- Biometric data (`Biometric` collection) is structurally separated from
  identity data (`Student` collection)
- No admin self-registration route exists — accounts are created only
  via `scripts/seedAdmin.js`, closing off a potential attack surface

---

## 8. Known Limitations

- **Fingerprint capture/matching is simulated** — no physical scanner
  was available; see §4.3 for the adapter design that makes swapping in
  real hardware a contained change.
- **Face model loading needs internet on first run** unless the offline
  setup in §5 step 5 is done in advance.
- **Report/log previews cap at 200–500 rows** for performance; the
  actual downloaded PDF/Excel files always contain the complete matching
  data set, not just the preview.
- **Dashboard does not auto-refresh** — a manual reload shows updated
  numbers. Live polling wasn't part of the original requirements.
- **No physical gate hardware integration** (Arduino/ESP32/relay/lock) —
  explicitly out of scope per Chapter 1; this system produces a
  software-only grant/deny decision.
- **1:1 verification only** — the system does not perform 1:N biometric
  identification across the full student population (see §4.4).

---

## 9. Anticipated Panel Questions

**"Why didn't you use Express, since it's in your documentation?"**
Next.js API routes fulfil the same backend responsibilities within one
application, removing a second server process and CORS setup. See §4.1.

**"Is this actually reading real fingerprints?"**
No — no physical scanner was available. The system uses a mock adapter
that mirrors the exact interface a real DigitalPersona SDK integration
would use, so hardware can be added later by changing one file, not
redesigning the system. See §4.3.

**"How does your face recognition actually work?"**
It's real, not mocked — `face-api.js` runs live in the browser, extracts
a 128-value facial descriptor from the webcam feed, and the system
compares it against the stored descriptor using Euclidean distance
(`lib/biometric/faceMatcher.js`).

**"Why does the student enter their matric number instead of the system
just recognizing them?"**
This is 1:1 verification (confirm a claimed identity) rather than 1:N
identification (search the whole database for a match), which is both
more realistic for the mocked fingerprint data and how a real
DigitalPersona SDK integration would be used. See §4.4.

**"What happens if someone's fingerprint fails?"**
The system automatically falls back to facial verification, only if the
student has a face enrolled — this is the "hybrid" design in Chapter 3.7.

**"Is every attempt really logged, even failures?"**
Yes — both `/api/verify/fingerprint` and `/api/verify/face` write to
`AccessLog` regardless of outcome, before returning a response.

---

## 10. Project Build History

This project was built incrementally across 10 steps, each independently
tested before moving to the next:

1. Scaffolding & architecture (Mongoose models, DB connection, design tokens)
2. Authentication (JWT, bcrypt, protected routes)
3. Student management (CRUD, uploads)
4. Biometric enrolment (fingerprint mock, real face-api.js capture)
5. Access verification flow (the gate console)
6. Access logs (search/filter)
7. Reports (PDF/Excel export)
8. Dashboard (stats, chart, activity feed)
9. UI polish (CSS Modules conversion, responsive/hover refinement)
10. Documentation (this file)
11. Branding — design tokens and the university crest updated to match
    KASU's official colors (green `#00923f`, gold `#f0b90b`, red
    `#dc3b30`, sampled directly from the logo), applied across the login,
    home, gate console, and admin sidebar via `app/globals.css`
