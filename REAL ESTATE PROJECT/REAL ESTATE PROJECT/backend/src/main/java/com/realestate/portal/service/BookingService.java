package com.realestate.portal.service;

import com.realestate.portal.dto.BookingRequest;
import com.realestate.portal.dto.BookingStatusUpdateRequest;
import com.realestate.portal.model.Booking;

import java.util.List;

/**
 * Booking Service Interface - Member 3 Responsibility
 * Demonstrates OOP Abstraction.
 */
public interface BookingService {
    Booking createBooking(String buyerId, BookingRequest request);
    List<Booking> getBookingsByBuyer(String buyerId);
    List<Booking> getBookingsBySeller(String sellerId);
    List<Booking> getAllBookings();
    Booking getBookingById(String bookingId);
    Booking updateBookingStatus(String bookingId, String userId, boolean isAdmin, BookingStatusUpdateRequest request);
    Booking updateBookingDetails(String bookingId, String buyerId, boolean isAdmin, com.realestate.portal.dto.BookingUpdateRequest request);
    boolean cancelBooking(String bookingId, String buyerId);
    boolean deleteBooking(String bookingId, String userId, boolean isAdmin);
}

