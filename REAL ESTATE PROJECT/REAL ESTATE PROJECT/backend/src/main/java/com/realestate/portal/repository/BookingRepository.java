package com.realestate.portal.repository;

import com.realestate.portal.model.Booking;
import com.realestate.portal.model.BookingStatus;
import com.realestate.portal.util.FileTextUtil;
import com.realestate.portal.util.IdGenerator;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Booking Repository - Member 3 Responsibility
 * Handles text-file persistence for bookings in data/bookings.txt
 */
@Repository
public class BookingRepository extends AbstractFileRepository<Booking> {

    public BookingRepository() {
        super("bookings.txt");
    }

    @Override
    protected String generateId() {
        return IdGenerator.nextId("BKG");
    }

    @Override
    protected String serialize(Booking b) {
        return String.join("|",
                FileTextUtil.escape(b.getId()),
                FileTextUtil.escape(b.getPropertyId()),
                FileTextUtil.escape(b.getPropertyTitle()),
                FileTextUtil.escape(b.getBuyerId()),
                FileTextUtil.escape(b.getBuyerName()),
                FileTextUtil.escape(b.getBuyerEmail()),
                FileTextUtil.escape(b.getSellerId()),
                b.getBookingDate() != null ? b.getBookingDate().toString() : "",
                b.getReservationFee() != null ? b.getReservationFee().toString() : "0.00",
                b.getStatus() != null ? b.getStatus().name() : BookingStatus.PENDING_APPROVAL.name(),
                FileTextUtil.escape(b.getNotes()),
                FileTextUtil.escape(b.getCreatedAt() != null ? b.getCreatedAt().toString() : ""),
                FileTextUtil.escape(b.getUpdatedAt() != null ? b.getUpdatedAt().toString() : ""),
                FileTextUtil.escape(b.getPaymentStatus() != null ? b.getPaymentStatus() : "UNPAID")
        );
    }

    @Override
    protected Booking deserialize(String line) {
        String[] parts = line.split("\\|", -1);
        if (parts.length < 11) {
            return null;
        }
        String id = FileTextUtil.unescape(parts[0]);
        String propertyId = FileTextUtil.unescape(parts[1]);
        String propertyTitle = FileTextUtil.unescape(parts[2]);
        String buyerId = FileTextUtil.unescape(parts[3]);
        String buyerName = FileTextUtil.unescape(parts[4]);
        String buyerEmail = FileTextUtil.unescape(parts[5]);
        String sellerId = FileTextUtil.unescape(parts[6]);
        LocalDate bookingDate = parts[7].isBlank() ? LocalDate.now() : LocalDate.parse(parts[7]);
        BigDecimal reservationFee = new BigDecimal(parts[8]);
        BookingStatus status = BookingStatus.valueOf(parts[9]);
        String notes = FileTextUtil.unescape(parts[10]);

        LocalDateTime createdAt = (parts.length > 11 && !parts[11].isBlank())
                ? LocalDateTime.parse(FileTextUtil.unescape(parts[11]))
                : LocalDateTime.now();
        LocalDateTime updatedAt = (parts.length > 12 && !parts[12].isBlank())
                ? LocalDateTime.parse(FileTextUtil.unescape(parts[12]))
                : LocalDateTime.now();

        String paymentStatus = "UNPAID";
        if (parts.length > 13 && !parts[13].isBlank()) {
            paymentStatus = FileTextUtil.unescape(parts[13]);
        } else {
            if (status == BookingStatus.CONFIRMED) {
                paymentStatus = "PAID";
            } else if (status == BookingStatus.CANCELLED) {
                paymentStatus = "CANCELLED";
            } else {
                paymentStatus = "UNPAID";
            }
        }

        return new Booking(id, createdAt, updatedAt, propertyId, propertyTitle, buyerId,
                buyerName, buyerEmail, sellerId, bookingDate, reservationFee, status, notes, paymentStatus);
    }

    public List<Booking> findByBuyerId(String buyerId) {
        return findAll().stream()
                .filter(b -> buyerId.equals(b.getBuyerId()))
                .collect(Collectors.toList());
    }

    public List<Booking> findBySellerId(String sellerId) {
        return findAll().stream()
                .filter(b -> sellerId.equals(b.getSellerId()))
                .collect(Collectors.toList());
    }

    public List<Booking> findByPropertyId(String propertyId) {
        return findAll().stream()
                .filter(b -> propertyId.equals(b.getPropertyId()))
                .collect(Collectors.toList());
    }
}
