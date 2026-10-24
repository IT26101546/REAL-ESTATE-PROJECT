# Module ownership and integration map

The application has one React application (`frontend/`) and one Spring Boot
application (`backend/`). Members own domain folders; shared routing,
authentication, API client, CORS, and error handling must be changed by agreement.

| Member | Frontend ownership | Backend ownership | Tables / relationships |
|---|---|---|---|
| 1 – Users | `pages/Member1_User` | `AuthController`, `UserController`, `UserService*`, `UserRepository`, `User` | `users` is referenced by every authenticated domain |
| 2 – Properties | `pages/Member2_Property` | `PropertyController`, `PropertyService*`, `PropertyRepository`, `Property` | `properties` → `categories`, `users` (seller) |
| 3 – Bookings & payments | `pages/Member3_BookingPayment` | Booking/Payment controllers, services, repositories, models and payment strategies | bookings → property/buyer/seller; payments → booking/buyer |
| 4 – Inquiries | `pages/Member4_Inquiry` | `InquiryController`, `InquiryService*`, `InquiryRepository`, `Inquiry` | inquiry → property/buyer/seller |
| 5 – Administration | `pages/Member5_AdminCategory` | `AdminController`, `CategoryController`, related services | dashboard reads all domains; categories are used by properties |
| 6 – Reviews | `pages/Member6_Review` | `ReviewController`, `ReviewService*`, `ReviewRepository`, `Review` | review → property/reviewer; one review per user/property |

Shared frontend code lives in `src/api`, `src/components`, and `src/context`.
Shared backend code lives in `config`, `dto`, `exception`, and `util`.

## Authorization contract

`BUYER` creates bookings and inquiries, `SELLER` owns and manages listings and
their inbound bookings/inquiries, and `ADMIN` manages the platform. The JWT is
sent as `Authorization: Bearer <token>` by `src/api/apiClient.js`; controllers
must verify ownership as well as role before modifying a record.

## Payment safety

Payment processors are mock strategies only. They accept a payment method and
create a transaction reference; no card number, CVV, bank-account number, or
gateway credential may be saved in a DTO, model, database table, browser
storage, or log.
# Module ownership and integration map

One React application (`frontend/`) and one Spring Boot application (`backend/`) are shared by all members. Shared routing, authentication, API client, CORS, and error handling require team agreement.

| Member | Frontend | Backend | Database scope |
|---|---|---|---|
| 1 – Users | `pages/Member1_User` | Auth/User controllers, services, repository, model | `users` |
| 2 – Properties | `pages/Member2_Property` | Property controller, service, repository, model | `properties` → category, seller |
| 3 – Bookings & payments | `pages/Member3_BookingPayment` | Booking/Payment controllers, services, repositories, models | bookings → property/buyer/seller; payments → booking/buyer/property |
| 4 – Inquiries | `pages/Member4_Inquiry` | Inquiry controller, service, repository, model | inquiries → property/buyer/seller |
| 5 – Administration | `pages/Member5_AdminCategory` | Admin/Category controllers and services | dashboard reads all domains; categories → properties |
| 6 – Reviews | `pages/Member6_Review` | Review controller, service, repository, model | reviews → property/user; one review per user/property |

## Shared contract

The client sends the JWT as `Authorization: Bearer <token>` through `src/api/apiClient.js`. Controllers must check both role and ownership before changing a resource. `BUYER` creates bookings/inquiries; `SELLER` manages own listings and incoming requests; `ADMIN` manages platform-wide records.

## Payment safety

The payment strategies are mock processors. Persist only the method, status, amount, and generated transaction reference. Never store a card number, CVV, bank account number, gateway secret, or raw payment payload.
