package com.realestate.portal.service.payment;

import com.realestate.portal.model.PaymentMethodType;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * Concrete Strategy 1: Credit / Debit Card Simulator.
 * Demonstrates OOP Polymorphism.
 */
@Component
public class CardPaymentProcessor implements PaymentProcessor {

    @Override
    public PaymentMethodType getSupportedMethod() {
        return PaymentMethodType.CREDIT_CARD;
    }

    @Override
    public boolean processPayment(BigDecimal amount, String metadata) {
        // Simulated authorization logic: successful for positive amounts
        return amount != null && amount.compareTo(BigDecimal.ZERO) > 0;
    }
}
