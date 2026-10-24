# Property API

`GET /api/properties` supports `keyword`, `type`, `categoryId`, `minPrice`,
`maxPrice`, and `location`. `GET /api/properties/{id}` reads one listing.

Seller endpoints are `POST /api/properties`, `PUT /api/properties/{id}`,
`DELETE /api/properties/{id}`, and `GET /api/properties/my-properties`.

Example body: `{"title":"Lake View","description":"...","categoryId":"CAT-001","location":"Kandy","price":12000000,"type":"SALE","bedrooms":3,"bathrooms":2,"area":1600}`.
