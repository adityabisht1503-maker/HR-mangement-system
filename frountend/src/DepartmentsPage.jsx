import React, { useState, useEffect } from 'react'

import toast from 'react-hot-toast'
import { departmentAPI } from './services/api'

// ─── helpers ─────────────────────────────────────────────────────────────────
const initials = name => name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'

// ─── styles ──────────────────────────────────────────────────────────────────
const S = {
  page:       { fontFamily: "'DM Sans', sans-serif", color: '#e2e8f0', padding: '1.5rem', background: '#080d14', minHeight: '100vh' },
  header:     { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' },
  title:      { margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#f1f5f9', fontFamily: "'Syne', sans-serif" },
  sub:        { margin: '0.2rem 0 0', fontSize: '0.82rem', color: '#64748b' },

  grid3:      { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' },

  statRow:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' },

  statCard:   (accent) => ({
    background: '#0f172a', border: '1px solid #1e293b',
    borderTop: `2px solid ${accent}`, borderRadius: 16,
    padding: '1.1rem 1.25rem', transition: 'border-color 0.2s, transform 0.2s',
  }),

  statIcon:   (accent, bg) => ({
    width: 36, height: 36, borderRadius: 9, background: bg,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: '0.75rem', fontSize: '1rem', flexShrink: 0,
  }),

  statValue:  { fontSize: '1.65rem', fontWeight: 700, color: '#f1f5f9', lineHeight: 1, marginBottom: 3 },
  statLabel:  { fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 },

  deptCard:   {
    background: '#0f172a', border: '1px solid #1e293b', borderRadius: 16,
    overflow: 'hidden', transition: 'border-color 0.2s, transform 0.2s',
    display: 'flex', flexDirection: 'column',
  },

  deptCardTop: (color) => ({
    padding: '1.25rem 1.25rem 1rem',
    borderBottom: '1px solid #1e293b',
    borderTop: `3px solid ${color}`,
  }),

  deptIcon:   (color, bg) => ({
    width: 46, height: 46, borderRadius: 12, background: bg,
    border: `1px solid ${color}33`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1rem', fontWeight: 700, color, marginBottom: '0.85rem',
    fontFamily: "'Syne', sans-serif",
  }),

  deptName:   { fontSize: '1rem', fontWeight: 700, color: '#f1f5f9', margin: 0, fontFamily: "'Syne', sans-serif" },
  deptDesc:   { fontSize: '0.78rem', color: '#475569', marginTop: 4, lineHeight: 1.5 },

  deptCardBot: { padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 },

  deleteBtn:  {
    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
    color: '#f87171', borderRadius: 7, padding: '4px 10px',
    fontSize: '0.73rem', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
    fontWeight: 600, transition: 'background 0.15s, border-color 0.15s',
  },

  primaryBtn: {
    padding: '0.48rem 1.1rem',
    background: 'linear-gradient(135deg,#7c3aed,#5b21b6)',
    color: '#fff', border: 'none', borderRadius: 8,
    fontSize: '0.83rem', fontWeight: 600, cursor: 'pointer',
    fontFamily: "'DM Sans',sans-serif", whiteSpace: 'nowrap',
    display: 'flex', alignItems: 'center', gap: 6,
  },

  ghostBtn:   {
    padding: '0.48rem 1rem', background: 'transparent',
    color: '#94a3b8', border: '1px solid #1e293b',
    borderRadius: 8, fontSize: '0.83rem', cursor: 'pointer',
    fontFamily: "'DM Sans',sans-serif",
  },

  overlay:    { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' },
  modal:      { background: '#0f172a', border: '1px solid #1e293b', borderRadius: 16, width: '100%', maxWidth: 460, overflow: 'hidden' },
  modalHead:  { padding: '1rem 1.25rem', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  modalTitle: { margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#f1f5f9', fontFamily: "'Syne', sans-serif" },
  modalBody:  { padding: '1.25rem' },
  closeBtn:   { background: 'transparent', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '1.1rem', padding: '0 4px', lineHeight: 1 },

  formLabel:  { display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: 4, fontWeight: 500 },
  formInput:  { width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0', padding: '0.5rem 0.75rem', fontSize: '0.83rem', outline: 'none', marginBottom: '1rem', boxSizing: 'border-box' },
  formTextarea: { width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0', padding: '0.5rem 0.75rem', fontSize: '0.83rem', outline: 'none', marginBottom: '1rem', boxSizing: 'border-box', resize: 'vertical', minHeight: 80, fontFamily: "'DM Sans', sans-serif" },

  emptyWrap:  { gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 1rem', color: '#475569', fontSize: '0.83rem' },
  spinner:    { display: 'inline-block', width: 26, height: 26, border: '2.5px solid #1e293b', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 0.7s linear infinite' },

  confirmBox: {
    background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)',
    borderRadius: 10, padding: '0.85rem 1rem', marginBottom: '1.25rem',
    fontSize: '0.82rem', color: '#fca5a5', lineHeight: 1.6,
  },
}

// accent colors per department index
const ACCENTS = [
  { color: '#7c3aed', bg: 'rgba(124,58,237,0.12)' },
  { color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  { color: '#a855f7', bg: 'rgba(168,85,247,0.12)' },
  { color: '#06b6d4', bg: 'rgba(6,182,212,0.12)'  },
  { color: '#ef4444', bg: 'rgba(239,68,68,0.12)'  },
  { color: '#84cc16', bg: 'rgba(132,204,22,0.12)' },
]

const accent = i => ACCENTS[i % ACCENTS.length]

// ─────────────────────────────────────────────────────────────────────────────
export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [submitting,  setSubmitting]  = useState(false)
  const [showAdd,     setShowAdd]     = useState(false)
  const [confirmDel,  setConfirmDel]  = useState(null)
  const [form,        setForm]        = useState({ name: '', description: '' })
  const setF = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const load = async () => {
    setLoading(true)
    try {
      const r = await departmentAPI.getAll()
      setDepartments(r.data.departments || [])
    } catch { toast.error('Failed to load departments') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleAdd = async () => {
    if (!form.name.trim()) return toast.error('Department name is required')
    setSubmitting(true)
    try {
      await departmentAPI.create({ name: form.name.trim(), description: form.description.trim() })
      toast.success('Department created!')
      setShowAdd(false); setForm({ name: '', description: '' }); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSubmitting(false) }
  }

  const handleDelete = async () => {
    if (!confirmDel) return
    setSubmitting(true)
    try {
      await departmentAPI.delete(confirmDel._id)
      toast.success('Department removed!')
      setConfirmDel(null); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSubmitting(false) }
  }

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

        .dept-card:hover { border-color: #334155 !important; transform: translateY(-3px); }
        .stat-card-hover:hover { border-color: #334155 !important; transform: translateY(-2px); }

        .dept-del-btn:hover { background: rgba(239,68,68,0.16) !important; border-color: rgba(239,68,68,0.4) !important; }

        .dep-form-input {
          color: #e2e8f0 !important; background: #1e293b !important;
          border: 1px solid #334155 !important; caret-color: #a78bfa;
        }
        .dep-form-input::placeholder { color: #475569 !important; }
        .dep-form-input:focus {
          border-color: #7c3aed !important;
          box-shadow: 0 0 0 3px rgba(124,58,237,0.12) !important;
          outline: none !important;
        }
        .dep-form-input:-webkit-autofill,
        .dep-form-input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px #1e293b inset !important;
          -webkit-text-fill-color: #e2e8f0 !important;
        }

        .dep-ghost:hover { border-color: #334155 !important; color: #e2e8f0 !important; }

        .dep-modal::-webkit-scrollbar { width: 6px; }
        .dep-modal::-webkit-scrollbar-track { background: #0f172a; }
        .dep-modal::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 3px; }
      `}</style>

      <div style={S.page}>

        {/* ── Header ── */}
        <div style={S.header}>
          <div>
            <h4 style={S.title}>Departments</h4>
            <p style={S.sub}>Manage your organisation's departments</p>
          </div>
          <button style={S.primaryBtn} onClick={() => { setForm({ name: '', description: '' }); setShowAdd(true) }}>
            <span style={{ fontSize: '1rem', lineHeight: 1 }}>＋</span> Add Department
          </button>
        </div>

        {/* ── Stat row ── */}
        <div style={S.statRow}>
          {[
            { label: 'Total Departments', value: departments.length, accent: '#7c3aed', bg: 'rgba(124,58,237,0.12)', icon: '🏢' },
            { label: 'Active',            value: departments.length, accent: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: '✅' },
          ].map(c => (
            <div key={c.label} className="stat-card-hover" style={S.statCard(c.accent)}>
              <div style={S.statIcon(c.accent, c.bg)}>{c.icon}</div>
              <div style={S.statValue}>{loading ? '…' : c.value}</div>
              <div style={S.statLabel}>{c.label}</div>
            </div>
          ))}
        </div>

        {/* ── Cards Grid ── */}
        <div style={S.grid3}>
          {loading ? (
            <div style={S.emptyWrap}><div style={S.spinner} /></div>
          ) : departments.length === 0 ? (
            <div style={S.emptyWrap}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>🏢</div>
              <div style={{ color: '#64748b', fontWeight: 600, fontSize: '0.92rem' }}>No departments yet</div>
              <div style={{ color: '#475569', fontSize: '0.78rem', marginTop: 4 }}>Create your first department to get started</div>
            </div>
          ) : departments.map((dept, i) => {
            const { color, bg } = accent(i)
            return (
              <div key={dept._id} className="dept-card" style={S.deptCard}>
                <div style={S.deptCardTop(color)}>
                  <div style={S.deptIcon(color, bg)}>
                    {initials(dept.name)}
                  </div>
                  <p style={S.deptName}>{dept.name}</p>
                  {dept.description
                    ? <p style={S.deptDesc}>{dept.description}</p>
                    : <p style={{ ...S.deptDesc, fontStyle: 'italic', color: '#334155' }}>No description</p>
                  }
                </div>

                <div style={S.deptCardBot}>
                  <button
                    className="dept-del-btn"
                    style={S.deleteBtn}
                    onClick={() => setConfirmDel(dept)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Add Department Modal ── */}
      {showAdd && (
        <div style={S.overlay} onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="dep-modal" style={S.modal}>
            <div style={S.modalHead}>
              <p style={S.modalTitle}>Add Department</p>
              <button style={S.closeBtn} onClick={() => setShowAdd(false)}>✕</button>
            </div>
            <div style={S.modalBody}>
              <label style={S.formLabel}>Department Name *</label>
              <input
                className="dep-form-input"
                style={S.formInput}
                placeholder="e.g. Engineering"
                value={form.name}
                onChange={setF('name')}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
              />
              <label style={S.formLabel}>Description</label>
              <textarea
                className="dep-form-input"
                style={S.formTextarea}
                placeholder="What does this department do?"
                value={form.description}
                onChange={setF('description')}
              />
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button className="dep-ghost" style={S.ghostBtn} onClick={() => setShowAdd(false)}>Cancel</button>
                <button style={S.primaryBtn} onClick={handleAdd} disabled={submitting}>
                  {submitting ? 'Creating…' : 'Create Department'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm Delete Modal ── */}
      {confirmDel && (
        <div style={S.overlay} onClick={e => e.target === e.currentTarget && setConfirmDel(null)}>
          <div className="dep-modal" style={S.modal}>
            <div style={S.modalHead}>
              <p style={S.modalTitle}>Delete Department</p>
              <button style={S.closeBtn} onClick={() => setConfirmDel(null)}>✕</button>
            </div>
            <div style={S.modalBody}>
              <div style={S.confirmBox}>
                ⚠️ Are you sure you want to delete <strong style={{ color: '#f1f5f9' }}>{confirmDel.name}</strong>?
                This action will deactivate the department. Employees assigned to it will not be affected.
              </div>

              {/* Preview card */}
              <div style={{ background: '#1e293b', borderRadius: 10, padding: '0.85rem 1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ ...S.deptIcon(accent(0).color, accent(0).bg), margin: 0, width: 36, height: 36, borderRadius: 9, fontSize: '0.8rem' }}>
                  {initials(confirmDel.name)}
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '0.88rem' }}>{confirmDel.name}</div>
                  {confirmDel.description && <div style={{ fontSize: '0.73rem', color: '#475569', marginTop: 2 }}>{confirmDel.description}</div>}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button className="dep-ghost" style={S.ghostBtn} onClick={() => setConfirmDel(null)}>Cancel</button>
                <button
                  style={{ ...S.primaryBtn, background: 'linear-gradient(135deg,#ef4444,#b91c1c)' }}
                  onClick={handleDelete}
                  disabled={submitting}
                >
                  {submitting ? 'Deleting…' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
