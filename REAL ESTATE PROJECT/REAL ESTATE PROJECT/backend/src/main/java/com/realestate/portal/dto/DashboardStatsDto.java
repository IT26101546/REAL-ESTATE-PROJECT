package com.realestate.portal.dto;

import java.math.BigDecimal;

public class DashboardStatsDto {
    private long totalUsers;
    private long totalBuyers;
    private long totalSellers;
    private long totalProperties;
    private long totalAvailableProperties;
    private long totalBookings;
    private long totalConfirmedBookings;
    private long totalPayments;
    private BigDecimal totalRevenue;
    private long totalInquiries;
    private long totalCategories;
    private long totalReviews;

    public DashboardStatsDto() {
        this.totalRevenue = BigDecimal.ZERO;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getTotalBuyers() {
        return totalBuyers;
    }

    public void setTotalBuyers(long totalBuyers) {
        this.totalBuyers = totalBuyers;
    }

    public long getTotalSellers() {
        return totalSellers;
    }

    public void setTotalSellers(long totalSellers) {
        this.totalSellers = totalSellers;
    }

    public long getTotalProperties() {
        return totalProperties;
    }

    public void setTotalProperties(long totalProperties) {
        this.totalProperties = totalProperties;
    }

    public long getTotalAvailableProperties() {
        return totalAvailableProperties;
    }

    public void setTotalAvailableProperties(long totalAvailableProperties) {
        this.totalAvailableProperties = totalAvailableProperties;
    }

    public long getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(long totalBookings) {
        this.totalBookings = totalBookings;
    }

    public long getTotalConfirmedBookings() {
        return totalConfirmedBookings;
    }

    public void setTotalConfirmedBookings(long totalConfirmedBookings) {
        this.totalConfirmedBookings = totalConfirmedBookings;
    }

    public long getTotalPayments() {
        return totalPayments;
    }

    public void setTotalPayments(long totalPayments) {
        this.totalPayments = totalPayments;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public long getTotalInquiries() {
        return totalInquiries;
    }

    public void setTotalInquiries(long totalInquiries) {
        this.totalInquiries = totalInquiries;
    }

    public long getTotalCategories() {
        return totalCategories;
    }

    public void setTotalCategories(long totalCategories) {
        this.totalCategories = totalCategories;
    }

    public long getTotalReviews() {
        return totalReviews;
    }

    public void setTotalReviews(long totalReviews) {
        this.totalReviews = totalReviews;
    }
}
