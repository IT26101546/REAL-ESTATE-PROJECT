package com.realestate.portal.service.payment;

import com.realestate.portal.model.PaymentMethodType;

import java.math.BigDecimal;

/**
 * PaymentProcessor - Strategy Pattern Interface.
 * Demonstrates:
 * - OOP Polymorphism: Multiple payment processors provide specialized implementation
 *   of processPayment without altering calling client code.
 * - OOP Abstraction: Hides payment gateway implementation details.
 */
public interface PaymentProcessor {
    PaymentMethodType getSupportedMethod();
    boolean processPayment(BigDecimal amount, String metadata);
}
