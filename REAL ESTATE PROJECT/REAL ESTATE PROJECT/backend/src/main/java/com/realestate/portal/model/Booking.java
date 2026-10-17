package com.realestate.portal.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Booking Entity - Member 3 Responsibility
 * Represents property reservations.
 * Extends BaseEntity (Inheritance).
 */
public class Booking extends BaseEntity {
    private String propertyId;
    private String propertyTitle;
    private String buyerId;
    private String buyerName;
    private String buyerEmail;
    private String sellerId;
    private LocalDate bookingDate;
    private BigDecimal reservationFee;
    private BookingStatus status;
    private String notes;
    private String paymentStatus;

    public Booking() {
        super();
        this.status = BookingStatus.PENDING_APPROVAL;
        this.paymentStatus = "UNPAID";
    }

    public Booking(String id, String propertyId, String propertyTitle, String buyerId,
                   String buyerName, String buyerEmail, String sellerId, LocalDate bookingDate,
                   BigDecimal reservationFee, BookingStatus status, String notes) {
        this(id, propertyId, propertyTitle, buyerId, buyerName, buyerEmail, sellerId, bookingDate, reservationFee, status, notes, "UNPAID");
    }

    public Booking(String id, String propertyId, String propertyTitle, String buyerId,
                   String buyerName, String buyerEmail, String sellerId, LocalDate bookingDate,
                   BigDecimal reservationFee, BookingStatus status, String notes, String paymentStatus) {
        super(id);
        this.propertyId = propertyId;
        this.propertyTitle = propertyTitle;
        this.buyerId = buyerId;
        this.buyerName = buyerName;
        this.buyerEmail = buyerEmail;
        this.sellerId = sellerId;
        this.bookingDate = bookingDate != null ? bookingDate : LocalDate.now();
        this.reservationFee = reservationFee;
        this.status = status != null ? status : BookingStatus.PENDING_APPROVAL;
        this.notes = notes;
        this.paymentStatus = paymentStatus != null ? paymentStatus : "UNPAID";
    }

    public Booking(String id, LocalDateTime createdAt, LocalDateTime updatedAt, String propertyId,
                   String propertyTitle, String buyerId, String buyerName, String buyerEmail,
                   String sellerId, LocalDate bookingDate, BigDecimal reservationFee,
                   BookingStatus status, String notes) {
        this(id, createdAt, updatedAt, propertyId, propertyTitle, buyerId, buyerName, buyerEmail, sellerId, bookingDate, reservationFee, status, notes, "UNPAID");
    }

    public Booking(String id, LocalDateTime createdAt, LocalDateTime updatedAt, String propertyId,
                   String propertyTitle, String buyerId, String buyerName, String buyerEmail,
                   String sellerId, LocalDate bookingDate, BigDecimal reservationFee,
                   BookingStatus status, String notes, String paymentStatus) {
        super(id, createdAt, updatedAt);
        this.propertyId = propertyId;
        this.propertyTitle = propertyTitle;
        this.buyerId = buyerId;
        this.buyerName = buyerName;
        this.buyerEmail = buyerEmail;
        this.sellerId = sellerId;
        this.bookingDate = bookingDate;
        this.reservationFee = reservationFee;
        this.status = status;
        this.notes = notes;
        this.paymentStatus = paymentStatus != null ? paymentStatus : "UNPAID";
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

    public String getSellerId() {
        return sellerId;
    }

    public void setSellerId(String sellerId) {
        this.sellerId = sellerId;
    }

    public LocalDate getBookingDate() {
        return bookingDate;
    }

    public void setBookingDate(LocalDate bookingDate) {
        this.bookingDate = bookingDate;
    }

    public BigDecimal getReservationFee() {
        return reservationFee;
    }

    public void setReservationFee(BigDecimal reservationFee) {
        this.reservationFee = reservationFee;
    }

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }
}
