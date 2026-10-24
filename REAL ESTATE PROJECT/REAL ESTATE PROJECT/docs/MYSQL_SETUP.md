# MySQL setup and migration contract

1. Install MySQL 8+ and create a least-privilege local account, for example
   `CREATE USER 'real_estate_app'@'localhost' IDENTIFIED BY 'choose-a-local-secret';`.
2. Run `database/mysql-schema.sql` once: `mysql -u root -p < database/mysql-schema.sql`.
3. Copy `backend/.env.example` and set `DB_HOST`, `DB_PORT`, `DB_NAME`,
   `DB_USERNAME`, and `DB_PASSWORD` locally; do not commit the completed file.
4. Load optional members’ seed rows only after the prerequisite user/category/
   property rows exist, or create records through the REST API.

The schema, foreign keys, and module SQL files are MySQL-ready. The currently
tested Spring Boot persistence adapter is explicitly file-backed (`backend/data`),
as stated in the main README. Do not enable the `mysql` profile or claim runtime
MySQL persistence until the repository adapter is migrated and integration-tested.
