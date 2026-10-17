import { request } from './apiClient';

/**
 * Member 2: Property Listing Management API Service
 */

export const getProperties = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.keyword) params.append('keyword', filters.keyword);
  if (filters.categoryId) params.append('categoryId', filters.categoryId);
  if (filters.type) params.append('type', filters.type);
  if (filters.location) params.append('location', filters.location);
  if (filters.minPrice) params.append('minPrice', filters.minPrice);
  if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
  if (filters.status) params.append('status', filters.status);

  const qs = params.toString() ? `?${params.toString()}` : '';
  const res = await request(`/properties${qs}`);
  return res?.data ?? res;
};

export const getPropertyById = async (id) => {
  const res = await request(`/properties/${id}`);
  return res?.data ?? res;
};

export const getMyProperties = async () => {
  const res = await request('/properties/my-properties');
  return res?.data ?? res;
};

export const getPropertiesBySeller = async (sellerId) => {
  const res = await request(`/properties/seller/${sellerId}`);
  return res?.data ?? res;
};

export const createProperty = async (propertyData) => {
  const res = await request('/properties', {
    method: 'POST',
    body: JSON.stringify(propertyData)
  });
  return res?.data ?? res;
};

export const updateProperty = async (id, propertyData) => {
  const res = await request(`/properties/${id}`, {
    method: 'PUT',
    body: JSON.stringify(propertyData)
  });
  return res?.data ?? res;
};

export const deleteProperty = async (id) => {
  const res = await request(`/properties/${id}`, {
    method: 'DELETE'
  });
  return res?.data ?? res;
};

export const propertyApi = {
  getProperties,
  getPropertyById,
  getMyProperties,
  getPropertiesBySeller,
  createProperty,
  updateProperty,
  deleteProperty
};

export default propertyApi;
