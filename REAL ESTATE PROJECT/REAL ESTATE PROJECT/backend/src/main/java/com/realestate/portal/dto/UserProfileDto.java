package com.realestate.portal.dto;

import com.realestate.portal.model.Role;
import com.realestate.portal.model.User;

import java.time.LocalDateTime;

/**
 * User Profile DTO.
 * Information Hiding: Excludes password hash from API representations.
 */
public class UserProfileDto {
    private String id;
    private String name;
    private String email;
    private String phone;
    private Role role;
    private String bio;
    private boolean active;
    private LocalDateTime createdAt;

    public UserProfileDto() {
    }

    public UserProfileDto(String id, String name, String email, String phone, Role role, String bio, boolean active, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.role = role;
        this.bio = bio;
        this.active = active;
        this.createdAt = createdAt;
    }

    public static UserProfileDto fromEntity(User user) {
        if (user == null) return null;
        return new UserProfileDto(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                user.getBio(),
                user.isActive(),
                user.getCreatedAt()
        );
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
