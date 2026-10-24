package com.realestate.portal.service;

import com.realestate.portal.dto.PropertyReviewSummaryDto;
import com.realestate.portal.dto.ReviewRequest;
import com.realestate.portal.model.Review;

import java.util.List;

/**
 * Review Service Interface - Member 6 Responsibility
 * Demonstrates OOP Abstraction.
 */
public interface ReviewService {
    List<Review> getAllReviews();
    Review createReview(String userId, ReviewRequest request);
    List<Review> getReviewsByProperty(String propertyId);
    PropertyReviewSummaryDto getPropertyReviewSummary(String propertyId);
    List<Review> getReviewsByUser(String userId);
    Review getReviewById(String reviewId);
    Review updateReview(String reviewId, String userId, ReviewRequest request);
    boolean deleteReview(String reviewId, String userId, boolean isAdmin);
}
