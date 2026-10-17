package com.realestate.portal.service;

import com.realestate.portal.dto.DashboardStatsDto;
import com.realestate.portal.model.BookingStatus;
import com.realestate.portal.model.PaymentStatus;
import com.realestate.portal.model.PropertyStatus;
import com.realestate.portal.model.Role;
import com.realestate.portal.model.User;
import com.realestate.portal.repository.*;
import com.realestate.portal.util.PasswordEncoderUtil;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

/**
 * Admin Service Implementation - Member 5 Responsibility
 * Handles default administrator initialization and system metrics computation.
 */
@Service
public class AdminServiceImpl implements AdminService {

    @Value("${app.admin.email:admin@realestate.com}")
    private String adminEmail;

    @Value("${app.admin.password:Admin@123}")
    private String adminPassword;

    @Value("${app.admin.name:System Administrator}")
    private String adminName;

    @Value("${app.admin.phone:+94 77 000 0000}")
    private String adminPhone;

    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final InquiryRepository inquiryRepository;
    private final CategoryRepository categoryRepository;
    private final ReviewRepository reviewRepository;
    private final PasswordEncoderUtil passwordEncoder;

    public AdminServiceImpl(UserRepository userRepository,
                            @Lazy PropertyRepository propertyRepository,
                            @Lazy BookingRepository bookingRepository,
                            @Lazy PaymentRepository paymentRepository,
                            @Lazy InquiryRepository inquiryRepository,
                            @Lazy CategoryRepository categoryRepository,
                            @Lazy ReviewRepository reviewRepository,
                            PasswordEncoderUtil passwordEncoder) {
        this.userRepository = userRepository;
        this.propertyRepository = propertyRepository;
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
        this.inquiryRepository = inquiryRepository;
        this.categoryRepository = categoryRepository;
        this.reviewRepository = reviewRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostConstruct
    @Override
    public void initializeDefaultAdmin() {
        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = new User();
            admin.setName(adminName);
            admin.setEmail(adminEmail.toLowerCase().trim());
            admin.setPasswordHash(passwordEncoder.encode(adminPassword));
            admin.setPhone(adminPhone);
            admin.setRole(Role.ADMIN);
            admin.setBio("Platform System Administrator");
            admin.setActive(true);
            userRepository.save(admin);
            System.out.println("Default Administrator account initialized: " + adminEmail);
        }
    }

    @Override
    public DashboardStatsDto getDashboardStats() {
        DashboardStatsDto stats = new DashboardStatsDto();

        var users = userRepository.findAll();
        stats.setTotalUsers(users.size());
        stats.setTotalBuyers(users.stream().filter(u -> u.getRole() == Role.BUYER).count());
        stats.setTotalSellers(users.stream().filter(u -> u.getRole() == Role.SELLER).count());

        var properties = propertyRepository.findAll();
        stats.setTotalProperties(properties.size());
        stats.setTotalAvailableProperties(properties.stream().filter(p -> p.getStatus() == PropertyStatus.AVAILABLE).count());

        var bookings = bookingRepository.findAll();
        stats.setTotalBookings(bookings.size());
        stats.setTotalConfirmedBookings(bookings.stream().filter(b -> b.getStatus() == BookingStatus.CONFIRMED).count());

        var payments = paymentRepository.findAll();
        stats.setTotalPayments(payments.size());
        BigDecimal revenue = payments.stream()
                .filter(p -> p.getStatus() == PaymentStatus.COMPLETED)
                .map(p -> p.getAmount() != null ? p.getAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.setTotalRevenue(revenue);

        stats.setTotalInquiries(inquiryRepository.count());
        stats.setTotalCategories(categoryRepository.count());
        stats.setTotalReviews(reviewRepository.count());

        return stats;
    }
}
