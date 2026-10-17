import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { propertyApi } from '../../api/propertyApi';
import { categoryAdminApi } from '../../api/categoryAdminApi';
import { getMyBookings } from '../../api/bookingPaymentApi';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  MapPin,
  Home as HomeIcon,
  Building2,
  Trees,
  Briefcase,
  Tag,
  ChevronRight,
  ArrowRight,
  User,
  PlusCircle,
  ShieldCheck,
  CalendarCheck
} from 'lucide-react';
import PropertyCard from '../../components/PropertyCard/PropertyCard';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import './HomePage.css';

export default function HomePage() {
  const { isAuthenticated, isSeller, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [categories, setCategories] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Hero Search Panel State
  const [searchLocation, setSearchLocation] = useState('');
  const [searchCategoryId, setSearchCategoryId] = useState('');
  const [searchPurpose, setSearchPurpose] = useState('');

  useEffect(() => {
    async function loadHomeData() {
      setLoading(true);
      setError('');
      try {
        const [propsRes, catsRes] = await Promise.allSettled([
          propertyApi.getProperties({ status: 'AVAILABLE' }),
          categoryAdminApi.getCategories()
        ]);

        let availableList = [];
        if (propsRes.status === 'fulfilled') {
          const list = Array.isArray(propsRes.value) ? propsRes.value : (propsRes.value?.data || []);
          availableList = list.filter((p) => p.status === 'AVAILABLE');
        } else {
          console.error('Failed to load homepage properties', propsRes.reason);
        }

        // Resilient fallback: if explicit available query returns empty, fetch all and filter AVAILABLE
        if (availableList.length === 0) {
          try {
            const allProps = await propertyApi.getProperties();
            const list = Array.isArray(allProps) ? allProps : (allProps?.data || []);
            availableList = list.filter((p) => p.status === 'AVAILABLE');
          } catch (fallbackErr) {
            console.error('Fallback property fetch failed', fallbackErr);
          }
        }

        // Display up to 6 eligible AVAILABLE properties
        setFeaturedProperties(availableList.slice(0, 6));

        if (catsRes.status === 'fulfilled') {
          const catList = Array.isArray(catsRes.value) ? catsRes.value : (catsRes.value?.data || []);
          setCategories(catList);
        } else {
          console.error('Failed to load homepage categories', catsRes.reason);
        }

        if (isAuthenticated) {
          try {
            const bRes = await getMyBookings();
            const bList = Array.isArray(bRes) ? bRes : (bRes?.data || []);
            setUserBookings(bList.filter((b) => b.status !== 'CANCELLED' && b.status !== 'REJECTED'));
          } catch (bErr) {
            console.warn('Failed to load user bookings on homepage', bErr);
          }
        }
      } catch (err) {
        console.error('Failed to load homepage data', err);
        setError('Unable to load listings right now. Please check backend connection.');
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, [isAuthenticated]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchLocation) params.set('location', searchLocation);
    if (searchCategoryId) params.set('categoryId', searchCategoryId);
    if (searchPurpose) params.set('type', searchPurpose);
    navigate(`/properties?${params.toString()}`);
  };

  // Find backend categories for the 4 preview tiles
  const findCategory = (term) => {
    return categories.find((c) =>
      c.name?.toLowerCase().includes(term.toLowerCase())
    );
  };

  const houseCat = findCategory('house');
  const aptCat = findCategory('apartment');
  const landCat = findCategory('land');
  const commCat = findCategory('commercial');

  const categoryCards = [
    {
      title: 'House',
      desc: 'Find your dream house',
      icon: <HomeIcon size={22} />,
      categoryId: houseCat?.id || ''
    },
    {
      title: 'Apartment',
      desc: 'Modern city living',
      icon: <Building2 size={22} />,
      categoryId: aptCat?.id || ''
    },
    {
      title: 'Land',
      desc: 'Investment opportunities',
      icon: <Trees size={22} />,
      categoryId: landCat?.id || ''
    },
    {
      title: 'Commercial',
      desc: 'Grow your business',
      icon: <Briefcase size={22} />,
      categoryId: commCat?.id || ''
    }
  ];

  return (
    <div className="home-page">
      {/* ── 1. Homepage Hero ─────────────────────────────────── */}
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Find Your Perfect Home or Investment
            </h1>
            <p className="hero-subtitle">
              Explore properties across Sri Lanka.
            </p>

            <div className="hero-buttons">
              <Link to="/properties" className="btn-primary hero-btn">
                <Search size={18} />
                <span>Browse Properties</span>
              </Link>

              {!isAuthenticated ? (
                <Link to="/register" className="btn-outline hero-btn hero-create-acc-btn">
                  <User size={18} />
                  <span>Create Account</span>
                </Link>
              ) : isSeller ? (
                <Link to="/add-property" className="btn-outline hero-btn">
                  <PlusCircle size={18} />
                  <span>Add Property</span>
                </Link>
              ) : isAdmin ? (
                <Link to="/admin" className="btn-outline hero-btn">
                  <ShieldCheck size={18} />
                  <span>Admin Dashboard</span>
                </Link>
              ) : (
                <Link to="/my-bookings" className="btn-outline hero-btn">
                  <CalendarCheck size={18} />
                  <span>My Bookings</span>
                </Link>
              )}
            </div>

            {/* ── 5. Search Panel ──────────────────────────────── */}
            <form onSubmit={handleSearchSubmit} className="hero-search-panel">
              {/* Location */}
              <div className="search-field">
                <div className="search-field-icon">
                  <MapPin size={18} />
                </div>
                <div className="search-field-text">
                  <label htmlFor="hero-location" className="search-field-label">Location</label>
                  <select
                    id="hero-location"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="search-field-select"
                  >
                    <option value="">Select location</option>
                    <option value="Colombo">Colombo</option>
                    <option value="Kandy">Kandy</option>
                    <option value="Galle">Galle</option>
                    <option value="Dehiwala">Dehiwala</option>
                    <option value="Kadawatha">Kadawatha</option>
                    <option value="Negombo">Negombo</option>
                  </select>
                </div>
              </div>

              <div className="search-divider" />

              {/* Property Type */}
              <div className="search-field">
                <div className="search-field-icon">
                  <HomeIcon size={18} />
                </div>
                <div className="search-field-text">
                  <label htmlFor="hero-prop-type" className="search-field-label">Property Type</label>
                  <select
                    id="hero-prop-type"
                    value={searchCategoryId}
                    onChange={(e) => setSearchCategoryId(e.target.value)}
                    className="search-field-select"
                  >
                    <option value="">Any type</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="search-divider" />

              {/* Purpose (Sale / Rent) */}
              <div className="search-field">
                <div className="search-field-icon">
                  <Tag size={18} />
                </div>
                <div className="search-field-text">
                  <label htmlFor="hero-purpose" className="search-field-label">Purpose</label>
                  <select
                    id="hero-purpose"
                    value={searchPurpose}
                    onChange={(e) => setSearchPurpose(e.target.value)}
                    className="search-field-select"
                  >
                    <option value="">For Sale or Rent</option>
                    <option value="SALE">For Sale</option>
                    <option value="RENT">For Rent</option>
                  </select>
                </div>
              </div>

              {/* Search Button */}
              <button type="submit" className="hero-search-submit-btn">
                <Search size={18} />
                <span>Search</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ── 6. Category Cards ───────────────────────────────── */}
      <section className="home-categories-section">
        <div className="container">
          <div className="categories-preview-grid">
            {categoryCards.map((cat, idx) => (
              <Link
                key={idx}
                to={cat.categoryId ? `/properties?categoryId=${cat.categoryId}` : '/properties'}
                className="category-preview-card"
              >
                <div className="category-card-icon">
                  {cat.icon}
                </div>
                <div className="category-card-info">
                  <h3 className="category-card-title">{cat.title}</h3>
                  <p className="category-card-desc">{cat.desc}</p>
                </div>
                <div className="category-card-arrow">
                  <ChevronRight size={18} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. Featured Properties ───────────────────────────── */}
      <section className="featured-properties-section">
        <div className="container">
          <div className="featured-header">
            <div>
              <h2 className="featured-title">Featured Properties</h2>
            </div>
            <Link to="/properties" className="view-all-pill-btn">
              <span>View All Properties</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          {loading ? (
            <div className="glass-panel" style={{ padding: '3.5rem', textAlign: 'center' }}>
              <LoadingSpinner message="Loading featured properties..." />
            </div>
          ) : error ? (
            <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--danger-color)' }}>
              <p>{error}</p>
            </div>
          ) : featuredProperties.length === 0 ? (
            <div className="glass-panel no-listings-box">
              <h3>No featured properties found.</h3>
              <p>Check back soon or browse our full property catalog.</p>
              <Link to="/properties" className="btn-primary" style={{ marginTop: '1.25rem' }}>
                Browse All Properties
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-6 featured-properties-grid">
              {featuredProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  userBooking={userBookings.find((b) => b.propertyId === property.id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
