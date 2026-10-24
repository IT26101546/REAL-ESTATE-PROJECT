# Member 3 — Booking and Payment Management

Owns reservation lifecycle, seller booking decisions, payment history, and
receipts. Production code is mapped under `frontend/` and `backend/`; both tables
and safe seed data are in `data/`. All mutating APIs require JWT authentication
and role/ownership checks. Payment processing is intentionally simulated—never
use this coursework module to process or store live card details.

Run it through the shared React/Spring Boot application described in
`../../README.md`.
