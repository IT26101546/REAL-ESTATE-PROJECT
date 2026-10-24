package com.realestate.portal.repository;

import com.realestate.portal.model.Review;
import com.realestate.portal.util.FileTextUtil;
import com.realestate.portal.util.IdGenerator;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Review Repository - Member 6 Responsibility
 * Handles text-file persistence for property reviews in data/reviews.txt
 */
@Repository
public class ReviewRepository extends AbstractFileRepository<Review> {

    public ReviewRepository() {
        super("reviews.txt");
    }

    @Override
    protected String generateId() {
        return IdGenerator.nextId("REV");
    }

    @Override
    protected String serialize(Review r) {
        return String.join("|",
                FileTextUtil.escape(r.getId()),
                FileTextUtil.escape(r.getPropertyId()),
                FileTextUtil.escape(r.getUserId()),
                FileTextUtil.escape(r.getUserName()),
                String.valueOf(r.getRating()),
                FileTextUtil.escape(r.getComment()),
                FileTextUtil.escape(r.getCreatedAt() != null ? r.getCreatedAt().toString() : ""),
                FileTextUtil.escape(r.getUpdatedAt() != null ? r.getUpdatedAt().toString() : "")
        );
    }

    @Override
    protected Review deserialize(String line) {
        String[] parts = line.split("\\|", -1);
        if (parts.length < 6) {
            return null;
        }
        String id = FileTextUtil.unescape(parts[0]);
        String propertyId = FileTextUtil.unescape(parts[1]);
        String userId = FileTextUtil.unescape(parts[2]);
        String userName = FileTextUtil.unescape(parts[3]);
        int rating = Integer.parseInt(parts[4]);
        String comment = FileTextUtil.unescape(parts[5]);

        LocalDateTime createdAt = (parts.length > 6 && !parts[6].isBlank())
                ? LocalDateTime.parse(FileTextUtil.unescape(parts[6]))
                : LocalDateTime.now();
        LocalDateTime updatedAt = (parts.length > 7 && !parts[7].isBlank())
                ? LocalDateTime.parse(FileTextUtil.unescape(parts[7]))
                : LocalDateTime.now();

        return new Review(id, createdAt, updatedAt, propertyId, userId, userName, rating, comment);
    }

    public List<Review> findByPropertyId(String propertyId) {
        return findAll().stream()
                .filter(r -> propertyId.equals(r.getPropertyId()))
                .collect(Collectors.toList());
    }

    public List<Review> findByUserId(String userId) {
        return findAll().stream()
                .filter(r -> userId.equals(r.getUserId()))
                .collect(Collectors.toList());
    }
}
