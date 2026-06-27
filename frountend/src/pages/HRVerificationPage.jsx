import React, { useState, useEffect } from 'react'

import { toast } from 'react-toastify'
import { hrAPI } from '../services/api'

// ─── helpers ─────────────────────────────────────────────────────────────────
const initials = name => name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'
const timeAgo  = d => {
  if (!d) return '—'
  const diff = Date.now() - new Date(d).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60)   return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)    return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

// ─── styles ──────────────────────────────────────────────────────────────────
const S = {
  page:       { fontFamily: "'DM Sans', sans-serif", color: '#e2e8f0', padding: '1.5rem', background: '#080d14', minHeight: '100vh' },
  header:     { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' },
  title:      { margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#f1f5f9', fontFamily: "'Syne', sans-serif" },
  sub:        { margin: '0.2rem 0 0', fontSize: '0.82rem', color: '#64748b' },

  statRow:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' },

  statCard:   (accent) => ({
    background: '#0f172a', border: '1px solid #1e293b',
    borderTop: `2px solid ${accent}`, borderRadius: 16,
    padding: '1.1rem 1.25rem', transition: 'border-color 0.2s, transform 0.2s',
  }),

  statIcon:   (bg) => ({
    width: 36, height: 36, borderRadius: 9, background: bg,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: '0.75rem', fontSize: '1rem',
  }),

  statValue:  { fontSize: '1.65rem', fontWeight: 700, color: '#f1f5f9', lineHeight: 1, marginBottom: 3 },
  statLabel:  { fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 },

  tabBar:     { display: 'flex', gap: 6, marginBottom: '1.25rem', flexWrap: 'wrap' },

  tab:        (active) => ({
    padding: '0.4rem 1rem', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600,
    cursor: 'pointer', border: '1px solid', fontFamily: "'DM Sans',sans-serif",
    background:   active ? 'rgba(124,58,237,0.2)' : 'transparent',
    color:        active ? '#a78bfa'               : '#64748b',
    borderColor:  active ? 'rgba(124,58,237,0.4)'  : '#1e293b',
    transition: 'all 0.15s',
  }),

  card:       { background: '#0f172a', border: '1px solid #1e293b', borderRadius: 16, overflow: 'hidden' },
  cardHeader: { padding: '0.9rem 1.25rem', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle:  { margin: 0, fontSize: '0.88rem', fontWeight: 600, color: '#e2e8f0' },

  // user row
  userRow:    { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.9rem 1.25rem', borderBottom: '1px solid #1e293b', gap: '1rem', flexWrap: 'wrap', transition: 'background 0.12s' },

  avatar:     (i) => {
    const colors = [['#7c3aed','#5b21b6'],['#10b981','#059669'],['#3b82f6','#1d4ed8'],['#f59e0b','#d97706'],['#a855f7','#7e22ce']]
    const [a, b] = colors[i % colors.length]
    return { width: 38, height: 38, borderRadius: 10, background: `linear-gradient(135deg,${a},${b})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 700, color: '#fff', flexShrink: 0 }
  },

  roleBadge:  (role) => {
    const map = {
      admin:    { bg: 'rgba(239,68,68,0.1)',   color: '#f87171', border: 'rgba(239,68,68,0.25)'   },
      hr:       { bg: 'rgba(168,85,247,0.1)',  color: '#c084fc', border: 'rgba(168,85,247,0.25)'  },
      employee: { bg: 'rgba(59,130,246,0.1)',  color: '#60a5fa', border: 'rgba(59,130,246,0.25)'  },
    }
    const c = map[role?.toLowerCase()] || map.employee
    return { display: 'inline-block', padding: '2px 9px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 600, background: c.bg, color: c.color, border: `1px solid ${c.border}` }
  },

  approveBtn: {
    padding: '0.3rem 0.85rem', background: 'rgba(16,185,129,0.1)',
    color: '#34d399', border: '1px solid rgba(16,185,129,0.25)',
    borderRadius: 7, fontSize: '0.75rem', cursor: 'pointer',
    fontFamily: "'DM Sans',sans-serif", fontWeight: 600,
    transition: 'background 0.15s',
  },

  rejectBtn:  {
    padding: '0.3rem 0.85rem', background: 'rgba(239,68,68,0.08)',
    color: '#f87171', border: '1px solid rgba(239,68,68,0.2)',
    borderRadius: 7, fontSize: '0.75rem', cursor: 'pointer',
    fontFamily: "'DM Sans',sans-serif", fontWeight: 600,
    transition: 'background 0.15s',
  },

  revokeBtn:  {
    padding: '0.3rem 0.85rem', background: 'rgba(245,158,11,0.08)',
    color: '#fbbf24', border: '1px solid rgba(245,158,11,0.2)',
    borderRadius: 7, fontSize: '0.75rem', cursor: 'pointer',
    fontFamily: "'DM Sans',sans-serif", fontWeight: 600,
  },

  ghostBtn:   {
    padding: '0.42rem 1rem', background: 'transparent',
    color: '#94a3b8', border: '1px solid #1e293b',
    borderRadius: 8, fontSize: '0.83rem', cursor: 'pointer',
    fontFamily: "'DM Sans',sans-serif",
  },

  dangerBtn:  {
    padding: '0.42rem 1rem',
    background: 'linear-gradient(135deg,#ef4444,#b91c1c)',
    color: '#fff', border: 'none', borderRadius: 8,
    fontSize: '0.83rem', fontWeight: 600, cursor: 'pointer',
    fontFamily: "'DM Sans',sans-serif",
  },

  overlay:    { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' },
  modal:      { background: '#0f172a', border: '1px solid #1e293b', borderRadius: 16, width: '100%', maxWidth: 440, overflow: 'hidden' },
  modalHead:  { padding: '1rem 1.25rem', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  modalTitle: { margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#f1f5f9', fontFamily: "'Syne', sans-serif" },
  modalBody:  { padding: '1.25rem' },
  closeBtn:   { background: 'transparent', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '1.1rem', padding: '0 4px', lineHeight: 1 },

  confirmBox: (type) => ({
    background: type === 'reject' ? 'rgba(239,68,68,0.05)' : 'rgba(245,158,11,0.05)',
    border: `1px solid ${type === 'reject' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)'}`,
    borderRadius: 10, padding: '0.85rem 1rem', marginBottom: '1.25rem',
    fontSize: '0.82rem', color: type === 'reject' ? '#fca5a5' : '#fde68a',
    lineHeight: 1.6,
  }),

  userPreview: { background: '#1e293b', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 12 },

  emptyWrap:  { textAlign: 'center', padding: '4rem 1rem', color: '#475569', fontSize: '0.83rem' },
  spinner:    { display: 'inline-block', width: 26, height: 26, border: '2.5px solid #1e293b', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 0.7s linear infinite' },

  detailRow:  { display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #1e293b' },
  detailLabel:{ fontSize: '0.75rem', color: '#64748b' },
  detailValue:{ fontSize: '0.8rem', color: '#e2e8f0', fontWeight: 500 },
}

// ─────────────────────────────────────────────────────────────────────────────
export default function HRVerificationPage() {
  const [users,      setUsers]      = useState([])
  const [stats,      setStats]      = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [actionId,   setActionId]   = useState(null)   // id being approved/rejected
  const [tab,        setTab]        = useState('pending')
  const [confirm,    setConfirm]    = useState(null)   // { type: 'reject'|'revoke', user }
  const [detail,     setDetail]     = useState(null)   // user to view details

  const load = async (t = tab) => {
    setLoading(true)
    console.log("getverfication");
    
    try {
      const [ur, sr] = await Promise.allSettled([
        hrAPI.getVerificationRequests(t),
        hrAPI.getVerificationStats(),
      ])
    
      if (ur.status === 'fulfilled') setUsers(ur.value.data.users || [])
      if (sr.status === 'fulfilled') setStats(sr.value.data.stats)
    } catch { toast.error('Failed to load requests') }
    finally { setLoading(false) }
  }

  useEffect(() => { load(tab) }, [tab])

  const handleApprove = async (user) => {
    setActionId(user._id)
    try {
      await hrAPI.approveUser(user._id)
      toast.success(`${user.name} approved!`)
      load(tab)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setActionId(null) }
  }

  const handleReject = async () => {
    if (!confirm) return
    setActionId(confirm.user._id)
    try {
      await hrAPI.rejectUser(confirm.user._id)
      toast.success(`${confirm.user.name}'s request rejected`)
      setConfirm(null); load(tab)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setActionId(null) }
  }

  const handleRevoke = async () => {
    if (!confirm) return
    setActionId(confirm.user._id)
    try {
      await hrAPI.revokeUser(confirm.user._id)
      toast.success(`${confirm.user.name}'s approval revoked`)
      setConfirm(null); load(tab)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setActionId(null) }
  }

  const TABS = [
    { id: 'pending',  label: '⏳ Pending',  count: stats?.pending  },
    { id: 'approved', label: '✅ Approved', count: stats?.approved },
    { id: 'all',      label: '📋 All',      count: stats?.total    },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }

        body, #root,
        [class*="content"], [class*="layout"], [class*="main"],
        [class*="wrapper"], [class*="page"] {
          background: #080d14 !important;
        }

        .stat-card-hover:hover { border-color: #334155 !important; transform: translateY(-2px); }
        .user-row-hover:hover  { background: rgba(255,255,255,0.02) !important; }

        .approve-btn:hover { background: rgba(16,185,129,0.2) !important; }
        .reject-btn:hover  { background: rgba(239,68,68,0.16) !important; }
        .revoke-btn:hover  { background: rgba(245,158,11,0.16) !important; }
        .dep-ghost:hover   { border-color: #334155 !important; color: #e2e8f0 !important; }

        .ver-modal::-webkit-scrollbar { width: 6px; }
        .ver-modal::-webkit-scrollbar-track { background: #0f172a; }
        .ver-modal::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 3px; }
      `}</style>

      <div style={S.page}>

        {/* ── Header ── */}
        <div style={S.header}>
          <div>
            <h4 style={S.title}>HR Verification</h4>
            <p style={S.sub}>Review and approve new user registration requests</p>
          </div>
          <button
            style={{ ...S.ghostBtn, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem' }}
            onClick={() => load(tab)}
          >
            ↻ Refresh
          </button>
        </div>

        {/* ── Stats ── */}
        <div style={S.statRow}>
          {[
            { label: 'Total Registered', value: stats?.total,    accent: '#7c3aed', bg: 'rgba(124,58,237,0.12)', icon: '👥' },
            { label: 'Pending Approval', value: stats?.pending,  accent: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  icon: '⏳' },
            { label: 'Approved',         value: stats?.approved, accent: '#10b981', bg: 'rgba(16,185,129,0.12)',  icon: '✅' },
            { label: 'Rejected',         value: stats?.rejected ?? 0, accent: '#ef4444', bg: 'rgba(239,68,68,0.12)', icon: '❌' },
          ].map(c => (
            <div key={c.label} className="stat-card-hover" style={S.statCard(c.accent)}>
              <div style={S.statIcon(c.bg)}>{c.icon}</div>
              <div style={S.statValue}>{loading ? '…' : (c.value ?? '—')}</div>
              <div style={S.statLabel}>{c.label}</div>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div style={S.tabBar}>
          {TABS.map(t => (
            <button key={t.id} style={S.tab(tab === t.id)} onClick={() => setTab(t.id)}>
              {t.label}
              {t.count != null && (
                <span style={{ marginLeft: 6, background: tab === t.id ? 'rgba(124,58,237,0.3)' : '#1e293b', padding: '1px 7px', borderRadius: 10, fontSize: '0.68rem' }}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── User List ── */}
        <div style={S.card}>
          <div style={S.cardHeader}>
            <p style={S.cardTitle}>
              {tab === 'pending' ? 'Pending Requests' : tab === 'approved' ? 'Approved Users' : 'All Users'}
            </p>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '4px 10px', borderRadius: 100, background: 'rgba(100,116,139,0.12)', color: '#94a3b8', border: '1px solid rgba(100,116,139,0.2)' }}>
              {users.length} shown
            </span>
          </div>

          {loading ? (
            <div style={S.emptyWrap}><div style={S.spinner} /></div>
          ) : users.length === 0 ? (
            <div style={S.emptyWrap}>
              <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>
                {tab === 'pending' ? '🎉' : '📭'}
              </div>
              <div style={{ color: '#64748b', fontWeight: 600 }}>
                {tab === 'pending' ? 'All caught up! No pending requests.' : 'No users found.'}
              </div>
            </div>
          ) : (
            users.map((user, i) => (
              <div key={user._id} className="user-row-hover" style={S.userRow}>
                {/* Left — avatar + info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                  <div style={S.avatar(i)}>{initials(user.name)}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      {user.name}
                      <span style={S.roleBadge(user.role)}>{user.role}</span>
                      {user.hrVerified && (
                        <span style={{ fontSize: '0.68rem', color: '#34d399', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', padding: '1px 7px', borderRadius: 6, fontWeight: 600 }}>
                          ✓ HR Approved
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.73rem', color: '#475569', marginTop: 3 }}>
                      {user.email} · Registered {timeAgo(user.createdAt)}
                    </div>
                  </div>
                </div>

                {/* Right — actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <button
                    className="dep-ghost"
                    style={{ ...S.ghostBtn, padding: '0.28rem 0.65rem', fontSize: '0.74rem' }}
                    onClick={() => setDetail(user)}
                  >
                    View
                  </button>

                  {!user.hrVerified && (
                    <button
                      className="approve-btn"
                      style={{ ...S.approveBtn, opacity: actionId === user._id ? 0.6 : 1 }}
                      onClick={() => handleApprove(user)}
                      disabled={actionId === user._id}
                    >
                      {actionId === user._id ? '…' : '✓ Approve'}
                    </button>
                  )}

                  {user.hrVerified && (
                    <button
                      className="revoke-btn"
                      style={S.revokeBtn}
                      onClick={() => setConfirm({ type: 'revoke', user })}
                    >
                      Revoke
                    </button>
                  )}

                  {!user.hrVerified && (
                    <button
                      className="reject-btn"
                      style={S.rejectBtn}
                      onClick={() => setConfirm({ type: 'reject', user })}
                    >
                      ✕ Reject
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Detail Modal ── */}
      {detail && (
        <div style={S.overlay} onClick={e => e.target === e.currentTarget && setDetail(null)}>
          <div className="ver-modal" style={S.modal}>
            <div style={S.modalHead}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ ...S.avatar(0), width: 36, height: 36 }}>{initials(detail.name)}</div>
                <p style={S.modalTitle}>{detail.name}</p>
              </div>
              <button style={S.closeBtn} onClick={() => setDetail(null)}>✕</button>
            </div>
            <div style={S.modalBody}>
              {[
                { label: 'Full Name',         value: detail.name },
                { label: 'Email',             value: detail.email },
                { label: 'Role',              value: <span style={S.roleBadge(detail.role)}>{detail.role}</span> },
                { label: 'Email Verified',    value: detail.isVerified ? '✅ Yes' : '❌ No' },
                { label: 'HR Approved',       value: detail.hrVerified ? '✅ Approved' : '⏳ Pending' },
                { label: 'Registered',        value: new Date(detail.createdAt).toLocaleString('en-IN') },
              ].map(({ label, value }) => (
                <div key={label} style={S.detailRow}>
                  <span style={S.detailLabel}>{label}</span>
                  <span style={S.detailValue}>{value}</span>
                </div>
              ))}

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button className="dep-ghost" style={S.ghostBtn} onClick={() => setDetail(null)}>Close</button>
                {!detail.hrVerified && (
                  <>
                    <button
                      className="approve-btn"
                      style={{ ...S.approveBtn, padding: '0.42rem 1rem', fontSize: '0.83rem' }}
                      onClick={() => { handleApprove(detail); setDetail(null) }}
                    >
                      ✓ Approve
                    </button>
                    <button
                      className="reject-btn"
                      style={{ ...S.rejectBtn, padding: '0.42rem 1rem', fontSize: '0.83rem' }}
                      onClick={() => { setDetail(null); setConfirm({ type: 'reject', user: detail }) }}
                    >
                      ✕ Reject
                    </button>
                  </>
                )}
                {detail.hrVerified && (
                  <button
                    className="revoke-btn"
                    style={{ ...S.revokeBtn, padding: '0.42rem 1rem', fontSize: '0.83rem' }}
                    onClick={() => { setDetail(null); setConfirm({ type: 'revoke', user: detail }) }}
                  >
                    Revoke Approval
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm Modal (Reject / Revoke) ── */}
      {confirm && (
        <div style={S.overlay} onClick={e => e.target === e.currentTarget && setConfirm(null)}>
          <div className="ver-modal" style={S.modal}>
            <div style={S.modalHead}>
              <p style={S.modalTitle}>
                {confirm.type === 'reject' ? 'Reject Request' : 'Revoke Approval'}
              </p>
              <button style={S.closeBtn} onClick={() => setConfirm(null)}>✕</button>
            </div>
            <div style={S.modalBody}>
              <div style={S.confirmBox(confirm.type)}>
                {confirm.type === 'reject'
                  ? `⚠️ This will permanently delete ${confirm.user.name}'s account. They will need to register again.`
                  : `⚠️ This will revoke HR approval for ${confirm.user.name}. They will lose access until re-approved.`
                }
              </div>

              {/* User preview */}
              <div style={S.userPreview}>
                <div style={{ ...S.avatar(0), width: 36, height: 36 }}>{initials(confirm.user.name)}</div>
                <div>
                  <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '0.88rem' }}>{confirm.user.name}</div>
                  <div style={{ fontSize: '0.73rem', color: '#475569', marginTop: 2 }}>{confirm.user.email} · <span style={S.roleBadge(confirm.user.role)}>{confirm.user.role}</span></div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button className="dep-ghost" style={S.ghostBtn} onClick={() => setConfirm(null)}>Cancel</button>
                <button
                  style={S.dangerBtn}
                  onClick={confirm.type === 'reject' ? handleReject : handleRevoke}
                  disabled={!!actionId}
                >
                  {actionId ? '…' : confirm.type === 'reject' ? 'Yes, Reject' : 'Yes, Revoke'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
