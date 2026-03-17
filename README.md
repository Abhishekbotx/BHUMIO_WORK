# BHUMIO Assignment — Transactions (Mock API + Retry + Dedup)

A small web app with **a single page** and **a single form** that collects:

- **email**
- **amount (number)**

On submit, the UI immediately enters **pending** state and calls a **mock API** that randomly returns:

- **200 success** (immediate)
- **503 temporary failure** (immediate)
- **200 success** after a **5–10s delay**

This repo contains:

- **Backend**: Node.js + Express + MongoDB via Mongoose (port `3000`)
- **Frontend**: Vite + React + Tailwind (in `Client/`, port `5173`)

---

## Run locally

### Backend

From `Server/`:

```bash
cd Server
npm install
npm run start
```

Create `Server/.env`:

```env
PORT=3000
MONGODB_URL=YOUR_MONGODB_CONNECTION_STRING
```

### Frontend

From `Client/`:

```bash
cd Client
npm install
npm run dev
```

---

## API

- `POST /api/v1/transactions`
  - Body: `{ "email": string, "amount": number }`
  - Header: `Idempotency-Key: <uuid>`
  - Responses:
    - `200` with `{ data: Transaction, meta }` (success, sometimes delayed 5–10s)
    - `503` with `{ data: Transaction, meta }` (temporary failure; safe to retry)
- `GET /api/v1/transactions` → `{ data: Transaction[] }`

The older endpoints `POST /api/v1/createtransaction` and `GET /api/v1/getalltransactions` are kept for compatibility, but the app uses `/transactions`.

---

## State transitions (UI)

Client-side submit state (single in-flight submission):

- **normal**
- **pending** (attempt \(1..N\))
- **success**
- **failed**

The list view shows the persisted transaction record state from the server:

- `pending` → created immediately when first seen
- `success` → set when a 200 outcome occurs (immediate or delayed)
- `failed` → set when server-side retryCount reaches the limit

---

## Retry logic

The client retries **only** on HTTP **503**:

- Max attempts: `1 + 3retries`
- Backoff: exponential with small jitter
- Critical detail: every retry reuses the **same `Idempotency-Key`**

This means retries are safe and will never create a second record.

---

## How duplicates are prevented

There are two layers:

- **UI layer**: the submit button is disabled while a submission is pending, preventing accidental double-click / double-submit.
- **API layer (idempotency)**:
  - The client generates a **stable** `Idempotency-Key` per `(email, amount)` payload.
  - The server stores it as a **unique** field (`Transaction.idempotencyKey`) and returns/updates the existing record if the same key is seen again.

Result: the user never sees duplicate records even across retries and refreshes.
