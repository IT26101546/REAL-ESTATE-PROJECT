package com.realestate.portal.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Payment Entity - Member 3 Responsibility
 * Represents simulated reservation payments.
 * Extends BaseEntity (Inheritance).
 */
public class Payment extends BaseEntity {
    private String bookingId;
    private String propertyId;
    private String buyerId;
    private BigDecimal amount;
    private PaymentMethodType paymentMethod;
    private String transactionRef;
    private PaymentStatus status;
    private LocalDateTime paymentDate;
    private String notes;

    public Payment() {
        super();
        this.status = PaymentStatus.PENDING;
        this.paymentDate = LocalDateTime.now();
    }

    public Payment(String id, String bookingId, String propertyId, String buyerId,
                   BigDecimal amount, PaymentMethodType paymentMethod, String transactionRef,
                   PaymentStatus status, String notes) {
        super(id);
        this.bookingId = bookingId;
        this.propertyId = propertyId;
        this.buyerId = buyerId;
        this.amount = amount;
        this.paymentMethod = paymentMethod;
        this.transactionRef = transactionRef;
        this.status = status != null ? status : PaymentStatus.PENDING;
        this.paymentDate = LocalDateTime.now();
        this.notes = notes;
    }

    public Payment(String id, LocalDateTime createdAt, LocalDateTime updatedAt, String bookingId,
                   String propertyId, String buyerId, BigDecimal amount, PaymentMethodType paymentMethod,
                   String transactionRef, PaymentStatus status, LocalDateTime paymentDate, String notes) {
        super(id, createdAt, updatedAt);
        this.bookingId = bookingId;
        this.propertyId = propertyId;
        this.buyerId = buyerId;
        this.amount = amount;
        this.paymentMethod = paymentMethod;
        this.transactionRef = transactionRef;
        this.status = status;
        this.paymentDate = paymentDate != null ? paymentDate : LocalDateTime.now();
        this.notes = notes;
    }

    public String getBookingId() {
        return bookingId;
    }

    public void setBookingId(String bookingId) {
        this.bookingId = bookingId;
    }

    public String getPropertyId() {
        return propertyId;
    }

    public void setPropertyId(String propertyId) {
        this.propertyId = propertyId;
    }

    public String getBuyerId() {
        return buyerId;
    }

    public void setBuyerId(String buyerId) {
        this.buyerId = buyerId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public PaymentMethodType getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(PaymentMethodType paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getTransactionRef() {
        return transactionRef;
    }

    public void setTransactionRef(String transactionRef) {
        this.transactionRef = transactionRef;
    }

    public PaymentStatus getStatus() {
        return status;
    }

    public void setStatus(PaymentStatus status) {
        this.status = status;
    }

    public LocalDateTime getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(LocalDateTime paymentDate) {
        this.paymentDate = paymentDate;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
