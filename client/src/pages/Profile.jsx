import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ListingCard from '../components/ListingCard';
import toast from 'react-hot-toast';
import './Profile.css';

export default function Profile() {
  const { id } = useParams();
  const { user: authUser, refreshUser } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    skills: '',
    location: '',
    website: '',
    role: 'creator',
  });
  const [saving, setSaving] = useState(false);

  const isOwner = authUser && authUser.id === id;

  useEffect(() => {
    setLoading(true);
    api.get(`/users/${id}`)
      .then((res) => {
        const u = res.data.user;
        setProfileUser(u);
        setEditForm({
          name: u.name || '',
          bio: u.bio || '',
          skills: Array.isArray(u.skills) ? u.skills.join(', ') : '',
          location: u.location || '',
          website: u.website || '',
          role: u.role || 'creator',
        });
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const skillsArray = editForm.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const { data } = await api.put('/users/profile', {
        ...editForm,
        skills: skillsArray,
      });

      setProfileUser((prev) => ({ ...prev, ...data.user }));
      refreshUser();
      setEditing(false);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="page-wrapper">
        <div className="container empty-state">
          <div className="empty-state-icon">👤</div>
          <h3>User not found</h3>
        </div>
      </div>
    );
  }

  const { name, avatar, bio, skills = [], role, isVerified, location, website, rating, ratingCount, listings = [] } = profileUser;

  return (
    <div className="page-wrapper profile-page">
      <div className="container">
        {/* Profile Hero Card */}
        <div className="profile-hero card">
          <div className="profile-top">
            <div className="profile-avatar-wrap">
              {avatar ? (
                <img
                  src={avatar.startsWith('http') ? avatar : `http://localhost:5000${avatar}`}
                  alt={name}
                  className="profile-avatar"
                />
              ) : (
                <div className="profile-avatar-fallback">
                  {name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="profile-main-info">
              <div className="profile-name-row">
                <h1 className="profile-name">{name}</h1>
                {isVerified && <span className="badge badge-green">✓ Verified Creator</span>}
                <span className="badge badge-violet">{role}</span>
              </div>

              {location && <span className="profile-meta-item">📍 {location}</span>}
              {website && (
                <a href={website.startsWith('http') ? website : `https://${website}`} target="_blank" rel="noreferrer" className="profile-meta-item profile-link">
                  🔗 {website}
                </a>
              )}

              {ratingCount > 0 && (
                <div className="profile-rating">
                  ⭐ {(rating || 0).toFixed(1)} ({ratingCount} reviews)
                </div>
              )}
            </div>

            {isOwner && (
              <button
                className="btn btn-outline btn-sm profile-edit-btn"
                onClick={() => setEditing(!editing)}
              >
                {editing ? 'Cancel' : 'Edit Profile'}
              </button>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleSaveProfile} className="profile-edit-form">
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    className="form-input"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input
                    className="form-input"
                    placeholder="e.g. San Francisco, CA"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea
                  className="form-input"
                  placeholder="Share a short bio about what you create and what you're looking for..."
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Skills / Expertise (comma separated)</label>
                  <input
                    className="form-input"
                    placeholder="e.g. Screenwriting, AI Prompting, Game Lore"
                    value={editForm.skills}
                    onChange={(e) => setEditForm({ ...editForm, skills: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Website or Portfolio</label>
                  <input
                    className="form-input"
                    placeholder="https://..."
                    value={editForm.website}
                    onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : 'Save Profile'}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              {bio && <p className="profile-bio">{bio}</p>}

              {Array.isArray(skills) && skills.length > 0 && (
                <div className="profile-skills">
                  {skills.map((s, idx) => (
                    <span key={idx} className="badge badge-cyan">{s}</span>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* User's Listings Section */}
        <div className="profile-listings-section">
          <div className="section-header" style={{ textAlign: 'left', margin: '0 0 1.5rem 0' }}>
            <h2 className="section-title" style={{ fontSize: '1.4rem' }}>
              Published Ideas ({listings.length})
            </h2>
          </div>

          {listings.length === 0 ? (
            <div className="empty-state card">
              <div className="empty-state-icon">💡</div>
              <h3>No public ideas yet</h3>
              <p>This creator hasn't published any public listings yet.</p>
            </div>
          ) : (
            <div className="grid-3">
              {listings.map((item) => (
                <ListingCard
                  key={item.id}
                  listing={{ ...item, creator: { id, name, avatar, isVerified, rating } }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
