package com.realestate.portal.controller;

import com.realestate.portal.dto.ApiResponse;
import com.realestate.portal.dto.AuthRequest;
import com.realestate.portal.dto.AuthResponse;
import com.realestate.portal.dto.RegisterRequest;
import com.realestate.portal.dto.UserProfileDto;
import com.realestate.portal.model.User;
import com.realestate.portal.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication Controller - Member 1 Responsibility
 * Handles public registration and sign-in operations.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserProfileDto>> register(@Valid @RequestBody RegisterRequest request) {
        User user = userService.register(request);
        UserProfileDto profile = UserProfileDto.fromEntity(user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("User registered successfully.", profile));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody AuthRequest request) {
        AuthResponse response = userService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Login successful.", response));
    }
}
