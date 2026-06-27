import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { toast, ToastContainer } from 'react-toastify'

import { login } from './store/authSlice.jsx'
import { authAPI } from '../services/api.js'


const initials = (name = '') =>
  name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

const styles = `
  body, #root, .main-content, .page-content, .content-area,
  .layout-content, .content-wrapper, .main-wrapper, .app-content,
  .page-wrapper, [class*="content"], [class*="main"] {
    background: #0d1117 !important;
  }

  .prof-root {
    font-family: 'DM Sans', sans-serif;
    color: #e2e8f0;
    padding: 0;
  }

  /* ── Banner ── */
  .prof-banner {
    height: 160px;
    background: linear-gradient(135deg, #1a0533 0%, #160d2e 40%, #0a1628 100%);
    border-radius: 16px;
    position: relative;
    overflow: hidden;
    margin-bottom: 0;
    border: 1px solid #30363d;
  }

  .prof-banner::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse at 20% 50%, rgba(124,58,237,0.35) 0%, transparent 60%),
      radial-gradient(ellipse at 80% 20%, rgba(59,130,246,0.2) 0%, transparent 50%);
  }

  .prof-banner-dots {
    position: absolute;
    inset: 0;
    background-image: radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px);
    background-size: 24px 24px;
  }

  /* ── Avatar section ── */
  .prof-avatar-wrap {
    display: flex;
    align-items: flex-end;
    gap: 1.25rem;
    padding: 0 1.5rem;
    margin-top: -40px;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
  }

  .prof-avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: linear-gradient(135deg, #7c3aed, #5b21b6);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Syne', sans-serif;
    font-size: 1.6rem;
    font-weight: 700;
    color: #fff;
    border: 3px solid #0d1117;
    flex-shrink: 0;
    box-shadow: 0 0 0 1px rgba(124,58,237,0.4), 0 8px 24px rgba(124,58,237,0.25);
  }

  .prof-name-block {
    padding-bottom: 4px;
    flex: 1;
    min-width: 0;
  }

  .prof-name {
    font-family: 'Syne', sans-serif;
    font-size: 1.3rem;
    font-weight: 700;
    color: #f1f5f9;
    margin: 0 0 4px 0;
    line-height: 1.2;
  }

  .prof-role-chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 0.72rem;
    font-weight: 600;
    background: rgba(124,58,237,0.15);
    color: #a78bfa;
    border: 1px solid rgba(124,58,237,0.3);
    text-transform: capitalize;
  }

  /* ── Grid ── */
  .prof-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  @media (max-width: 768px) { .prof-grid { grid-template-columns: 1fr; } }

  /* ── Panel ── */
  .prof-panel {
    background: #161b22;
    border: 1px solid #21262d;
    border-radius: 14px;
    overflow: hidden;
  }

  .prof-panel-header {
    padding: 0.9rem 1.25rem;
    border-bottom: 1px solid #21262d;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .prof-panel-icon {
    width: 28px;
    height: 28px;
    border-radius: 7px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    background: rgba(124,58,237,0.12);
    color: #a78bfa;
    flex-shrink: 0;
  }

  .prof-panel-title {
    font-family: 'Syne', sans-serif;
    font-size: 0.88rem;
    font-weight: 600;
    color: #e2e8f0;
    margin: 0;
  }

  .prof-panel-body {
    padding: 1.25rem;
  }

  /* ── Info rows ── */
  .prof-info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.6rem 0;
    border-bottom: 1px solid #21262d;
  }

  .prof-info-row:last-child { border-bottom: none; }

  .prof-info-label {
    font-size: 0.78rem;
    color: #6e7681;
  }

  .prof-info-value {
    font-size: 0.82rem;
    color: #e2e8f0;
    font-weight: 500;
    text-align: right;
    text-transform: capitalize;
  }

  /* ── Form inputs ── */
  .prof-label {
    display: block;
    font-size: 0.75rem;
    color: #6e7681;
    margin-bottom: 5px;
    font-weight: 500;
    letter-spacing: 0.02em;
  }

  .prof-input {
    width: 100%;
    background: #0d1117;
    border: 1px solid #30363d;
    border-radius: 8px;
    color: #e2e8f0;
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
    font-family: 'DM Sans', sans-serif;
    outline: none;
    margin-bottom: 1rem;
    box-sizing: border-box;
    transition: border-color 0.15s;
  }

  .prof-input:focus { border-color: #7c3aed; }
  .prof-input:disabled { opacity: 0.45; cursor: not-allowed; }

  .prof-input-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }

  @media (max-width: 500px) { .prof-input-row { grid-template-columns: 1fr; } }

  /* ── Buttons ── */
  .prof-save-btn {
    padding: 0.55rem 1.4rem;
    background: linear-gradient(135deg, #7c3aed, #5b21b6);
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    box-shadow: 0 0 0 1px rgba(124,58,237,0.35), 0 4px 12px rgba(124,58,237,0.25);
    transition: opacity 0.15s;
  }

  .prof-save-btn:hover { opacity: 0.88; }
  .prof-save-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .prof-cancel-btn {
    padding: 0.55rem 1.2rem;
    background: transparent;
    color: #8b949e;
    border: 1px solid #30363d;
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s;
    margin-right: 0.5rem;
  }

  .prof-cancel-btn:hover { border-color: #8b949e; color: #e2e8f0; }

  /* ── Danger zone ── */
  .prof-danger-panel {
    background: #161b22;
    border: 1px solid rgba(239,68,68,0.2);
    border-radius: 14px;
    padding: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
    margin-bottom: 1rem;
  }

  .prof-danger-btn {
    padding: 0.5rem 1.1rem;
    background: transparent;
    color: #f87171;
    border: 1px solid rgba(239,68,68,0.3);
    border-radius: 8px;
    font-size: 0.82rem;
    font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.15s;
  }

  .prof-danger-btn:hover { background: rgba(239,68,68,0.08); }

  /* ── Tab strip ── */
  .prof-tabs {
    display: flex;
    gap: 4px;
    margin-bottom: 1rem;
    background: #161b22;
    border: 1px solid #21262d;
    border-radius: 10px;
    padding: 4px;
    width: fit-content;
  }

  .prof-tab {
    padding: 0.4rem 1rem;
    border-radius: 7px;
    font-size: 0.82rem;
    font-weight: 500;
    border: none;
    background: transparent;
    color: #6e7681;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
    font-family: 'DM Sans', sans-serif;
  }

  .prof-tab.active {
    background: rgba(124,58,237,0.18);
    color: #a78bfa;
    font-weight: 600;
  }

  /* ── Password strength ── */
  .strength-bar {
    display: flex;
    gap: 3px;
    margin-bottom: 0.5rem;
  }

  .strength-seg {
    flex: 1;
    height: 3px;
    border-radius: 99px;
    background: #21262d;
    transition: background 0.2s;
  }
`

const passwordStrength = (pw) => {
  if (!pw) return { score: 0, label: '', color: '' }
  let score = 0
  if (pw.length >= 8)          score++
  if (/[A-Z]/.test(pw))        score++
  if (/[0-9]/.test(pw))        score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  const map = [
    { label: '',        color: '' },
    { label: 'Weak',    color: '#f87171' },
    { label: 'Fair',    color: '#fbbf24' },
    { label: 'Good',    color: '#60a5fa' },
    { label: 'Strong',  color: '#34d399' },
  ]
  return { score, ...map[score] }
}

export default function ProfilePage() {
  const dispatch = useDispatch()
  const user = useSelector(state => state.auth.user)

  const [tab, setTab] = useState('info')
  const [saving, setSaving] = useState(false)

  const [infoForm, setInfoForm] = useState({
    name:  user?.name  || '',
    email: user?.email || '',
    phone: user?.phone || '',
  })

  const [pwForm, setPwForm] = useState({
    current: '',
    next:    '',
    confirm: '',
  })

  const strength = passwordStrength(pwForm.next)

  const handleInfoSave = async () => {
    setSaving(true)
    try {
      const res = await authAPI.updateProfile(infoForm)
      const updatedUser = res.data.user                           // ← grab updated user
      dispatch(login({ ...user, ...updatedUser }))
      localStorage.setItem('user', JSON.stringify({ ...user, ...updatedUser }))
      toast.success('Profile updated!')
      setInfoForm({
        name:  "",                           // ← use updatedUser
        email:"",
        phone:"" ,
      })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }
  const handlePasswordSave = async () => {
    if (pwForm.next !== pwForm.confirm) {
      toast.error('Passwords do not match')
      return
    }
    if (pwForm.next.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setSaving(true)
    try {
      await authAPI.changePassword({ current: pwForm.current, password: pwForm.next })  // PATCH /api/auth/password
      toast.success('Password changed!')
      setPwForm({ current: '', next: '', confirm: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <style>{styles}</style>
      <div className="prof-root">

        {/* ── Banner ── */}
       
        {/* ── Avatar + name ── */}
        < div className="prof-avatar-wrap mt-1">
          <div className="prof-avatar">{initials(user?.name)}</div>
          <div className="prof-name-block">
            <h2 className="prof-name">{user?.name || 'Your Name'}</h2>
            <span className="prof-role-chip">
              <i className="bi bi-shield-check" style={{ fontSize: '0.7rem' }} />
              {user?.role || 'employee'}
            </span>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="prof-tabs">
          {['info', 'password'].map(t => (
            <button
              key={t}
              className={`prof-tab ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t === 'info' ? '👤 Profile Info' : '🔒 Password'}
            </button>
          ))}
        </div>

        {tab === 'info' && (
          <>
            <div className="prof-grid">

              {/* Edit info */}
              <div className="prof-panel">
                <div className="prof-panel-header">
                  <div className="prof-panel-icon"><i className="bi bi-person" /></div>
                  <p className="prof-panel-title">Personal Information</p>
                </div>
                <div className="prof-panel-body">
                  <label className="prof-label">Full Name</label>
                  <input
                    className="prof-input"
                    value={infoForm.name}
                    onChange={e => setInfoForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Your full name"
                  />
                  <label className="prof-label">Email Address</label>
                  <input
                    className="prof-input"
                    type="email"
                    value={infoForm.email}
                    onChange={e => setInfoForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="you@company.com"
                  />
                  <label className="prof-label">Phone Number</label>
                  <input
                    className="prof-input"
                    value={infoForm.phone}
                    onChange={e => setInfoForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+91 00000 00000"
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
                    <button className="prof-save-btn" onClick={handleInfoSave} disabled={saving}>
                      {saving ? 'Saving…' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Account details (read only) */}
             
            </div>
          </>
        )}

        {tab === 'password' && (
          <div className="prof-panel" style={{ maxWidth: 480 }}>
            <div className="prof-panel-header">
              <div className="prof-panel-icon"><i className="bi bi-lock" /></div>
              <p className="prof-panel-title">Change Password</p>
            </div>
            <div className="prof-panel-body">
              <label className="prof-label">Current Password</label>
              <input
                className="prof-input"
                type="password"
                value={pwForm.current}
                onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))}
                placeholder="Enter current password"
              />

              <label className="prof-label">New Password</label>
              <input
                className="prof-input"
                type="password"
                value={pwForm.next}
                onChange={e => setPwForm(f => ({ ...f, next: e.target.value }))}
                placeholder="Min. 8 characters"
              />

              {/* Strength indicator */}
              {pwForm.next && (
                <>
                  <div className="strength-bar">
                    {[1,2,3,4].map(i => (
                      <div
                        key={i}
                        className="strength-seg"
                        style={{ background: i <= strength.score ? strength.color : '#21262d' }}
                      />
                    ))}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: strength.color, marginBottom: '0.75rem' }}>
                    {strength.label}
                  </div>
                </>
              )}

              <label className="prof-label">Confirm New Password</label>
              <input
                className="prof-input"
                type="password"
                value={pwForm.confirm}
                onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
                placeholder="Re-enter new password"
                style={{
                  borderColor: pwForm.confirm && pwForm.confirm !== pwForm.next
                    ? '#f87171' : undefined
                }}
              />
              {pwForm.confirm && pwForm.confirm !== pwForm.next && (
                <div style={{ fontSize: '0.72rem', color: '#f87171', marginTop: '-0.5rem', marginBottom: '0.75rem' }}>
                  Passwords do not match
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  className="prof-cancel-btn"
                  onClick={() => setPwForm({ current: '', next: '', confirm: '' })}
                >
                  Clear
                </button>
                <button className="prof-save-btn" onClick={handlePasswordSave} disabled={saving}>
                  {saving ? 'Updating…' : 'Update Password'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Danger Zone ── */}
        

      </div>
    </>
  )
}
