package com.realestate.portal.dto;

import jakarta.validation.constraints.NotBlank;

public class InquiryRequest {
    @NotBlank(message = "Property ID is required")
    private String propertyId;

    @NotBlank(message = "Question cannot be blank")
    private String question;

    public String getPropertyId() {
        return propertyId;
    }

    public void setPropertyId(String propertyId) {
        this.propertyId = propertyId;
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }
}
