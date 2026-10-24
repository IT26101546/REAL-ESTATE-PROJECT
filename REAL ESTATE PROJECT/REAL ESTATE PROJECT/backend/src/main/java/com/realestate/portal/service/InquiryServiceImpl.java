package com.realestate.portal.service;

import com.realestate.portal.dto.InquiryReplyRequest;
import com.realestate.portal.dto.InquiryRequest;
import com.realestate.portal.exception.BadRequestException;
import com.realestate.portal.exception.ResourceNotFoundException;
import com.realestate.portal.exception.UnauthorizedException;
import com.realestate.portal.model.Inquiry;
import com.realestate.portal.model.InquiryStatus;
import com.realestate.portal.model.Property;
import com.realestate.portal.model.User;
import com.realestate.portal.repository.InquiryRepository;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Inquiry Service Implementation - Member 4 Responsibility
 * Handles buyer inquiries, seller responses, and question editing.
 */
@Service
public class InquiryServiceImpl implements InquiryService {

    private final InquiryRepository inquiryRepository;
    private final PropertyService propertyService;
    private final UserService userService;

    public InquiryServiceImpl(InquiryRepository inquiryRepository,
                              @Lazy PropertyService propertyService,
                              @Lazy UserService userService) {
        this.inquiryRepository = inquiryRepository;
        this.propertyService = propertyService;
        this.userService = userService;
    }

    @Override
    public Inquiry createInquiry(String buyerId, InquiryRequest request) {
        User buyer = userService.getUserEntity(buyerId);
        Property property = propertyService.getPropertyById(request.getPropertyId());

        Inquiry inquiry = new Inquiry();
        inquiry.setPropertyId(property.getId());
        inquiry.setPropertyTitle(property.getTitle());
        inquiry.setBuyerId(buyer.getId());
        inquiry.setBuyerName(buyer.getName());
        inquiry.setBuyerEmail(buyer.getEmail());
        inquiry.setSellerId(property.getSellerId());
        inquiry.setQuestion(request.getQuestion().trim());
        inquiry.setStatus(InquiryStatus.PENDING);

        // Note: An inquiry does NOT reserve a property.
        return inquiryRepository.save(inquiry);
    }

    @Override
    public List<Inquiry> getAllInquiries() {
        return inquiryRepository.findAll();
    }

    @Override
    public List<Inquiry> getInquiriesByBuyer(String buyerId) {
        return inquiryRepository.findByBuyerId(buyerId);
    }

    @Override
    public List<Inquiry> getInquiriesBySeller(String sellerId) {
        return inquiryRepository.findBySellerId(sellerId);
    }

    @Override
    public List<Inquiry> getInquiriesByProperty(String propertyId) {
        return inquiryRepository.findByPropertyId(propertyId);
    }

    @Override
    public Inquiry getInquiryById(String inquiryId) {
        return inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new ResourceNotFoundException("Inquiry not found with id: " + inquiryId));
    }

    @Override
    public Inquiry updateQuestion(String inquiryId, String buyerId, String newQuestion) {
        Inquiry inquiry = getInquiryById(inquiryId);
        if (!inquiry.getBuyerId().equals(buyerId)) {
            throw new UnauthorizedException("You can only edit questions on your own inquiries.");
        }
        if (inquiry.getStatus() == InquiryStatus.ANSWERED) {
            throw new BadRequestException("Cannot edit inquiry after the seller has provided an answer.");
        }
        inquiry.setQuestion(newQuestion.trim());
        return inquiryRepository.save(inquiry);
    }

    @Override
    public Inquiry replyInquiry(String inquiryId, String sellerId, boolean isAdmin, InquiryReplyRequest request) {
        Inquiry inquiry = getInquiryById(inquiryId);
        if (!inquiry.getSellerId().equals(sellerId) && !isAdmin) {
            throw new UnauthorizedException("Only the listing seller can respond to this inquiry.");
        }
        inquiry.setResponse(request.getResponse().trim());
        inquiry.setStatus(InquiryStatus.ANSWERED);
        inquiry.setAnsweredAt(LocalDateTime.now());
        return inquiryRepository.save(inquiry);
    }

    @Override
    public boolean deleteInquiry(String inquiryId, String buyerId, boolean isAdmin) {
        Inquiry inquiry = getInquiryById(inquiryId);
        if (!inquiry.getBuyerId().equals(buyerId) && !isAdmin) {
            throw new UnauthorizedException("Only the buyer who asked this question can delete it.");
        }
        return inquiryRepository.deleteById(inquiryId);
    }
}
