import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../../../context/ToastContext';
import { getCategoryById, updateCategory } from '../../../api/categoryAdminApi';
import { Tag, ArrowLeft, Save } from 'lucide-react';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import './EditCategoryPage.css';

export default function EditCategoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'home'
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadCategory() {
      try {
        const cat = await getCategoryById(id);
        if (cat) {
          setFormData({
            name: cat.name || '',
            description: cat.description || '',
            icon: cat.icon || 'home'
          });
        }
      } catch (err) {
        showToast(err.message || 'Failed to load category', 'error');
        navigate('/admin/categories');
      } finally {
        setLoading(false);
      }
    }
    loadCategory();
  }, [id]);

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
      await updateCategory(id, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        icon: formData.icon
      });
      showToast('Category updated successfully!', 'success');
      navigate('/admin/categories');
    } catch (err) {
      setError(err.message || 'Failed to update category.');
      showToast(err.message || 'Failed to update category.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading category..." />;

  return (
    <div className="category-form-page page-wrapper container">
      <div className="category-form-container">
        <div className="category-form-header">
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/admin/categories')}>
            <ArrowLeft size={16} />
            <span>Back to Categories</span>
          </button>
          <h1 className="page-title">Edit Property Category</h1>
          <p className="page-subtitle">Update category details and display icon.</p>
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
                <Save size={16} />
                <span>{submitting ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
