package com.realestate.portal.service;

import com.realestate.portal.dto.PropertyFilterDto;
import com.realestate.portal.dto.PropertyRequest;
import com.realestate.portal.exception.BadRequestException;
import com.realestate.portal.exception.ResourceNotFoundException;
import com.realestate.portal.exception.UnauthorizedException;
import com.realestate.portal.model.*;
import com.realestate.portal.repository.BookingRepository;
import com.realestate.portal.repository.CategoryRepository;
import com.realestate.portal.repository.PaymentRepository;
import com.realestate.portal.repository.PropertyRepository;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Property Service Implementation - Member 2 Responsibility
 * Handles property listing CRUD, search/filtering, and archiving.
 */
@Service
public class PropertyServiceImpl implements PropertyService {

    private final PropertyRepository propertyRepository;
    private final CategoryRepository categoryRepository;
    private final UserService userService;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;

    public PropertyServiceImpl(PropertyRepository propertyRepository,
                               CategoryRepository categoryRepository,
                               UserService userService,
                               @Lazy BookingRepository bookingRepository,
                               @Lazy PaymentRepository paymentRepository) {
        this.propertyRepository = propertyRepository;
        this.categoryRepository = categoryRepository;
        this.userService = userService;
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
    }

    @Override
    public Property createProperty(String sellerId, PropertyRequest request) {
        User seller = userService.getUserEntity(sellerId);
        if (seller.getRole() != Role.SELLER && seller.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only registered sellers can create property listings.");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        Property property = new Property();
        property.setTitle(request.getTitle().trim());
        property.setDescription(request.getDescription().trim());
        property.setCategoryId(category.getId());
        property.setCategoryName(category.getName());
        property.setLocation(request.getLocation().trim());
        property.setPrice(request.getPrice());
        property.setType(request.getType());
        property.setBedrooms(request.getBedrooms());
        property.setBathrooms(request.getBathrooms());
        property.setArea(request.getArea());
        property.setImageUrl(request.getImageUrl() != null && !request.getImageUrl().isBlank()
                ? request.getImageUrl().trim()
                : "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80");
        property.setSellerId(seller.getId());
        property.setSellerName(seller.getName());
        property.setStatus(request.getStatus() != null ? request.getStatus() : PropertyStatus.AVAILABLE);

        return propertyRepository.save(property);
    }

    @Override
    public Property getPropertyById(String id) {
        return propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with id: " + id));
    }

    @Override
    public List<Property> getAllProperties() {
        return propertyRepository.findAll();
    }

    @Override
    public List<Property> searchAndFilter(PropertyFilterDto filter) {
        return propertyRepository.findAll().stream()
                .filter(p -> {
                    // Do not show ARCHIVED properties in public searches unless explicitly requested
                    if (filter.getStatus() != null) {
                        if (p.getStatus() != filter.getStatus()) return false;
                    } else {
                        if (p.getStatus() == PropertyStatus.ARCHIVED) return false;
                    }

                    if (filter.getKeyword() != null && !filter.getKeyword().isBlank()) {
                        String kw = filter.getKeyword().toLowerCase().trim();
                        boolean matchesTitle = p.getTitle() != null && p.getTitle().toLowerCase().contains(kw);
                        boolean matchesDesc = p.getDescription() != null && p.getDescription().toLowerCase().contains(kw);
                        boolean matchesLoc = p.getLocation() != null && p.getLocation().toLowerCase().contains(kw);
                        if (!matchesTitle && !matchesDesc && !matchesLoc) return false;
                    }

                    if (filter.getCategoryId() != null && !filter.getCategoryId().isBlank()) {
                        if (!filter.getCategoryId().equalsIgnoreCase(p.getCategoryId())) return false;
                    }

                    if (filter.getType() != null) {
                        if (p.getType() != filter.getType()) return false;
                    }

                    if (filter.getLocation() != null && !filter.getLocation().isBlank()) {
                        if (p.getLocation() == null || !p.getLocation().toLowerCase().contains(filter.getLocation().toLowerCase().trim())) {
                            return false;
                        }
                    }

                    if (filter.getMinPrice() != null) {
                        if (p.getPrice() == null || p.getPrice().compareTo(filter.getMinPrice()) < 0) return false;
                    }

                    if (filter.getMaxPrice() != null) {
                        if (p.getPrice() == null || p.getPrice().compareTo(filter.getMaxPrice()) > 0) return false;
                    }

                    return true;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<Property> getPropertiesBySeller(String sellerId) {
        return propertyRepository.findBySellerId(sellerId);
    }

    @Override
    public Property updateProperty(String propertyId, String requesterId, boolean isAdmin, PropertyRequest request) {
        Property property = getPropertyById(propertyId);
        if (!property.getSellerId().equals(requesterId) && !isAdmin) {
            throw new UnauthorizedException("You are not authorized to update this property.");
        }

        if (request.getCategoryId() != null && !request.getCategoryId().isBlank()) {
            Category cat = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));
            property.setCategoryId(cat.getId());
            property.setCategoryName(cat.getName());
        }

        property.setTitle(request.getTitle().trim());
        property.setDescription(request.getDescription().trim());
        property.setLocation(request.getLocation().trim());
        property.setPrice(request.getPrice());
        property.setType(request.getType());
        property.setBedrooms(request.getBedrooms());
        property.setBathrooms(request.getBathrooms());
        property.setArea(request.getArea());
        if (request.getImageUrl() != null && !request.getImageUrl().isBlank()) {
            property.setImageUrl(request.getImageUrl().trim());
        }
        if (request.getStatus() != null) {
            property.setStatus(request.getStatus());
        }

        return propertyRepository.save(property);
    }

    @Override
    public boolean deleteOrArchiveProperty(String propertyId, String requesterId, boolean isAdmin) {
        Property property = getPropertyById(propertyId);
        if (!property.getSellerId().equals(requesterId) && !isAdmin) {
            throw new UnauthorizedException("You are not authorized to delete this property.");
        }

        // Rule: Delete listings without linked transactions; archive listings with booking/payment history.
        boolean hasLinkedBookings = bookingRepository.findAll().stream()
                .anyMatch(b -> propertyId.equals(b.getPropertyId()));
        boolean hasLinkedPayments = paymentRepository.findAll().stream()
                .anyMatch(p -> propertyId.equals(p.getPropertyId()));

        if (hasLinkedBookings || hasLinkedPayments) {
            // Archive listing instead of hard-deleting
            property.setStatus(PropertyStatus.ARCHIVED);
            propertyRepository.save(property);
            return true;
        } else {
            // Hard delete
            return propertyRepository.deleteById(propertyId);
        }
    }
}
