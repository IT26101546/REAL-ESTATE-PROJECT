# Member 6 — Feedback and Review Management

Owns property feedback CRUD, ratings, and review summaries. The referenced React
and Spring source files are the functional shared implementation, while this
bundle contains the table definition, seed row, endpoint documentation, and
ownership guide. Keep the unique `(property_id, user_id)` constraint in MySQL to
match the service rule. Run with `cd ../../backend; mvn spring-boot:run` and,
in another terminal, `cd ../../frontend; npm install; npm run dev`.
