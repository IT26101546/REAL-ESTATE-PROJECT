# Member 1 — User Management

## Responsibility
Own account registration, login, profile maintenance, password changes, role-aware
access, and account deletion.

## Files and features
The exact production files are listed in `frontend/SOURCE_MAP.md` and
`backend/SOURCE_MAP.md`. The React pages call the JWT-aware shared API client;
the Spring layer validates requests, hashes passwords, and returns consistent
`ApiResponse` payloads. Data ownership is the `users` table in `data/schema.sql`.

## Run with the shared project
Start `../../backend` with `mvn spring-boot:run`; start `../../frontend` with
`npm install` then `npm run dev`. Configure the API address with
`frontend/.env.example`. Copy `backend/.env.example` to an uncommitted local
environment file before supplying database credentials.
