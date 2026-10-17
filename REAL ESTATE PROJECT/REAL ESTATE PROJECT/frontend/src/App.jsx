import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary'
import './App.css'

// Public pages
import HomePage from './pages/Home/HomePage'
import LoginPage from './pages/Member1_User/LoginPage/LoginPage'
import RegisterPage from './pages/Member1_User/RegisterPage/RegisterPage'

// Member 1 — User Management
import ProfilePage from './pages/Member1_User/ProfilePage/ProfilePage'
import EditProfilePage from './pages/Member1_User/EditProfilePage/EditProfilePage'

// Member 2 — Property Listing Management
import PropertyListPage from './pages/Member2_Property/PropertyListPage/PropertyListPage'
import PropertyDetailsPage from './pages/Member2_Property/PropertyDetailsPage/PropertyDetailsPage'
import AddPropertyPage from './pages/Member2_Property/AddPropertyPage/AddPropertyPage'
import EditPropertyPage from './pages/Member2_Property/EditPropertyPage/EditPropertyPage'
import MyPropertiesPage from './pages/Member2_Property/MyPropertiesPage/MyPropertiesPage'

// Member 3 — Booking and Payment Management
import CreateBookingPage from './pages/Member3_BookingPayment/CreateBookingPage/CreateBookingPage'
import MyBookingsPage from './pages/Member3_BookingPayment/MyBookingsPage/MyBookingsPage'
import BookingDetailsPage from './pages/Member3_BookingPayment/BookingDetailsPage/BookingDetailsPage'
import ManageBookingsPage from './pages/Member3_BookingPayment/ManageBookingsPage/ManageBookingsPage'
import PaymentPage from './pages/Member3_BookingPayment/PaymentPage/PaymentPage'
import PaymentHistoryPage from './pages/Member3_BookingPayment/PaymentHistoryPage/PaymentHistoryPage'
import ReceiptPage from './pages/Member3_BookingPayment/ReceiptPage/ReceiptPage'

// Member 4 — Property Inquiry Management
import SubmitInquiryPage from './pages/Member4_Inquiry/SubmitInquiryPage/SubmitInquiryPage'
import MyInquiriesPage from './pages/Member4_Inquiry/MyInquiriesPage/MyInquiriesPage'
import EditInquiryPage from './pages/Member4_Inquiry/EditInquiryPage/EditInquiryPage'
import SellerInquiryManagementPage from './pages/Member4_Inquiry/SellerInquiryManagementPage/SellerInquiryManagementPage'

// Member 5 — Admin & Category Management
import AdminDashboardPage from './pages/Member5_AdminCategory/AdminDashboardPage/AdminDashboardPage'
import CategoryListPage from './pages/Member5_AdminCategory/CategoryListPage/CategoryListPage'
import AddCategoryPage from './pages/Member5_AdminCategory/AddCategoryPage/AddCategoryPage'
import EditCategoryPage from './pages/Member5_AdminCategory/EditCategoryPage/EditCategoryPage'

// Member 6 — Feedback and Review Management
import AddReviewPage from './pages/Member6_Review/AddReviewPage/AddReviewPage'
import PropertyReviewsPage from './pages/Member6_Review/PropertyReviewsPage/PropertyReviewsPage'
import MyReviewsPage from './pages/Member6_Review/MyReviewsPage/MyReviewsPage'
import EditReviewPage from './pages/Member6_Review/EditReviewPage/EditReviewPage'

function App() {
  return (
    <div className="app-wrapper">
      {/* One shared villa background and warm translucent overlay for every route. */}
      <div className="shared-bg-layer" aria-hidden="true">
        <div className="shared-bg-image" />
        <div className="shared-bg-overlay" />
      </div>
      <Navbar />
      <main className="app-main">
        <ErrorBoundary>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/properties" element={<PropertyListPage />} />
            <Route path="/properties/:id" element={<PropertyDetailsPage />} />
            <Route path="/reviews/property/:propertyId" element={<PropertyReviewsPage />} />

            {/* Member 1 — Authenticated users */}
            <Route path="/profile" element={
              <ProtectedRoute allowedRoles={['BUYER', 'SELLER', 'ADMIN']}>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/profile/edit" element={
              <ProtectedRoute allowedRoles={['BUYER', 'SELLER', 'ADMIN']}>
                <EditProfilePage />
              </ProtectedRoute>
            } />

            {/* Member 2 — Seller & Admin */}
            <Route path="/properties/add" element={
              <ProtectedRoute allowedRoles={['SELLER', 'ADMIN']}>
                <AddPropertyPage />
              </ProtectedRoute>
            } />
            <Route path="/properties/edit/:id" element={
              <ProtectedRoute allowedRoles={['SELLER', 'ADMIN']}>
                <EditPropertyPage />
              </ProtectedRoute>
            } />
            <Route path="/properties/my-properties" element={
              <ProtectedRoute allowedRoles={['SELLER', 'ADMIN']}>
                <MyPropertiesPage />
              </ProtectedRoute>
            } />

            {/* Member 3 — Booking: Buyer & Admin */}
            <Route path="/bookings/create" element={
              <ProtectedRoute allowedRoles={['BUYER', 'ADMIN']}>
                <CreateBookingPage />
              </ProtectedRoute>
            } />
            <Route path="/bookings/my-bookings" element={
              <ProtectedRoute allowedRoles={['BUYER', 'ADMIN']}>
                <MyBookingsPage />
              </ProtectedRoute>
            } />
            <Route path="/bookings/:id" element={
              <ProtectedRoute allowedRoles={['BUYER', 'SELLER', 'ADMIN']}>
                <BookingDetailsPage />
              </ProtectedRoute>
            } />

            {/* Member 3 — Booking: Seller & Admin */}
            <Route path="/bookings/manage" element={
              <ProtectedRoute allowedRoles={['SELLER', 'ADMIN']}>
                <ManageBookingsPage />
              </ProtectedRoute>
            } />

            {/* Member 3 — Payment: Buyer & Admin */}
            <Route path="/payments/pay" element={
              <ProtectedRoute allowedRoles={['BUYER', 'ADMIN']}>
                <PaymentPage />
              </ProtectedRoute>
            } />
            <Route path="/payments/history" element={
              <ProtectedRoute allowedRoles={['BUYER', 'ADMIN']}>
                <PaymentHistoryPage />
              </ProtectedRoute>
            } />
            <Route path="/payments/receipt/:id" element={
              <ProtectedRoute allowedRoles={['BUYER', 'SELLER', 'ADMIN']}>
                <ReceiptPage />
              </ProtectedRoute>
            } />

            {/* Member 4 — Inquiry: Buyer & Admin */}
            <Route path="/inquiries/create" element={
              <ProtectedRoute allowedRoles={['BUYER', 'ADMIN']}>
                <SubmitInquiryPage />
              </ProtectedRoute>
            } />
            <Route path="/inquiries/submit" element={
              <ProtectedRoute allowedRoles={['BUYER', 'ADMIN']}>
                <SubmitInquiryPage />
              </ProtectedRoute>
            } />
            <Route path="/inquiries/my-inquiries" element={
              <ProtectedRoute allowedRoles={['BUYER', 'ADMIN']}>
                <MyInquiriesPage />
              </ProtectedRoute>
            } />
            <Route path="/inquiries/edit/:id" element={
              <ProtectedRoute allowedRoles={['BUYER', 'ADMIN']}>
                <EditInquiryPage />
              </ProtectedRoute>
            } />

            {/* Member 4 — Inquiry: Seller & Admin */}
            <Route path="/inquiries/seller" element={
              <ProtectedRoute allowedRoles={['SELLER', 'ADMIN']}>
                <SellerInquiryManagementPage />
              </ProtectedRoute>
            } />

          {/* Member 5 — Admin */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboardPage initialTab="overview" />
            </ProtectedRoute>
          } />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboardPage initialTab="overview" />
            </ProtectedRoute>
          } />
          <Route path="/admin/properties" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboardPage initialTab="properties" />
            </ProtectedRoute>
          } />
          <Route path="/admin/categories" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboardPage initialTab="categories" />
            </ProtectedRoute>
          } />
          <Route path="/admin/categories/add" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AddCategoryPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/categories/edit/:id" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <EditCategoryPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/bookings" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboardPage initialTab="bookings" />
            </ProtectedRoute>
          } />
          <Route path="/admin/payments" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboardPage initialTab="payments" />
            </ProtectedRoute>
          } />
          <Route path="/admin/inquiries" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboardPage initialTab="inquiries" />
            </ProtectedRoute>
          } />
          <Route path="/admin/reviews" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboardPage initialTab="reviews" />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboardPage initialTab="users" />
            </ProtectedRoute>
          } />

          {/* Member 6 — Reviews */}
          <Route path="/reviews/add" element={
            <ProtectedRoute allowedRoles={['BUYER', 'SELLER', 'ADMIN']}>
              <AddReviewPage />
            </ProtectedRoute>
          } />
          <Route path="/reviews/create" element={
            <ProtectedRoute allowedRoles={['BUYER', 'SELLER', 'ADMIN']}>
              <AddReviewPage />
            </ProtectedRoute>
          } />
          <Route path="/reviews/my-reviews" element={
            <ProtectedRoute allowedRoles={['BUYER', 'SELLER', 'ADMIN']}>
              <MyReviewsPage />
            </ProtectedRoute>
          } />
          <Route path="/reviews/edit/:id" element={
            <ProtectedRoute allowedRoles={['BUYER', 'SELLER', 'ADMIN']}>
              <EditReviewPage />
            </ProtectedRoute>
          } />

          {/* Navbar & Convenience Aliases */}
          <Route path="/edit-profile" element={<Navigate to="/profile/edit" replace />} />
          <Route path="/my-bookings" element={<Navigate to="/bookings/my-bookings" replace />} />
          <Route path="/my-payments" element={<Navigate to="/payments/history" replace />} />
          <Route path="/my-inquiries" element={<Navigate to="/inquiries/my-inquiries" replace />} />
          <Route path="/my-reviews" element={<Navigate to="/reviews/my-reviews" replace />} />
          <Route path="/my-properties" element={<Navigate to="/properties/my-properties" replace />} />
          <Route path="/add-property" element={<Navigate to="/properties/add" replace />} />
          <Route path="/manage-bookings" element={<Navigate to="/bookings/manage" replace />} />
          <Route path="/seller-inquiries" element={<Navigate to="/inquiries/seller" replace />} />
          <Route path="/categories" element={<Navigate to="/admin/categories" replace />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ErrorBoundary>
    </main>
      <Footer />
    </div>
  )
}

export default App
