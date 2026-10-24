import { request } from './apiClient';

/**
 * Member 6: Feedback and Review Management API Service
 */

export const createReview = async (data) => {
  const res = await request('/reviews', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return res?.data ?? res;
};

export const getPropertyReviews = async (propertyId) => {
  const res = await request(`/reviews/property/${propertyId}`);
  return res?.data ?? res;
};

export const getReviewsByProperty = getPropertyReviews;

export const getMyReviews = async () => {
  const res = await request('/reviews/my-reviews');
  return res?.data ?? res;
};

export const getReviewById = async (id) => {
  const res = await request(`/reviews/${id}`);
  return res?.data ?? res;
};

export const updateReview = async (id, data) => {
  const res = await request(`/reviews/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
  return res?.data ?? res;
};

export const getAllReviews = async () => {
  const res = await request('/reviews');
  return res?.data ?? res;
};

export const deleteReview = async (id) => {
  const res = await request(`/reviews/${id}`, {
    method: 'DELETE'
  });
  return res?.data ?? res;
};

export const reviewApi = {
  createReview,
  getPropertyReviews,
  getReviewsByProperty,
  getMyReviews,
  getAllReviews,
  getReviewById,
  updateReview,
  deleteReview
};

export default reviewApi;
