package com.realestate.portal.util;

import com.realestate.portal.exception.UnauthorizedException;
import com.realestate.portal.model.Role;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;

/**
 * Helper to retrieve currently authenticated user details from HTTP request context.
 */
@Component
public class UserSecurityContext {

    public String getCurrentUserId(HttpServletRequest request) {
        Object userId = request.getAttribute("currentUserId");
        if (userId == null) {
            throw new UnauthorizedException("Authentication token is missing or invalid. Please sign in.");
        }
        return userId.toString();
    }

    public Role getCurrentUserRole(HttpServletRequest request) {
        Object roleStr = request.getAttribute("currentUserRole");
        if (roleStr == null) {
            throw new UnauthorizedException("Authentication token is missing or invalid. Please sign in.");
        }
        return Role.valueOf(roleStr.toString());
    }

    public boolean isAdmin(HttpServletRequest request) {
        try {
            return getCurrentUserRole(request) == Role.ADMIN;
        } catch (Exception e) {
            return false;
        }
    }
}
