package com.realestate.portal.service;

import com.realestate.portal.dto.InquiryReplyRequest;
import com.realestate.portal.dto.InquiryRequest;
import com.realestate.portal.model.Inquiry;

import java.util.List;

/**
 * Inquiry Service Interface - Member 4 Responsibility
 * Demonstrates OOP Abstraction.
 */
public interface InquiryService {
    List<Inquiry> getAllInquiries();
    Inquiry createInquiry(String buyerId, InquiryRequest request);
    List<Inquiry> getInquiriesByBuyer(String buyerId);
    List<Inquiry> getInquiriesBySeller(String sellerId);
    List<Inquiry> getInquiriesByProperty(String propertyId);
    Inquiry getInquiryById(String inquiryId);
    Inquiry updateQuestion(String inquiryId, String buyerId, String newQuestion);
    Inquiry replyInquiry(String inquiryId, String sellerId, boolean isAdmin, InquiryReplyRequest request);
    boolean deleteInquiry(String inquiryId, String buyerId, boolean isAdmin);
}
