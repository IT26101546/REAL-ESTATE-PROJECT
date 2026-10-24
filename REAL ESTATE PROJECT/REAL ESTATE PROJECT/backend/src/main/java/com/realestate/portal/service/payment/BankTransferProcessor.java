package com.realestate.portal.service.payment;

import com.realestate.portal.model.PaymentMethodType;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * Concrete Strategy 2: Direct Bank Transfer Simulator.
 * Demonstrates OOP Polymorphism.
 */
@Component
public class BankTransferProcessor implements PaymentProcessor {

    @Override
    public PaymentMethodType getSupportedMethod() {
        return PaymentMethodType.BANK_TRANSFER;
    }

    @Override
    public boolean processPayment(BigDecimal amount, String metadata) {
        return amount != null && amount.compareTo(BigDecimal.ZERO) > 0;
    }
}
