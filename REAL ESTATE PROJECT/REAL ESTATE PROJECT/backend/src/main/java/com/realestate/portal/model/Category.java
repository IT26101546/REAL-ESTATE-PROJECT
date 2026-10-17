package com.realestate.portal.model;

import java.time.LocalDateTime;

/**
 * Category Entity - Member 5 Responsibility
 * Represents property categories (House, Apartment, Land, Commercial Property, etc.).
 * Extends BaseEntity (Inheritance).
 */
public class Category extends BaseEntity {
    private String name;
    private String description;
    private String icon;

    public Category() {
        super();
    }

    public Category(String id, String name, String description, String icon) {
        super(id);
        this.name = name;
        this.description = description;
        this.icon = icon;
    }

    public Category(String id, LocalDateTime createdAt, LocalDateTime updatedAt, String name,
                    String description, String icon) {
        super(id, createdAt, updatedAt);
        this.name = name;
        this.description = description;
        this.icon = icon;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }
}
