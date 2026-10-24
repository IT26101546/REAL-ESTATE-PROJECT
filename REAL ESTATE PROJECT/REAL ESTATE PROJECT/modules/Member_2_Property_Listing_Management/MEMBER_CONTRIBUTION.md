# Member 2 — Property Listing Management

Owns property browse/detail views and seller CRUD. The real JSX/CSS and Spring
sources are mapped in the two `SOURCE_MAP.md` files. The module validates listing
input and uses authenticated seller ownership checks. Its MySQL table and example
row are in `data/`; run it only after the shared schema's users/categories tables.

Run through the shared app: `../../backend` → `mvn spring-boot:run`, then
`../../frontend` → `npm install; npm run dev`.
