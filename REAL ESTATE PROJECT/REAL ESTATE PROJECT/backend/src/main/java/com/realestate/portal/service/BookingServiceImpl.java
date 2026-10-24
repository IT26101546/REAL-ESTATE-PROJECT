package com.realestate.portal.service;

import com.realestate.portal.dto.BookingRequest;
import com.realestate.portal.dto.BookingStatusUpdateRequest;
import com.realestate.portal.exception.BadRequestException;
import com.realestate.portal.exception.ConflictException;
import com.realestate.portal.exception.ResourceNotFoundException;
import com.realestate.portal.exception.UnauthorizedException;
import com.realestate.portal.model.*;
import com.realestate.portal.repository.BookingRepository;
import com.realestate.portal.repository.PaymentRepository;
import com.realestate.portal.repository.PropertyRepository;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

/**
 * Booking Service Implementation - Member 3 Responsibility
 * Handles property reservations, approvals, cancellations, and safe deletion.
 */
@Service
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final PropertyRepository propertyRepository;
    private final PropertyService propertyService;
    private final UserService userService;
    private final PaymentRepository paymentRepository;

    public BookingServiceImpl(BookingRepository bookingRepository,
                              @Lazy PropertyRepository propertyRepository,
                              @Lazy PropertyService propertyService,
                              @Lazy UserService userService,
                              @Lazy PaymentRepository paymentRepository) {
        this.bookingRepository = bookingRepository;
        this.propertyRepository = propertyRepository;
        this.propertyService = propertyService;
        this.userService = userService;
        this.paymentRepository = paymentRepository;
    }

    @Override
    public Booking createBooking(String buyerId, BookingRequest request) {
        User buyer = userService.getUserEntity(buyerId);
        if (buyer.getRole() != Role.BUYER && buyer.getRole() != Role.ADMIN) {
            throw new BadRequestException("Only buyers can submit property reservations.");
        }

        Property property = propertyService.getPropertyById(request.getPropertyId());
        if (property.getStatus() != PropertyStatus.AVAILABLE) {
            throw new ConflictException("Property is currently " + property.getStatus() + " and cannot be reserved.");
        }

        // Prevent conflicting active reservations
        boolean hasConflict = bookingRepository.findAll().stream()
                .anyMatch(b -> request.getPropertyId().equals(b.getPropertyId())
                        && b.getStatus() != BookingStatus.CANCELLED
                        && b.getStatus() != BookingStatus.REJECTED);

        if (hasConflict) {
            throw new ConflictException("A pending or confirmed reservation already exists for this property.");
        }

        // Calculate reservation deposit fee (2% of property price, minimum 250.00)
        BigDecimal calculatedFee = property.getPrice().multiply(BigDecimal.valueOf(0.02)).setScale(2, RoundingMode.HALF_UP);
        if (calculatedFee.compareTo(BigDecimal.valueOf(250.00)) < 0) {
            calculatedFee = BigDecimal.valueOf(250.00);
        }

        Booking booking = new Booking();
        booking.setPropertyId(property.getId());
        booking.setPropertyTitle(property.getTitle());
        booking.setBuyerId(buyer.getId());
        booking.setBuyerName(buyer.getName());
        booking.setBuyerEmail(buyer.getEmail());
        booking.setSellerId(property.getSellerId());
        booking.setBookingDate(request.getBookingDate());
        booking.setReservationFee(calculatedFee);
        booking.setStatus(BookingStatus.PENDING_APPROVAL);
        booking.setPaymentStatus("UNPAID");
        booking.setNotes(request.getNotes() != null ? request.getNotes().trim() : "");

        Booking savedBooking = bookingRepository.save(booking);

        // Immediately reserve only its selected property
        property.setStatus(PropertyStatus.RESERVED);
        propertyRepository.save(property);

        return savedBooking;
    }

    @Override
    public List<Booking> getBookingsByBuyer(String buyerId) {
        return bookingRepository.findByBuyerId(buyerId);
    }

    @Override
    public List<Booking> getBookingsBySeller(String sellerId) {
        return bookingRepository.findBySellerId(sellerId);
    }

    @Override
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    @Override
    public Booking getBookingById(String bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));
    }

    @Override
    public Booking updateBookingStatus(String bookingId, String userId, boolean isAdmin, BookingStatusUpdateRequest request) {
        Booking booking = getBookingById(bookingId);

        // Seller approval or rejection (for any legacy bookings or explicit updates)
        if (request.getStatus() == BookingStatus.APPROVED || request.getStatus() == BookingStatus.REJECTED) {
            if (!booking.getSellerId().equals(userId) && !isAdmin) {
                throw new UnauthorizedException("Only the listing seller or an admin can approve/reject this booking.");
            }
            booking.setStatus(request.getStatus());
            Booking saved = bookingRepository.save(booking);
            if (request.getStatus() == BookingStatus.REJECTED) {
                releasePropertyReservationIfNoActiveBookings(booking.getPropertyId());
            }
            return saved;
        }

        // Cancellation
        if (request.getStatus() == BookingStatus.CANCELLED) {
            return performCancel(booking, userId, isAdmin);
        }

        throw new BadRequestException("Invalid status transition: " + request.getStatus());
    }

    @Override
    public Booking updateBookingDetails(String bookingId, String buyerId, boolean isAdmin, com.realestate.portal.dto.BookingUpdateRequest request) {
        Booking booking = getBookingById(bookingId);
        if (!booking.getBuyerId().equals(buyerId) && !isAdmin) {
            throw new UnauthorizedException("You are only allowed to edit your own booking requests.");
        }
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Cancelled bookings cannot be modified.");
        }
        if (request.getBookingDate() != null) {
            booking.setBookingDate(request.getBookingDate());
        }
        if (request.getNotes() != null) {
            booking.setNotes(request.getNotes().trim());
        }
        return bookingRepository.save(booking);
    }

    @Override
    public boolean cancelBooking(String bookingId, String buyerId) {
        Booking booking = getBookingById(bookingId);
        performCancel(booking, buyerId, false);
        return true;
    }

    private Booking performCancel(Booking booking, String userId, boolean isAdmin) {
        if (!booking.getBuyerId().equals(userId) && !booking.getSellerId().equals(userId) && !isAdmin) {
            throw new UnauthorizedException("You are not authorized to cancel this booking.");
        }
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Booking is already cancelled.");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        if ("PAID".equalsIgnoreCase(booking.getPaymentStatus())) {
            // Require refund review; do not claim money has been refunded
            booking.setPaymentStatus("REFUND_REVIEW");
        } else {
            booking.setPaymentStatus("CANCELLED");
        }

        Booking saved = bookingRepository.save(booking);

        // Release property reservation back to AVAILABLE when no other valid active reservation exists
        releasePropertyReservationIfNoActiveBookings(booking.getPropertyId());

        return saved;
    }

    private void releasePropertyReservationIfNoActiveBookings(String propertyId) {
        if (propertyId == null || propertyId.isBlank()) {
            return;
        }
        propertyRepository.findById(propertyId).ifPresent(prop -> {
            // Preserve genuinely sold, rented, or archived statuses
            if (prop.getStatus() == PropertyStatus.SOLD
                    || prop.getStatus() == PropertyStatus.RENTED
                    || prop.getStatus() == PropertyStatus.ARCHIVED) {
                return;
            }

            boolean hasOtherActiveReservation = bookingRepository.findAll().stream()
                    .anyMatch(b -> propertyId.equals(b.getPropertyId())
                            && b.getStatus() != BookingStatus.CANCELLED
                            && b.getStatus() != BookingStatus.REJECTED);

            if (!hasOtherActiveReservation) {
                prop.setStatus(PropertyStatus.AVAILABLE);
                propertyRepository.save(prop);
            }
        });
    }

    @Override
    public boolean deleteBooking(String bookingId, String userId, boolean isAdmin) {
        Booking booking = getBookingById(bookingId);
        if (!booking.getBuyerId().equals(userId) && !booking.getSellerId().equals(userId) && !isAdmin) {
            throw new UnauthorizedException("You are not authorized to delete this booking.");
        }

        // Rule: Delete eligible cancelled/rejected bookings without successful payments.
        // Retain successful payment records and their linked bookings.
        if (booking.getStatus() != BookingStatus.CANCELLED && booking.getStatus() != BookingStatus.REJECTED) {
            throw new BadRequestException("Only CANCELLED or REJECTED bookings without payments can be deleted.");
        }

        boolean hasProtectedPayment = paymentRepository.findAll().stream()
                .anyMatch(p -> bookingId.equals(p.getBookingId())
                        && (p.getStatus() == PaymentStatus.COMPLETED || p.getStatus() == PaymentStatus.PENDING_COLLECTION));

        if (hasProtectedPayment) {
            throw new ConflictException("Cannot delete booking linked to successful financial payments or pending cash collections.");
        }

        boolean deleted = bookingRepository.deleteById(bookingId);
        if (deleted) {
            releasePropertyReservationIfNoActiveBookings(booking.getPropertyId());
        }
        return deleted;
    }
}
