package com.realestate.portal.dto;

import com.realestate.portal.model.PaymentMethodType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Payment Request DTO.
 * Simulates card/bank inputs for UI interaction, but real sensitive card data is never persisted.
 */
public class PaymentRequest {
    @NotBlank(message = "Booking ID is required")
    private String bookingId;

    @NotNull(message = "Payment method is required")
    private PaymentMethodType paymentMethod;

    // Simulated fields for UI form only (never stored to file)
    private String cardHolderName;
    private String simulatedCardNumber;
    private String simulatedExpiry;
    private String notes;

    public String getBookingId() {
        return bookingId;
    }

    public void setBookingId(String bookingId) {
        this.bookingId = bookingId;
    }

    public PaymentMethodType getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(PaymentMethodType paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getCardHolderName() {
        return cardHolderName;
    }

    public void setCardHolderName(String cardHolderName) {
        this.cardHolderName = cardHolderName;
    }

    public String getSimulatedCardNumber() {
        return simulatedCardNumber;
    }

    public void setSimulatedCardNumber(String simulatedCardNumber) {
        this.simulatedCardNumber = simulatedCardNumber;
    }

    public String getSimulatedExpiry() {
        return simulatedExpiry;
    }

    public void setSimulatedExpiry(String simulatedExpiry) {
        this.simulatedExpiry = simulatedExpiry;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
