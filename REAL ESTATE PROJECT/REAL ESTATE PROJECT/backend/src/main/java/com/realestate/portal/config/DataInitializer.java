package com.realestate.portal.config;

import com.realestate.portal.model.*;
import com.realestate.portal.repository.*;
import com.realestate.portal.util.PasswordEncoderUtil;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DataInitializer seeds realistic sample data on startup if text storage files are empty.
 * Provides ready-to-test records for all 6 group members.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final PropertyRepository propertyRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final InquiryRepository inquiryRepository;
    private final ReviewRepository reviewRepository;
    private final PasswordEncoderUtil passwordEncoder;
    private final com.realestate.portal.service.AdminService adminService;

    public DataInitializer(UserRepository userRepository,
                           CategoryRepository categoryRepository,
                           PropertyRepository propertyRepository,
                           BookingRepository bookingRepository,
                           PaymentRepository paymentRepository,
                           InquiryRepository inquiryRepository,
                           ReviewRepository reviewRepository,
                           PasswordEncoderUtil passwordEncoder,
                           com.realestate.portal.service.AdminService adminService) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.propertyRepository = propertyRepository;
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
        this.inquiryRepository = inquiryRepository;
        this.reviewRepository = reviewRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminService = adminService;
    }

    @Override
    public void run(String... args) {
        adminService.initializeDefaultAdmin();
        seedCategories();
        seedUsers();
        seedProperties();
        seedBookingsAndPayments();
        seedInquiries();
        seedReviews();
        reconcileStaleReservations();
    }

    private void seedCategories() {
        if (categoryRepository.count() == 0) {
            categoryRepository.save(new Category("CAT-001", "House", "Standalone family houses, villas, and luxury residences", "home"));
            categoryRepository.save(new Category("CAT-002", "Apartment", "Modern luxury flats, studios, and high-rise condominiums", "building"));
            categoryRepository.save(new Category("CAT-003", "Land", "Residential plots, bare land, and agricultural properties", "map-pin"));
            categoryRepository.save(new Category("CAT-004", "Commercial Property", "Office buildings, retail stores, and commercial spaces", "briefcase"));
            System.out.println("Categories seeded successfully.");
        }
    }

    private void seedUsers() {
        if (userRepository.count() <= 1) { // Only admin might exist
            // Sellers
            if (!userRepository.existsByEmail("seller1@realestate.com")) {
                User s1 = new User("USR-S01", "Kamal Perera", "seller1@realestate.com",
                        passwordEncoder.encode("Seller@123"), "+94 77 111 2233", Role.SELLER,
                        "Experienced real estate broker with over 10 years experience across Greater Colombo.");
                userRepository.save(s1);
            }
            if (!userRepository.existsByEmail("seller2@realestate.com")) {
                User s2 = new User("USR-S02", "Dilshan Silva", "seller2@realestate.com",
                        passwordEncoder.encode("Seller@123"), "+94 71 444 5566", Role.SELLER,
                        "Specialized in luxury beachfront properties and prime commercial lands.");
                userRepository.save(s2);
            }

            // Buyers
            if (!userRepository.existsByEmail("buyer1@realestate.com")) {
                User b1 = new User("USR-B01", "Anura Fernando", "buyer1@realestate.com",
                        passwordEncoder.encode("Buyer@123"), "+94 76 777 8899", Role.BUYER,
                        "Looking to purchase a cozy suburban family home.");
                userRepository.save(b1);
            }
            if (!userRepository.existsByEmail("buyer2@realestate.com")) {
                User b2 = new User("USR-B02", "Nimali Jayawardena", "buyer2@realestate.com",
                        passwordEncoder.encode("Buyer@123"), "+94 70 222 3344", Role.BUYER,
                        "Active investor seeking prime rental apartments in Colombo city.");
                userRepository.save(b2);
            }
            System.out.println("Users seeded successfully.");
        }
    }

    private void seedProperties() {
        if (propertyRepository.count() >= 30) {
            return;
        }

        Property[] catalogue = new Property[] {
            new Property("PROP-001", "Luxury Modern Villa with Private Pool", "Splendid 4-bedroom contemporary villa located in a tranquil, prestigious neighborhood. Features a landscaped garden, private infinity pool, solar power system, and double garage.", "CAT-001", "House", "Colombo 07, Cinnamon Gardens", new BigDecimal("350000.00"), PropertyType.SALE, 4, 3, 3200.0, "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80", "USR-S01", "Kamal Perera", PropertyStatus.AVAILABLE),
            new Property("PROP-002", "Oceanview 2BR Luxury Apartment", "Fully furnished panoramic ocean view apartment located right on Marine Drive. Features 2 spacious bedrooms, high-speed elevator, 24/7 security, gymnasium, and rooftop infinity lounge.", "CAT-002", "Apartment", "Marine Drive, Colombo 03", new BigDecimal("1200.00"), PropertyType.RENT, 2, 2, 1150.0, "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80", "USR-S01", "Kamal Perera", PropertyStatus.AVAILABLE),
            new Property("PROP-003", "Prime 40 Perch Commercial Land Plot", "High-visibility plot directly facing the main highway. Ideal for corporate headquarters, retail showroom, or logistics hub. All utilities and road access fully cleared.", "CAT-003", "Land", "Kandy Road, Kadawatha", new BigDecimal("180000.00"), PropertyType.SALE, 0, 0, 10890.0, "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80", "USR-S02", "Dilshan Silva", PropertyStatus.AVAILABLE),
            new Property("PROP-004", "Downtown Executive Office Space", "Turnkey commercial floor plate with open workstation layouts, 3 executive cabins, conference room, and server room. Central AC and dedicated backup generator.", "CAT-004", "Commercial Property", "World Trade Center Area, Colombo 01", new BigDecimal("2500.00"), PropertyType.RENT, 0, 2, 2400.0, "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80", "USR-S02", "Dilshan Silva", PropertyStatus.AVAILABLE),
            new Property("PROP-005", "Charming Suburban 3BR Family House", "Well-maintained single-story home with a spacious backyard, close to international schools, supermarkets, and highway expressway interchanges.", "CAT-001", "House", "Negombo Town", new BigDecimal("165000.00"), PropertyType.SALE, 3, 2, 1850.0, "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80", "USR-S01", "Kamal Perera", PropertyStatus.AVAILABLE),
            new Property("PROP-006", "Colonial Style Hill Country Bungalow", "Stately 4-bedroom colonial bungalow set on an acre of landscaped tea gardens. Features timber flooring, working fireplace, wrap-around veranda, and staff quarters.", "CAT-001", "House", "Kandy, Peradeniya Road", new BigDecimal("24500000.00"), PropertyType.SALE, 4, 3, 3600.0, "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80", "USR-S01", "Kamal Perera", PropertyStatus.AVAILABLE),
            new Property("PROP-007", "Luxury Lakefront 5BR Residence", "Modern architectural masterpiece situated on the shores of Kurunegala Lake. Infinity deck, smart home automation, rooftop terrace, and private boat dock.", "CAT-001", "House", "Kurunegala Lake Round", new BigDecimal("38000000.00"), PropertyType.SALE, 5, 4, 4200.0, "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80", "USR-S02", "Dilshan Silva", PropertyStatus.AVAILABLE),
            new Property("PROP-008", "Modern 3BR Suburban Townhouse", "Contemporary two-story townhouse in a peaceful gated community. Open concept living, modular kitchen, solar hot water, and 2-vehicle parking.", "CAT-001", "House", "Negombo, Kochchikade", new BigDecimal("85000.00"), PropertyType.RENT, 3, 2, 1950.0, "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=800&q=80", "USR-S01", "Kamal Perera", PropertyStatus.AVAILABLE),
            new Property("PROP-009", "Heritage Dutch Villa with Courtyard", "Lovingly restored 18th-century heritage villa inside historical ramparts. Features central open courtyard, terracotta tiles, and high timber beam ceilings.", "CAT-001", "House", "Galle, Fort Ramparts", new BigDecimal("175000.00"), PropertyType.RENT, 3, 3, 2400.0, "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80", "USR-S02", "Dilshan Silva", PropertyStatus.AVAILABLE),
            new Property("PROP-010", "Palmyrah Grove Traditional 4BR Villa", "Spacious traditional Jaffna family home surrounded by fruit orchards. Large sit-out portico, deep limestone well, and modern attached bathrooms.", "CAT-001", "House", "Jaffna, Nallur", new BigDecimal("18500000.00"), PropertyType.SALE, 4, 3, 2800.0, "https://images.unsplash.com/photo-1598228723793-52759bba239c?auto=format&fit=crop&w=800&q=80", "USR-S01", "Kamal Perera", PropertyStatus.AVAILABLE),
            new Property("PROP-011", "Architect Designed 3BR Eco Villa", "Eco-friendly residence incorporating sustainable timber, rainwater harvesting, solar generation, and passive ventilation.", "CAT-001", "House", "Kandy, Digana", new BigDecimal("95000.00"), PropertyType.RENT, 3, 2, 2100.0, "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=800&q=80", "USR-S02", "Dilshan Silva", PropertyStatus.AVAILABLE),
            new Property("PROP-012", "Executive 4BR Residence in Prime Suburb", "Two-storey luxury residential house featuring master suite with walk-in closet, landscaped garden, roller shutter gate, and CCTV security.", "CAT-001", "House", "Colombo, Rajagiriya", new BigDecimal("45000000.00"), PropertyType.SALE, 4, 4, 3500.0, "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80", "USR-S01", "Kamal Perera", PropertyStatus.AVAILABLE),
            new Property("PROP-013", "Skyline Luxury 3BR Penthouse", "Breathtaking top-floor penthouse with panoramic views of the Indian Ocean and Colombo port city. Private jacuzzi deck and concierge service.", "CAT-002", "Apartment", "Colombo 02, Union Place", new BigDecimal("68000000.00"), PropertyType.SALE, 3, 3, 2600.0, "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80", "USR-S02", "Dilshan Silva", PropertyStatus.AVAILABLE),
            new Property("PROP-014", "Central 2BR Serviced Apartment", "Fully furnished chic city apartment close to leading private hospitals and shopping malls. Includes reserved underground parking and pool access.", "CAT-002", "Apartment", "Colombo 05, Havelock Road", new BigDecimal("140000.00"), PropertyType.RENT, 2, 2, 1050.0, "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80", "USR-S01", "Kamal Perera", PropertyStatus.AVAILABLE),
            new Property("PROP-015", "Kandy Hills Scenic 3BR Apartment", "Tranquil hillside apartment overlooking misty knuckles mountain ranges. Balcony access from all bedrooms, clubhouse, and heated swimming pool.", "CAT-002", "Apartment", "Kandy, Anniewatte", new BigDecimal("22500000.00"), PropertyType.SALE, 3, 2, 1480.0, "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80", "USR-S02", "Dilshan Silva", PropertyStatus.AVAILABLE),
            new Property("PROP-016", "Galle Coastal Breeze 2BR Condo", "Sunny beachfront condo minutes from the Galle expressway entrance. High rental yield potential, fully air-conditioned, and 24/7 security.", "CAT-002", "Apartment", "Galle, Dadalla", new BigDecimal("110000.00"), PropertyType.RENT, 2, 2, 980.0, "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80", "USR-S01", "Kamal Perera", PropertyStatus.AVAILABLE),
            new Property("PROP-017", "Kurunegala City Centre 2BR Flat", "Bright modern apartment in the heart of Kurunegala town. Walking distance to schools, railway station, and supermarkets. Ideal for working professionals.", "CAT-002", "Apartment", "Kurunegala Town", new BigDecimal("65000.00"), PropertyType.RENT, 2, 1, 850.0, "https://images.unsplash.com/photo-1502005229762-ee152da92e06?auto=format&fit=crop&w=800&q=80", "USR-S02", "Dilshan Silva", PropertyStatus.AVAILABLE),
            new Property("PROP-018", "Jaffna Town Modern 3BR Apartment", "Newly completed luxury residential complex in central Jaffna. Solar backup, standby generator, high-speed elevator, and rooftop entertainment terrace.", "CAT-002", "Apartment", "Jaffna, Hospital Road", new BigDecimal("19800000.00"), PropertyType.SALE, 3, 2, 1350.0, "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=800&q=80", "USR-S01", "Kamal Perera", PropertyStatus.AVAILABLE),
            new Property("PROP-019", "Negombo Beachside Studio Apartment", "Compact and stylish studio unit right next to Negombo golden beach. Excellent Airbnb investment with proven rental track record and kitchenette.", "CAT-002", "Apartment", "Negombo, Porutota Road", new BigDecimal("75000.00"), PropertyType.RENT, 1, 1, 550.0, "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&q=80", "USR-S01", "Kamal Perera", PropertyStatus.AVAILABLE),
            new Property("PROP-020", "Colombo 04 Seafront 3BR Luxury Unit", "High-floor oceanfront apartment along Galle Road corridor with unobstructed sea views. Gymnasium, infinity lap pool, and two dedicated parking slots.", "CAT-002", "Apartment", "Colombo 04, Bambalapitiya", new BigDecimal("42000000.00"), PropertyType.SALE, 3, 3, 1750.0, "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80", "USR-S02", "Dilshan Silva", PropertyStatus.AVAILABLE),
            new Property("PROP-021", "Urban Elegance 2BR City Apartment", "Well-appointed two-bedroom flat in quiet residential enclave near Victoria Park. Granite countertops, timber cabinetry, and private balcony.", "CAT-002", "Apartment", "Colombo 07, Cinnamon Gardens", new BigDecimal("160000.00"), PropertyType.RENT, 2, 2, 1100.0, "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80", "USR-S01", "Kamal Perera", PropertyStatus.AVAILABLE),
            new Property("PROP-022", "Prime 15 Perch Residential Plot", "Flat build-ready residential land plot in an exclusive gated neighborhood. Clear deeds, water, three-phase electricity, and 20ft carpeted access road.", "CAT-003", "Land", "Colombo, Thalawathugoda", new BigDecimal("22500000.00"), PropertyType.SALE, 0, 0, 4083.0, "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80", "USR-S01", "Kamal Perera", PropertyStatus.AVAILABLE),
            new Property("PROP-023", "Scenic Hilltop 25 Perch Tea Land", "Breathtaking panoramic mountain view plot ideal for a boutique holiday bungalow or eco-retreat. Gentle slope with cool mountain climate year-round.", "CAT-003", "Land", "Kandy, Hantana", new BigDecimal("15000000.00"), PropertyType.SALE, 0, 0, 6806.0, "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80", "USR-S02", "Dilshan Silva", PropertyStatus.AVAILABLE),
            new Property("PROP-024", "Beachside 20 Perch Tourism Land", "Prime tourism zoned bare plot situated just 100 meters from the ocean. Clear titles, coconut palms, and excellent potential for a boutique hotel or cabanas.", "CAT-003", "Land", "Galle, Unawatuna", new BigDecimal("26000000.00"), PropertyType.SALE, 0, 0, 5445.0, "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80", "USR-S02", "Dilshan Silva", PropertyStatus.AVAILABLE),
            new Property("PROP-025", "Commercial Land 30 Perch Plot for Lease", "Spacious commercial-zoned land plot along high-traffic bypass road. Ideal for vehicle yard, storage depot, or open-air restaurant setup.", "CAT-003", "Land", "Kurunegala, Dambulla Road", new BigDecimal("90000.00"), PropertyType.RENT, 0, 0, 8167.0, "https://images.unsplash.com/photo-1524813686514-a57563d77d61?auto=format&fit=crop&w=800&q=80", "USR-S01", "Kamal Perera", PropertyStatus.AVAILABLE),
            new Property("PROP-026", "High Street Retail Showroom Space", "Ground-floor prime retail showroom with large glass frontage on bustling main street. High foot traffic, customer parking slots, and emergency backup generator.", "CAT-004", "Commercial Property", "Colombo 03, Kollupitiya", new BigDecimal("320000.00"), PropertyType.RENT, 0, 2, 2100.0, "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80", "USR-S02", "Dilshan Silva", PropertyStatus.AVAILABLE),
            new Property("PROP-027", "Kandy City 4-Story Commercial Building", "Freehold commercial building situated in downtown commercial district. Suitable for banking branch, educational institute, or medical clinic center.", "CAT-004", "Commercial Property", "Kandy, Dalada Veediya", new BigDecimal("95000000.00"), PropertyType.SALE, 0, 6, 6500.0, "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80", "USR-S01", "Kamal Perera", PropertyStatus.AVAILABLE),
            new Property("PROP-028", "Modern Tech Park Office Floor", "Grade-A open plan office floor with fiber cabling, executive boardrooms, cafeteria area, and central air conditioning. 24/7 security access.", "CAT-004", "Commercial Property", "Colombo 10, Maradana", new BigDecimal("275000.00"), PropertyType.RENT, 0, 4, 3200.0, "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80", "USR-S02", "Dilshan Silva", PropertyStatus.AVAILABLE),
            new Property("PROP-029", "Industrial Warehouse & Logistics Hub", "High-ceiling heavy industrial logistics warehouse with 4 container loading docks, wide turning bay, three-phase 100kVA power, and office mezzanine.", "CAT-004", "Commercial Property", "Negombo, Katunayake Export Zone", new BigDecimal("55000000.00"), PropertyType.SALE, 0, 3, 12500.0, "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80", "USR-S01", "Kamal Perera", PropertyStatus.AVAILABLE)
        };

        for (Property p : catalogue) {
            if (propertyRepository.count() >= 30) {
                break;
            }
            if (!propertyRepository.existsById(p.getId())) {
                propertyRepository.save(p);
            }
        }
        System.out.println("Catalogue verified. Total properties: " + propertyRepository.count());
    }

    private void seedBookingsAndPayments() {
        if (bookingRepository.count() == 0) {
            // Booking 1: APPROVED (Ready for buyer to test payment checkout!)
            Booking b1 = new Booking(
                    "BKG-001", "PROP-002", "Oceanview 2BR Luxury Apartment",
                    "USR-B01", "Anura Fernando", "buyer1@realestate.com", "USR-S01",
                    LocalDate.now().plusDays(3), new BigDecimal("250.00"),
                    BookingStatus.APPROVED, "Requesting key handover for next Monday."
            );
            bookingRepository.save(b1);

            // Booking 2: CONFIRMED with completed payment
            Booking b2 = new Booking(
                    "BKG-002", "PROP-001", "Luxury Modern Villa with Private Pool",
                    "USR-B02", "Nimali Jayawardena", "buyer2@realestate.com", "USR-S01",
                    LocalDate.now().plusDays(10), new BigDecimal("7000.00"),
                    BookingStatus.CONFIRMED, "Reservation deposit completed."
            );
            bookingRepository.save(b2);

            // Payment 1 for Booking 2
            Payment p1 = new Payment(
                    "PAY-001", "BKG-002", "PROP-001", "USR-B02",
                    new BigDecimal("7000.00"), PaymentMethodType.CREDIT_CARD,
                    "TXN-7F89A12", PaymentStatus.COMPLETED, "Initial property reservation deposit"
            );
            paymentRepository.save(p1);

            propertyRepository.findById("PROP-001").ifPresent(prop -> {
                prop.setStatus(PropertyStatus.RESERVED);
                propertyRepository.save(prop);
            });
            propertyRepository.findById("PROP-002").ifPresent(prop -> {
                prop.setStatus(PropertyStatus.RESERVED);
                propertyRepository.save(prop);
            });

            System.out.println("Bookings and Payments seeded successfully.");
        }
    }

    private void reconcileStaleReservations() {
        for (Property property : propertyRepository.findAll()) {
            if (property.getStatus() == PropertyStatus.RESERVED) {
                boolean hasActiveReservation = bookingRepository.findAll().stream()
                        .anyMatch(b -> property.getId().equals(b.getPropertyId())
                                && b.getStatus() != BookingStatus.CANCELLED
                                && b.getStatus() != BookingStatus.REJECTED);
                if (!hasActiveReservation) {
                    property.setStatus(PropertyStatus.AVAILABLE);
                    propertyRepository.save(property);
                    System.out.println("Repaired stale RESERVED status to AVAILABLE for: " + property.getId());
                }
            }
        }
    }

    private void seedInquiries() {
        if (inquiryRepository.count() == 0) {
            Inquiry inq1 = new Inquiry(
                    "INQ-001", LocalDateTime.now().minusDays(2), LocalDateTime.now().minusDays(1),
                    "PROP-001", "Luxury Modern Villa with Private Pool",
                    "USR-B01", "Anura Fernando", "buyer1@realestate.com", "USR-S01",
                    "Are there any municipal parking permits or guest parking spaces included with this villa?",
                    "Yes, covered parking for 2 vehicles is allocated inside the premises, and wide private road allows 2 extra guest slots.",
                    InquiryStatus.ANSWERED, LocalDateTime.now().minusDays(1)
            );
            inquiryRepository.save(inq1);

            Inquiry inq2 = new Inquiry(
                    "INQ-002", LocalDateTime.now().minusHours(5), LocalDateTime.now().minusHours(5),
                    "PROP-003", "Prime 40 Perch Commercial Land Plot",
                    "USR-B02", "Nimali Jayawardena", "buyer2@realestate.com", "USR-S02",
                    "Is this land plot clear of title disputes, and has the soil testing report been completed?",
                    null, InquiryStatus.PENDING, null
            );
            inquiryRepository.save(inq2);
            System.out.println("Inquiries seeded successfully.");
        }
    }

    private void seedReviews() {
        if (reviewRepository.count() == 0) {
            Review r1 = new Review(
                    "REV-001", "PROP-001", "USR-B01", "Anura Fernando",
                    5, "Breathtaking property and peaceful neighborhood! The builder used high-grade materials throughout."
            );
            reviewRepository.save(r1);

            Review r2 = new Review(
                    "REV-002", "PROP-002", "USR-B02", "Nimali Jayawardena",
                    4, "Stunning view of the ocean, very convenient access to supermarkets and restaurants."
            );
            reviewRepository.save(r2);
            System.out.println("Reviews seeded successfully.");
        }
    }
}
