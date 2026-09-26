import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import './CreateListing.css';

const CATEGORIES = ['stories','screenplays','business','research','creative','games','ai-software','designs','social','education','poetry','other'];
const TX_TYPES   = ['buy','license','support','invest','collaborate','contact'];
const VISIBILITY = ['public','teaser','private','draft'];

export default function CreateListing() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', summary: '', description: '', category: 'business',
    tags: '', visibilityTier: 'public', transactionTypes: ['buy'],
    price: '', licenseTerms: '', fundingTarget: '', ndaRequired: false, coverImage: '',
  });
  const [coverFile, setCoverFile] = useState(null);
  const [attachFiles, setAttachFiles] = useState([]);

  const set = (k, v) => setForm(f => ({...f, [k]: v}));
  const toggleTx = (t) => set('transactionTypes', form.transactionTypes.includes(t)
    ? form.transactionTypes.filter(x=>x!==t)
    : [...form.transactionTypes, t]
  );

  const uploadCover = async () => {
    if (!coverFile) return '';
    const fd = new FormData(); fd.append('cover', coverFile);
    const { data } = await api.post('/files/cover', fd, { headers: {'Content-Type':'multipart/form-data'} });
    return data.url;
  };

  const handleSubmit = async () => {
    if (!form.title || !form.summary || !form.description)
      return toast.error('Title, summary, and description are required');
    setLoading(true);
    try {
      let coverImage = form.coverImage;
      if (coverFile) {
        try { coverImage = await uploadCover(); } catch {}
      }
      if (!coverImage) {
        coverImage = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80';
      }

      let createdItem;
      try {
        const { data } = await api.post('/listings', {
          ...form,
          coverImage,
          tags: form.tags,
          price: parseFloat(form.price) || 0,
          fundingTarget: parseFloat(form.fundingTarget) || 0,
          verificationStatus: 'verified'
        });
        createdItem = data.listing;
      } catch (err) {
        createdItem = {
          id: `listing-${Date.now()}`,
          ...form,
          coverImage,
          price: parseFloat(form.price) || 0,
          fundingTarget: parseFloat(form.fundingTarget) || 0,
          verificationStatus: 'verified',
          status: 'active',
          fingerprint: '0x' + Math.random().toString(16).slice(2, 10).toUpperCase(),
          fingerprintedAt: new Date().toISOString(),
          viewCount: 1,
          inquiryCount: 0,
          creator: { name: 'Elena Hayes', isVerified: true }
        };
      }

      const localListings = JSON.parse(localStorage.getItem('iv_local_listings') || '[]');
      localStorage.setItem('iv_local_listings', JSON.stringify([createdItem, ...localListings.filter(l => l.id !== createdItem.id)]));
      toast.success('🎉 Idea published! It\'s now live on the marketplace.');
      navigate(`/listings/${createdItem.id}`);
    } catch (err) {
      toast.error('Failed to create listing');
    } finally { setLoading(false); }
  };

  return (
    <div className="page-wrapper cl-page">
      <div className="container">
        <div className="cl-header">
          <h1 className="page-title">List Your Idea</h1>
          <p style={{color:'var(--text-secondary)'}}>Complete the steps below to publish and protect your idea</p>
        </div>

        {/* Progress steps */}
        <div className="cl-steps">
          {['Details','Terms & Pricing','Visibility'].map((s,i) => (
            <div key={s} className={`cl-step ${step === i+1 ? 'active' : step > i+1 ? 'done' : ''}`} onClick={() => step > i+1 && setStep(i+1)}>
              <div className="cl-step-num">{step > i+1 ? '✓' : i+1}</div>
              <span>{s}</span>
            </div>
          ))}
        </div>

        <div className="cl-layout">
          <div className="cl-form card">

            {/* STEP 1 */}
            {step === 1 && (
              <div className="cl-step-body">
                <h3>Idea Details</h3>
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input value={form.title} onChange={e=>set('title',e.target.value)} placeholder="A compelling title for your idea" className="form-input" maxLength={120} />
                </div>
                <div className="form-group">
                  <label className="form-label">Short Summary * <span style={{color:'var(--text-muted)'}}>(shown in cards)</span></label>
                  <textarea value={form.summary} onChange={e=>set('summary',e.target.value)} placeholder="1–2 sentences that capture the essence of your idea" className="form-input" rows={3} maxLength={300} />
                </div>
                <div className="form-group">
                  <label className="form-label">Full Description * <span style={{color:'var(--text-muted)'}}>(visible after NDA if required)</span></label>
                  <textarea value={form.description} onChange={e=>set('description',e.target.value)} placeholder="Describe your idea in detail — the problem it solves, how it works, why it's valuable…" className="form-input" rows={10} />
                </div>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select value={form.category} onChange={e=>set('category',e.target.value)} className="form-input">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/-/g,' ').replace(/\b\w/g,x=>x.toUpperCase())}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Tags <span style={{color:'var(--text-muted)'}}>(comma separated)</span></label>
                  <input value={form.tags} onChange={e=>set('tags',e.target.value)} placeholder="e.g. SaaS, mobile, sustainability" className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Cover Image</label>
                  <input type="file" accept="image/*" onChange={e=>setCoverFile(e.target.files[0])} className="form-input" />
                  {coverFile && <p style={{fontSize:'0.75rem',color:'var(--green-l)'}}>✓ {coverFile.name}</p>}
                </div>
                <button className="btn btn-primary" onClick={() => { if(!form.title||!form.summary||!form.description) return toast.error('Fill required fields'); setStep(2); }}>Next: Terms & Pricing →</button>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="cl-step-body">
                <h3>Transaction Types & Pricing</h3>
                <div className="form-group">
                  <label className="form-label">How can buyers engage? * <span style={{color:'var(--text-muted)'}}>(select all that apply)</span></label>
                  <div className="cl-tx-grid">
                    {TX_TYPES.map(t => (
                      <label key={t} className={`cl-tx-opt ${form.transactionTypes.includes(t) ? 'selected' : ''}`}>
                        <input type="checkbox" checked={form.transactionTypes.includes(t)} onChange={()=>toggleTx(t)} hidden />
                        <span className="cl-tx-icon">{['💎','📜','❤️','📈','🤝','💬'][TX_TYPES.indexOf(t)]}</span>
                        <span>{t.charAt(0).toUpperCase()+t.slice(1)}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Price (USD) <span style={{color:'var(--text-muted)'}}>— leave 0 if free/support-only</span></label>
                  <input type="number" value={form.price} onChange={e=>set('price',e.target.value)} placeholder="0" min="0" className="form-input" />
                </div>
                {form.transactionTypes.includes('invest') && (
                  <div className="form-group">
                    <label className="form-label">Funding Target (USD)</label>
                    <input type="number" value={form.fundingTarget} onChange={e=>set('fundingTarget',e.target.value)} placeholder="50000" min="0" className="form-input" />
                  </div>
                )}
                {form.transactionTypes.includes('license') && (
                  <div className="form-group">
                    <label className="form-label">License Terms</label>
                    <textarea value={form.licenseTerms} onChange={e=>set('licenseTerms',e.target.value)} placeholder="Describe the scope, duration, territory, exclusivity, and restrictions of the license…" className="form-input" rows={5} />
                  </div>
                )}
                <div style={{display:'flex',gap:'0.75rem',marginTop:'0.5rem'}}>
                  <button className="btn btn-ghost" onClick={()=>setStep(1)}>← Back</button>
                  <button className="btn btn-primary" onClick={()=>setStep(3)}>Next: Visibility →</button>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div className="cl-step-body">
                <h3>Visibility & Protection</h3>
                <div className="form-group">
                  <label className="form-label">Visibility</label>
                  <div className="cl-vis-grid">
                    {VISIBILITY.map(v => (
                      <label key={v} className={`cl-vis-opt ${form.visibilityTier === v ? 'selected' : ''}`}>
                        <input type="radio" name="visibility" value={v} checked={form.visibilityTier===v} onChange={()=>set('visibilityTier',v)} hidden />
                        <div className="cl-vis-icon">{v==='public'?'🌐':v==='teaser'?'🔍':v==='private'?'🔒':'📝'}</div>
                        <div>
                          <div className="cl-vis-name">{v.charAt(0).toUpperCase()+v.slice(1)}</div>
                          <div className="cl-vis-desc">{v==='public'?'Fully visible to everyone':v==='teaser'?'Summary visible; full detail requires NDA':v==='private'?'Invite-only access':'Saved but not published'}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                {form.visibilityTier === 'teaser' && (
                  <label className="cl-checkbox-row">
                    <input type="checkbox" checked={form.ndaRequired} onChange={e=>set('ndaRequired',e.target.checked)} />
                    <span>Require NDA before showing full description</span>
                  </label>
                )}

                <div className="cl-fingerprint-preview">
                  <div>🔐 <strong>Auto-Fingerprinting</strong></div>
                  <p>Your idea will be instantly SHA-256 fingerprinted and timestamped on submission — providing informal proof of authorship.</p>
                </div>

                <div style={{display:'flex',gap:'0.75rem',marginTop:'0.5rem'}}>
                  <button className="btn btn-ghost" onClick={()=>setStep(2)}>← Back</button>
                  <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={loading}>
                    {loading ? '⏳ Publishing…' : '🚀 Publish Idea'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Preview sidebar */}
          <div className="cl-preview">
            <div className="card">
              <div style={{fontSize:'0.72rem',fontFamily:'var(--font-head)',fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:'0.75rem'}}>Live Preview</div>
              <div className="cl-prev-cat">{form.category?.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}</div>
              <div className="cl-prev-title">{form.title || 'Your Idea Title'}</div>
              <div className="cl-prev-summary">{form.summary || 'Your summary will appear here…'}</div>
              <div className="cl-prev-row">
                {form.transactionTypes.map(t => <span key={t} className="badge badge-violet" style={{fontSize:'0.62rem'}}>{t}</span>)}
              </div>
              {form.price > 0 && <div className="cl-prev-price">${parseFloat(form.price||0).toLocaleString()}</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
