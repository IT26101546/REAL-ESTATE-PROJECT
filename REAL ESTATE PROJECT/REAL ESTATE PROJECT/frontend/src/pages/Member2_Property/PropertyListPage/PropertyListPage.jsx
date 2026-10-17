import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, RotateCcw, Building2, SlidersHorizontal, Tag } from 'lucide-react';
import { getProperties } from '../../../api/propertyApi';
import { getCategories } from '../../../api/categoryAdminApi';
import { getMyBookings } from '../../../api/bookingPaymentApi';
import { useAuth } from '../../../context/AuthContext';
import PropertyCard from '../../../components/PropertyCard/PropertyCard';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import './PropertyListPage.css';

export default function PropertyListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();

  const [properties, setProperties] = useState([]);
  const [categories, setCategories] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [visibleCount, setVisibleCount] = useState(9);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter state
  const [searchTerm, setSearchTerm] = useState(searchParams.get('location') || searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categoryId') || 'All');
  const [filterType, setFilterType] = useState(searchParams.get('type') || 'All');
  const [filterMinPrice, setFilterMinPrice] = useState('');
  const [filterMaxPrice, setFilterMaxPrice] = useState('');

  // Synchronize URL search params if changed from outside
  useEffect(() => {
    const locFromUrl = searchParams.get('location') || searchParams.get('search');
    if (locFromUrl !== null && locFromUrl !== undefined) {
      setSearchTerm(locFromUrl);
    }
    const catFromUrl = searchParams.get('categoryId');
    if (catFromUrl) {
      setSelectedCategory(catFromUrl);
    }
    const typeFromUrl = searchParams.get('type');
    if (typeFromUrl) {
      setFilterType(typeFromUrl);
    }
    setVisibleCount(9);
  }, [searchParams]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError('');
      try {
        const [propsData, catsData] = await Promise.all([
          getProperties(),
          getCategories(),
        ]);
        const propList = Array.isArray(propsData) ? propsData : (propsData?.data || []);
        const catList = Array.isArray(catsData) ? catsData : (catsData?.data || []);
        setProperties(propList);
        setCategories(catList);

        if (isAuthenticated) {
          try {
            const bData = await getMyBookings();
            const bList = Array.isArray(bData) ? bData : (bData?.data || []);
            setUserBookings(bList.filter((b) => b.status !== 'CANCELLED' && b.status !== 'REJECTED'));
          } catch (_) {}
        }
      } catch (err) {
        setError('Failed to load property listings. Please ensure the backend is connected.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [isAuthenticated]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setFilterType('All');
    setFilterMinPrice('');
    setFilterMaxPrice('');
    setVisibleCount(9);
    setSearchParams({});
  };

  // Client-side filtering across keyword, category, type, and price range
  const filtered = properties.filter((p) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !term ||
      p.title?.toLowerCase().includes(term) ||
      p.location?.toLowerCase().includes(term) ||
      p.categoryName?.toLowerCase().includes(term);

    const matchesCategory =
      selectedCategory === 'All' ||
      String(p.categoryId) === String(selectedCategory);

    const matchesType =
      filterType === 'All' ||
      p.type === filterType;

    const matchesMinPrice =
      !filterMinPrice ||
      Number(p.price) >= Number(filterMinPrice);

    const matchesMaxPrice =
      !filterMaxPrice ||
      Number(p.price) <= Number(filterMaxPrice);

    return matchesSearch && matchesCategory && matchesType && matchesMinPrice && matchesMaxPrice;
  });

  return (
    <div className="explore-properties-page page-wrapper container">
      {/* ── Page Header ────────────────────────────────────── */}
      <header className="page-header">
        <h1 className="page-title gradient-text">Explore Properties</h1>
        <p className="page-subtitle">
          Discover verified houses, apartments, lands, and commercial spaces across Sri Lanka
        </p>
      </header>

      {/* ── Search Bar (TicketPro style) ───────────────────── */}
      <div className="search-container">
        <div className="search-wrapper">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search properties by title, neighborhood, or city (e.g. Colombo, Kandy)..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* ── Filter Panel ───────────────────────────────────── */}
      <div className="glass-panel filter-panel">
        <div className="filter-panel-header">
          <div className="filter-header-left">
            <SlidersHorizontal size={18} className="text-primary" />
            <span className="filter-title">Filter by Category</span>
          </div>

          <button onClick={resetFilters} className="btn-outline clear-filters-btn">
            <RotateCcw size={14} />
            <span>Clear Filters</span>
          </button>
        </div>

        {/* Category Filter Chips */}
        <div className="filter-chips-row">
          <button
            className={`filter-chip ${selectedCategory === 'All' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('All')}
          >
            All Properties
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`filter-chip ${String(selectedCategory) === String(cat.id) ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Secondary Filter Row: Sale/Rent & Price Ranges */}
        <div className="secondary-filters-row">
          {/* Sale / Rent Segmented Chips */}
          <div className="filter-subgroup">
            <label className="subgroup-label">Listing Type</label>
            <div className="type-toggle-group">
              <button
                className={`type-chip ${filterType === 'All' ? 'active' : ''}`}
                onClick={() => setFilterType('All')}
              >
                All Types
              </button>
              <button
                className={`type-chip ${filterType === 'SALE' ? 'active' : ''}`}
                onClick={() => setFilterType('SALE')}
              >
                For Sale
              </button>
              <button
                className={`type-chip ${filterType === 'RENT' ? 'active' : ''}`}
                onClick={() => setFilterType('RENT')}
              >
                For Rent
              </button>
            </div>
          </div>

          {/* Min Price */}
          <div className="filter-subgroup price-input-group">
            <label className="subgroup-label">Min Price (LKR)</label>
            <input
              type="number"
              className="form-input filter-price-input"
              placeholder="Min amount"
              value={filterMinPrice}
              onChange={(e) => setFilterMinPrice(e.target.value)}
              min="0"
            />
          </div>

          {/* Max Price */}
          <div className="filter-subgroup price-input-group">
            <label className="subgroup-label">Max Price (LKR)</label>
            <input
              type="number"
              className="form-input filter-price-input"
              placeholder="Max amount"
              value={filterMaxPrice}
              onChange={(e) => setFilterMaxPrice(e.target.value)}
              min="0"
            />
          </div>
        </div>
      </div>

      {/* ── Results Count ──────────────────────────────────── */}
      <div className="results-header-bar">
        <span className="results-count-text">
          Showing <strong>{Math.min(visibleCount, filtered.length)}</strong> of <strong>{filtered.length}</strong> {filtered.length === 1 ? 'property' : 'properties'}
        </span>
      </div>

      {/* ── Content States ─────────────────────────────────── */}
      {loading ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
          <LoadingSpinner message="Loading properties..." />
        </div>
      ) : error ? (
        <div className="glass-panel error-panel">
          <p>{error}</p>
          <button onClick={resetFilters} className="btn-primary" style={{ marginTop: '1rem' }}>
            Reload Listings
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel no-results">
          <h3>No properties found matching your criteria.</h3>
          <p>Try adjusting your search terms, price limits, or category selection.</p>
          <button onClick={resetFilters} className="btn-primary" style={{ marginTop: '1.5rem' }}>
            <RotateCcw size={16} />
            <span>Reset All Filters</span>
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-6 properties-explore-grid">
            {filtered.slice(0, visibleCount).map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                userBooking={userBookings.find((b) => b.propertyId === property.id)}
              />
            ))}
          </div>

          {visibleCount < filtered.length && (
            <div style={{ textAlign: 'center', marginTop: '2.5rem', marginBottom: '1rem' }}>
              <button
                type="button"
                className="btn-primary"
                style={{ padding: '0.85rem 2.25rem', fontSize: '0.95rem' }}
                onClick={() => setVisibleCount((prev) => prev + 9)}
              >
                Load More Properties ({Math.min(visibleCount, filtered.length)} of {filtered.length})
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
