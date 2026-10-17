package com.realestate.portal.dto;

import jakarta.validation.constraints.NotBlank;

public class InquiryReplyRequest {
    @NotBlank(message = "Response cannot be blank")
    private String response;

    public String getResponse() {
        return response;
    }

    public void setResponse(String response) {
        this.response = response;
    }
}
