package com.realestate.portal.controller;

import com.realestate.portal.dto.ApiResponse;
import com.realestate.portal.dto.ChangePasswordRequest;
import com.realestate.portal.dto.UpdateProfileRequest;
import com.realestate.portal.dto.UserProfileDto;
import com.realestate.portal.exception.UnauthorizedException;
import com.realestate.portal.service.UserService;
import com.realestate.portal.util.UserSecurityContext;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * User Controller - Member 1 Responsibility
 * Handles user profile retrieval, updates, password change, and deletion.
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final UserSecurityContext securityContext;

    public UserController(UserService userService, UserSecurityContext securityContext) {
        this.userService = userService;
        this.securityContext = securityContext;
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileDto>> getCurrentUserProfile(HttpServletRequest request) {
        String currentUserId = securityContext.getCurrentUserId(request);
        UserProfileDto profile = userService.getProfile(currentUserId);
        return ResponseEntity.ok(ApiResponse.ok(profile));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserProfileDto>> getUserById(@PathVariable String id) {
        UserProfileDto profile = userService.getProfile(id);
        return ResponseEntity.ok(ApiResponse.ok(profile));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserProfileDto>>> getAllUsers(HttpServletRequest request) {
        if (!securityContext.isAdmin(request)) {
            throw new UnauthorizedException("Only platform administrators can view the full user list.");
        }
        List<UserProfileDto> users = userService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.ok(users));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileDto>> updateProfile(
            HttpServletRequest request,
            @Valid @RequestBody UpdateProfileRequest updateRequest) {
        String currentUserId = securityContext.getCurrentUserId(request);
        UserProfileDto updated = userService.updateProfile(currentUserId, updateRequest);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated successfully.", updated));
    }

    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            HttpServletRequest request,
            @Valid @RequestBody ChangePasswordRequest passwordRequest) {
        String currentUserId = securityContext.getCurrentUserId(request);
        userService.changePassword(currentUserId, passwordRequest);
        return ResponseEntity.ok(ApiResponse.ok("Password updated successfully.", null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            HttpServletRequest request,
            @PathVariable String id) {
        String currentUserId = securityContext.getCurrentUserId(request);
        boolean isAdmin = securityContext.isAdmin(request);

        if (!currentUserId.equals(id) && !isAdmin) {
            throw new UnauthorizedException("You are not authorized to delete this account.");
        }

        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.ok("User account deleted successfully.", null));
    }
}
