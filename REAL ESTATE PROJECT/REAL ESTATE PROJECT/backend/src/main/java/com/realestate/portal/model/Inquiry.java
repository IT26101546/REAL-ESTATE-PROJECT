package com.realestate.portal.model;

import java.time.LocalDateTime;

/**
 * Inquiry Entity - Member 4 Responsibility
 * Represents questions submitted by prospective buyers.
 * Extends BaseEntity (Inheritance).
 */
public class Inquiry extends BaseEntity {
    private String propertyId;
    private String propertyTitle;
    private String buyerId;
    private String buyerName;
    private String buyerEmail;
    private String sellerId;
    private String question;
    private String response;
    private InquiryStatus status;
    private LocalDateTime answeredAt;

    public Inquiry() {
        super();
        this.status = InquiryStatus.PENDING;
    }

    public Inquiry(String id, String propertyId, String propertyTitle, String buyerId,
                   String buyerName, String buyerEmail, String sellerId, String question) {
        super(id);
        this.propertyId = propertyId;
        this.propertyTitle = propertyTitle;
        this.buyerId = buyerId;
        this.buyerName = buyerName;
        this.buyerEmail = buyerEmail;
        this.sellerId = sellerId;
        this.question = question;
        this.status = InquiryStatus.PENDING;
    }

    public Inquiry(String id, LocalDateTime createdAt, LocalDateTime updatedAt, String propertyId,
                   String propertyTitle, String buyerId, String buyerName, String buyerEmail,
                   String sellerId, String question, String response, InquiryStatus status,
                   LocalDateTime answeredAt) {
        super(id, createdAt, updatedAt);
        this.propertyId = propertyId;
        this.propertyTitle = propertyTitle;
        this.buyerId = buyerId;
        this.buyerName = buyerName;
        this.buyerEmail = buyerEmail;
        this.sellerId = sellerId;
        this.question = question;
        this.response = response;
        this.status = status;
        this.answeredAt = answeredAt;
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

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public String getResponse() {
        return response;
    }

    public void setResponse(String response) {
        this.response = response;
    }

    public InquiryStatus getStatus() {
        return status;
    }

    public void setStatus(InquiryStatus status) {
        this.status = status;
    }

    public LocalDateTime getAnsweredAt() {
        return answeredAt;
    }

    public void setAnsweredAt(LocalDateTime answeredAt) {
        this.answeredAt = answeredAt;
    }
}
