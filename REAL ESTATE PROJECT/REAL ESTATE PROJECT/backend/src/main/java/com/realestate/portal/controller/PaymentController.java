package com.realestate.portal.controller;

import com.realestate.portal.dto.ApiResponse;
import com.realestate.portal.dto.PaymentReceiptDto;
import com.realestate.portal.dto.PaymentRequest;
import com.realestate.portal.model.Payment;
import com.realestate.portal.service.PaymentService;
import com.realestate.portal.util.UserSecurityContext;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Payment Controller - Member 3 Responsibility
 * Handles simulated reservation payments, payment histories, and receipt generation.
 */
@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;
    private final UserSecurityContext securityContext;

    public PaymentController(PaymentService paymentService, UserSecurityContext securityContext) {
        this.paymentService = paymentService;
        this.securityContext = securityContext;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Payment>> processPayment(
            HttpServletRequest request,
            @Valid @RequestBody PaymentRequest paymentRequest) {
        String buyerId = securityContext.getCurrentUserId(request);
        Payment payment = paymentService.processPayment(buyerId, paymentRequest);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Payment processed successfully. Reservation confirmed!", payment));
    }

    @GetMapping("/my-payments")
    public ResponseEntity<ApiResponse<List<Payment>>> getMyPayments(HttpServletRequest request) {
        String buyerId = securityContext.getCurrentUserId(request);
        List<Payment> payments = paymentService.getPaymentsByBuyer(buyerId);
        return ResponseEntity.ok(ApiResponse.ok(payments));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Payment>>> getAllPayments(HttpServletRequest request) {
        if (!securityContext.isAdmin(request)) {
            String buyerId = securityContext.getCurrentUserId(request);
            return ResponseEntity.ok(ApiResponse.ok(paymentService.getPaymentsByBuyer(buyerId)));
        }
        return ResponseEntity.ok(ApiResponse.ok(paymentService.getAllPayments()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Payment>> getPaymentById(@PathVariable String id) {
        Payment payment = paymentService.getPaymentById(id);
        return ResponseEntity.ok(ApiResponse.ok(payment));
    }

    @GetMapping("/{id}/receipt")
    public ResponseEntity<ApiResponse<PaymentReceiptDto>> getReceipt(
            HttpServletRequest request,
            @PathVariable String id) {
        String userId = securityContext.getCurrentUserId(request);
        boolean isAdmin = securityContext.isAdmin(request);
        PaymentReceiptDto receipt = paymentService.getReceipt(id, userId, isAdmin);
        return ResponseEntity.ok(ApiResponse.ok(receipt));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Payment>> updatePayment(
            HttpServletRequest request,
            @PathVariable String id,
            @RequestBody com.realestate.portal.dto.PaymentUpdateRequest updateRequest) {
        String userId = securityContext.getCurrentUserId(request);
        boolean isAdmin = securityContext.isAdmin(request);
        Payment updated = paymentService.updatePayment(id, userId, isAdmin, updateRequest);
        return ResponseEntity.ok(ApiResponse.ok("Payment record updated successfully.", updated));
    }

    @PutMapping("/{id}/confirm-cash")
    public ResponseEntity<ApiResponse<Payment>> confirmCashPayment(
            HttpServletRequest request,
            @PathVariable String id) {
        if (!securityContext.isAdmin(request)) {
            throw new com.realestate.portal.exception.UnauthorizedException("Only administrators can confirm in-person cash payments.");
        }
        String adminUserId = securityContext.getCurrentUserId(request);
        Payment confirmed = paymentService.confirmCashPayment(id, adminUserId);
        return ResponseEntity.ok(ApiResponse.ok("Cash payment confirmed successfully! Booking marked as PAID.", confirmed));
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteFailedPayment(
            HttpServletRequest request,
            @PathVariable String id) {
        String userId = securityContext.getCurrentUserId(request);
        boolean isAdmin = securityContext.isAdmin(request);
        paymentService.deleteFailedPayment(id, userId, isAdmin);
        return ResponseEntity.ok(ApiResponse.ok("Failed payment record deleted successfully.", null));
    }
}
