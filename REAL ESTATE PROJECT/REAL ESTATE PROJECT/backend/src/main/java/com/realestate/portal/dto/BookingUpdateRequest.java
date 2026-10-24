package com.realestate.portal.dto;

import java.time.LocalDate;

/**
 * DTO for updating pending booking date and notes.
 */
public class BookingUpdateRequest {

    private LocalDate bookingDate;
    private String notes;

    public BookingUpdateRequest() {
    }

    public BookingUpdateRequest(LocalDate bookingDate, String notes) {
        this.bookingDate = bookingDate;
        this.notes = notes;
    }

    public LocalDate getBookingDate() {
        return bookingDate;
    }

    public void setBookingDate(LocalDate bookingDate) {
        this.bookingDate = bookingDate;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
