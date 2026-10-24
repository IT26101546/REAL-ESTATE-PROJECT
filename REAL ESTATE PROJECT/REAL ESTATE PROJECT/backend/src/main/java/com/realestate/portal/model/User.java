package com.realestate.portal.model;

import java.time.LocalDateTime;

/**
 * User Entity - Member 1 Responsibility
 * Represents portal users (Buyers, Sellers, Admin).
 * Extends BaseEntity (Inheritance).
 */
public class User extends BaseEntity {
    private String name;
    private String email;
    private String passwordHash;
    private String phone;
    private Role role;
    private String bio;
    private boolean active;

    public User() {
        super();
        this.active = true;
    }

    public User(String id, String name, String email, String passwordHash, String phone, Role role, String bio) {
        super(id);
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
        this.phone = phone;
        this.role = role;
        this.bio = bio;
        this.active = true;
    }

    public User(String id, LocalDateTime createdAt, LocalDateTime updatedAt, String name, String email,
                String passwordHash, String phone, Role role, String bio, boolean active) {
        super(id, createdAt, updatedAt);
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
        this.phone = phone;
        this.role = role;
        this.bio = bio;
        this.active = active;
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

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
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
}
