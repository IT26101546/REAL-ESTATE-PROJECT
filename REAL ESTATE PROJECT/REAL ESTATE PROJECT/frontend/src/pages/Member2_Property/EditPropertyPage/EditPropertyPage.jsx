import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../../../context/ToastContext';
import { getPropertyById, updateProperty } from '../../../api/propertyApi';
import { getCategories } from '../../../api/categoryAdminApi';
import { Building, MapPin, DollarSign, Image, FileText, Bed, Bath, Maximize2, ArrowLeft, Save } from 'lucide-react';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import './EditPropertyPage.css';

export default function EditPropertyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    location: '',
    price: '',
    type: 'SALE',
    bedrooms: '2',
    bathrooms: '2',
    area: '1200',
    imageUrl: '',
    status: 'AVAILABLE'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    async function loadData() {
      try {
        const [propData, catsData] = await Promise.all([
          getPropertyById(id),
          getCategories()
        ]);

        const catList = Array.isArray(catsData) ? catsData : [];
        setCategories(catList);

        if (propData) {
          setFormData({
            title: propData.title || '',
            description: propData.description || '',
            categoryId: propData.categoryId || (catList[0]?.id || ''),
            location: propData.location || '',
            price: propData.price != null ? String(propData.price) : '',
            type: propData.type || 'SALE',
            bedrooms: propData.bedrooms != null ? String(propData.bedrooms) : '0',
            bathrooms: propData.bathrooms != null ? String(propData.bathrooms) : '0',
            area: propData.area != null ? String(propData.area) : '1000',
            imageUrl: propData.imageUrl || '',
            status: propData.status || 'AVAILABLE'
          });
        }
      } catch (err) {
        showToast(err.message || 'Failed to load property details', 'error');
        navigate('/properties/my-properties');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Title is required';
    if (!formData.description.trim()) errs.description = 'Description is required';
    if (!formData.categoryId) errs.categoryId = 'Category is required';
    if (!formData.location.trim()) errs.location = 'Location is required';
    if (!formData.price || Number(formData.price) <= 0) errs.price = 'Valid price is required';
    if (!formData.area || Number(formData.area) <= 0) errs.area = 'Valid area in sqft is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        categoryId: formData.categoryId,
        location: formData.location.trim(),
        price: parseFloat(formData.price),
        type: formData.type,
        bedrooms: parseInt(formData.bedrooms, 10) || 0,
        bathrooms: parseInt(formData.bathrooms, 10) || 0,
        area: parseFloat(formData.area),
        imageUrl: formData.imageUrl.trim() || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
        status: formData.status
      };

      await updateProperty(id, payload);
      showToast('Property updated successfully!', 'success');
      navigate('/properties/my-properties');
    } catch (err) {
      showToast(err.message || 'Failed to update property', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading property..." />;

  return (
    <div className="edit-property-page page-wrapper container">
      <div className="edit-property-container">
        <div className="edit-property-header">
          <button className="btn-outline btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: '1rem' }}>
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
          <h1 className="page-title gradient-text" style={{ fontSize: '2.5rem', textAlign: 'left' }}>Edit Property Listing</h1>
          <p className="page-subtitle" style={{ textAlign: 'left', margin: '0 0 2rem' }}>Update property specs, pricing, and availability details</p>
        </div>

        <form onSubmit={handleSubmit} className="edit-property-form">
          {/* General Information */}
          <div className="edit-form-section">
            <h2 className="edit-form-section-title">
              <Building size={18} />
              <span>General Information</span>
            </h2>

            <div className="form-group">
              <label className="form-label">
                Listing Title <span className="required-star">*</span>
              </label>
              <input
                type="text"
                name="title"
                className="form-control"
                value={formData.title}
                onChange={handleChange}
                maxLength={120}
              />
              {errors.title && <span className="form-error">{errors.title}</span>}
              <div className="edit-char-counter">{formData.title.length} / 120</div>
            </div>

            <div className="edit-form-row">
              <div className="form-group">
                <label className="form-label">
                  Category <span className="required-star">*</span>
                </label>
                <select
                  name="categoryId"
                  className="form-control"
                  value={formData.categoryId}
                  onChange={handleChange}
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {errors.categoryId && <span className="form-error">{errors.categoryId}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Listing Type <span className="required-star">*</span>
                </label>
                <select
                  name="type"
                  className="form-control"
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option value="SALE">For Sale</option>
                  <option value="RENT">For Rent</option>
                </select>
              </div>
            </div>

            <div className="edit-form-row">
              <div className="form-group">
                <label className="form-label">
                  Price (LKR) <span className="required-star">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  className="form-control"
                  value={formData.price}
                  onChange={handleChange}
                  min="1"
                  step="any"
                />
                {errors.price && <span className="form-error">{errors.price}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Status
                </label>
                <select
                  name="status"
                  className="form-control"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="AVAILABLE">AVAILABLE</option>
                  <option value="RESERVED">RESERVED</option>
                  <option value="SOLD">SOLD</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Location / City <span className="required-star">*</span>
              </label>
              <input
                type="text"
                name="location"
                className="form-control"
                value={formData.location}
                onChange={handleChange}
              />
              {errors.location && <span className="form-error">{errors.location}</span>}
            </div>
          </div>

          {/* Specifications */}
          <div className="edit-form-section">
            <h2 className="edit-form-section-title">
              <Maximize2 size={18} />
              <span>Property Specifications</span>
            </h2>

            <div className="edit-form-row">
              <div className="form-group">
                <label className="form-label">Bedrooms</label>
                <input
                  type="number"
                  name="bedrooms"
                  className="form-control"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Bathrooms</label>
                <input
                  type="number"
                  name="bathrooms"
                  className="form-control"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  min="0"
                />
              </div>
            </div>

            <div className="edit-form-row">
              <div className="form-group">
                <label className="form-label">
                  Total Area (sqft) <span className="required-star">*</span>
                </label>
                <input
                  type="number"
                  name="area"
                  className="form-control"
                  value={formData.area}
                  onChange={handleChange}
                  min="1"
                />
                {errors.area && <span className="form-error">{errors.area}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input
                  type="url"
                  name="imageUrl"
                  className="form-control"
                  value={formData.imageUrl}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="edit-form-section">
            <h2 className="edit-form-section-title">
              <FileText size={18} />
              <span>Detailed Description</span>
            </h2>

            <div className="form-group">
              <label className="form-label">
                Description <span className="required-star">*</span>
              </label>
              <textarea
                name="description"
                className="form-control"
                value={formData.description}
                onChange={handleChange}
                rows={5}
              />
              {errors.description && <span className="form-error">{errors.description}</span>}
            </div>
          </div>

          <div className="edit-submit-row">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/properties/my-properties')}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              <Save size={16} />
              <span>{submitting ? 'Saving Changes...' : 'Save Property Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
