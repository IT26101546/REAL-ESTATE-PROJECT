import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../context/ToastContext';
import { createCategory } from '../../../api/categoryAdminApi';
import { Tag, ArrowLeft, Plus } from 'lucide-react';
import './AddCategoryPage.css';

export default function AddCategoryPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'home'
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Category name is required.');
      return;
    }

    setSubmitting(true);
    try {
      await createCategory({
        name: formData.name.trim(),
        description: formData.description.trim(),
        icon: formData.icon
      });
      showToast('Category created successfully!', 'success');
      navigate('/admin/categories');
    } catch (err) {
      setError(err.message || 'Failed to create category.');
      showToast(err.message || 'Failed to create category.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="category-form-page page-wrapper container">
      <div className="category-form-container">
        <div className="category-form-header">
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/admin/categories')}>
            <ArrowLeft size={16} />
            <span>Back to Categories</span>
          </button>
          <h1 className="page-title">Add Property Category</h1>
          <p className="page-subtitle">Define a new category for classifying real estate listings.</p>
        </div>

        {error && <div className="form-error-banner">{error}</div>}

        <div className="form-card category-card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                Category Name <span className="required-star">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                className="form-control"
                placeholder="e.g. Luxury Beachfront Villa"
                value={formData.name}
                onChange={handleChange}
                maxLength={50}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category Icon</label>
              <select
                name="icon"
                className="form-control"
                value={formData.icon}
                onChange={handleChange}
              >
                <option value="home">Home / House</option>
                <option value="building">Building / Apartment</option>
                <option value="map-pin">Map Pin / Land</option>
                <option value="briefcase">Briefcase / Commercial</option>
                <option value="tag">General Tag</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                className="form-control"
                placeholder="Brief description of this property category..."
                value={formData.description}
                onChange={handleChange}
                rows={4}
                maxLength={250}
              />
            </div>

            <div className="category-form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/admin/categories')}
                disabled={submitting}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                <Plus size={16} />
                <span>{submitting ? 'Creating...' : 'Create Category'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
