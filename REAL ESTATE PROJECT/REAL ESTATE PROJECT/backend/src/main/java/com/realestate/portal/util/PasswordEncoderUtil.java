package com.realestate.portal.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Utility for hashing and verifying passwords securely using BCrypt.
 * Ensures plain text passwords are never stored or exposed.
 */
@Component
public class PasswordEncoderUtil {

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public String encode(CharSequence rawPassword) {
        return encoder.encode(rawPassword);
    }

    public boolean matches(CharSequence rawPassword, String encodedPassword) {
        if (encodedPassword == null || rawPassword == null) {
            return false;
        }
        return encoder.matches(rawPassword, encodedPassword);
    }
}
