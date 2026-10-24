# Member delivery modules

This folder is the six-member handoff area for the **single integrated portal**.
Every member directory is ZIP-ready and contains `frontend`, `backend`, `data`,
`docs`, and `MEMBER_CONTRIBUTION.md`.

The production source is deliberately shared rather than copied six times:

- React application: `../../frontend`
- Spring Boot application: `../../backend`
- complete MySQL contract: `../../database/mysql-schema.sql`

The source maps in each delivery folder identify the exact JSX, CSS, controller,
service, repository, model, DTO, and SQL assets owned by that member. This keeps
class names and API paths unique and lets all six modules run together.

To create a member handoff archive, zip the chosen directory (for example,
`Member_1_User_Management`) without altering its relative paths.
