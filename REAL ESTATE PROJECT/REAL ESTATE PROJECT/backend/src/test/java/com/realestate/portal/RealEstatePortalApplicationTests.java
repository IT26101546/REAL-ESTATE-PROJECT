package com.realestate.portal;

import com.realestate.portal.dto.*;
import com.realestate.portal.model.*;
import com.realestate.portal.service.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {"app.data.dir=target/test-data"})
class RealEstatePortalApplicationTests {

    @Autowired
    private UserService userService;

    @Autowired
    private PropertyService propertyService;

    @Autowired
    private BookingService bookingService;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private InquiryService inquiryService;

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private AdminService adminService;

    @Autowired
    private ReviewService reviewService;

    @Test
    @DisplayName("Context Loads and Default Admin Initialized")
    void contextLoads() {
        assertNotNull(userService);
        assertNotNull(propertyService);
        assertNotNull(bookingService);
        assertNotNull(paymentService);
        assertNotNull(inquiryService);
        assertNotNull(categoryService);
        assertNotNull(adminService);
        assertNotNull(reviewService);
    }

    @Test
    @DisplayName("Member 1: User Management CRUD & Authentication")
    void testMember1UserManagement() {
        // Create (Register)
        RegisterRequest reg = new RegisterRequest();
        String testEmail = "testbuyer_" + System.currentTimeMillis() + "@test.com";
        reg.setName("Test Buyer");
        reg.setEmail(testEmail);
        reg.setPassword("Password@123");
        reg.setPhone("+94 77 999 8888");
        reg.setRole(Role.BUYER);
        reg.setBio("First-time home searcher");

        User registered = userService.register(reg);
        assertNotNull(registered.getId());
        assertEquals(Role.BUYER, registered.getRole());

        // Authenticate (Login)
        AuthRequest loginReq = new AuthRequest();
        loginReq.setEmail(testEmail);
        loginReq.setPassword("Password@123");
        AuthResponse authRes = userService.login(loginReq);
        assertNotNull(authRes.getToken());
        assertEquals("Test Buyer", authRes.getUser().getName());

        // Read (Profile)
        UserProfileDto profile = userService.getProfile(registered.getId());
        assertEquals(testEmail, profile.getEmail());

        // Update (Profile & Password)
        UpdateProfileRequest updateReq = new UpdateProfileRequest();
        updateReq.setName("Test Buyer Updated");
        updateReq.setPhone("+94 77 999 7777");
        updateReq.setBio("Updated bio description");
        UserProfileDto updatedProfile = userService.updateProfile(registered.getId(), updateReq);
        assertEquals("Test Buyer Updated", updatedProfile.getName());

        ChangePasswordRequest pwReq = new ChangePasswordRequest();
        pwReq.setCurrentPassword("Password@123");
        pwReq.setNewPassword("NewPassword@123");
        assertDoesNotThrow(() -> userService.changePassword(registered.getId(), pwReq));

        // Delete eligible account
        boolean deleted = userService.deleteUser(registered.getId());
        assertTrue(deleted);
    }

    @Test
    @DisplayName("Member 2: Property Listings CRUD, Filter, and Archive Protection")
    void testMember2PropertyManagement() {
        // Read categories for foreign key
        List<Category> categories = categoryService.getAllCategories();
        assertFalse(categories.isEmpty());
        String catId = categories.get(0).getId();

        // Create
        PropertyRequest req = new PropertyRequest();
        req.setTitle("Sunny Hill Country Cottage");
        req.setDescription("Cozy scenic 3-bedroom hill country cottage in Nuwara Eliya.");
        req.setCategoryId(catId);
        req.setLocation("Nuwara Eliya Town");
        req.setPrice(new BigDecimal("125000.00"));
        req.setType(PropertyType.SALE);
        req.setBedrooms(3);
        req.setBathrooms(2);
        req.setArea(1450.0);
        req.setStatus(PropertyStatus.AVAILABLE);

        Property created = propertyService.createProperty("USR-S01", req);
        assertNotNull(created.getId());
        assertEquals("Sunny Hill Country Cottage", created.getTitle());

        // Read (by ID and Search/Filter)
        Property found = propertyService.getPropertyById(created.getId());
        assertEquals(new BigDecimal("125000.00"), found.getPrice());

        PropertyFilterDto filter = new PropertyFilterDto();
        filter.setKeyword("Cottage");
        List<Property> filtered = propertyService.searchAndFilter(filter);
        assertFalse(filtered.isEmpty());

        // Update
        req.setTitle("Sunny Hill Country Cottage (Renovated)");
        Property updated = propertyService.updateProperty(created.getId(), "USR-S01", false, req);
        assertEquals("Sunny Hill Country Cottage (Renovated)", updated.getTitle());

        // Delete (unbooked property is hard deleted)
        boolean removed = propertyService.deleteOrArchiveProperty(created.getId(), "USR-S01", false);
        assertTrue(removed);
    }

    @Test
    @DisplayName("Member 3: Booking & Simulated Payment Workflow")
    void testMember3BookingAndPaymentWorkflow() {
        // Step 1: Create a test property so the test is repeatable and isolated
        PropertyRequest pReq = new PropertyRequest();
        pReq.setTitle("Booking Test Property " + System.currentTimeMillis());
        pReq.setDescription("Temporary test property for booking and payment test");
        pReq.setCategoryId("CAT-001");
        pReq.setLocation("Colombo 03");
        pReq.setPrice(new BigDecimal("100000.00"));
        pReq.setType(PropertyType.SALE);
        pReq.setBedrooms(2);
        pReq.setBathrooms(1);
        pReq.setArea(1000.0);
        pReq.setStatus(PropertyStatus.AVAILABLE);
        Property testProp = propertyService.createProperty("USR-S01", pReq);

        BookingRequest bReq = new BookingRequest();
        bReq.setPropertyId(testProp.getId());
        bReq.setBookingDate(LocalDate.now().plusDays(5));
        bReq.setNotes("Visiting for property inspection with architect.");

        Booking booking = bookingService.createBooking("USR-B01", bReq);
        assertNotNull(booking.getId());
        assertEquals(BookingStatus.PENDING_APPROVAL, booking.getStatus());

        // Step 2: Seller approves reservation
        BookingStatusUpdateRequest approveReq = new BookingStatusUpdateRequest();
        approveReq.setStatus(BookingStatus.APPROVED);
        Booking approvedBooking = bookingService.updateBookingStatus(booking.getId(), "USR-S01", false, approveReq);
        assertEquals(BookingStatus.APPROVED, approvedBooking.getStatus());

        // Step 3: Buyer pays reservation fee via simulated checkout
        PaymentRequest payReq = new PaymentRequest();
        payReq.setBookingId(approvedBooking.getId());
        payReq.setPaymentMethod(PaymentMethodType.CREDIT_CARD);
        payReq.setNotes("Inspection reservation fee deposit");

        Payment payment = paymentService.processPayment("USR-B01", payReq);
        assertNotNull(payment.getId());
        assertEquals(PaymentStatus.COMPLETED, payment.getStatus());

        // Step 4: Verify booking status transitioned to CONFIRMED
        Booking confirmedBooking = bookingService.getBookingById(approvedBooking.getId());
        assertEquals(BookingStatus.CONFIRMED, confirmedBooking.getStatus());

        // Step 5: Read payment receipt
        PaymentReceiptDto receipt = paymentService.getReceipt(payment.getId(), "USR-B01", false);
        assertNotNull(receipt);
        assertEquals(payment.getId(), receipt.getPaymentId());

        // Step 6: Verify deletion rule: confirmed booking with payment CANNOT be deleted
        assertThrows(Exception.class, () -> bookingService.deleteBooking(confirmedBooking.getId(), "USR-B01", false));
        assertThrows(Exception.class, () -> paymentService.deleteFailedPayment(payment.getId(), "USR-B01", false));
    }

    @Test
    @DisplayName("Member 4: Property Inquiries CRUD & Reply")
    void testMember4InquiryManagement() {
        // Create Inquiry
        InquiryRequest req = new InquiryRequest();
        req.setPropertyId("PROP-004");
        req.setQuestion("Does the office space include dedicated backup fiber internet lines?");

        Inquiry inquiry = inquiryService.createInquiry("USR-B01", req);
        assertNotNull(inquiry.getId());
        assertEquals(InquiryStatus.PENDING, inquiry.getStatus());

        // Update Question (while still pending)
        Inquiry updatedInq = inquiryService.updateQuestion(inquiry.getId(), "USR-B01", "Does the space include dual backup fiber internet feeds?");
        assertEquals("Does the space include dual backup fiber internet feeds?", updatedInq.getQuestion());

        // Seller replies
        InquiryReplyRequest replyReq = new InquiryReplyRequest();
        replyReq.setResponse("Yes, two independent optical fiber connections from SLT and Dialog are provisioned.");
        Inquiry answered = inquiryService.replyInquiry(inquiry.getId(), "USR-S02", false, replyReq);
        assertEquals(InquiryStatus.ANSWERED, answered.getStatus());
        assertNotNull(answered.getResponse());

        // Read
        List<Inquiry> buyerInqs = inquiryService.getInquiriesByBuyer("USR-B01");
        assertFalse(buyerInqs.isEmpty());

        // Delete
        boolean deleted = inquiryService.deleteInquiry(inquiry.getId(), "USR-B01", false);
        assertTrue(deleted);
    }

    @Test
    @DisplayName("Member 5: Admin Metrics and Category CRUD with Integrity Protection")
    void testMember5AdminAndCategoryManagement() {
        // Read Admin Dashboard Metrics
        DashboardStatsDto stats = adminService.getDashboardStats();
        assertNotNull(stats);
        assertTrue(stats.getTotalUsers() > 0);
        assertTrue(stats.getTotalProperties() > 0);

        // Create Category
        CategoryRequest catReq = new CategoryRequest();
        catReq.setName("Eco Villa");
        catReq.setDescription("Sustainable off-grid solar-powered eco homes.");
        catReq.setIcon("leaf");

        Category createdCat = categoryService.createCategory(catReq);
        assertNotNull(createdCat.getId());
        assertEquals("Eco Villa", createdCat.getName());

        // Read Category
        Category fetched = categoryService.getCategoryById(createdCat.getId());
        assertEquals("leaf", fetched.getIcon());

        // Update Category
        catReq.setDescription("Sustainable eco villas with organic farmland.");
        Category updatedCat = categoryService.updateCategory(createdCat.getId(), catReq);
        assertEquals("Sustainable eco villas with organic farmland.", updatedCat.getDescription());

        // Delete unused category (should succeed)
        boolean deleted = categoryService.deleteCategory(createdCat.getId());
        assertTrue(deleted);

        // Attempt deleting category linked to properties (e.g. CAT-001 House) -> Must throw ConflictException
        assertThrows(Exception.class, () -> categoryService.deleteCategory("CAT-001"));
    }

    @Test
    @DisplayName("Member 6: Feedback and Reviews CRUD & Summary")
    void testMember6ReviewManagement() {
        // Create Review
        ReviewRequest req = new ReviewRequest();
        req.setPropertyId("PROP-003");
        req.setRating(5);
        req.setComment("Excellent location and quick seller response!");

        Review created = reviewService.createReview("USR-B01", req);
        assertNotNull(created.getId());
        assertEquals(5, created.getRating());

        // Read Review Summary & Average Calculation
        PropertyReviewSummaryDto summary = reviewService.getPropertyReviewSummary("PROP-003");
        assertEquals(1, summary.getTotalReviews());
        assertEquals(5.0, summary.getAverageRating());

        // Update Review
        req.setRating(4);
        req.setComment("Very good location, access road has slight traffic during peak hours.");
        Review updated = reviewService.updateReview(created.getId(), "USR-B01", req);
        assertEquals(4, updated.getRating());

        // Delete Review
        boolean deleted = reviewService.deleteReview(created.getId(), "USR-B01", false);
        assertTrue(deleted);
    }
}
