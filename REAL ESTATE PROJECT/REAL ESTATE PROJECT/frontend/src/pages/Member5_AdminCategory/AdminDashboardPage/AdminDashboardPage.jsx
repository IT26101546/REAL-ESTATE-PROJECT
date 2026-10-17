import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import {
  categoryAdminApi,
  propertyApi,
  bookingPaymentApi,
  inquiryApi,
  reviewApi,
  userApi
} from '../../../api';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import ConfirmModal from '../../../components/ConfirmModal/ConfirmModal';
import {
  LayoutDashboard,
  Building2,
  Layers,
  CalendarCheck,
  CreditCard,
  MessageSquare,
  Star,
  Users,
  Shield,
  ShieldCheck,
  LogOut,
  Plus,
  Trash2,
  Edit,
  Eye,
  Check,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Receipt,
  Search,
  ExternalLink,
  MessageCircle,
  Info
} from 'lucide-react';
import './AdminDashboardPage.css';

export default function AdminDashboardPage({ initialTab }) {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab from prop, pathname, or query param
  const getTabFromLocation = () => {
    if (initialTab) return initialTab;
    const pathParts = location.pathname.split('/');
    const subRoute = pathParts[2];
    if (subRoute && ['overview', 'properties', 'categories', 'bookings', 'payments', 'inquiries', 'reviews', 'users'].includes(subRoute)) {
      return subRoute;
    }
    const params = new URLSearchParams(location.search);
    const queryTab = params.get('tab');
    if (queryTab && ['overview', 'properties', 'categories', 'bookings', 'payments', 'inquiries', 'reviews', 'users'].includes(queryTab)) {
      return queryTab;
    }
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState(getTabFromLocation);

  // Sync state if URL changes
  useEffect(() => {
    setActiveTab(getTabFromLocation());
  }, [location.pathname, location.search, initialTab]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    navigate(`/admin/${tabId === 'overview' ? 'dashboard' : tabId}`, { replace: true });
  };

  // Data states
  const [stats, setStats] = useState(null);
  const [properties, setProperties] = useState([]);
  const [categories, setCategories] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [usersList, setUsersList] = useState([]);

  // Loading states
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingData, setLoadingData] = useState(false);

  // Modals state
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null, danger: true, loading: false });
  const [categoryModal, setCategoryModal] = useState({ isOpen: false, mode: 'create', data: { id: '', name: '', description: '', icon: 'home' }, loading: false });
  const [bookingStatusModal, setBookingStatusModal] = useState({ isOpen: false, booking: null, newStatus: 'APPROVED', loading: false });
  const [inquiryReplyModal, setInquiryReplyModal] = useState({ isOpen: false, inquiry: null, responseText: '', loading: false });
  const [receiptModal, setReceiptModal] = useState({ isOpen: false, receipt: null, loading: false });

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch Dashboard Summary Stats
  const loadStats = useCallback(async () => {
    try {
      const data = await categoryAdminApi.getDashboardStats();
      setStats(data);
    } catch (err) {
      showToast(err.message || 'Failed to load dashboard statistics.', 'error');
    } finally {
      setLoadingStats(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Fetch Tab Specific Data
  const loadTabData = useCallback(async (tab) => {
    setLoadingData(true);
    try {
      if (tab === 'properties') {
        const data = await propertyApi.getProperties();
        setProperties(Array.isArray(data) ? data : []);
      } else if (tab === 'categories') {
        const data = await categoryAdminApi.getCategories();
        setCategories(Array.isArray(data) ? data : []);
      } else if (tab === 'bookings') {
        const data = await bookingPaymentApi.getAllBookings();
        setBookings(Array.isArray(data) ? data : []);
      } else if (tab === 'payments') {
        const data = await bookingPaymentApi.getAllPayments();
        setPayments(Array.isArray(data) ? data : []);
      } else if (tab === 'inquiries') {
        const data = await inquiryApi.getAllInquiries();
        setInquiries(Array.isArray(data) ? data : []);
      } else if (tab === 'reviews') {
        const data = await reviewApi.getAllReviews();
        setReviews(Array.isArray(data) ? data : []);
      } else if (tab === 'users') {
        const data = await userApi.getAllUsers();
        setUsersList(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      showToast(err.message || `Failed to load ${tab} data.`, 'error');
    } finally {
      setLoadingData(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (activeTab !== 'overview') {
      loadTabData(activeTab);
    }
  }, [activeTab, loadTabData]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // --- ACTIONS: CATEGORIES ---
  const handleOpenAddCategory = () => {
    setCategoryModal({
      isOpen: true,
      mode: 'create',
      data: { id: '', name: '', description: '', icon: 'home' },
      loading: false
    });
  };

  const handleOpenEditCategory = (cat) => {
    setCategoryModal({
      isOpen: true,
      mode: 'edit',
      data: { id: cat.id, name: cat.name, description: cat.description || '', icon: cat.icon || 'home' },
      loading: false
    });
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!categoryModal.data.name.trim()) {
      showToast('Category name is required.', 'error');
      return;
    }
    setCategoryModal((prev) => ({ ...prev, loading: true }));
    try {
      if (categoryModal.mode === 'create') {
        await categoryAdminApi.createCategory({
          name: categoryModal.data.name.trim(),
          description: categoryModal.data.description.trim(),
          icon: categoryModal.data.icon.trim() || 'home'
        });
        showToast('Category created successfully.', 'success');
      } else {
        await categoryAdminApi.updateCategory(categoryModal.data.id, {
          name: categoryModal.data.name.trim(),
          description: categoryModal.data.description.trim(),
          icon: categoryModal.data.icon.trim() || 'home'
        });
        showToast('Category updated successfully.', 'success');
      }
      setCategoryModal({ isOpen: false, mode: 'create', data: { id: '', name: '', description: '', icon: 'home' }, loading: false });
      loadTabData('categories');
      loadStats();
    } catch (err) {
      showToast(err.message || 'Failed to save category.', 'error');
      setCategoryModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleDeleteCategory = (cat) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Category',
      message: `Are you sure you want to delete category "${cat.name}"? Only unused categories can be deleted.`,
      danger: true,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, loading: true }));
        try {
          await categoryAdminApi.deleteCategory(cat.id);
          showToast(`Category "${cat.name}" deleted successfully.`, 'success');
          setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null, danger: true, loading: false });
          loadTabData('categories');
          loadStats();
        } catch (err) {
          showToast(err.message || 'Cannot delete category in use by existing property listings.', 'error');
          setConfirmModal((prev) => ({ ...prev, loading: false }));
        }
      }
    });
  };

  // --- ACTIONS: PROPERTIES ---
  const handleDeleteProperty = (property) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Property Listing',
      message: `Are you sure you want to delete or archive "${property.title}"?`,
      danger: true,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, loading: true }));
        try {
          await propertyApi.deleteProperty(property.id);
          showToast('Property listing removed successfully.', 'success');
          setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null, danger: true, loading: false });
          loadTabData('properties');
          loadStats();
        } catch (err) {
          showToast(err.message || 'Failed to delete property listing.', 'error');
          setConfirmModal((prev) => ({ ...prev, loading: false }));
        }
      }
    });
  };

  // --- ACTIONS: BOOKINGS ---
  const handleOpenStatusModal = (b) => {
    setBookingStatusModal({
      isOpen: true,
      booking: b,
      newStatus: b.status,
      loading: false
    });
  };

  const handleUpdateBookingStatus = async (e) => {
    e.preventDefault();
    if (!bookingStatusModal.booking) return;
    setBookingStatusModal((prev) => ({ ...prev, loading: true }));
    try {
      await bookingPaymentApi.updateBookingStatus(bookingStatusModal.booking.id, {
        status: bookingStatusModal.newStatus
      });
      showToast(`Booking ${bookingStatusModal.booking.id} status updated to ${bookingStatusModal.newStatus}.`, 'success');
      setBookingStatusModal({ isOpen: false, booking: null, newStatus: 'APPROVED', loading: false });
      loadTabData('bookings');
      loadStats();
    } catch (err) {
      showToast(err.message || 'Failed to update booking status.', 'error');
      setBookingStatusModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleDeleteBooking = (b) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Booking Record',
      message: `Are you sure you want to delete booking record "${b.id}"?`,
      danger: true,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, loading: true }));
        try {
          await bookingPaymentApi.deleteBooking(b.id);
          showToast('Booking record deleted.', 'success');
          setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null, danger: true, loading: false });
          loadTabData('bookings');
          loadStats();
        } catch (err) {
          showToast(err.message || 'Cannot delete confirmed booking record with completed payment.', 'error');
          setConfirmModal((prev) => ({ ...prev, loading: false }));
        }
      }
    });
  };

  // --- ACTIONS: PAYMENTS ---
  const handleViewReceipt = async (p) => {
    try {
      const receipt = await bookingPaymentApi.getReceipt(p.id);
      setReceiptModal({ isOpen: true, receipt, loading: false });
    } catch (err) {
      showToast(err.message || 'Failed to fetch receipt details.', 'error');
    }
  };

  const handleDeleteFailedPayment = (p) => {
    if (p.status === 'COMPLETED') {
      showToast('Successful payment records are permanent and protected from deletion.', 'warning');
      return;
    }
    setConfirmModal({
      isOpen: true,
      title: 'Delete Failed Payment',
      message: `Delete failed payment attempt ${p.id}? Successful records cannot be deleted.`,
      danger: true,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, loading: true }));
        try {
          await bookingPaymentApi.deleteFailedPayment(p.id);
          showToast('Payment record removed.', 'success');
          setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null, danger: true, loading: false });
          loadTabData('payments');
          loadStats();
        } catch (err) {
          showToast(err.message || 'Cannot delete payment record.', 'error');
          setConfirmModal((prev) => ({ ...prev, loading: false }));
        }
      }
    });
  };

  // --- ACTIONS: INQUIRIES ---
  const handleOpenReplyModal = (inq) => {
    setInquiryReplyModal({
      isOpen: true,
      inquiry: inq,
      responseText: inq.response || '',
      loading: false
    });
  };

  const handleSendInquiryReply = async (e) => {
    e.preventDefault();
    if (!inquiryReplyModal.responseText.trim()) {
      showToast('Response message cannot be empty.', 'error');
      return;
    }
    setInquiryReplyModal((prev) => ({ ...prev, loading: true }));
    try {
      await inquiryApi.replyToInquiry(inquiryReplyModal.inquiry.id, {
        response: inquiryReplyModal.responseText.trim()
      });
      showToast('Response submitted successfully.', 'success');
      setInquiryReplyModal({ isOpen: false, inquiry: null, responseText: '', loading: false });
      loadTabData('inquiries');
      loadStats();
    } catch (err) {
      showToast(err.message || 'Failed to send inquiry response.', 'error');
      setInquiryReplyModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleDeleteInquiry = (inq) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Inquiry',
      message: `Delete inquiry "${inq.id}" for property "${inq.propertyTitle}"?`,
      danger: true,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, loading: true }));
        try {
          await inquiryApi.deleteInquiry(inq.id);
          showToast('Inquiry deleted.', 'success');
          setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null, danger: true, loading: false });
          loadTabData('inquiries');
          loadStats();
        } catch (err) {
          showToast(err.message || 'Failed to delete inquiry.', 'error');
          setConfirmModal((prev) => ({ ...prev, loading: false }));
        }
      }
    });
  };

  // --- ACTIONS: REVIEWS ---
  const handleDeleteReview = (rev) => {
    setConfirmModal({
      isOpen: true,
      title: 'Remove Review',
      message: `Remove this review by "${rev.userName}"? (${rev.rating} Stars: "${rev.comment?.slice(0, 40)}...")`,
      danger: true,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, loading: true }));
        try {
          await reviewApi.deleteReview(rev.id);
          showToast('Inappropriate review removed.', 'success');
          setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null, danger: true, loading: false });
          loadTabData('reviews');
          loadStats();
        } catch (err) {
          showToast(err.message || 'Failed to delete review.', 'error');
          setConfirmModal((prev) => ({ ...prev, loading: false }));
        }
      }
    });
  };

  // --- ACTIONS: USERS ---
  const handleDeleteUser = (u) => {
    if (u.role === 'ADMIN' || u.email === 'admin@realestate.com') {
      showToast('Default Administrator account is protected and cannot be deleted.', 'error');
      return;
    }
    setConfirmModal({
      isOpen: true,
      title: 'Delete User Account',
      message: `Delete account for "${u.name}" (${u.email})? Note: Accounts with active bookings or completed transactions are protected from deletion.`,
      danger: true,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, loading: true }));
        try {
          await userApi.deleteAccount(u.id);
          showToast(`User account ${u.email} deleted successfully.`, 'success');
          setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null, danger: true, loading: false });
          loadTabData('users');
          loadStats();
        } catch (err) {
          showToast(err.message || 'Cannot delete account with active bookings or transaction records.', 'error');
          setConfirmModal((prev) => ({ ...prev, loading: false }));
        }
      }
    });
  };

  // Helper date formatter
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const formatCurrencyLKR = (val) => {
    const num = Number(val || 0);
    return `LKR ${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Sidebar navigation items
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'properties', label: 'Properties', icon: Building2 },
    { id: 'categories', label: 'Categories', icon: Layers },
    { id: 'bookings', label: 'Bookings', icon: CalendarCheck },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'inquiries', label: 'Inquiries', icon: MessageSquare },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'users', label: 'Users', icon: Users }
  ];

  return (
    <div className="admin-portal-wrapper page-wrapper container">
      {/* Top Admin Identity & Portal Bar */}
      <header className="admin-top-bar glass-panel">
        <div className="admin-top-brand">
          <div className="admin-brand-icon">
            <Building2 size={22} />
          </div>
          <div className="admin-brand-text">
            <span className="admin-brand-title">RealEstatePro</span>
            <span className="admin-brand-badge">Admin Portal</span>
          </div>
        </div>

        <div className="admin-top-user">
          <div className="admin-user-info">
            <div className="admin-name-row">
              <span className="admin-name">{user?.name || 'System Administrator'}</span>
              <span className="admin-role-tag">ADMIN</span>
            </div>
            <span className="admin-email">{user?.email || 'admin@realestate.com'}</span>
          </div>

          <button
            onClick={handleLogout}
            className="btn btn-outline btn-sm admin-logout-btn"
            title="Logout"
            aria-label="Logout"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Two-Column Admin Layout */}
      <div className="admin-layout-container">
        {/* Left Sidebar titled "Admin Menu" */}
        <aside className="admin-sidebar glass-panel">
          <div className="admin-sidebar-header">
            <h3 className="admin-sidebar-title">Admin Menu</h3>
          </div>

          <nav className="admin-sidebar-nav">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`admin-nav-item ${isActive ? 'active' : ''}`}
                >
                  <Icon size={19} className="admin-nav-icon" />
                  <span className="admin-nav-label">{item.label}</span>
                  {item.id === 'bookings' && stats?.totalBookings > 0 && (
                    <span className="nav-counter">{stats.totalBookings}</span>
                  )}
                  {item.id === 'properties' && stats?.totalProperties > 0 && (
                    <span className="nav-counter">{stats.totalProperties}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="admin-main-content glass-panel">
          {/* Main Area Header */}
          <div className="admin-content-header">
            <div>
              <h1 className="page-title admin-section-title">
                {activeTab === 'overview' && 'Dashboard Overview'}
                {activeTab === 'properties' && 'Properties Management'}
                {activeTab === 'categories' && 'Categories Management'}
                {activeTab === 'bookings' && 'Bookings Management'}
                {activeTab === 'payments' && 'Payments & Receipts'}
                {activeTab === 'inquiries' && 'Property Inquiries'}
                {activeTab === 'reviews' && 'Reviews & Moderation'}
                {activeTab === 'users' && 'User Accounts Management'}
              </h1>
              <p className="page-subtitle admin-section-subtitle">
                {activeTab === 'overview' && 'Real-time platform summary metrics and management shortcuts.'}
                {activeTab === 'properties' && 'Inspect, filter, and moderate active property listings.'}
                {activeTab === 'categories' && 'Create, edit, and delete unused listing categories.'}
                {activeTab === 'bookings' && 'Review reservation appointments and update permitted statuses.'}
                {activeTab === 'payments' && 'View simulated reservation fee deposits and receipts.'}
                {activeTab === 'inquiries' && 'View questions from buyers and submit answers.'}
                {activeTab === 'reviews' && 'Moderate property reviews and remove inappropriate comments.'}
                {activeTab === 'users' && 'View registered accounts and manage platform users.'}
              </p>
            </div>

            {activeTab === 'categories' && (
              <button className="btn btn-primary btn-sm" onClick={handleOpenAddCategory}>
                <Plus size={16} />
                <span>Add Category</span>
              </button>
            )}
            {activeTab === 'properties' && (
              <Link to="/properties/add" className="btn btn-primary btn-sm">
                <Plus size={16} />
                <span>Post Listing</span>
              </Link>
            )}
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="overview-tab-content">
              {loadingStats ? (
                <LoadingSpinner />
              ) : (
                <>
                  {/* 4 Summary Cards */}
                  <div className="summary-cards-grid">
                    {/* Card 1: Total Registered Buyers/Sellers */}
                    <div className="summary-card">
                      <div className="summary-card-icon user-icon">
                        <Users size={26} />
                      </div>
                      <div className="summary-card-body">
                        <span className="summary-card-label">Total Buyers & Sellers</span>
                        <div className="summary-card-value">
                          {((stats?.totalBuyers || 0) + (stats?.totalSellers || 0))}
                        </div>
                        <span className="summary-card-subtext">
                          {stats?.totalBuyers || 0} Buyers · {stats?.totalSellers || 0} Sellers
                        </span>
                      </div>
                    </div>

                    {/* Card 2: Total Properties */}
                    <div className="summary-card">
                      <div className="summary-card-icon property-icon">
                        <Building2 size={26} />
                      </div>
                      <div className="summary-card-body">
                        <span className="summary-card-label">Total Properties</span>
                        <div className="summary-card-value">
                          {stats?.totalProperties ?? 0}
                        </div>
                        <span className="summary-card-subtext">
                          {stats?.totalAvailableProperties ?? 0} Available Listings
                        </span>
                      </div>
                    </div>

                    {/* Card 3: Total Bookings */}
                    <div className="summary-card">
                      <div className="summary-card-icon booking-icon">
                        <CalendarCheck size={26} />
                      </div>
                      <div className="summary-card-body">
                        <span className="summary-card-label">Total Bookings</span>
                        <div className="summary-card-value">
                          {stats?.totalBookings ?? 0}
                        </div>
                        <span className="summary-card-subtext">
                          {stats?.totalConfirmedBookings ?? 0} Confirmed Reservations
                        </span>
                      </div>
                    </div>

                    {/* Card 4: Successful Reservation Payments in LKR */}
                    <div className="summary-card payment-summary-card">
                      <div className="summary-card-icon payment-icon">
                        <CreditCard size={26} />
                      </div>
                      <div className="summary-card-body">
                        <div className="payment-label-row">
                          <span className="summary-card-label">Reservation Payments</span>
                          <span className="simulated-pill">Simulated</span>
                        </div>
                        <div className="summary-card-value currency-value">
                          {formatCurrencyLKR(stats?.totalRevenue)}
                        </div>
                        <span className="summary-card-subtext">
                          {stats?.totalPayments ?? 0} Successful reservation deposits
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Shortcuts Section */}
                  <div className="admin-shortcuts-section">
                    <h2 className="shortcuts-title">Management Quick Navigation</h2>
                    <div className="shortcuts-grid">
                      <div className="shortcut-card" onClick={() => handleTabChange('properties')}>
                        <div className="shortcut-icon" style={{ backgroundColor: 'rgba(96, 61, 40, 0.12)', color: '#603D28' }}>
                          <Building2 size={22} />
                        </div>
                        <div className="shortcut-info">
                          <h4>Manage Properties</h4>
                          <p>{stats?.totalProperties || 0} listings in catalogue</p>
                        </div>
                      </div>

                      <div className="shortcut-card" onClick={() => handleTabChange('categories')}>
                        <div className="shortcut-icon" style={{ backgroundColor: 'rgba(40, 114, 75, 0.12)', color: '#205D3C' }}>
                          <Layers size={22} />
                        </div>
                        <div className="shortcut-info">
                          <h4>Manage Categories</h4>
                          <p>{stats?.totalCategories || 0} property classifications</p>
                        </div>
                      </div>

                      <div className="shortcut-card" onClick={() => handleTabChange('bookings')}>
                        <div className="shortcut-icon" style={{ backgroundColor: 'rgba(149, 97, 15, 0.12)', color: '#79500D' }}>
                          <CalendarCheck size={22} />
                        </div>
                        <div className="shortcut-info">
                          <h4>Manage Bookings</h4>
                          <p>{stats?.totalBookings || 0} viewing appointments</p>
                        </div>
                      </div>

                      <div className="shortcut-card" onClick={() => handleTabChange('payments')}>
                        <div className="shortcut-icon" style={{ backgroundColor: 'rgba(83, 110, 135, 0.15)', color: '#3E5A72' }}>
                          <CreditCard size={22} />
                        </div>
                        <div className="shortcut-info">
                          <h4>View Payments</h4>
                          <p>{formatCurrencyLKR(stats?.totalRevenue)} processed</p>
                        </div>
                      </div>

                      <div className="shortcut-card" onClick={() => handleTabChange('inquiries')}>
                        <div className="shortcut-icon" style={{ backgroundColor: 'rgba(117, 96, 78, 0.15)', color: '#5B4A3C' }}>
                          <MessageSquare size={22} />
                        </div>
                        <div className="shortcut-info">
                          <h4>View Inquiries</h4>
                          <p>{stats?.totalInquiries || 0} questions submitted</p>
                        </div>
                      </div>

                      <div className="shortcut-card" onClick={() => handleTabChange('users')}>
                        <div className="shortcut-icon" style={{ backgroundColor: 'rgba(96, 61, 40, 0.12)', color: '#603D28' }}>
                          <Users size={22} />
                        </div>
                        <div className="shortcut-info">
                          <h4>User Accounts</h4>
                          <p>{stats?.totalUsers || 0} total registered users</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* System & Persistence Status Box */}
                  <div className="system-status-box">
                    <div className="status-box-header">
                      <ShieldCheck size={20} color="#205D3C" />
                      <span>Data Persistence & Storage Health</span>
                    </div>
                    <div className="status-box-content">
                      <p>
                        All records are actively synchronized to backend text storage at <code>backend/data/*.txt</code>.
                        Passwords are cryptographically hashed with BCrypt. Public registration is restricted to buyers and sellers only.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 2: PROPERTIES */}
          {activeTab === 'properties' && (
            <div className="admin-tab-table-view">
              {loadingData ? (
                <LoadingSpinner />
              ) : properties.length === 0 ? (
                <div className="empty-table-state">
                  <Building2 size={40} className="empty-icon" />
                  <h3>No properties found</h3>
                  <p>There are currently no property listings in the database.</p>
                </div>
              ) : (
                <div className="table-responsive-wrapper">
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Property Title</th>
                        <th>Category</th>
                        <th>Type</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th>Seller</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {properties.map((p) => (
                        <tr key={p.id}>
                          <td className="id-cell">{p.id}</td>
                          <td className="title-cell">
                            <div className="property-title-flex">
                              {p.imageUrl && (
                                <img src={p.imageUrl} alt="" className="table-thumb" />
                              )}
                              <div>
                                <strong>{p.title}</strong>
                                <small className="table-subtext">{p.location}</small>
                              </div>
                            </div>
                          </td>
                          <td>{p.categoryName || p.categoryId}</td>
                          <td>
                            <span className="type-badge">{p.type}</span>
                          </td>
                          <td className="price-cell">
                            {formatCurrencyLKR(p.price)}
                          </td>
                          <td>
                            <span className={`badge badge-${p.status?.toLowerCase()}`}>
                              {p.status}
                            </span>
                          </td>
                          <td>{p.sellerName || p.sellerId}</td>
                          <td>
                            <div className="action-buttons-group">
                              <Link
                                to={`/properties/${p.id}`}
                                className="action-btn action-view"
                                title="View Property Details"
                              >
                                <Eye size={15} />
                              </Link>
                              <button
                                onClick={() => handleDeleteProperty(p)}
                                className="action-btn action-delete"
                                title="Delete Property Listing"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="admin-tab-table-view">
              {loadingData ? (
                <LoadingSpinner />
              ) : categories.length === 0 ? (
                <div className="empty-table-state">
                  <Layers size={40} className="empty-icon" />
                  <h3>No Categories Created</h3>
                  <p>Create your first real estate category using the button above.</p>
                </div>
              ) : (
                <div className="table-responsive-wrapper">
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Category Name</th>
                        <th>Description</th>
                        <th>Icon</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((c) => (
                        <tr key={c.id}>
                          <td className="id-cell">{c.id}</td>
                          <td>
                            <strong>{c.name}</strong>
                          </td>
                          <td className="desc-cell">{c.description || '—'}</td>
                          <td><code>{c.icon || 'home'}</code></td>
                          <td>{formatDate(c.createdAt)}</td>
                          <td>
                            <div className="action-buttons-group">
                              <button
                                onClick={() => handleOpenEditCategory(c)}
                                className="action-btn action-edit"
                                title="Edit Category"
                              >
                                <Edit size={15} />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(c)}
                                className="action-btn action-delete"
                                title="Delete Category"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: BOOKINGS */}
          {activeTab === 'bookings' && (
            <div className="admin-tab-table-view">
              {loadingData ? (
                <LoadingSpinner />
              ) : bookings.length === 0 ? (
                <div className="empty-table-state">
                  <CalendarCheck size={40} className="empty-icon" />
                  <h3>No Bookings Recorded</h3>
                  <p>There are no reservation requests or viewing appointments recorded.</p>
                </div>
              ) : (
                <div className="table-responsive-wrapper">
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>Booking ID</th>
                        <th>Property</th>
                        <th>Buyer</th>
                        <th>Viewing Date</th>
                        <th>Deposit Fee</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((b) => (
                        <tr key={b.id}>
                          <td className="id-cell">{b.id}</td>
                          <td>
                            <strong>{b.propertyTitle || b.propertyId}</strong>
                          </td>
                          <td>
                            <div>{b.buyerName || b.buyerId}</div>
                            <small className="table-subtext">{b.buyerEmail || '—'}</small>
                          </td>
                          <td>{b.bookingDate || '—'}</td>
                          <td className="price-cell">{formatCurrencyLKR(b.reservationFee)}</td>
                          <td>
                            <span className={`badge badge-${b.status?.toLowerCase()}`}>
                              {b.status}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons-group">
                              <button
                                onClick={() => handleOpenStatusModal(b)}
                                className="action-btn action-edit"
                                title="Update Booking Status"
                              >
                                <Edit size={15} />
                              </button>
                              <button
                                onClick={() => handleDeleteBooking(b)}
                                className="action-btn action-delete"
                                title="Delete Booking Record"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: PAYMENTS */}
          {activeTab === 'payments' && (
            <div className="admin-tab-table-view">
              <div className="simulated-notice-banner">
                <Info size={18} />
                <span>
                  <strong>Note:</strong> Payments reflect simulated reservation-fee deposits made by buyers to hold viewings. Successful transaction records are retained for compliance.
                </span>
              </div>

              {loadingData ? (
                <LoadingSpinner />
              ) : payments.length === 0 ? (
                <div className="empty-table-state">
                  <CreditCard size={40} className="empty-icon" />
                  <h3>No Payments Recorded</h3>
                  <p>No reservation fee payments have been simulated yet.</p>
                </div>
              ) : (
                <div className="table-responsive-wrapper">
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>Payment ID</th>
                        <th>Booking ID</th>
                        <th>Amount</th>
                        <th>Method</th>
                        <th>Reference</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((p) => (
                        <tr key={p.id}>
                          <td className="id-cell">{p.id}</td>
                          <td>{p.bookingId}</td>
                          <td className="price-cell">{formatCurrencyLKR(p.amount)}</td>
                          <td><code>{p.method}</code></td>
                          <td className="ref-cell">{p.transactionReference}</td>
                          <td>
                            <span className={`badge badge-${p.status?.toLowerCase()}`}>
                              {p.status}
                            </span>
                          </td>
                          <td>{formatDate(p.createdAt)}</td>
                          <td>
                            <div className="action-buttons-group">
                              <button
                                onClick={() => handleViewReceipt(p)}
                                className="action-btn action-view"
                                title="View Receipt"
                              >
                                <Receipt size={15} />
                              </button>
                              {p.status !== 'COMPLETED' ? (
                                <button
                                  onClick={() => handleDeleteFailedPayment(p)}
                                  className="action-btn action-delete"
                                  title="Delete Failed Record"
                                >
                                  <Trash2 size={15} />
                                </button>
                              ) : (
                                <span className="protected-pill" title="Successful records are retained permanent">
                                  Retained
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: INQUIRIES */}
          {activeTab === 'inquiries' && (
            <div className="admin-tab-table-view">
              {loadingData ? (
                <LoadingSpinner />
              ) : inquiries.length === 0 ? (
                <div className="empty-table-state">
                  <MessageSquare size={40} className="empty-icon" />
                  <h3>No Inquiries Found</h3>
                  <p>Buyers have not asked any property questions yet.</p>
                </div>
              ) : (
                <div className="table-responsive-wrapper">
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Property</th>
                        <th>Buyer</th>
                        <th>Question</th>
                        <th>Status</th>
                        <th>Response</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inquiries.map((inq) => (
                        <tr key={inq.id}>
                          <td className="id-cell">{inq.id}</td>
                          <td><strong>{inq.propertyTitle || inq.propertyId}</strong></td>
                          <td>
                            <div>{inq.buyerName || inq.buyerId}</div>
                            <small className="table-subtext">{inq.buyerEmail || '—'}</small>
                          </td>
                          <td className="question-cell">{inq.question}</td>
                          <td>
                            <span className={`badge badge-${inq.status?.toLowerCase()}`}>
                              {inq.status}
                            </span>
                          </td>
                          <td className="response-cell">
                            {inq.response || <span className="no-desc">Awaiting reply</span>}
                          </td>
                          <td>
                            <div className="action-buttons-group">
                              <button
                                onClick={() => handleOpenReplyModal(inq)}
                                className="action-btn action-edit"
                                title="Reply / Edit Response"
                              >
                                <MessageCircle size={15} />
                              </button>
                              <button
                                onClick={() => handleDeleteInquiry(inq)}
                                className="action-btn action-delete"
                                title="Delete Inquiry"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="admin-tab-table-view">
              {loadingData ? (
                <LoadingSpinner />
              ) : reviews.length === 0 ? (
                <div className="empty-table-state">
                  <Star size={40} className="empty-icon" />
                  <h3>No Reviews Found</h3>
                  <p>No buyer feedback or property reviews have been submitted.</p>
                </div>
              ) : (
                <div className="table-responsive-wrapper">
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Property ID</th>
                        <th>Reviewer</th>
                        <th>Rating</th>
                        <th>Feedback Comment</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviews.map((rev) => (
                        <tr key={rev.id}>
                          <td className="id-cell">{rev.id}</td>
                          <td>{rev.propertyId}</td>
                          <td><strong>{rev.userName || rev.userId}</strong></td>
                          <td>
                            <div className="rating-stars-row">
                              {[...Array(rev.rating || 0)].map((_, i) => (
                                <Star key={i} size={14} className="star-filled" />
                              ))}
                              <span className="rating-num">({rev.rating})</span>
                            </div>
                          </td>
                          <td className="comment-cell">{rev.comment}</td>
                          <td>{formatDate(rev.createdAt)}</td>
                          <td>
                            <div className="action-buttons-group">
                              <button
                                onClick={() => handleDeleteReview(rev)}
                                className="action-btn action-delete"
                                title="Remove Inappropriate Review"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 8: USERS */}
          {activeTab === 'users' && (
            <div className="admin-tab-table-view">
              {loadingData ? (
                <LoadingSpinner />
              ) : usersList.length === 0 ? (
                <div className="empty-table-state">
                  <Users size={40} className="empty-icon" />
                  <h3>No Users Listed</h3>
                </div>
              ) : (
                <div className="table-responsive-wrapper">
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>User ID</th>
                        <th>Full Name</th>
                        <th>Email Address</th>
                        <th>Phone</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Registered</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersList.map((u) => {
                        const isDefaultAdmin = u.role === 'ADMIN' || u.email === 'admin@realestate.com';
                        return (
                          <tr key={u.id}>
                            <td className="id-cell">{u.id}</td>
                            <td>
                              <div className="user-name-flex">
                                <strong>{u.name}</strong>
                                {isDefaultAdmin && (
                                  <span className="protected-admin-badge" title="Default administrator is permanently protected">
                                    <Shield size={12} /> Default Admin
                                  </span>
                                )}
                              </div>
                            </td>
                            <td>{u.email}</td>
                            <td>{u.phone || '—'}</td>
                            <td>
                              <span className={`user-role-badge role-${u.role?.toLowerCase()}`}>
                                {u.role}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${u.active ? 'badge-active' : 'badge-failed'}`}>
                                {u.active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td>{formatDate(u.createdAt)}</td>
                            <td>
                              <div className="action-buttons-group">
                                {isDefaultAdmin ? (
                                  <span className="protected-pill" title="Cannot delete system administrator">
                                    Protected
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handleDeleteUser(u)}
                                    className="action-btn action-delete"
                                    title="Delete User Account"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* MODAL 1: ADD / EDIT CATEGORY */}
      {categoryModal.isOpen && (
        <div className="modal-overlay">
          <div className="modal-box form-card">
            <h3 className="modal-title">
              {categoryModal.mode === 'create' ? 'Create New Category' : 'Edit Category'}
            </h3>
            <p className="page-subtitle" style={{ fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              Categories organize properties in listings and search filters.
            </p>

            <form onSubmit={handleSaveCategory}>
              <div className="form-group">
                <label className="form-label">Category Name</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Luxury Villa, Commercial Office"
                  value={categoryModal.data.name}
                  onChange={(e) => setCategoryModal({
                    ...categoryModal,
                    data: { ...categoryModal.data, name: e.target.value }
                  })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  rows={3}
                  className="form-textarea"
                  placeholder="Describe properties included in this category"
                  value={categoryModal.data.description}
                  onChange={(e) => setCategoryModal({
                    ...categoryModal,
                    data: { ...categoryModal.data, description: e.target.value }
                  })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Icon Identifier</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. home, building, map-pin, briefcase"
                  value={categoryModal.data.icon}
                  onChange={(e) => setCategoryModal({
                    ...categoryModal,
                    data: { ...categoryModal.data, icon: e.target.value }
                  })}
                />
              </div>

              <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setCategoryModal({ isOpen: false, mode: 'create', data: { id: '', name: '', description: '', icon: 'home' }, loading: false })}
                  disabled={categoryModal.loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={categoryModal.loading}
                >
                  {categoryModal.loading ? 'Saving...' : (categoryModal.mode === 'create' ? 'Create Category' : 'Update Category')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: UPDATE BOOKING STATUS */}
      {bookingStatusModal.isOpen && (
        <div className="modal-overlay">
          <div className="modal-box form-card">
            <h3 className="modal-title">Update Booking Status</h3>
            <p className="page-subtitle" style={{ fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              Booking #{bookingStatusModal.booking?.id} — {bookingStatusModal.booking?.propertyTitle}
            </p>

            <form onSubmit={handleUpdateBookingStatus}>
              <div className="form-group">
                <label className="form-label">Select Permitted Status</label>
                <select
                  className="form-select"
                  value={bookingStatusModal.newStatus}
                  onChange={(e) => setBookingStatusModal({
                    ...bookingStatusModal,
                    newStatus: e.target.value
                  })}
                >
                  <option value="PENDING_APPROVAL">PENDING_APPROVAL</option>
                  <option value="APPROVED">APPROVED (Ready for payment)</option>
                  <option value="CONFIRMED">CONFIRMED (Payment completed)</option>
                  <option value="REJECTED">REJECTED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setBookingStatusModal({ isOpen: false, booking: null, newStatus: 'APPROVED', loading: false })}
                  disabled={bookingStatusModal.loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={bookingStatusModal.loading}
                >
                  {bookingStatusModal.loading ? 'Updating...' : 'Save Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: REPLY TO INQUIRY */}
      {inquiryReplyModal.isOpen && (
        <div className="modal-overlay">
          <div className="modal-box form-card">
            <h3 className="modal-title">Answer Inquiry</h3>
            <p className="page-subtitle" style={{ fontSize: '0.88rem', marginBottom: '1rem' }}>
              Inquiry #{inquiryReplyModal.inquiry?.id} for {inquiryReplyModal.inquiry?.propertyTitle}
            </p>

            <div className="inquiry-question-box">
              <strong>Question asked by {inquiryReplyModal.inquiry?.buyerName}:</strong>
              <p>"{inquiryReplyModal.inquiry?.question}"</p>
            </div>

            <form onSubmit={handleSendInquiryReply}>
              <div className="form-group">
                <label className="form-label">Response Answer</label>
                <textarea
                  rows={4}
                  required
                  className="form-textarea"
                  placeholder="Type official response to buyer's question..."
                  value={inquiryReplyModal.responseText}
                  onChange={(e) => setInquiryReplyModal({
                    ...inquiryReplyModal,
                    responseText: e.target.value
                  })}
                />
              </div>

              <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setInquiryReplyModal({ isOpen: false, inquiry: null, responseText: '', loading: false })}
                  disabled={inquiryReplyModal.loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={inquiryReplyModal.loading}
                >
                  {inquiryReplyModal.loading ? 'Submitting...' : 'Send Response'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: PAYMENT RECEIPT */}
      {receiptModal.isOpen && (
        <div className="modal-overlay">
          <div className="modal-box form-card receipt-modal-box">
            <div className="receipt-modal-header">
              <Receipt size={28} className="receipt-icon" />
              <h3 className="modal-title">Simulated Payment Receipt</h3>
              <p className="receipt-ref">TXN Ref: {receiptModal.receipt?.transactionReference}</p>
            </div>

            <div className="receipt-details-list">
              <div className="receipt-row">
                <span>Receipt ID:</span>
                <strong>{receiptModal.receipt?.paymentId}</strong>
              </div>
              <div className="receipt-row">
                <span>Property:</span>
                <strong>{receiptModal.receipt?.propertyTitle}</strong>
              </div>
              <div className="receipt-row">
                <span>Buyer Name:</span>
                <strong>{receiptModal.receipt?.buyerName}</strong>
              </div>
              <div className="receipt-row">
                <span>Buyer Email:</span>
                <strong>{receiptModal.receipt?.buyerEmail}</strong>
              </div>
              <div className="receipt-row">
                <span>Payment Method:</span>
                <strong>{receiptModal.receipt?.method}</strong>
              </div>
              <div className="receipt-row">
                <span>Payment Status:</span>
                <span className="badge badge-completed">{receiptModal.receipt?.status}</span>
              </div>
              <div className="receipt-row">
                <span>Payment Date:</span>
                <strong>{formatDate(receiptModal.receipt?.timestamp)}</strong>
              </div>
              <div className="receipt-total-row">
                <span>Reservation Fee Paid:</span>
                <span className="receipt-total-amount">
                  {formatCurrencyLKR(receiptModal.receipt?.amount)}
                </span>
              </div>
            </div>

            <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn btn-primary"
                style={{ width: '100%' }}
                onClick={() => setReceiptModal({ isOpen: false, receipt: null, loading: false })}
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: CONFIRM MODAL */}
      {confirmModal.isOpen && (
        <ConfirmModal
          title={confirmModal.title}
          message={confirmModal.message}
          danger={confirmModal.danger}
          loading={confirmModal.loading}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null, danger: true, loading: false })}
        />
      )}
    </div>
  );
}
