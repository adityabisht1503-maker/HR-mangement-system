import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'           // ✅ was: useAuthStore (doesn't exist)
import { leaveAPI } from '../../services/api.js'
import toast from 'react-hot-toast'

const STATUS = {
  pending:  { bg: 'rgba(245,158,11,0.15)',  color: '#f59e0b' },
  approved: { bg: 'rgba(16,185,129,0.15)',  color: '#10b981' },
  rejected: { bg: 'rgba(239,68,68,0.15)',   color: '#ef4444' },
}

const fmt = d => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

export default function LeavesPage() {
  const user = useSelector(state => state.auth.user)
  // ✅ was: useAuthStore().isManager() — now checks role directly from Redux
  const isManager = user?.role === 'admin' || user?.role === 'hr'

  const [leaves,     setLeaves]     = useState([])
  const [loading,    setLoading]    = useState(true)
  const [showForm,   setShowForm]   = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [filter,     setFilter]     = useState('all')    // all | pending | approved | rejected

  const [form, setForm] = useState({ leaveType: 'annual', startDate: '', endDate: '', reason: '' })
  const setF = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const load = async () => {
    setLoading(true)
    try {
      const params = { limit: 50 }
      if (filter !== 'all') params.status = filter
      const r = await leaveAPI.getAll(params)
      setLeaves(r.data.leaves || [])
    } catch { toast.error('Failed to load leaves') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [filter])

  const handleApprove = async (id, status) => {
    try {
      await leaveAPI.approve(id, { status })
      setLeaves(prev => prev.map(l => l._id === id ? { ...l, status } : l))
      toast.success(`Leave ${status}!`)
    } catch (e) { toast.error(e.response?.data?.message || 'Failed') }
  }

  const handleSubmit = async () => {
    if (!form.startDate || !form.endDate || !form.reason) {
      return toast.error('All fields are required')
    }
    setSubmitting(true)
    try {
      const r = await leaveAPI.create(form)   // POST /api/leaves
      setLeaves(prev => [r.data.leave, ...prev])
      setShowForm(false)
      setForm({ leaveType: 'annual', startDate: '', endDate: '', reason: '' })
      toast.success('Leave request submitted!')
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to submit') }
    finally { setSubmitting(false) }
  }

  const pending  = leaves.filter(l => l.status === 'pending').length
  const approved = leaves.filter(l => l.status === 'approved').length

  // ── styles (inline to match project pattern) ──────────────────────────────
  const S = {
    page:       { fontFamily: "'DM Sans', sans-serif", color: '#e6edf3', padding: 0 },
    header:     { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' },
    title:      { margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#f0f6fc' },
    sub:        { margin: '0.2rem 0 0', fontSize: '0.82rem', color: '#6e7681' },

    grid3:      { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' },
    statCard:   (accent) => ({ background: '#161b22', border: '1px solid #21262d', borderTop: `2px solid ${accent}`, borderRadius: 14, padding: '1.1rem 1.25rem' }),
    statValue:  { fontSize: '1.65rem', fontWeight: 700, color: '#f0f6fc', lineHeight: 1, marginBottom: 3 },
    statLabel:  { fontSize: '0.72rem', color: '#6e7681', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 },

    toolbar:    { display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' },
    filterBtn:  (active) => ({ padding: '0.38rem 0.9rem', borderRadius: 7, border: `1px solid ${active ? 'rgba(124,58,237,0.4)' : '#30363d'}`, background: active ? 'rgba(124,58,237,0.15)' : 'transparent', color: active ? '#a78bfa' : '#6e7681', cursor: 'pointer', fontSize: '0.8rem', fontFamily: "'DM Sans',sans-serif", fontWeight: active ? 600 : 400 }),

    card:       { background: '#161b22', border: '1px solid #21262d', borderRadius: 14, overflow: 'hidden' },
    cardHeader: { padding: '0.9rem 1.25rem', borderBottom: '1px solid #21262d', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    cardTitle:  { margin: 0, fontSize: '0.88rem', fontWeight: 600, color: '#f0f6fc' },

    badge: (bg, color) => ({ display: 'inline-block', padding: '0.18em 0.6em', borderRadius: 20, fontSize: '0.7rem', fontWeight: 600, background: bg, color }),
    primaryBtn: { padding: '0.48rem 1.1rem', background: 'linear-gradient(135deg,#7c3aed,#5b21b6)', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.83rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" },
    ghostBtn:   { padding: '0.42rem 0.85rem', background: 'transparent', color: '#8b949e', border: '1px solid #30363d', borderRadius: 7, fontSize: '0.78rem', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" },

    formLabel:  { display: 'block', fontSize: '0.75rem', color: '#6e7681', marginBottom: 4, fontWeight: 500 },
    formInput:  { width: '100%', background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, color: '#e6edf3', padding: '0.48rem 0.75rem', fontSize: '0.83rem', outline: 'none', marginBottom: '0.85rem', boxSizing: 'border-box' },
    formSelect: { width: '100%', background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, color: '#e6edf3', padding: '0.48rem 0.75rem', fontSize: '0.83rem', outline: 'none', marginBottom: '0.85rem', cursor: 'pointer', boxSizing: 'border-box' },
    formTextarea:{ width: '100%', background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, color: '#e6edf3', padding: '0.48rem 0.75rem', fontSize: '0.83rem', outline: 'none', marginBottom: '0.85rem', resize: 'vertical', minHeight: 80, boxSizing: 'border-box' },

    avatar:     { width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg,#7c3aed,#5b21b6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 700, color: '#fff', flexShrink: 0 },
    spinner:    { display: 'inline-block', width: 26, height: 26, border: '2.5px solid #21262d', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 0.7s linear infinite' },
    emptyWrap:  { textAlign: 'center', padding: '3rem 1rem', color: '#6e7681', fontSize: '0.83rem' },
  }

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .leave-row:hover td { background: rgba(255,255,255,0.02) !important; }
        .approve-btn:hover  { background: rgba(16,185,129,0.15) !important; }
        .reject-btn:hover   { background: rgba(239,68,68,0.15) !important; }
      `}</style>

      <div style={S.page}>

        {/* ── Header ── */}
        <div style={S.header}>
          <div>
            <h4 style={S.title}>Leave Management</h4>
            <p style={S.sub}>Track and manage all employee leave requests</p>
          </div>
         <button
            style={{ ...S.ghostBtn, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem' }}
            onClick={() => load()}
          >
            ↻ Refresh
          </button>
        </div>

        {/* ── Stat Cards ── */}
        <div style={S.grid3}>
          <div style={S.statCard('#7c3aed')}>
            <div style={{ fontSize: '1rem', marginBottom: 6 }}>📋</div>
            <div style={S.statValue}>{leaves.length}</div>
            <div style={S.statLabel}>Total Requests</div>
          </div>
          <div style={S.statCard('#fbbf24')}>
            <div style={{ fontSize: '1rem', marginBottom: 6 }}>⏳</div>
            <div style={S.statValue}>{pending}</div>
            <div style={S.statLabel}>Pending</div>
          </div>
          <div style={S.statCard('#34d399')}>
            <div style={{ fontSize: '1rem', marginBottom: 6 }}>✅</div>
            <div style={S.statValue}>{approved}</div>
            <div style={S.statLabel}>Approved</div>
          </div>
        </div>

        {/* ── Apply Form ── */}
        {showForm && (
          <div style={{ ...S.card, marginBottom: '1.25rem', border: '1px solid rgba(124,58,237,0.25)' }}>
            <div style={S.cardHeader}>
              <p style={S.cardTitle}>New Leave Request</p>
            </div>
            <div style={{ padding: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0 0.85rem' }}>
                <div>
                  <label style={S.formLabel}>Leave Type</label>
                  <select style={S.formSelect} value={form.leaveType} onChange={setF('leaveType')}>
                    {['annual', 'sick', 'casual', 'maternity', 'paternity', 'unpaid'].map(t => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={S.formLabel}>Start Date</label>
                  <input style={S.formInput} type="date" value={form.startDate} onChange={setF('startDate')} />
                </div>
                <div>
                  <label style={S.formLabel}>End Date</label>
                  <input style={S.formInput} type="date" value={form.endDate} onChange={setF('endDate')} />
                </div>
              </div>
              <label style={S.formLabel}>Reason</label>
              <textarea style={S.formTextarea} value={form.reason} onChange={setF('reason')} placeholder="Please provide a reason…" />
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button style={S.ghostBtn} onClick={() => setShowForm(false)}>Cancel</button>
                <button style={S.primaryBtn} onClick={handleSubmit} disabled={submitting}>
                  {submitting ? 'Submitting…' : 'Submit Request'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Filter Tabs ── */}
        <div style={S.toolbar}>
          {['all', 'pending', 'approved', 'rejected'].map(f => (
            <button key={f} style={S.filterBtn(filter === f)} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* ── Table ── */}
        <div style={S.card}>
          <div style={S.cardHeader}>
            <p style={S.cardTitle}>Leave Requests</p>
            <span style={S.badge('rgba(100,116,139,0.12)', '#94a3b8')}>{leaves.length} total</span>
          </div>

          {loading ? (
            <div style={S.emptyWrap}><div style={S.spinner} /></div>
          ) : leaves.length === 0 ? (
            <div style={S.emptyWrap}>No leave requests found.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
                <thead>
                  <tr>
                    {['Employee', 'Type', 'Period', 'Days', 'Reason', 'Status', ...(isManager ? ['Actions'] : [])].map(h => (
                      <th key={h} style={{ padding: '0.7rem 1rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6e7681', borderBottom: '1px solid #21262d', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leaves.map(l => {
                    const sc = STATUS[l.status] || STATUS.pending
                    const firstName = l.employee?.personalInfo?.firstName
                    const lastName  = l.employee?.personalInfo?.lastName
                    return (
                      <tr key={l._id} className="leave-row">
                        <td style={{ padding: '0.7rem 1rem', borderBottom: '1px solid #21262d' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={S.avatar}>
                              {(firstName?.[0] || '?').toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: '#f0f6fc' }}>{firstName} {lastName}</div>
                              <div style={{ fontSize: '0.72rem', color: '#6e7681' }}>{l.employee?.employeeCode}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '0.7rem 1rem', borderBottom: '1px solid #21262d' }}>
                          <span style={{ color: '#c9d1d9', textTransform: 'capitalize' }}>{l.leaveType}</span>
                        </td>
                        <td style={{ padding: '0.7rem 1rem', color: '#6e7681', fontSize: '0.78rem', borderBottom: '1px solid #21262d', whiteSpace: 'nowrap' }}>
                          {fmt(l.startDate)} → {fmt(l.endDate)}
                        </td>
                        <td style={{ padding: '0.7rem 1rem', color: '#f0f6fc', fontWeight: 600, borderBottom: '1px solid #21262d' }}>{l.totalDays}</td>
                        <td style={{ padding: '0.7rem 1rem', color: '#6e7681', fontSize: '0.78rem', borderBottom: '1px solid #21262d', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {l.reason}
                        </td>
                        <td style={{ padding: '0.7rem 1rem', borderBottom: '1px solid #21262d' }}>
                          <span style={S.badge(sc.bg, sc.color)}>
                            {l.status.charAt(0).toUpperCase() + l.status.slice(1)}
                          </span>
                        </td>
                        {isManager && (
                          <td style={{ padding: '0.7rem 1rem', borderBottom: '1px solid #21262d' }}>
                            {l.status === 'pending' && (
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button
                                  className="approve-btn"
                                  style={{ padding: '0.3rem 0.7rem', borderRadius: 7, border: '1px solid rgba(16,185,129,0.25)', background: 'rgba(16,185,129,0.08)', color: '#34d399', cursor: 'pointer', fontSize: '0.78rem', fontFamily: "'DM Sans',sans-serif" }}
                                  onClick={() => handleApprove(l._id, 'approved')}
                                >✓ Approve</button>
                                <button
                                  className="reject-btn"
                                  style={{ padding: '0.3rem 0.7rem', borderRadius: 7, border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.08)', color: '#f87171', cursor: 'pointer', fontSize: '0.78rem', fontFamily: "'DM Sans',sans-serif" }}
                                  onClick={() => handleApprove(l._id, 'rejected')}
                                >✕ Reject</button>
                              </div>
                            )}
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
