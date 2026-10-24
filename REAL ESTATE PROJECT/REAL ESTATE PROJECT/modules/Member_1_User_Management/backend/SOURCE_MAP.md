# Member 1 backend source map

- Controllers: `backend/src/main/java/com/realestate/portal/controller/AuthController.java`, `UserController.java`
- Services: `backend/src/main/java/com/realestate/portal/service/UserService.java`, `UserServiceImpl.java`
- Repository: `backend/src/main/java/com/realestate/portal/repository/UserRepository.java`
- Model: `backend/src/main/java/com/realestate/portal/model/User.java`, `Role.java`
- DTOs: `AuthRequest`, `AuthResponse`, `RegisterRequest`, `UpdateProfileRequest`, `ChangePasswordRequest`, `UserProfileDto`

Authentication is JWT-based and passwords are BCrypt-hashed. The controller uses
the shared `ApiResponse<T>` envelope and global exception handler.
