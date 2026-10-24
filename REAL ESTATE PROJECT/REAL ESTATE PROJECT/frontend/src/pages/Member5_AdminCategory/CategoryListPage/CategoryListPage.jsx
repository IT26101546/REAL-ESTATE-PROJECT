import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../context/ToastContext';
import { getCategories, deleteCategory } from '../../../api/categoryAdminApi';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import EmptyState from '../../../components/EmptyState/EmptyState';
import ConfirmModal from '../../../components/ConfirmModal/ConfirmModal';
import './CategoryListPage.css';

function CategoryListPage() {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      showToast('Failed to load categories.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCategory(deleteTarget.id);
      showToast('Category deleted successfully.', 'success');
      setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    } catch (err) {
      showToast(err.message || 'Cannot delete this category. It may be in use by existing properties.', 'error');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="category-list-page page-wrapper container">
      <div className="category-list-header">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">Manage property listing categories.</p>
        </div>
        <button
          className="btn btn-primary add-category-btn"
          onClick={() => navigate('/admin/categories/add')}
        >
          + Add Category
        </button>
      </div>

      {categories.length === 0 ? (
        <EmptyState
          title="No Categories"
          message="No categories have been created yet."
          actionLabel="Add Category"
          onAction={() => navigate('/admin/categories/add')}
        />
      ) : (
        <div className="categories-table-wrapper">
          <table className="categories-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td className="category-name-cell">{cat.name}</td>
                  <td className="category-desc-cell">
                    {cat.description || <span className="no-desc">—</span>}
                  </td>
                  <td>{formatDate(cat.createdAt)}</td>
                  <td>
                    <div className="category-actions">
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => navigate(`/admin/categories/edit/${cat.id}`)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => setDeleteTarget(cat)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Delete Category"
          message={`Are you sure you want to delete the category "${deleteTarget.name}"? This action cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
          danger
        />
      )}
    </div>
  );
}

export default CategoryListPage;
