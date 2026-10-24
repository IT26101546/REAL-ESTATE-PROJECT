package com.realestate.portal.repository;

import com.realestate.portal.model.Payment;
import com.realestate.portal.model.PaymentMethodType;
import com.realestate.portal.model.PaymentStatus;
import com.realestate.portal.util.FileTextUtil;
import com.realestate.portal.util.IdGenerator;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Payment Repository - Member 3 Responsibility
 * Handles text-file persistence for simulated payments in data/payments.txt
 */
@Repository
public class PaymentRepository extends AbstractFileRepository<Payment> {

    public PaymentRepository() {
        super("payments.txt");
    }

    @Override
    protected String generateId() {
        return IdGenerator.nextId("PAY");
    }

    @Override
    protected String serialize(Payment p) {
        return String.join("|",
                FileTextUtil.escape(p.getId()),
                FileTextUtil.escape(p.getBookingId()),
                FileTextUtil.escape(p.getPropertyId()),
                FileTextUtil.escape(p.getBuyerId()),
                p.getAmount() != null ? p.getAmount().toString() : "0.00",
                p.getPaymentMethod() != null ? p.getPaymentMethod().name() : PaymentMethodType.CREDIT_CARD.name(),
                FileTextUtil.escape(p.getTransactionRef()),
                p.getStatus() != null ? p.getStatus().name() : PaymentStatus.PENDING.name(),
                FileTextUtil.escape(p.getPaymentDate() != null ? p.getPaymentDate().toString() : ""),
                FileTextUtil.escape(p.getNotes()),
                FileTextUtil.escape(p.getCreatedAt() != null ? p.getCreatedAt().toString() : ""),
                FileTextUtil.escape(p.getUpdatedAt() != null ? p.getUpdatedAt().toString() : "")
        );
    }

    @Override
    protected Payment deserialize(String line) {
        String[] parts = line.split("\\|", -1);
        if (parts.length < 10) {
            return null;
        }
        String id = FileTextUtil.unescape(parts[0]);
        String bookingId = FileTextUtil.unescape(parts[1]);
        String propertyId = FileTextUtil.unescape(parts[2]);
        String buyerId = FileTextUtil.unescape(parts[3]);
        BigDecimal amount = new BigDecimal(parts[4]);
        PaymentMethodType paymentMethod = PaymentMethodType.valueOf(parts[5]);
        String transactionRef = FileTextUtil.unescape(parts[6]);
        PaymentStatus status = PaymentStatus.valueOf(parts[7]);
        LocalDateTime paymentDate = parts[8].isBlank() ? LocalDateTime.now() : LocalDateTime.parse(parts[8]);
        String notes = FileTextUtil.unescape(parts[9]);

        LocalDateTime createdAt = (parts.length > 10 && !parts[10].isBlank())
                ? LocalDateTime.parse(FileTextUtil.unescape(parts[10]))
                : LocalDateTime.now();
        LocalDateTime updatedAt = (parts.length > 11 && !parts[11].isBlank())
                ? LocalDateTime.parse(FileTextUtil.unescape(parts[11]))
                : LocalDateTime.now();

        return new Payment(id, createdAt, updatedAt, bookingId, propertyId, buyerId,
                amount, paymentMethod, transactionRef, status, paymentDate, notes);
    }

    public List<Payment> findByBuyerId(String buyerId) {
        return findAll().stream()
                .filter(p -> buyerId.equals(p.getBuyerId()))
                .collect(Collectors.toList());
    }

    public Optional<Payment> findByBookingId(String bookingId) {
        return findAll().stream()
                .filter(p -> bookingId.equals(p.getBookingId()))
                .findFirst();
    }

    public List<Payment> findByPropertyId(String propertyId) {
        return findAll().stream()
                .filter(p -> propertyId.equals(p.getPropertyId()))
                .collect(Collectors.toList());
    }
}
