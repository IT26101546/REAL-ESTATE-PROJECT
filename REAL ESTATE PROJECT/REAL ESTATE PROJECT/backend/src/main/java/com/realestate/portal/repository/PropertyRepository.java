package com.realestate.portal.repository;

import com.realestate.portal.model.Property;
import com.realestate.portal.model.PropertyStatus;
import com.realestate.portal.model.PropertyType;
import com.realestate.portal.util.FileTextUtil;
import com.realestate.portal.util.IdGenerator;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Property Repository - Member 2 Responsibility
 * Handles text-file persistence for properties in data/properties.txt
 */
@Repository
public class PropertyRepository extends AbstractFileRepository<Property> {

    public PropertyRepository() {
        super("properties.txt");
    }

    @Override
    protected String generateId() {
        return IdGenerator.nextId("PROP");
    }

    @Override
    protected String serialize(Property p) {
        return String.join("|",
                FileTextUtil.escape(p.getId()),
                FileTextUtil.escape(p.getTitle()),
                FileTextUtil.escape(p.getDescription()),
                FileTextUtil.escape(p.getCategoryId()),
                FileTextUtil.escape(p.getCategoryName()),
                FileTextUtil.escape(p.getLocation()),
                p.getPrice() != null ? p.getPrice().toString() : "0.00",
                p.getType() != null ? p.getType().name() : PropertyType.SALE.name(),
                String.valueOf(p.getBedrooms()),
                String.valueOf(p.getBathrooms()),
                String.valueOf(p.getArea()),
                FileTextUtil.escape(p.getImageUrl()),
                FileTextUtil.escape(p.getSellerId()),
                FileTextUtil.escape(p.getSellerName()),
                p.getStatus() != null ? p.getStatus().name() : PropertyStatus.AVAILABLE.name(),
                FileTextUtil.escape(p.getCreatedAt() != null ? p.getCreatedAt().toString() : ""),
                FileTextUtil.escape(p.getUpdatedAt() != null ? p.getUpdatedAt().toString() : "")
        );
    }

    @Override
    protected Property deserialize(String line) {
        String[] parts = line.split("\\|", -1);
        if (parts.length < 15) {
            return null;
        }
        String id = FileTextUtil.unescape(parts[0]);
        String title = FileTextUtil.unescape(parts[1]);
        String description = FileTextUtil.unescape(parts[2]);
        String categoryId = FileTextUtil.unescape(parts[3]);
        String categoryName = FileTextUtil.unescape(parts[4]);
        String location = FileTextUtil.unescape(parts[5]);
        BigDecimal price = new BigDecimal(parts[6]);
        PropertyType type = PropertyType.valueOf(parts[7]);
        int bedrooms = Integer.parseInt(parts[8]);
        int bathrooms = Integer.parseInt(parts[9]);
        double area = Double.parseDouble(parts[10]);
        String imageUrl = FileTextUtil.unescape(parts[11]);
        String sellerId = FileTextUtil.unescape(parts[12]);
        String sellerName = FileTextUtil.unescape(parts[13]);
        PropertyStatus status = PropertyStatus.valueOf(parts[14]);

        LocalDateTime createdAt = (parts.length > 15 && !parts[15].isBlank())
                ? LocalDateTime.parse(FileTextUtil.unescape(parts[15]))
                : LocalDateTime.now();
        LocalDateTime updatedAt = (parts.length > 16 && !parts[16].isBlank())
                ? LocalDateTime.parse(FileTextUtil.unescape(parts[16]))
                : LocalDateTime.now();

        return new Property(id, createdAt, updatedAt, title, description, categoryId, categoryName,
                location, price, type, bedrooms, bathrooms, area, imageUrl, sellerId, sellerName, status);
    }

    public List<Property> findBySellerId(String sellerId) {
        return findAll().stream()
                .filter(p -> sellerId.equals(p.getSellerId()))
                .collect(Collectors.toList());
    }

    public List<Property> findByCategoryId(String categoryId) {
        return findAll().stream()
                .filter(p -> categoryId.equals(p.getCategoryId()))
                .collect(Collectors.toList());
    }

    public List<Property> findByStatus(PropertyStatus status) {
        return findAll().stream()
                .filter(p -> p.getStatus() == status)
                .collect(Collectors.toList());
    }
}
