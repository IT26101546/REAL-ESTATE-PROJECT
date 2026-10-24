import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../../../context/ToastContext';
import { getMyProperties, deleteProperty } from '../../../api/propertyApi';
import { Building, Plus, Eye, Edit2, Trash2, MapPin } from 'lucide-react';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import EmptyState from '../../../components/EmptyState/EmptyState';
import ConfirmModal from '../../../components/Modal/ConfirmModal';
import './MyPropertiesPage.css';

export default function MyPropertiesPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const data = await getMyProperties();
      setProperties(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast(err.message || 'Failed to load your listings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProperty(deleteTarget.id);
      showToast(`Property "${deleteTarget.title}" deleted / archived successfully.`, 'success');
      setProperties(prev => prev.filter(p => p.id !== deleteTarget.id));
    } catch (err) {
      showToast(err.message || 'Failed to delete property. Active bookings may restrict deletion.', 'error');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const totalCount = properties.length;
  const availableCount = properties.filter(p => p.status === 'AVAILABLE').length;
  const reservedCount = properties.filter(p => p.status === 'RESERVED').length;
  const soldCount = properties.filter(p => p.status === 'SOLD').length;

  if (loading) return <LoadingSpinner message="Loading your properties..." />;

  return (
    <div className="my-properties-page page-wrapper container">
      <div className="my-properties-header">
        <div>
          <h1 className="page-title gradient-text" style={{ fontSize: '2.5rem', textAlign: 'left', marginBottom: '0.35rem' }}>My Property Listings</h1>
          <p className="page-subtitle" style={{ textAlign: 'left', margin: '0' }}>
            Manage your active, reserved, and sold real estate listings
          </p>
        </div>
        <button className="btn-primary add-property-btn" onClick={() => navigate('/properties/add')}>
          <Plus size={16} />
          <span>Add New Property</span>
        </button>
      </div>

      <div className="my-properties-stats">
        <div className="stat-chip">Total Listings: <strong>{totalCount}</strong></div>
        <div className="stat-chip">Available: <strong>{availableCount}</strong></div>
        <div className="stat-chip">Reserved: <strong>{reservedCount}</strong></div>
        <div className="stat-chip">Sold: <strong>{soldCount}</strong></div>
      </div>

      {properties.length === 0 ? (
        <EmptyState
          icon={<Building size={48} />}
          title="No properties listed yet"
          message="You haven't added any property listings. Click below to add your first listing."
          action={{
            label: 'Create Listing',
            onClick: () => navigate('/properties/add')
          }}
        />
      ) : (
        <div className="my-properties-table-wrapper">
          <table className="my-properties-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Type</th>
                <th>Price</th>
                <th>Status</th>
                <th>Listed Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {properties.map(prop => (
                <tr key={prop.id}>
                  <td className="property-title-cell">
                    <span>{prop.title}</span>
                    <span className="property-location-sub">
                      <MapPin size={11} />
                      {prop.location}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${prop.type === 'RENT' ? 'badge-rent' : 'badge-sale'}`}>
                      {prop.type === 'RENT' ? 'For Rent' : 'For Sale'}
                    </span>
                  </td>
                  <td className="property-price-cell">
                    LKR {Number(prop.price).toLocaleString()}
                    {prop.type === 'RENT' ? ' / mo' : ''}
                  </td>
                  <td>
                    <span className={`badge badge-${prop.status?.toLowerCase()}`}>
                      {prop.status}
                    </span>
                  </td>
                  <td className="date-cell">
                    {prop.createdAt ? new Date(prop.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td>
                    <div className="property-actions">
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => navigate(`/properties/${prop.id}`)}
                        title="View Details"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => navigate(`/properties/edit/${prop.id}`)}
                        title="Edit Listing"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => setDeleteTarget(prop)}
                        title="Delete Listing"
                      >
                        <Trash2 size={14} />
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
          title="Delete Property Listing?"
          message={`Are you sure you want to delete "${deleteTarget.title}"? Unreserved listings will be removed from text storage.`}
          confirmLabel="Delete Listing"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
          danger={true}
        />
      )}
    </div>
  );
}
