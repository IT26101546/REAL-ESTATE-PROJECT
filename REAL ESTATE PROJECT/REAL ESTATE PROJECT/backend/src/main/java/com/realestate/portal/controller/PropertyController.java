package com.realestate.portal.controller;

import com.realestate.portal.dto.ApiResponse;
import com.realestate.portal.dto.PropertyFilterDto;
import com.realestate.portal.dto.PropertyRequest;
import com.realestate.portal.model.Property;
import com.realestate.portal.model.PropertyStatus;
import com.realestate.portal.model.PropertyType;
import com.realestate.portal.service.PropertyService;
import com.realestate.portal.util.UserSecurityContext;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * Property Controller - Member 2 Responsibility
 * Handles property listings CRUD, search, and filtering.
 */
@RestController
@RequestMapping("/api/properties")
public class PropertyController {

    private final PropertyService propertyService;
    private final UserSecurityContext securityContext;

    public PropertyController(PropertyService propertyService, UserSecurityContext securityContext) {
        this.propertyService = propertyService;
        this.securityContext = securityContext;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Property>> createProperty(
            HttpServletRequest request,
            @Valid @RequestBody PropertyRequest propertyRequest) {
        String sellerId = securityContext.getCurrentUserId(request);
        Property property = propertyService.createProperty(sellerId, propertyRequest);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Property listing created successfully.", property));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Property>>> getProperties(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) PropertyType type,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) PropertyStatus status) {

        PropertyFilterDto filter = new PropertyFilterDto();
        filter.setKeyword(keyword);
        filter.setCategoryId(categoryId);
        filter.setType(type);
        filter.setMinPrice(minPrice);
        filter.setMaxPrice(maxPrice);
        filter.setLocation(location);
        filter.setStatus(status);

        List<Property> properties = propertyService.searchAndFilter(filter);
        return ResponseEntity.ok(ApiResponse.ok(properties));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Property>> getPropertyById(@PathVariable String id) {
        Property property = propertyService.getPropertyById(id);
        return ResponseEntity.ok(ApiResponse.ok(property));
    }

    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<ApiResponse<List<Property>>> getPropertiesBySeller(@PathVariable String sellerId) {
        List<Property> properties = propertyService.getPropertiesBySeller(sellerId);
        return ResponseEntity.ok(ApiResponse.ok(properties));
    }

    @GetMapping("/my-properties")
    public ResponseEntity<ApiResponse<List<Property>>> getMyProperties(HttpServletRequest request) {
        String sellerId = securityContext.getCurrentUserId(request);
        List<Property> properties = propertyService.getPropertiesBySeller(sellerId);
        return ResponseEntity.ok(ApiResponse.ok(properties));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Property>> updateProperty(
            HttpServletRequest request,
            @PathVariable String id,
            @Valid @RequestBody PropertyRequest propertyRequest) {
        String requesterId = securityContext.getCurrentUserId(request);
        boolean isAdmin = securityContext.isAdmin(request);
        Property updated = propertyService.updateProperty(id, requesterId, isAdmin, propertyRequest);
        return ResponseEntity.ok(ApiResponse.ok("Property listing updated successfully.", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProperty(
            HttpServletRequest request,
            @PathVariable String id) {
        String requesterId = securityContext.getCurrentUserId(request);
        boolean isAdmin = securityContext.isAdmin(request);
        propertyService.deleteOrArchiveProperty(id, requesterId, isAdmin);
        return ResponseEntity.ok(ApiResponse.ok("Property listing deleted or archived successfully.", null));
    }
}
