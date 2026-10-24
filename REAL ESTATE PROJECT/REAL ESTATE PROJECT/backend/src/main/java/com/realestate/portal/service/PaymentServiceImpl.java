package com.realestate.portal.service;

import com.realestate.portal.dto.PaymentReceiptDto;
import com.realestate.portal.dto.PaymentRequest;
import com.realestate.portal.exception.BadRequestException;
import com.realestate.portal.exception.ConflictException;
import com.realestate.portal.exception.ResourceNotFoundException;
import com.realestate.portal.exception.UnauthorizedException;
import com.realestate.portal.model.*;
import com.realestate.portal.repository.BookingRepository;
import com.realestate.portal.repository.PaymentRepository;
import com.realestate.portal.repository.PropertyRepository;
import com.realestate.portal.service.payment.PaymentProcessor;
import com.realestate.portal.util.IdGenerator;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Payment Service Implementation - Member 3 Responsibility
 * Handles simulated reservation payments, confirmation transitions, and receipts.
 * Demonstrates:
 * - Polymorphism via PaymentProcessor strategy injection
 * - Referential and transactional integrity
 */
@Service
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final PropertyRepository propertyRepository;
    private final UserService userService;
    private final List<PaymentProcessor> paymentProcessors;

    public PaymentServiceImpl(PaymentRepository paymentRepository,
                              BookingRepository bookingRepository,
                              @Lazy PropertyRepository propertyRepository,
                              @Lazy UserService userService,
                              List<PaymentProcessor> paymentProcessors) {
        this.paymentRepository = paymentRepository;
        this.bookingRepository = bookingRepository;
        this.propertyRepository = propertyRepository;
        this.userService = userService;
        this.paymentProcessors = paymentProcessors;
    }

    @Override
    public Payment processPayment(String buyerId, PaymentRequest request) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + request.getBookingId()));

        if (!booking.getBuyerId().equals(buyerId)) {
            throw new UnauthorizedException("You can only pay for your own bookings.");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Cannot make payments for cancelled bookings.");
        }

        if ("PAID".equalsIgnoreCase(booking.getPaymentStatus())) {
            throw new ConflictException("This booking has already been paid for.");
        }

        // Prevent duplicate successful payment
        Optional<Payment> existingSuccess = paymentRepository.findByBookingId(booking.getId())
                .filter(p -> p.getStatus() == PaymentStatus.COMPLETED);
        if (existingSuccess.isPresent()) {
            throw new ConflictException("A successful payment has already been recorded for this booking.");
        }

        // Handle CASH payment flow
        if (request.getPaymentMethod() == PaymentMethodType.CASH) {
            Optional<Payment> existingPendingCash = paymentRepository.findByBookingId(booking.getId())
                    .filter(p -> p.getStatus() == PaymentStatus.PENDING_COLLECTION);
            if (existingPendingCash.isPresent()) {
                return existingPendingCash.get();
            }

            Payment payment = new Payment();
            payment.setBookingId(booking.getId());
            payment.setPropertyId(booking.getPropertyId());
            payment.setBuyerId(buyerId);
            payment.setAmount(booking.getReservationFee());
            payment.setPaymentMethod(PaymentMethodType.CASH);
            payment.setTransactionRef(IdGenerator.nextId("CSH"));
            payment.setPaymentDate(LocalDateTime.now());
            payment.setStatus(PaymentStatus.PENDING_COLLECTION);
            payment.setNotes(request.getNotes() != null && !request.getNotes().isBlank()
                    ? request.getNotes().trim()
                    : "Cash payment selected. Due for in-person settlement at agency office.");
            payment = paymentRepository.save(payment);

            booking.setPaymentStatus("PENDING_COLLECTION");
            bookingRepository.save(booking);

            return payment;
        }

        // Polymorphic strategy execution for card and digital payments
        PaymentProcessor processor = paymentProcessors.stream()
                .filter(p -> p.getSupportedMethod() == request.getPaymentMethod())
                .findFirst()
                .orElse(paymentProcessors.get(0)); // default fallback strategy

        boolean processed = processor.processPayment(booking.getReservationFee(), "Booking:" + booking.getId());

        Payment payment = new Payment();
        payment.setBookingId(booking.getId());
        payment.setPropertyId(booking.getPropertyId());
        payment.setBuyerId(buyerId);
        payment.setAmount(booking.getReservationFee());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setTransactionRef(IdGenerator.nextId("TXN"));
        payment.setPaymentDate(LocalDateTime.now());
        payment.setNotes(request.getNotes() != null ? request.getNotes() : "Reservation fee payment");

        if (processed) {
            payment.setStatus(PaymentStatus.COMPLETED);
            payment = paymentRepository.save(payment);

            // Transition booking to CONFIRMED and PAID
            booking.setStatus(BookingStatus.CONFIRMED);
            booking.setPaymentStatus("PAID");
            bookingRepository.save(booking);

            // Ensure property status is RESERVED
            propertyRepository.findById(booking.getPropertyId()).ifPresent(prop -> {
                prop.setStatus(PropertyStatus.RESERVED);
                propertyRepository.save(prop);
            });
        } else {
            payment.setStatus(PaymentStatus.FAILED);
            payment = paymentRepository.save(payment);
            throw new BadRequestException("Simulated payment failed. Please try an alternative payment method.");
        }

        return payment;
    }

    @Override
    public List<Payment> getPaymentsByBuyer(String buyerId) {
        return paymentRepository.findByBuyerId(buyerId);
    }

    @Override
    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    @Override
    public Payment getPaymentById(String paymentId) {
        return paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + paymentId));
    }

    @Override
    public PaymentReceiptDto getReceipt(String paymentId, String userId, boolean isAdmin) {
        Payment payment = getPaymentById(paymentId);
        Booking booking = bookingRepository.findById(payment.getBookingId()).orElse(null);

        if (!isAdmin && !payment.getBuyerId().equals(userId)) {
            if (booking == null || !booking.getSellerId().equals(userId)) {
                throw new UnauthorizedException("You are not authorized to view this receipt.");
            }
        }

        String propTitle = booking != null ? booking.getPropertyTitle() : "Property #" + payment.getPropertyId();
        String buyerName = booking != null ? booking.getBuyerName() : "Buyer";
        String buyerEmail = booking != null ? booking.getBuyerEmail() : "N/A";

        return new PaymentReceiptDto(payment, propTitle, buyerName, buyerEmail);
    }

    @Override
    public Payment updatePayment(String paymentId, String userId, boolean isAdmin, com.realestate.portal.dto.PaymentUpdateRequest request) {
        Payment payment = getPaymentById(paymentId);
        if (!isAdmin && !payment.getBuyerId().equals(userId)) {
            throw new UnauthorizedException("You are not authorized to update this payment record.");
        }
        if (payment.getStatus() != PaymentStatus.PENDING && payment.getStatus() != PaymentStatus.PENDING_COLLECTION) {
            throw new BadRequestException("Only pending payment records can be updated. Completed transactions are permanent.");
        }
        if (request.getPaymentMethod() != null) {
            payment.setPaymentMethod(request.getPaymentMethod());
        }
        if (request.getNotes() != null) {
            payment.setNotes(request.getNotes().trim());
        }
        return paymentRepository.save(payment);
    }

    @Override
    public Payment confirmCashPayment(String paymentId, String adminUserId) {
        Payment payment = getPaymentById(paymentId);
        if (payment.getStatus() != PaymentStatus.PENDING_COLLECTION) {
            throw new BadRequestException("Only payments with status PENDING_COLLECTION can be confirmed. Current status: " + payment.getStatus());
        }

        payment.setStatus(PaymentStatus.COMPLETED);
        String notesSuffix = "Cash confirmed received by admin " + adminUserId;
        payment.setNotes(payment.getNotes() != null && !payment.getNotes().isBlank()
                ? payment.getNotes() + " | " + notesSuffix
                : notesSuffix);
        payment.setPaymentDate(LocalDateTime.now());
        payment = paymentRepository.save(payment);

        Booking booking = bookingRepository.findById(payment.getBookingId()).orElse(null);
        if (booking != null) {
            booking.setStatus(BookingStatus.CONFIRMED);
            booking.setPaymentStatus("PAID");
            bookingRepository.save(booking);

            propertyRepository.findById(booking.getPropertyId()).ifPresent(prop -> {
                prop.setStatus(PropertyStatus.RESERVED);
                propertyRepository.save(prop);
            });
        }

        return payment;
    }

    @Override
    public boolean deleteFailedPayment(String paymentId, String userId, boolean isAdmin) {
        Payment payment = getPaymentById(paymentId);

        if (!isAdmin && !payment.getBuyerId().equals(userId)) {
            throw new UnauthorizedException("You are not authorized to delete this payment record.");
        }

        // Rule: Delete failed payment attempts. Retain successful payment records.
        if (payment.getStatus() == PaymentStatus.COMPLETED || payment.getStatus() == PaymentStatus.PENDING_COLLECTION) {
            throw new ConflictException("Successful or pending collection payment records cannot be deleted.");
        }

        return paymentRepository.deleteById(paymentId);
    }
}
