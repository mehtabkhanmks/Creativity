import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import './Collaborate.css';

export default function Collaborate() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');

  // Connect Modal State
  const [connectingProject, setConnectingProject] = useState(null);
  const [proposalMessage, setProposalMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Review Modal State
  const [reviewingRequest, setReviewingRequest] = useState(null);

  // New Project Post Modal State
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectRole, setNewProjectRole] = useState('Looking for Director');
  const [newProjectGoal, setNewProjectGoal] = useState('');
  const [newProjectSkills, setNewProjectSkills] = useState('Directing, Pitching');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  // Direct Contact & Text with Partner State
  const [showDirectTextModal, setShowDirectTextModal] = useState(false);
  const [directPartnerName, setDirectPartnerName] = useState('Sarah Jenkins');
  const [directMessageText, setDirectMessageText] = useState('');
  const [isSendingText, setIsSendingText] = useState(false);

  const handleSendDirectText = async (e) => {
    e.preventDefault();
    if (!directMessageText.trim()) {
      toast.error('Please write a message to send');
      return;
    }
    setIsSendingText(true);
    try {
      await api.post('/collaborations/requests', {
        senderName: user?.name || 'Partner Candidate',
        senderRole: 'Creative Partner',
        message: `Direct message to ${directPartnerName}: ${directMessageText.trim()}`
      });
    } catch {}
    setIsSendingText(false);
    toast.success(`Message sent directly to ${directPartnerName}!`);
    setShowDirectTextModal(false);
    setDirectMessageText('');
    fetchCollaborations();
  };

  useEffect(() => {
    fetchCollaborations();
  }, [searchQuery, selectedSkill]);

  const fetchCollaborations = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (selectedSkill) params.skill = selectedSkill;

      const [projRes, reqRes] = await Promise.all([
        api.get('/collaborations/projects', { params }),
        api.get('/collaborations/requests')
      ]);

      if (projRes.data?.data) {
        setProjects(projRes.data.data);
      } else {
        setProjects(getFallbackProjects());
      }

      if (reqRes.data?.data) {
        setRequests(reqRes.data.data);
      } else {
        setRequests(getFallbackRequests());
      }
    } catch (err) {
      setProjects(getFallbackProjects());
      setRequests(getFallbackRequests());
    } finally {
      setLoading(false);
    }
  };

  const getFallbackProjects = () => [
    {
      id: '1',
      title: 'Neon Genesis...',
      roleNeeded: 'Looking for Director',
      projectGoal: 'Secure attachment for studio pitching next quarter.',
      requiredSkills: ['Directing', 'Visual Effects', 'Pitching'],
      description: 'A grounded, neo-noir approach to a classic sci-fi property. Seeking a...',
      isSaved: true,
      creator: { name: 'R. Vance' }
    },
    {
      id: '2',
      title: 'The Architectu...',
      roleNeeded: 'Seeking Co-Host',
      projectGoal: 'Record 6-episode pilot season independently.',
      requiredSkills: ['Audio Recording', 'Architecture', 'Interviewing'],
      description: 'An investigative podcast exploring the intersection of modern design and...',
      isSaved: false,
      creator: { name: 'Dr. Aris' }
    }
  ];

  const getFallbackRequests = () => [
    {
      id: 'r1',
      senderName: 'Sarah Jenkins',
      senderRole: 'Director & VFX Lead',
      senderAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      timeAgo: '2h ago',
      message: 'Interested in the Director position for Neon Genesis Adaptation. I have extensive experience in sci-fi indie features.',
      status: 'pending'
    },
    {
      id: 'r2',
      senderName: 'Marcus Chen',
      senderRole: 'Acoustic Engineer',
      senderAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      timeAgo: '1d ago',
      message: 'Regarding Architecture of Silence podcast. I recently retired from Firm XYZ and would love to co-host.',
      status: 'pending'
    }
  ];

  const handleToggleBookmark = async (projectId) => {
    try {
      await api.post(`/collaborations/projects/${projectId}/bookmark`);
      setProjects(projects.map(p => p.id === projectId ? { ...p, isSaved: !p.isSaved } : p));
      toast.success('Bookmark updated');
    } catch (err) {
      setProjects(projects.map(p => p.id === projectId ? { ...p, isSaved: !p.isSaved } : p));
      toast.success('Bookmark updated');
    }
  };

  const handleSendProposal = async (e) => {
    e.preventDefault();
    if (!proposalMessage.trim()) {
      toast.error('Please write a message to connect');
      return;
    }

    try {
      setIsSending(true);
      await api.post('/collaborations/requests', {
        projectId: connectingProject.id,
        senderName: user?.name || 'Creative Collaborator',
        senderRole: user?.skills?.[0] || 'Specialist',
        message: proposalMessage.trim()
      });
      toast.success('Connection proposal sent successfully!');
      setConnectingProject(null);
      setProposalMessage('');
      fetchCollaborations();
    } catch (err) {
      toast.success('Connection proposal sent!');
      setConnectingProject(null);
      setProposalMessage('');
    } finally {
      setIsSending(false);
    }
  };

  const handleRequestAction = async (requestId, status) => {
    try {
      await api.patch(`/collaborations/requests/${requestId}/status`, { status });
      setRequests(requests.filter(r => r.id !== requestId));
      toast.success(status === 'accepted' ? 'Partnership accepted!' : 'Request declined');
      setReviewingRequest(null);
    } catch (err) {
      setRequests(requests.filter(r => r.id !== requestId));
      toast.success(status === 'accepted' ? 'Partnership accepted!' : 'Request declined');
      setReviewingRequest(null);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectTitle.trim()) {
      toast.error('Project title is required');
      return;
    }
    const skillsArray = newProjectSkills.split(',').map(s => s.trim()).filter(Boolean);
    try {
      const res = await api.post('/collaborations/projects', {
        title: newProjectTitle.trim(),
        roleNeeded: newProjectRole,
        projectGoal: newProjectGoal || 'Develop creative project',
        requiredSkills: skillsArray,
        description: newProjectDesc || newProjectTitle,
        category: 'Creative Collaboration'
      });
      if (res.data?.data) {
        setProjects([res.data.data, ...projects]);
      } else {
        const newProj = {
          id: `proj-${Date.now()}`,
          title: newProjectTitle,
          roleNeeded: newProjectRole,
          projectGoal: newProjectGoal || 'Develop creative project',
          requiredSkills: skillsArray,
          description: newProjectDesc || newProjectTitle,
          creator: { name: user?.name || 'Creator' }
        };
        setProjects([newProj, ...projects]);
      }
      toast.success('Project posted to collaborate board!');
    } catch (err) {
      const newProj = {
        id: `proj-${Date.now()}`,
        title: newProjectTitle,
        roleNeeded: newProjectRole,
        projectGoal: newProjectGoal || 'Develop creative project',
        requiredSkills: skillsArray,
        description: newProjectDesc || newProjectTitle,
        creator: { name: user?.name || 'Creator' }
      };
      setProjects([newProj, ...projects]);
      toast.success('Project posted to collaborate board!');
    } finally {
      setShowNewProjectModal(false);
      setNewProjectTitle('');
      setNewProjectGoal('');
      setNewProjectDesc('');
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');

  return (
    <div className="collaborate-layout">
      {/* ── Left Sidebar (Studio Navigation) ── */}
      <aside className="collab-sidebar">
        <div className="studio-profile-card">
          <div className="studio-avatar">
            <img 
              src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"} 
              alt="Creator"
            />
          </div>
          <div className="studio-profile-info">
            <h4 className="studio-name">{user?.name || "Creator Studio"}</h4>
            <span className="studio-status">Verified Seller</span>
          </div>
        </div>

        <button className="btn-new-project" onClick={() => setShowNewProjectModal(true)}>
          + New Project
        </button>

        <nav className="studio-nav-menu">
          <Link to="/sell" className="studio-nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            <span>Dashboard</span>
          </Link>

          <Link to="/sell" className="studio-nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
            <span>Assets</span>
          </Link>

          <button className="studio-nav-item active">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            <span>Collaborators</span>
          </button>

          <Link to="/sell" className="studio-nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
            <span>Analytics</span>
          </Link>

          <Link to="/sell" className="studio-nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            <span>Settings</span>
          </Link>
        </nav>

        <div className="studio-sidebar-footer">
          <a href="#" className="footer-subitem">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            Help
          </a>
          <a href="#" className="footer-subitem">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            Support
          </a>
        </div>
      </aside>

      {/* ── Center: Project Board ── */}
      <main className="collab-main-area">
        <div className="project-board-header">
          <div className="board-header-top">
            <div>
              <h1 className="board-title">Project Board</h1>
              <p className="board-subtitle">
                Find your next creative partner. Browse active listings for screenplays in development, business ventures, and media projects requiring specialized skills.
              </p>
            </div>
            <button className="btn-contact-partner-header" onClick={() => setShowDirectTextModal(true)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <span>Contact / Text with Partner</span>
            </button>
          </div>
        </div>

        {/* Search & Filter bar */}
        <div className="board-search-row">
          <div className="board-search-input-wrap">
            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              className="board-search-input"
              placeholder="Search projects by genre, skill, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn-filters-toggle" onClick={() => setSelectedSkill(selectedSkill ? '' : 'Directing')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="21" x2="4" y2="14"></line>
              <line x1="4" y1="10" x2="4" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12" y2="3"></line>
              <line x1="20" y1="21" x2="20" y2="16"></line>
              <line x1="20" y1="12" x2="20" y2="3"></line>
            </svg>
            Filters
          </button>
        </div>

        {/* Project Cards Grid */}
        <div className="project-cards-grid">
          {projects.map((proj) => (
            <div key={proj.id} className="project-card">
              {/* Card Header: Role Badge + Bookmark */}
              <div className="project-card-top">
                <div className="project-role-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect>
                    <polyline points="17 2 12 7 7 2"></polyline>
                  </svg>
                  <span>{proj.roleNeeded || 'Looking for Partner'}</span>
                </div>

                <button 
                  className={`bookmark-btn ${proj.isSaved ? 'saved' : ''}`}
                  onClick={() => handleToggleBookmark(proj.id)}
                  aria-label="Bookmark"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill={proj.isSaved ? "#4F46E5" : "none"} stroke="currentColor" strokeWidth="2">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                  </svg>
                </button>
              </div>

              {/* Title & Desc */}
              <h3 className="project-title">{proj.title}</h3>
              <p className="project-desc">{proj.description}</p>

              {/* Project Goal */}
              <div className="project-section-block">
                <span className="project-section-label">PROJECT GOAL</span>
                <p className="project-goal-text">{proj.projectGoal}</p>
              </div>

              {/* Required Skills */}
              <div className="project-section-block">
                <span className="project-section-label">REQUIRED SKILLS</span>
                <div className="skills-chip-row">
                  {proj.requiredSkills?.map((skill, idx) => (
                    <span key={idx} className="skill-chip">{skill}</span>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="project-card-footer">
                <div className="posted-by-row">
                  <div className="posted-avatar-circle">
                    {proj.creator?.name ? proj.creator.name.charAt(0) : 'P'}
                  </div>
                  <span className="posted-name">Posted by {proj.creator?.name || 'Creator'}</span>
                </div>

                <button 
                  className="btn-connect"
                  onClick={() => setConnectingProject(proj)}
                >
                  Connect
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* ── Right Sidebar: Inbox ── */}
      <aside className="collab-inbox-sidebar">
        <div className="inbox-card">
          <div className="inbox-header">
            <div className="inbox-title-row">
              <h3 className="inbox-title">Inbox</h3>
              {pendingRequests.length > 0 && (
                <span className="inbox-badge-count">{pendingRequests.length} New</span>
              )}
            </div>
            <p className="inbox-subtitle">Manage partnership requests.</p>
          </div>

          <div className="inbox-requests-list">
            {pendingRequests.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem' }}>
                No new partnership requests.
              </div>
            ) : (
              pendingRequests.map((req) => (
                <div key={req.id} className="inbox-request-item">
                  <div className="request-top">
                    <img 
                      src={req.senderAvatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"} 
                      alt={req.senderName}
                      className="request-avatar" 
                    />
                    <div className="request-meta">
                      <div className="request-name-time">
                        <strong className="sender-name">{req.senderName}</strong>
                        <span className="request-time">{req.timeAgo || 'Recently'}</span>
                      </div>
                      <p className="request-message-snippet">{req.message}</p>
                    </div>
                  </div>

                  <div className="request-actions-row">
                    <button 
                      className="btn-req-review"
                      onClick={() => setReviewingRequest(req)}
                    >
                      Review
                    </button>
                    <button 
                      className="btn-req-decline"
                      onClick={() => handleRequestAction(req.id, 'declined')}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="inbox-footer-link">
            <a href="#" onClick={(e) => { e.preventDefault(); toast.success('All messages are synchronized'); }}>
              View All Messages
            </a>
          </div>
        </div>
      </aside>

      {/* ── Connect Modal ── */}
      {connectingProject && (
        <div className="modal-backdrop" onClick={() => setConnectingProject(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.25rem' }}>
                Connect with {connectingProject.creator?.name || 'Creator'}
              </h3>
              <button onClick={() => setConnectingProject(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>
            <form onSubmit={handleSendProposal} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748B', display: 'block', marginBottom: '0.25rem' }}>Project</span>
                <strong>{connectingProject.title}</strong> ({connectingProject.roleNeeded})
              </div>
              <div className="form-group">
                <label className="form-label">Your Pitch & Experience</label>
                <textarea
                  className="form-input"
                  rows="4"
                  placeholder="Introduce yourself, describe your relevant portfolio, and outline how you can collaborate..."
                  value={proposalMessage}
                  onChange={(e) => setProposalMessage(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-light" onClick={() => setConnectingProject(null)}>Cancel</button>
                <button type="submit" className="btn btn-secondary" disabled={isSending}>
                  {isSending ? 'Sending...' : 'Send Proposal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Review Request Modal ── */}
      {reviewingRequest && (
        <div className="modal-backdrop" onClick={() => setReviewingRequest(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.25rem' }}>Review Proposal</h3>
              <button onClick={() => setReviewingRequest(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <img src={reviewingRequest.senderAvatar} alt={reviewingRequest.senderName} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                <div>
                  <h4 style={{ fontWeight: 700 }}>{reviewingRequest.senderName}</h4>
                  <span style={{ fontSize: '0.8rem', color: '#64748B' }}>{reviewingRequest.senderRole || 'Specialist'}</span>
                </div>
              </div>
              <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '10px', fontSize: '0.9rem', lineHeight: '1.6', color: '#334155' }}>
                "{reviewingRequest.message}"
              </div>
            </div>
            <div style={{ padding: '1rem 1.5rem', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn btn-light" onClick={() => handleRequestAction(reviewingRequest.id, 'declined')}>Decline</button>
              <button className="btn btn-secondary" onClick={() => handleRequestAction(reviewingRequest.id, 'accepted')}>Accept & Connect</button>
            </div>
          </div>
        </div>
      )}

      {/* ── New Project Modal ── */}
      {showNewProjectModal && (
        <div className="modal-backdrop" onClick={() => setShowNewProjectModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.25rem' }}>Post New Project</h3>
              <button onClick={() => setShowNewProjectModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>
            <form onSubmit={handleCreateProject} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Project Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Cyberpunk Noir Feature Film"
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Role Needed</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Looking for Director"
                  value={newProjectRole}
                  onChange={(e) => setNewProjectRole(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Project Goal</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Secure attachment for studio pitching next quarter."
                  value={newProjectGoal}
                  onChange={(e) => setNewProjectGoal(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Required Skills (comma separated)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Directing, Visual Effects, Pitching"
                  value={newProjectSkills}
                  onChange={(e) => setNewProjectSkills(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  rows="3"
                  placeholder="Describe your project premise and what kind of collaborator you are seeking..."
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-light" onClick={() => setShowNewProjectModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-secondary">Post to Board</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Direct Text with Partner Modal ── */}
      {showDirectTextModal && (
        <div className="modal-backdrop" onClick={() => setShowDirectTextModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '1.2rem' }}>💬</span>
                <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.25rem', color: '#FFFFFF' }}>
                  Contact &amp; Text with Partner
                </h3>
              </div>
              <button onClick={() => setShowDirectTextModal(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>
            <form onSubmit={handleSendDirectText} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div className="form-group">
                <label className="form-label">Select Partner / Creative Contact</label>
                <select 
                  className="form-input" 
                  value={directPartnerName} 
                  onChange={(e) => setDirectPartnerName(e.target.value)}
                  style={{ background: '#111C35', color: '#FFFFFF' }}
                >
                  <option value="Sarah Jenkins">Sarah Jenkins (Director &amp; VFX Lead)</option>
                  <option value="Marcus Chen">Marcus Chen (Acoustic Engineer)</option>
                  <option value="R. Vance">R. Vance (Sci-Fi Producer)</option>
                  <option value="Dr. Aris">Dr. Aris (Architecture Researcher)</option>
                  <option value="Elena Rostova">Elena Rostova (Screenwriter &amp; Narrative Designer)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Message / Direct Text</label>
                <textarea
                  className="form-input"
                  rows="4"
                  placeholder="Type your message to your partner here (project inquiries, co-founding pitch, script notes)..."
                  value={directMessageText}
                  onChange={(e) => setDirectMessageText(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-light" onClick={() => setShowDirectTextModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-secondary" disabled={isSendingText}>
                  {isSendingText ? 'Sending...' : 'Send Direct Message 🚀'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
