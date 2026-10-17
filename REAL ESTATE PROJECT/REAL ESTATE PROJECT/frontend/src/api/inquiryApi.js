import { request } from './apiClient';

/**
 * Member 4: Property Inquiry Management API Service
 */

export const createInquiry = async (data) => {
  const res = await request('/inquiries', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return res?.data ?? res;
};

export const getMyInquiries = async () => {
  const res = await request('/inquiries/my-inquiries');
  return res?.data ?? res;
};

export const getInquiryById = async (id) => {
  const res = await request(`/inquiries/${id}`);
  return res?.data ?? res;
};

export const updateInquiry = async (id, data) => {
  const res = await request(`/inquiries/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
  return res?.data ?? res;
};

export const deleteInquiry = async (id) => {
  const res = await request(`/inquiries/${id}`, {
    method: 'DELETE'
  });
  return res?.data ?? res;
};

export const getSellerInquiries = async () => {
  const res = await request('/inquiries/seller');
  return res?.data ?? res;
};

export const getAllInquiries = async () => {
  const res = await request('/inquiries');
  return res?.data ?? res;
};

export const replyToInquiry = async (id, data) => {
  const res = await request(`/inquiries/${id}/reply`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
  return res?.data ?? res;
};

export const inquiryApi = {
  createInquiry,
  getMyInquiries,
  getAllInquiries,
  getInquiryById,
  updateInquiry,
  deleteInquiry,
  getSellerInquiries,
  replyToInquiry
};

export default inquiryApi;
