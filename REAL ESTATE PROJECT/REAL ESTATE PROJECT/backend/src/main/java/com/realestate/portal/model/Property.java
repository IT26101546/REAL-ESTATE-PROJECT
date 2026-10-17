package com.realestate.portal.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Property Entity - Member 2 Responsibility
 * Represents real estate listings.
 * Extends BaseEntity (Inheritance).
 */
public class Property extends BaseEntity {
    private String title;
    private String description;
    private String categoryId;
    private String categoryName;
    private String location;
    private BigDecimal price;
    private PropertyType type; // SALE or RENT
    private int bedrooms;
    private int bathrooms;
    private double area; // in square feet
    private String imageUrl;
    private String sellerId;
    private String sellerName;
    private PropertyStatus status; // AVAILABLE, RESERVED, SOLD, RENTED, ARCHIVED

    public Property() {
        super();
        this.status = PropertyStatus.AVAILABLE;
    }

    public Property(String id, String title, String description, String categoryId, String categoryName,
                    String location, BigDecimal price, PropertyType type, int bedrooms, int bathrooms,
                    double area, String imageUrl, String sellerId, String sellerName, PropertyStatus status) {
        super(id);
        this.title = title;
        this.description = description;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.location = location;
        this.price = price;
        this.type = type;
        this.bedrooms = bedrooms;
        this.bathrooms = bathrooms;
        this.area = area;
        this.imageUrl = imageUrl;
        this.sellerId = sellerId;
        this.sellerName = sellerName;
        this.status = status != null ? status : PropertyStatus.AVAILABLE;
    }

    public Property(String id, LocalDateTime createdAt, LocalDateTime updatedAt, String title,
                    String description, String categoryId, String categoryName, String location,
                    BigDecimal price, PropertyType type, int bedrooms, int bathrooms, double area,
                    String imageUrl, String sellerId, String sellerName, PropertyStatus status) {
        super(id, createdAt, updatedAt);
        this.title = title;
        this.description = description;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.location = location;
        this.price = price;
        this.type = type;
        this.bedrooms = bedrooms;
        this.bathrooms = bathrooms;
        this.area = area;
        this.imageUrl = imageUrl;
        this.sellerId = sellerId;
        this.sellerName = sellerName;
        this.status = status;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(String categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public PropertyType getType() {
        return type;
    }

    public void setType(PropertyType type) {
        this.type = type;
    }

    public int getBedrooms() {
        return bedrooms;
    }

    public void setBedrooms(int bedrooms) {
        this.bedrooms = bedrooms;
    }

    public int getBathrooms() {
        return bathrooms;
    }

    public void setBathrooms(int bathrooms) {
        this.bathrooms = bathrooms;
    }

    public double getArea() {
        return area;
    }

    public void setArea(double area) {
        this.area = area;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getSellerId() {
        return sellerId;
    }

    public void setSellerId(String sellerId) {
        this.sellerId = sellerId;
    }

    public String getSellerName() {
        return sellerName;
    }

    public void setSellerName(String sellerName) {
        this.sellerName = sellerName;
    }

    public PropertyStatus getStatus() {
        return status;
    }

    public void setStatus(PropertyStatus status) {
        this.status = status;
    }
}
