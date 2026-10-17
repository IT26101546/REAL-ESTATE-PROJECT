package com.realestate.portal.dto;

import com.realestate.portal.model.Review;

import java.util.ArrayList;
import java.util.List;

public class PropertyReviewSummaryDto {
    private String propertyId;
    private double averageRating;
    private int totalReviews;
    private List<Review> reviews;

    public PropertyReviewSummaryDto() {
        this.reviews = new ArrayList<>();
    }

    public PropertyReviewSummaryDto(String propertyId, double averageRating, int totalReviews, List<Review> reviews) {
        this.propertyId = propertyId;
        this.averageRating = averageRating;
        this.totalReviews = totalReviews;
        this.reviews = reviews != null ? reviews : new ArrayList<>();
    }

    public String getPropertyId() {
        return propertyId;
    }

    public void setPropertyId(String propertyId) {
        this.propertyId = propertyId;
    }

    public double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(double averageRating) {
        this.averageRating = averageRating;
    }

    public int getTotalReviews() {
        return totalReviews;
    }

    public void setTotalReviews(int totalReviews) {
        this.totalReviews = totalReviews;
    }

    public List<Review> getReviews() {
        return reviews;
    }

    public void setReviews(List<Review> reviews) {
        this.reviews = reviews;
    }
}
