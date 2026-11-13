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

## Detailed member guides

Each guide documents the implemented functions, user workflow, backend/frontend
layers, APIs, shared-module relationships, and OOP concepts:

1. [Member 1 — User Management](Member_1_User_Management/docs/MODULE_GUIDE.md)
2. [Member 2 — Property Listing Management](Member_2_Property_Listing_Management/docs/MODULE_GUIDE.md)
3. [Member 3 — Booking and Payment Management](Member_3_Booking_Payment_Management/docs/MODULE_GUIDE.md)
4. [Member 4 — Property Inquiry Management](Member_4_Property_Inquiry_Management/docs/MODULE_GUIDE.md)
5. [Member 5 — Admin Management](Member_5_Admin_Management/docs/MODULE_GUIDE.md)
6. [Member 6 — Feedback and Review Management](Member_6_Feedback_Review_Management/docs/MODULE_GUIDE.md)

To create a member handoff archive, zip the chosen directory (for example,
`Member_1_User_Management`) without altering its relative paths.
