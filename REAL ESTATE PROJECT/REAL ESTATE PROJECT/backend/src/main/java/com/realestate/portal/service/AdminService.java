package com.realestate.portal.service;

import com.realestate.portal.dto.DashboardStatsDto;

/**
 * Admin Service Interface - Member 5 Responsibility
 * Demonstrates OOP Abstraction.
 */
public interface AdminService {
    DashboardStatsDto getDashboardStats();
    void initializeDefaultAdmin();
}
