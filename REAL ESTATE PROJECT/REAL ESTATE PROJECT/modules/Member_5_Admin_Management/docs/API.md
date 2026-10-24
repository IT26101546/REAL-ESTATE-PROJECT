# Admin and category API

`GET /api/admin/dashboard` returns platform statistics for administrators.

Category CRUD: `GET /api/categories`, `GET /api/categories/{id}`, `POST /api/categories`,
`PUT /api/categories/{id}`, and `DELETE /api/categories/{id}`. Writes require
`Authorization: Bearer <admin-jwt>`.

Example category: `{"name":"Land","description":"Residential and commercial land","icon":"Map"}`.
