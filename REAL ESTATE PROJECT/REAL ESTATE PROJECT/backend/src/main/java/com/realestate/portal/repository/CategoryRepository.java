package com.realestate.portal.repository;

import com.realestate.portal.model.Category;
import com.realestate.portal.util.FileTextUtil;
import com.realestate.portal.util.IdGenerator;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Category Repository - Member 5 Responsibility
 * Handles text-file persistence for property categories in data/categories.txt
 */
@Repository
public class CategoryRepository extends AbstractFileRepository<Category> {

    public CategoryRepository() {
        super("categories.txt");
    }

    @Override
    protected String generateId() {
        return IdGenerator.nextId("CAT");
    }

    @Override
    protected String serialize(Category c) {
        return String.join("|",
                FileTextUtil.escape(c.getId()),
                FileTextUtil.escape(c.getName()),
                FileTextUtil.escape(c.getDescription()),
                FileTextUtil.escape(c.getIcon()),
                FileTextUtil.escape(c.getCreatedAt() != null ? c.getCreatedAt().toString() : ""),
                FileTextUtil.escape(c.getUpdatedAt() != null ? c.getUpdatedAt().toString() : "")
        );
    }

    @Override
    protected Category deserialize(String line) {
        String[] parts = line.split("\\|", -1);
        if (parts.length < 4) {
            return null;
        }
        String id = FileTextUtil.unescape(parts[0]);
        String name = FileTextUtil.unescape(parts[1]);
        String description = FileTextUtil.unescape(parts[2]);
        String icon = FileTextUtil.unescape(parts[3]);

        LocalDateTime createdAt = (parts.length > 4 && !parts[4].isBlank())
                ? LocalDateTime.parse(FileTextUtil.unescape(parts[4]))
                : LocalDateTime.now();
        LocalDateTime updatedAt = (parts.length > 5 && !parts[5].isBlank())
                ? LocalDateTime.parse(FileTextUtil.unescape(parts[5]))
                : LocalDateTime.now();

        return new Category(id, createdAt, updatedAt, name, description, icon);
    }

    public Optional<Category> findByName(String name) {
        if (name == null) return Optional.empty();
        return findAll().stream()
                .filter(c -> name.equalsIgnoreCase(c.getName()))
                .findFirst();
    }
}
