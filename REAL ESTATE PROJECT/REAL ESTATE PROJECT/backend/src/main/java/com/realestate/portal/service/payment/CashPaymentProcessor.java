package com.realestate.portal.service.payment;

import com.realestate.portal.model.PaymentMethodType;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * Concrete Strategy: Cash Payment Processor.
 * In-person cash payment initiation.
 * Demonstrates OOP Polymorphism.
 */
@Component
public class CashPaymentProcessor implements PaymentProcessor {

    @Override
    public PaymentMethodType getSupportedMethod() {
        return PaymentMethodType.CASH;
    }

    @Override
    public boolean processPayment(BigDecimal amount, String metadata) {
        return amount != null && amount.compareTo(BigDecimal.ZERO) > 0;
    }
}
