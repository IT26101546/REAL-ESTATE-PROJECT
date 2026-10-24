# Six-member integration guide

The portal is intentionally one React application and one Spring Boot service.
Member folders in `modules/` are ZIP-ready contribution packages, not six servers
that should be launched on the same ports.

## Shared conventions

- API root: `/api`; JWT header: `Authorization: Bearer <token>`.
- Response shape: `success`, `message`, `data`, `timestamp` (`ApiResponse<T>`).
- Frontend API modules live in `frontend/src/api`; use the existing `request`
  helper so authentication and HTTP errors behave consistently.
- Add a domain-specific page under the assigned `pages/MemberN_*` folder and
  register it in `frontend/src/App.jsx` only after coordinating route names.
- Backend domain code belongs in its existing controller/service/repository/model
  layer. Do not recreate shared DTO, exception, security, or utility classes.
- Database tables and REST paths are owned by the member shown in
  `docs/MODULE_OWNERSHIP.md`; use foreign keys rather than duplicate records.

## Local run commands

```powershell
cd backend
mvn spring-boot:run
```

```powershell
cd frontend
npm install
npm run dev
```

Use a separate terminal for each command. For a production build run
`npm run build`; for backend verification run `mvn test`.

## GitHub workflow

1. Create a branch such as `codex/member-4-inquiries` from the shared base.
2. Change only the domain folders assigned to that member plus agreed shared
   contracts.
3. Run the relevant frontend build and backend tests before committing.
4. Commit focused changes, push the branch, then open a pull request describing
   routes, API contract, SQL changes, tests, and any cross-domain impact.
5. Require another member to review shared API, schema, authentication, or route
   changes before merge; resolve conflicts in one integration branch.
