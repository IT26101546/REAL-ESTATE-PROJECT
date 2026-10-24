# User API

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Create buyer or seller account |
| POST | `/api/auth/login` | Receive JWT |
| GET | `/api/users/profile` | Read current user |
| PUT | `/api/users/profile` | Update current user |
| PUT | `/api/users/change-password` | Change password |
| DELETE | `/api/users/{id}` | Delete own account or, for admin, a user |

Example registration:
```json
{"name":"Asha Perera","email":"asha@example.com","password":"SecurePass@123","phone":"+94770000000","role":"BUYER"}
```
Use `Authorization: Bearer <jwt>` for protected requests. Success responses are
`{ "success": true, "message": "...", "data": ..., "timestamp": "..." }`.
