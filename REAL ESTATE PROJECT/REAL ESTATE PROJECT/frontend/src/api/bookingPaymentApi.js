import { request } from './apiClient';

/**
 * Member 3: Booking & Payment Management API Service
 */

// --- BOOKING OPERATIONS ---

export const createBooking = async (bookingData) => {
  const res = await request('/bookings', {
    method: 'POST',
    body: JSON.stringify(bookingData)
  });
  return res?.data ?? res;
};

export const getMyBookings = async () => {
  const res = await request('/bookings/my-bookings');
  return res?.data ?? res;
};

export const getManageBookings = async () => {
  const res = await request('/bookings/manage');
  return res?.data ?? res;
};

export const getSellerBookings = getManageBookings;

export const getAllBookings = async () => {
  const res = await request('/bookings');
  return res?.data ?? res;
};

export const getBookingById = async (id) => {
  const res = await request(`/bookings/${id}`);
  return res?.data ?? res;
};

export const updateBookingDetails = async (id, data) => {
  const res = await request(`/bookings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
  return res?.data ?? res;
};

export const updateBooking = updateBookingDetails;

export const updateBookingStatus = async (id, statusData) => {
  const res = await request(`/bookings/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify(statusData)
  });
  return res?.data ?? res;
};

export const cancelBooking = async (id) => {
  const res = await request(`/bookings/${id}/cancel`, {
    method: 'PUT'
  });
  return res?.data ?? res;
};

export const deleteBooking = async (id) => {
  const res = await request(`/bookings/${id}`, {
    method: 'DELETE'
  });
  return res?.data ?? res;
};

// --- PAYMENT OPERATIONS ---

export const processPayment = async (paymentData) => {
  const res = await request('/payments', {
    method: 'POST',
    body: JSON.stringify(paymentData)
  });
  return res?.data ?? res;
};

export const createPayment = processPayment;

export const getMyPayments = async () => {
  const res = await request('/payments/my-payments');
  return res?.data ?? res;
};

export const getAllPayments = async () => {
  const res = await request('/payments');
  return res?.data ?? res;
};

export const getPaymentById = async (id) => {
  const res = await request(`/payments/${id}`);
  return res?.data ?? res;
};

export const getReceipt = async (id) => {
  const res = await request(`/payments/${id}/receipt`);
  return res?.data ?? res;
};

export const getPaymentReceipt = getReceipt;

export const updatePayment = async (id, data) => {
  const res = await request(`/payments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
  return res?.data ?? res;
};

export const confirmCashPayment = async (id) => {
  const res = await request(`/payments/${id}/confirm-cash`, {
    method: 'PUT'
  });
  return res?.data ?? res;
};

export const deleteFailedPayment = async (id) => {
  const res = await request(`/payments/${id}`, {
    method: 'DELETE'
  });
  return res?.data ?? res;
};

export const deletePayment = deleteFailedPayment;

export const bookingPaymentApi = {
  createBooking,
  getMyBookings,
  getManageBookings,
  getSellerBookings,
  getAllBookings,
  getBookingById,
  updateBooking,
  updateBookingDetails,
  updateBookingStatus,
  cancelBooking,
  deleteBooking,
  processPayment,
  createPayment,
  updatePayment,
  confirmCashPayment,
  getMyPayments,
  getAllPayments,
  getPaymentById,
  getReceipt,
  getPaymentReceipt,
  deleteFailedPayment,
  deletePayment
};

export default bookingPaymentApi;
