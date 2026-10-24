package com.realestate.portal.service;

import com.realestate.portal.dto.PropertyReviewSummaryDto;
import com.realestate.portal.dto.ReviewRequest;
import com.realestate.portal.exception.BadRequestException;
import com.realestate.portal.exception.ResourceNotFoundException;
import com.realestate.portal.exception.UnauthorizedException;
import com.realestate.portal.model.Review;
import com.realestate.portal.model.User;
import com.realestate.portal.repository.ReviewRepository;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

/**
 * Review Service Implementation - Member 6 Responsibility
 * Handles property feedback, ratings calculation, and moderation.
 */
@Service
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final PropertyService propertyService;
    private final UserService userService;

    public ReviewServiceImpl(ReviewRepository reviewRepository,
                             @Lazy PropertyService propertyService,
                             @Lazy UserService userService) {
        this.reviewRepository = reviewRepository;
        this.propertyService = propertyService;
        this.userService = userService;
    }

    @Override
    public Review createReview(String userId, ReviewRequest request) {
        if (request.getRating() < 1 || request.getRating() > 5) {
            throw new BadRequestException("Rating must be between 1 and 5 stars.");
        }

        // Verify property exists
        propertyService.getPropertyById(request.getPropertyId());
        User user = userService.getUserEntity(userId);

        Review review = new Review();
        review.setPropertyId(request.getPropertyId());
        review.setUserId(user.getId());
        review.setUserName(user.getName());
        review.setRating(request.getRating());
        review.setComment(request.getComment().trim());

        return reviewRepository.save(review);
    }

    @Override
    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }

    @Override
    public List<Review> getReviewsByProperty(String propertyId) {
        return reviewRepository.findByPropertyId(propertyId);
    }

    @Override
    public PropertyReviewSummaryDto getPropertyReviewSummary(String propertyId) {
        List<Review> reviews = reviewRepository.findByPropertyId(propertyId);
        if (reviews.isEmpty()) {
            return new PropertyReviewSummaryDto(propertyId, 0.0, 0, reviews);
        }

        double avg = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);

        BigDecimal roundedAvg = BigDecimal.valueOf(avg).setScale(1, RoundingMode.HALF_UP);
        return new PropertyReviewSummaryDto(propertyId, roundedAvg.doubleValue(), reviews.size(), reviews);
    }

    @Override
    public List<Review> getReviewsByUser(String userId) {
        return reviewRepository.findByUserId(userId);
    }

    @Override
    public Review getReviewById(String reviewId) {
        return reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + reviewId));
    }

    @Override
    public Review updateReview(String reviewId, String userId, ReviewRequest request) {
        Review review = getReviewById(reviewId);
        if (!review.getUserId().equals(userId)) {
            throw new UnauthorizedException("You are only allowed to edit your own reviews.");
        }
        if (request.getRating() < 1 || request.getRating() > 5) {
            throw new BadRequestException("Rating must be between 1 and 5 stars.");
        }
        review.setRating(request.getRating());
        review.setComment(request.getComment().trim());
        return reviewRepository.save(review);
    }

    @Override
    public boolean deleteReview(String reviewId, String userId, boolean isAdmin) {
        Review review = getReviewById(reviewId);
        if (!review.getUserId().equals(userId) && !isAdmin) {
            throw new UnauthorizedException("You are not authorized to delete this review.");
        }
        return reviewRepository.deleteById(reviewId);
    }
}
