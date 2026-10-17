package com.realestate.portal.dto;

import com.realestate.portal.model.Payment;
import com.realestate.portal.model.PaymentMethodType;
import com.realestate.portal.model.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PaymentReceiptDto {
    private String paymentId;
    private String bookingId;
    private String propertyId;
    private String propertyTitle;
    private String buyerId;
    private String buyerName;
    private String buyerEmail;
    private BigDecimal amount;
    private PaymentMethodType paymentMethod;
    private String transactionRef;
    private PaymentStatus status;
    private LocalDateTime paymentDate;
    private String notes;

    public PaymentReceiptDto() {
    }

    public PaymentReceiptDto(Payment payment, String propertyTitle, String buyerName, String buyerEmail) {
        if (payment != null) {
            this.paymentId = payment.getId();
            this.bookingId = payment.getBookingId();
            this.propertyId = payment.getPropertyId();
            this.buyerId = payment.getBuyerId();
            this.amount = payment.getAmount();
            this.paymentMethod = payment.getPaymentMethod();
            this.transactionRef = payment.getTransactionRef();
            this.status = payment.getStatus();
            this.paymentDate = payment.getPaymentDate();
            this.notes = payment.getNotes();
        }
        this.propertyTitle = propertyTitle;
        this.buyerName = buyerName;
        this.buyerEmail = buyerEmail;
    }

    public String getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(String paymentId) {
        this.paymentId = paymentId;
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

    public String getPropertyTitle() {
        return propertyTitle;
    }

    public void setPropertyTitle(String propertyTitle) {
        this.propertyTitle = propertyTitle;
    }

    public String getBuyerId() {
        return buyerId;
    }

    public void setBuyerId(String buyerId) {
        this.buyerId = buyerId;
    }

    public String getBuyerName() {
        return buyerName;
    }

    public void setBuyerName(String buyerName) {
        this.buyerName = buyerName;
    }

    public String getBuyerEmail() {
        return buyerEmail;
    }

    public void setBuyerEmail(String buyerEmail) {
        this.buyerEmail = buyerEmail;
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
