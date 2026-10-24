# Inquiry API

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/inquiries` | Buyer submits question |
| GET | `/api/inquiries/my-inquiries` | Buyer history |
| GET | `/api/inquiries/seller` | Seller inbox |
| GET | `/api/inquiries/{id}` | Detail |
| PUT | `/api/inquiries/{id}` | Buyer edit |
| PUT | `/api/inquiries/{id}/reply` | Seller response |
| DELETE | `/api/inquiries/{id}` | Buyer delete |

Example: `{"propertyId":"PROP-001","question":"Can I arrange a viewing?"}`.
