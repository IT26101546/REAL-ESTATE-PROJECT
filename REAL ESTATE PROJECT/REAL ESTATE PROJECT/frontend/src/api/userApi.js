import { request } from './apiClient';

/**
 * Member 1: User Management API Service
 */

export const register = (userData) => request('/auth/register', {
  method: 'POST',
  body: JSON.stringify(userData)
});

export const login = (credentials) => request('/auth/login', {
  method: 'POST',
  body: JSON.stringify(credentials)
});

export const getCurrentProfile = () => request('/users/profile');

export const getUserById = (id) => request(`/users/${id}`);

export const getAllUsers = () => request('/users');

export const updateProfile = (profileData) => request('/users/profile', {
  method: 'PUT',
  body: JSON.stringify(profileData)
});

export const changePassword = (passwordData) => request('/users/change-password', {
  method: 'PUT',
  body: JSON.stringify(passwordData)
});

export const deleteAccount = (id) => request(`/users/${id}`, {
  method: 'DELETE'
});

export const userApi = {
  register,
  login,
  getCurrentProfile,
  getUserById,
  getAllUsers,
  updateProfile,
  changePassword,
  deleteAccount
};

export default userApi;
