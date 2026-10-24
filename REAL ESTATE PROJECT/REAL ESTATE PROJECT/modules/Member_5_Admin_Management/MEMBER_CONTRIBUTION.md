# Member 5 — Admin Management

Owns admin dashboards and category administration. The `SOURCE_MAP.md` files
point to the complete production React and Spring implementations; `data/` owns
the categories table and its sample row. The dashboard reads, but does not
duplicate, other members’ domain tables. Run it through the common portal with
`cd ../../backend; mvn spring-boot:run`, then `cd ../../frontend; npm install;
npm run dev`.
