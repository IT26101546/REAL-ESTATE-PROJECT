package com.realestate.portal.repository;

import com.realestate.portal.model.Inquiry;
import com.realestate.portal.model.InquiryStatus;
import com.realestate.portal.util.FileTextUtil;
import com.realestate.portal.util.IdGenerator;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Inquiry Repository - Member 4 Responsibility
 * Handles text-file persistence for inquiries in data/inquiries.txt
 */
@Repository
public class InquiryRepository extends AbstractFileRepository<Inquiry> {

    public InquiryRepository() {
        super("inquiries.txt");
    }

    @Override
    protected String generateId() {
        return IdGenerator.nextId("INQ");
    }

    @Override
    protected String serialize(Inquiry inq) {
        return String.join("|",
                FileTextUtil.escape(inq.getId()),
                FileTextUtil.escape(inq.getPropertyId()),
                FileTextUtil.escape(inq.getPropertyTitle()),
                FileTextUtil.escape(inq.getBuyerId()),
                FileTextUtil.escape(inq.getBuyerName()),
                FileTextUtil.escape(inq.getBuyerEmail()),
                FileTextUtil.escape(inq.getSellerId()),
                FileTextUtil.escape(inq.getQuestion()),
                FileTextUtil.escape(inq.getResponse()),
                inq.getStatus() != null ? inq.getStatus().name() : InquiryStatus.PENDING.name(),
                FileTextUtil.escape(inq.getAnsweredAt() != null ? inq.getAnsweredAt().toString() : ""),
                FileTextUtil.escape(inq.getCreatedAt() != null ? inq.getCreatedAt().toString() : ""),
                FileTextUtil.escape(inq.getUpdatedAt() != null ? inq.getUpdatedAt().toString() : "")
        );
    }

    @Override
    protected Inquiry deserialize(String line) {
        String[] parts = line.split("\\|", -1);
        if (parts.length < 10) {
            return null;
        }
        String id = FileTextUtil.unescape(parts[0]);
        String propertyId = FileTextUtil.unescape(parts[1]);
        String propertyTitle = FileTextUtil.unescape(parts[2]);
        String buyerId = FileTextUtil.unescape(parts[3]);
        String buyerName = FileTextUtil.unescape(parts[4]);
        String buyerEmail = FileTextUtil.unescape(parts[5]);
        String sellerId = FileTextUtil.unescape(parts[6]);
        String question = FileTextUtil.unescape(parts[7]);
        String response = FileTextUtil.unescape(parts[8]);
        InquiryStatus status = InquiryStatus.valueOf(parts[9]);
        LocalDateTime answeredAt = (parts.length > 10 && !parts[10].isBlank())
                ? LocalDateTime.parse(FileTextUtil.unescape(parts[10]))
                : null;
        LocalDateTime createdAt = (parts.length > 11 && !parts[11].isBlank())
                ? LocalDateTime.parse(FileTextUtil.unescape(parts[11]))
                : LocalDateTime.now();
        LocalDateTime updatedAt = (parts.length > 12 && !parts[12].isBlank())
                ? LocalDateTime.parse(FileTextUtil.unescape(parts[12]))
                : LocalDateTime.now();

        return new Inquiry(id, createdAt, updatedAt, propertyId, propertyTitle, buyerId,
                buyerName, buyerEmail, sellerId, question, response, status, answeredAt);
    }

    public List<Inquiry> findByBuyerId(String buyerId) {
        return findAll().stream()
                .filter(i -> buyerId.equals(i.getBuyerId()))
                .collect(Collectors.toList());
    }

    public List<Inquiry> findBySellerId(String sellerId) {
        return findAll().stream()
                .filter(i -> sellerId.equals(i.getSellerId()))
                .collect(Collectors.toList());
    }

    public List<Inquiry> findByPropertyId(String propertyId) {
        return findAll().stream()
                .filter(i -> propertyId.equals(i.getPropertyId()))
                .collect(Collectors.toList());
    }
}
