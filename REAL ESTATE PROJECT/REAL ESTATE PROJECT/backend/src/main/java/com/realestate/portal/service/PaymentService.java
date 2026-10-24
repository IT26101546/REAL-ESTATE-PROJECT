package com.realestate.portal.service;

import com.realestate.portal.dto.PaymentReceiptDto;
import com.realestate.portal.dto.PaymentRequest;
import com.realestate.portal.model.Payment;

import java.util.List;

/**
 * Payment Service Interface - Member 3 Responsibility
 * Demonstrates OOP Abstraction.
 */
public interface PaymentService {
    Payment processPayment(String buyerId, PaymentRequest request);
    List<Payment> getPaymentsByBuyer(String buyerId);
    List<Payment> getAllPayments();
    Payment getPaymentById(String paymentId);
    PaymentReceiptDto getReceipt(String paymentId, String userId, boolean isAdmin);
    Payment updatePayment(String paymentId, String userId, boolean isAdmin, com.realestate.portal.dto.PaymentUpdateRequest request);
    Payment confirmCashPayment(String paymentId, String adminUserId);
    boolean deleteFailedPayment(String paymentId, String userId, boolean isAdmin);
}

