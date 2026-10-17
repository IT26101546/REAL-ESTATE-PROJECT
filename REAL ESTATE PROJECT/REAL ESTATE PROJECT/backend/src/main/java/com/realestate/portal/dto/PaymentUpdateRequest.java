package com.realestate.portal.dto;

import com.realestate.portal.model.PaymentMethodType;

/**
 * DTO for updating pending payment details.
 */
public class PaymentUpdateRequest {

    private PaymentMethodType paymentMethod;
    private String notes;

    public PaymentUpdateRequest() {
    }

    public PaymentUpdateRequest(PaymentMethodType paymentMethod, String notes) {
        this.paymentMethod = paymentMethod;
        this.notes = notes;
    }

    public PaymentMethodType getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(PaymentMethodType paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
