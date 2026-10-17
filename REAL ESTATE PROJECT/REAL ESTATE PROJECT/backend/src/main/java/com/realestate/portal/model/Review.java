package com.realestate.portal.model;

import java.time.LocalDateTime;

/**
 * Review Entity - Member 6 Responsibility
 * Represents ratings and comments on properties.
 * Extends BaseEntity (Inheritance).
 */
public class Review extends BaseEntity {
    private String propertyId;
    private String userId;
    private String userName;
    private int rating; // 1 to 5
    private String comment;

    public Review() {
        super();
    }

    public Review(String id, String propertyId, String userId, String userName, int rating, String comment) {
        super(id);
        this.propertyId = propertyId;
        this.userId = userId;
        this.userName = userName;
        this.rating = rating;
        this.comment = comment;
    }

    public Review(String id, LocalDateTime createdAt, LocalDateTime updatedAt, String propertyId,
                  String userId, String userName, int rating, String comment) {
        super(id, createdAt, updatedAt);
        this.propertyId = propertyId;
        this.userId = userId;
        this.userName = userName;
        this.rating = rating;
        this.comment = comment;
    }

    public String getPropertyId() {
        return propertyId;
    }

    public void setPropertyId(String propertyId) {
        this.propertyId = propertyId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }
}
