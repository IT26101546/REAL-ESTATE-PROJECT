# Review API

`POST /api/reviews` creates a review; public `GET /api/reviews/property/{id}`
returns reviews and the average rating. Authenticated users use
`GET /api/reviews/my-reviews`, `GET /api/reviews/{id}`, `PUT /api/reviews/{id}`,
and `DELETE /api/reviews/{id}` for their own records.

Example body: `{"propertyId":"PROP-001","rating":5,"comment":"Well maintained and accurately described."}`.
