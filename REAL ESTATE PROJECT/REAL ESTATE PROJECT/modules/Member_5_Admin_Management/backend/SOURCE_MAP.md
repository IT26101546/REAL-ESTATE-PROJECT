# Member 5 backend source map

- Controllers: `backend/src/main/java/com/realestate/portal/controller/AdminController.java`, `CategoryController.java`
- Services: `AdminService*`, `CategoryService*`
- Repository: `CategoryRepository.java`
- Model: `Category.java`
- DTOs: `CategoryRequest.java`, `DashboardStatsDto.java`

All administration endpoints require the `ADMIN` role. Category deletion is
rejected when a category is still referenced by a property.
