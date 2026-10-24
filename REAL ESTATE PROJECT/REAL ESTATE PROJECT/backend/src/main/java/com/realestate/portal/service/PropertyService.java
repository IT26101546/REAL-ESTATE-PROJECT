package com.realestate.portal.service;

import com.realestate.portal.dto.PropertyFilterDto;
import com.realestate.portal.dto.PropertyRequest;
import com.realestate.portal.model.Property;

import java.util.List;

/**
 * Property Service Interface - Member 2 Responsibility
 * Demonstrates OOP Abstraction.
 */
public interface PropertyService {
    Property createProperty(String sellerId, PropertyRequest request);
    Property getPropertyById(String id);
    List<Property> getAllProperties();
    List<Property> searchAndFilter(PropertyFilterDto filter);
    List<Property> getPropertiesBySeller(String sellerId);
    Property updateProperty(String propertyId, String requesterId, boolean isAdmin, PropertyRequest request);
    boolean deleteOrArchiveProperty(String propertyId, String requesterId, boolean isAdmin);
}
