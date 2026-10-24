package com.realestate.portal.controller;

import com.realestate.portal.dto.ApiResponse;
import com.realestate.portal.dto.DashboardStatsDto;
import com.realestate.portal.exception.UnauthorizedException;
import com.realestate.portal.service.AdminService;
import com.realestate.portal.util.UserSecurityContext;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Admin Controller - Member 5 Responsibility
 * Provides high-level dashboard metrics for the administrator portal.
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;
    private final UserSecurityContext securityContext;

    public AdminController(AdminService adminService, UserSecurityContext securityContext) {
        this.adminService = adminService;
        this.securityContext = securityContext;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getDashboardStats(HttpServletRequest request) {
        if (!securityContext.isAdmin(request)) {
            throw new UnauthorizedException("Only administrators can view platform metrics.");
        }
        DashboardStatsDto stats = adminService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }
}
