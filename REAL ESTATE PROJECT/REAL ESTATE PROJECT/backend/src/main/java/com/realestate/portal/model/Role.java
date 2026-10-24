package com.realestate.portal.model;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum Role {
    BUYER,
    SELLER,
    ADMIN;

    @JsonCreator
    public static Role fromString(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        for (Role role : Role.values()) {
            if (role.name().equalsIgnoreCase(value.trim())) {
                return role;
            }
        }
        throw new IllegalArgumentException("Unknown role: " + value + ". Permitted roles: BUYER, SELLER");
    }
}
