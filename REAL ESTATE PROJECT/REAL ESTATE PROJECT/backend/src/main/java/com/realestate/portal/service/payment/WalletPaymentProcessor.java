package com.realestate.portal.service.payment;

import com.realestate.portal.model.PaymentMethodType;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * Concrete Strategy 3: Digital Wallet Simulator.
 * Demonstrates OOP Polymorphism.
 */
@Component
public class WalletPaymentProcessor implements PaymentProcessor {

    @Override
    public PaymentMethodType getSupportedMethod() {
        return PaymentMethodType.DIGITAL_WALLET;
    }

    @Override
    public boolean processPayment(BigDecimal amount, String metadata) {
        return amount != null && amount.compareTo(BigDecimal.ZERO) > 0;
    }
}
