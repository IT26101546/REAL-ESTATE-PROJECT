import { request } from './apiClient';

/**
 * Member 5: Admin & Property Category Management API Service
 */

export const getCategories = async () => {
  const res = await request('/categories');
  return res?.data ?? res;
};

export const getCategoryById = async (id) => {
  const res = await request(`/categories/${id}`);
  return res?.data ?? res;
};

export const createCategory = async (data) => {
  const res = await request('/categories', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return res?.data ?? res;
};

export const updateCategory = async (id, data) => {
  const res = await request(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
  return res?.data ?? res;
};

export const deleteCategory = async (id) => {
  const res = await request(`/categories/${id}`, {
    method: 'DELETE'
  });
  return res?.data ?? res;
};

export const getDashboardStats = async () => {
  const res = await request('/admin/dashboard');
  return res?.data ?? res;
};

export const categoryAdminApi = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getDashboardStats
};

export default categoryAdminApi;
