package com.realestate.portal.repository;

import com.realestate.portal.model.Role;
import com.realestate.portal.model.User;
import com.realestate.portal.util.FileTextUtil;
import com.realestate.portal.util.IdGenerator;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * User Repository - Member 1 Responsibility
 * Handles text-file persistence for users in data/users.txt
 * Demonstrates:
 * - Inheritance: Extends AbstractFileRepository
 * - Polymorphism: Overrides serialize, deserialize, generateId
 */
@Repository
public class UserRepository extends AbstractFileRepository<User> {

    public UserRepository() {
        super("users.txt");
    }

    @Override
    protected String generateId() {
        return IdGenerator.nextId("USR");
    }

    @Override
    protected String serialize(User user) {
        return String.join("|",
                FileTextUtil.escape(user.getId()),
                FileTextUtil.escape(user.getName()),
                FileTextUtil.escape(user.getEmail()),
                FileTextUtil.escape(user.getPasswordHash()),
                FileTextUtil.escape(user.getPhone()),
                FileTextUtil.escape(user.getRole() != null ? user.getRole().name() : Role.BUYER.name()),
                FileTextUtil.escape(user.getBio()),
                String.valueOf(user.isActive()),
                FileTextUtil.escape(user.getCreatedAt() != null ? user.getCreatedAt().toString() : ""),
                FileTextUtil.escape(user.getUpdatedAt() != null ? user.getUpdatedAt().toString() : "")
        );
    }

    @Override
    protected User deserialize(String line) {
        String[] parts = line.split("\\|", -1);
        if (parts.length < 8) {
            return null;
        }
        String id = FileTextUtil.unescape(parts[0]);
        String name = FileTextUtil.unescape(parts[1]);
        String email = FileTextUtil.unescape(parts[2]);
        String passwordHash = FileTextUtil.unescape(parts[3]);
        String phone = FileTextUtil.unescape(parts[4]);
        Role role = Role.valueOf(FileTextUtil.unescape(parts[5]));
        String bio = FileTextUtil.unescape(parts[6]);
        boolean active = Boolean.parseBoolean(parts[7]);

        LocalDateTime createdAt = (parts.length > 8 && !parts[8].isBlank())
                ? LocalDateTime.parse(FileTextUtil.unescape(parts[8]))
                : LocalDateTime.now();
        LocalDateTime updatedAt = (parts.length > 9 && !parts[9].isBlank())
                ? LocalDateTime.parse(FileTextUtil.unescape(parts[9]))
                : LocalDateTime.now();

        return new User(id, createdAt, updatedAt, name, email, passwordHash, phone, role, bio, active);
    }

    public Optional<User> findByEmail(String email) {
        if (email == null) return Optional.empty();
        return findAll().stream()
                .filter(u -> email.equalsIgnoreCase(u.getEmail()))
                .findFirst();
    }

    public boolean existsByEmail(String email) {
        return findByEmail(email).isPresent();
    }
}
