package com.realestate.portal.controller;

import com.realestate.portal.dto.ApiResponse;
import com.realestate.portal.dto.BookingRequest;
import com.realestate.portal.dto.BookingStatusUpdateRequest;
import com.realestate.portal.model.Booking;
import com.realestate.portal.service.BookingService;
import com.realestate.portal.util.UserSecurityContext;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Booking Controller - Member 3 Responsibility
 * Handles property reservations, approvals, and status tracking.
 */
@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;
    private final UserSecurityContext securityContext;

    public BookingController(BookingService bookingService, UserSecurityContext securityContext) {
        this.bookingService = bookingService;
        this.securityContext = securityContext;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Booking>> createBooking(
            HttpServletRequest request,
            @Valid @RequestBody BookingRequest bookingRequest) {
        String buyerId = securityContext.getCurrentUserId(request);
        Booking booking = bookingService.createBooking(buyerId, bookingRequest);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Property reservation requested successfully.", booking));
    }

    @GetMapping("/my-bookings")
    public ResponseEntity<ApiResponse<List<Booking>>> getMyBookings(HttpServletRequest request) {
        String buyerId = securityContext.getCurrentUserId(request);
        List<Booking> bookings = bookingService.getBookingsByBuyer(buyerId);
        return ResponseEntity.ok(ApiResponse.ok(bookings));
    }

    @GetMapping("/manage")
    public ResponseEntity<ApiResponse<List<Booking>>> getManageBookings(HttpServletRequest request) {
        String sellerId = securityContext.getCurrentUserId(request);
        List<Booking> bookings = bookingService.getBookingsBySeller(sellerId);
        return ResponseEntity.ok(ApiResponse.ok(bookings));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Booking>>> getAllBookings(HttpServletRequest request) {
        if (!securityContext.isAdmin(request)) {
            String userId = securityContext.getCurrentUserId(request);
            return ResponseEntity.ok(ApiResponse.ok(bookingService.getBookingsByBuyer(userId)));
        }
        return ResponseEntity.ok(ApiResponse.ok(bookingService.getAllBookings()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Booking>> getBookingById(@PathVariable String id) {
        Booking booking = bookingService.getBookingById(id);
        return ResponseEntity.ok(ApiResponse.ok(booking));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Booking>> updateBookingDetails(
            HttpServletRequest request,
            @PathVariable String id,
            @RequestBody com.realestate.portal.dto.BookingUpdateRequest updateRequest) {
        String userId = securityContext.getCurrentUserId(request);
        boolean isAdmin = securityContext.isAdmin(request);
        Booking updated = bookingService.updateBookingDetails(id, userId, isAdmin, updateRequest);
        return ResponseEntity.ok(ApiResponse.ok("Booking details updated successfully.", updated));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Booking>> updateStatus(
            HttpServletRequest request,
            @PathVariable String id,
            @Valid @RequestBody BookingStatusUpdateRequest statusRequest) {
        String userId = securityContext.getCurrentUserId(request);
        boolean isAdmin = securityContext.isAdmin(request);
        Booking updated = bookingService.updateBookingStatus(id, userId, isAdmin, statusRequest);
        return ResponseEntity.ok(ApiResponse.ok("Booking status updated to " + updated.getStatus(), updated));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelBooking(
            HttpServletRequest request,
            @PathVariable String id) {
        String buyerId = securityContext.getCurrentUserId(request);
        bookingService.cancelBooking(id, buyerId);
        return ResponseEntity.ok(ApiResponse.ok("Booking cancelled successfully.", null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBooking(
            HttpServletRequest request,
            @PathVariable String id) {
        String userId = securityContext.getCurrentUserId(request);
        boolean isAdmin = securityContext.isAdmin(request);
        bookingService.deleteBooking(id, userId, isAdmin);
        return ResponseEntity.ok(ApiResponse.ok("Booking record deleted successfully.", null));
    }
}
