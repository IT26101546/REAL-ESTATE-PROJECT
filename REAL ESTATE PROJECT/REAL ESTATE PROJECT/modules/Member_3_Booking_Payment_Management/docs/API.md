# Booking and payment API

Bookings: `POST /api/bookings`, `GET /api/bookings/my-bookings`,
`GET /api/bookings/manage`, `GET /api/bookings/{id}`, `PUT /api/bookings/{id}/status`,
`DELETE /api/bookings/{id}`.

Payments: `POST /api/payments`, `GET /api/payments/my-payments`,
`GET /api/payments/{id}`, `GET /api/payments/{id}/receipt`, `DELETE /api/payments/{id}`.

Example booking: `{"propertyId":"PROP-001","bookingDate":"2026-11-01","reservationFee":100000,"notes":"Morning visit"}`.
