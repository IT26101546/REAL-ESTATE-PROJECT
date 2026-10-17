package com.realestate.portal.controller;

import com.realestate.portal.dto.ApiResponse;
import com.realestate.portal.dto.PropertyReviewSummaryDto;
import com.realestate.portal.dto.ReviewRequest;
import com.realestate.portal.model.Review;
import com.realestate.portal.service.ReviewService;
import com.realestate.portal.util.UserSecurityContext;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Review Controller - Member 6 Responsibility
 * Handles property feedback, ratings, and moderation.
 */
@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;
    private final UserSecurityContext securityContext;

    public ReviewController(ReviewService reviewService, UserSecurityContext securityContext) {
        this.reviewService = reviewService;
        this.securityContext = securityContext;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Review>> createReview(
            HttpServletRequest request,
            @Valid @RequestBody ReviewRequest reviewRequest) {
        String userId = securityContext.getCurrentUserId(request);
        Review review = reviewService.createReview(userId, reviewRequest);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Review submitted successfully.", review));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Review>>> getAllReviews(HttpServletRequest request) {
        if (!securityContext.isAdmin(request)) {
            String userId = securityContext.getCurrentUserId(request);
            return ResponseEntity.ok(ApiResponse.ok(reviewService.getReviewsByUser(userId)));
        }
        return ResponseEntity.ok(ApiResponse.ok(reviewService.getAllReviews()));
    }

    @GetMapping("/property/{propertyId}")
    public ResponseEntity<ApiResponse<PropertyReviewSummaryDto>> getReviewsByProperty(@PathVariable String propertyId) {
        PropertyReviewSummaryDto summary = reviewService.getPropertyReviewSummary(propertyId);
        return ResponseEntity.ok(ApiResponse.ok(summary));
    }

    @GetMapping("/my-reviews")
    public ResponseEntity<ApiResponse<List<Review>>> getMyReviews(HttpServletRequest request) {
        String userId = securityContext.getCurrentUserId(request);
        List<Review> reviews = reviewService.getReviewsByUser(userId);
        return ResponseEntity.ok(ApiResponse.ok(reviews));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Review>> getReviewById(@PathVariable String id) {
        Review review = reviewService.getReviewById(id);
        return ResponseEntity.ok(ApiResponse.ok(review));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Review>> updateReview(
            HttpServletRequest request,
            @PathVariable String id,
            @Valid @RequestBody ReviewRequest reviewRequest) {
        String userId = securityContext.getCurrentUserId(request);
        Review updated = reviewService.updateReview(id, userId, reviewRequest);
        return ResponseEntity.ok(ApiResponse.ok("Review updated successfully.", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteReview(
            HttpServletRequest request,
            @PathVariable String id) {
        String userId = securityContext.getCurrentUserId(request);
        boolean isAdmin = securityContext.isAdmin(request);
        reviewService.deleteReview(id, userId, isAdmin);
        return ResponseEntity.ok(ApiResponse.ok("Review deleted successfully.", null));
    }
}
