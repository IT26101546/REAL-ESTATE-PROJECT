package com.realestate.portal.controller;

import com.realestate.portal.dto.ApiResponse;
import com.realestate.portal.dto.InquiryReplyRequest;
import com.realestate.portal.dto.InquiryRequest;
import com.realestate.portal.model.Inquiry;
import com.realestate.portal.service.InquiryService;
import com.realestate.portal.util.UserSecurityContext;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.realestate.portal.dto.InquiryUpdateRequest;

/**
 * Inquiry Controller - Member 4 Responsibility
 * Handles property inquiries and communications between buyers and sellers.
 */
@RestController
@RequestMapping("/api/inquiries")
public class InquiryController {

    private final InquiryService inquiryService;
    private final UserSecurityContext securityContext;

    public InquiryController(InquiryService inquiryService, UserSecurityContext securityContext) {
        this.inquiryService = inquiryService;
        this.securityContext = securityContext;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Inquiry>> createInquiry(
            HttpServletRequest request,
            @Valid @RequestBody InquiryRequest inquiryRequest) {
        String buyerId = securityContext.getCurrentUserId(request);
        Inquiry inquiry = inquiryService.createInquiry(buyerId, inquiryRequest);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Inquiry submitted successfully.", inquiry));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Inquiry>>> getAllInquiries(HttpServletRequest request) {
        if (!securityContext.isAdmin(request)) {
            String buyerId = securityContext.getCurrentUserId(request);
            return ResponseEntity.ok(ApiResponse.ok(inquiryService.getInquiriesByBuyer(buyerId)));
        }
        return ResponseEntity.ok(ApiResponse.ok(inquiryService.getAllInquiries()));
    }

    @GetMapping("/my-inquiries")
    public ResponseEntity<ApiResponse<List<Inquiry>>> getMyInquiries(HttpServletRequest request) {
        String buyerId = securityContext.getCurrentUserId(request);
        List<Inquiry> inquiries = inquiryService.getInquiriesByBuyer(buyerId);
        return ResponseEntity.ok(ApiResponse.ok(inquiries));
    }

    @GetMapping("/seller")
    public ResponseEntity<ApiResponse<List<Inquiry>>> getSellerInquiries(HttpServletRequest request) {
        String sellerId = securityContext.getCurrentUserId(request);
        List<Inquiry> inquiries = inquiryService.getInquiriesBySeller(sellerId);
        return ResponseEntity.ok(ApiResponse.ok(inquiries));
    }

    @GetMapping("/property/{propertyId}")
    public ResponseEntity<ApiResponse<List<Inquiry>>> getInquiriesForProperty(@PathVariable String propertyId) {
        List<Inquiry> inquiries = inquiryService.getInquiriesByProperty(propertyId);
        return ResponseEntity.ok(ApiResponse.ok(inquiries));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Inquiry>> getInquiryById(@PathVariable String id) {
        Inquiry inquiry = inquiryService.getInquiryById(id);
        return ResponseEntity.ok(ApiResponse.ok(inquiry));
    }

    @PutMapping(value = {"/{id}", "/{id}/question"})
    public ResponseEntity<ApiResponse<Inquiry>> updateQuestion(
            HttpServletRequest request,
            @PathVariable String id,
            @Valid @RequestBody InquiryUpdateRequest updateRequest) {
        String buyerId = securityContext.getCurrentUserId(request);
        Inquiry updated = inquiryService.updateQuestion(id, buyerId, updateRequest.getQuestion());
        return ResponseEntity.ok(ApiResponse.ok("Inquiry question updated successfully.", updated));
    }

    @PutMapping("/{id}/reply")
    public ResponseEntity<ApiResponse<Inquiry>> replyInquiry(
            HttpServletRequest request,
            @PathVariable String id,
            @Valid @RequestBody InquiryReplyRequest replyRequest) {
        String sellerId = securityContext.getCurrentUserId(request);
        boolean isAdmin = securityContext.isAdmin(request);
        Inquiry updated = inquiryService.replyInquiry(id, sellerId, isAdmin, replyRequest);
        return ResponseEntity.ok(ApiResponse.ok("Response submitted successfully.", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteInquiry(
            HttpServletRequest request,
            @PathVariable String id) {
        String buyerId = securityContext.getCurrentUserId(request);
        boolean isAdmin = securityContext.isAdmin(request);
        inquiryService.deleteInquiry(id, buyerId, isAdmin);
        return ResponseEntity.ok(ApiResponse.ok("Inquiry deleted successfully.", null));
    }
}
