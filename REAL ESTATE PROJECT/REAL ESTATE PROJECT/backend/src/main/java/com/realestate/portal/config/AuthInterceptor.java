package com.realestate.portal.config;

import com.realestate.portal.util.JwtUtil;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Authentication Interceptor.
 * Extracts Bearer JWT tokens from Authorization header and injects identity into request attributes.
 */
@Component
public class AuthInterceptor implements HandlerInterceptor {

    private final JwtUtil jwtUtil;

    public AuthInterceptor(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7).trim();
            if (jwtUtil.validateToken(token)) {
                Claims claims = jwtUtil.extractAllClaims(token);
                request.setAttribute("currentUserId", claims.getSubject());
                request.setAttribute("currentUserEmail", claims.get("email"));
                request.setAttribute("currentUserRole", claims.get("role"));
                request.setAttribute("currentUserName", claims.get("name"));
            }
        }
        return true;
    }
}
