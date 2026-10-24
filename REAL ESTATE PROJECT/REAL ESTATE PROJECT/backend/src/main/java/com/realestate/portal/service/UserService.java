package com.realestate.portal.service;

import com.realestate.portal.dto.*;
import com.realestate.portal.model.User;

import java.util.List;

/**
 * User Service Interface - Member 1 Responsibility
 * Demonstrates OOP Abstraction.
 */
public interface UserService {
    User register(RegisterRequest request);
    AuthResponse login(AuthRequest request);
    UserProfileDto getProfile(String userId);
    List<UserProfileDto> getAllUsers();
    UserProfileDto updateProfile(String userId, UpdateProfileRequest request);
    void changePassword(String userId, ChangePasswordRequest request);
    boolean deleteUser(String userId);
    User getUserEntity(String userId);
}
