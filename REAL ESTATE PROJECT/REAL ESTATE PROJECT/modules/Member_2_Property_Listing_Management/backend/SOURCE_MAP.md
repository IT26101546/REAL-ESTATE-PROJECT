# Member 2 backend source map

- Controller: `backend/src/main/java/com/realestate/portal/controller/PropertyController.java`
- Service: `backend/src/main/java/com/realestate/portal/service/PropertyService.java`, `PropertyServiceImpl.java`
- Repository: `backend/src/main/java/com/realestate/portal/repository/PropertyRepository.java`
- Model: `backend/src/main/java/com/realestate/portal/model/Property.java`, `PropertyStatus.java`, `PropertyType.java`
- DTOs: `PropertyRequest.java`, `PropertyFilterDto.java`

Seller ownership is checked before write operations; public list/detail endpoints
remain separate from seller-only management endpoints.
