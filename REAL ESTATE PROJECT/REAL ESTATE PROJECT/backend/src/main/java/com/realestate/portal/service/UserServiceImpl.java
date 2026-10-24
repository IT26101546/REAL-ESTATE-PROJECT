package com.realestate.portal.service;

import com.realestate.portal.dto.*;
import com.realestate.portal.exception.BadRequestException;
import com.realestate.portal.exception.ConflictException;
import com.realestate.portal.exception.ResourceNotFoundException;
import com.realestate.portal.exception.UnauthorizedException;
import com.realestate.portal.model.*;
import com.realestate.portal.repository.BookingRepository;
import com.realestate.portal.repository.PaymentRepository;
import com.realestate.portal.repository.UserRepository;
import com.realestate.portal.util.JwtUtil;
import com.realestate.portal.util.PasswordEncoderUtil;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * User Service Implementation - Member 1 Responsibility
 * Handles registration, authentication, profile management, and safe deletion.
 */
@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final PasswordEncoderUtil passwordEncoder;
    private final JwtUtil jwtUtil;

    public UserServiceImpl(UserRepository userRepository,
                           @Lazy BookingRepository bookingRepository,
                           @Lazy PaymentRepository paymentRepository,
                           PasswordEncoderUtil passwordEncoder,
                           JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public User register(RegisterRequest request) {
        if (request.getRole() == Role.ADMIN) {
            throw new BadRequestException("Public registration cannot grant ADMIN access.");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email already registered: " + request.getEmail());
        }

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone() != null ? request.getPhone().trim() : "");
        user.setRole(request.getRole());
        user.setBio(request.getBio() != null ? request.getBio().trim() : "");
        user.setActive(true);

        return userRepository.save(user);
    }

    @Override
    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password."));

        if (!user.isActive()) {
            throw new UnauthorizedException("Account is deactivated.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password.");
        }

        String token = jwtUtil.generateToken(user);
        UserProfileDto profile = UserProfileDto.fromEntity(user);
        return new AuthResponse(token, profile);
    }

    @Override
    public UserProfileDto getProfile(String userId) {
        User user = getUserEntity(userId);
        return UserProfileDto.fromEntity(user);
    }

    @Override
    public List<UserProfileDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserProfileDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public UserProfileDto updateProfile(String userId, UpdateProfileRequest request) {
        User user = getUserEntity(userId);
        user.setName(request.getName().trim());
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone().trim());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio().trim());
        }
        User updated = userRepository.save(user);
        return UserProfileDto.fromEntity(updated);
    }

    @Override
    public void changePassword(String userId, ChangePasswordRequest request) {
        User user = getUserEntity(userId);
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password does not match.");
        }
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    public boolean deleteUser(String userId) {
        User user = getUserEntity(userId);
        if (user.getRole() == Role.ADMIN) {
            throw new BadRequestException("Default system administrator account cannot be deleted.");
        }

        // Referential integrity check: check bookings & payments
        boolean hasActiveBookings = bookingRepository.findAll().stream()
                .anyMatch(b -> (userId.equals(b.getBuyerId()) || userId.equals(b.getSellerId()))
                        && (b.getStatus() == BookingStatus.PENDING_APPROVAL
                        || b.getStatus() == BookingStatus.APPROVED
                        || b.getStatus() == BookingStatus.CONFIRMED));

        if (hasActiveBookings) {
            throw new ConflictException("Cannot delete account: Account has active or confirmed property bookings.");
        }

        boolean hasPayments = paymentRepository.findAll().stream()
                .anyMatch(p -> userId.equals(p.getBuyerId()) && p.getStatus() == PaymentStatus.COMPLETED);

        if (hasPayments) {
            throw new ConflictException("Cannot delete account: Account has financial transaction and payment records.");
        }

        return userRepository.deleteById(userId);
    }

    @Override
    public User getUserEntity(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }
}
