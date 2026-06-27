import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { employeeAPI, departmentAPI } from '../../services/api.js'


import EmployeeSelfPage from './EmployeeSelfPage.jsx'
import { toast } from 'react-toastify'

const initials = (f, l) => `${f?.[0] || ''}${l?.[0] || ''}`.toUpperCase()
const fmt      = d => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const S = {
  page:       { fontFamily: "'DM Sans', sans-serif", color: '#e2e8f0', padding: '1.5rem', background: '#080d14', minHeight: '100vh' },
  header:     { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' },
  title:      { margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#f1f5f9' },
  sub:        { margin: '0.2rem 0 0', fontSize: '0.82rem', color: '#64748b' },
  grid4:      { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem', marginBottom: '1.5rem' },
  statCard:   (accent) => ({ background: '#0f172a', border: '1px solid #1e293b', borderTop: `2px solid ${accent}`, borderRadius: 16, padding: '1.1rem 1.25rem', position: 'relative', overflow: 'hidden', transition: 'border-color 0.2s, transform 0.2s' }),
  statIcon:   (accent, bg) => ({ width: 36, height: 36, borderRadius: 9, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem', color: accent, fontSize: '0.95rem' }),
  statValue:  { fontSize: '1.65rem', fontWeight: 700, color: '#f1f5f9', lineHeight: 1, marginBottom: 3 },
  statLabel:  { fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 },
  toolbar:    { display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' },
  searchWrap: { flex: 1, minWidth: 200, position: 'relative' },
  searchIcon: { position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#475569', fontSize: '0.85rem', pointerEvents: 'none' },
  input:      { width: '100%', background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, color: '#e2e8f0', padding: '0.48rem 0.75rem 0.48rem 2rem', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' },
  select:     { background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, color: '#e2e8f0', padding: '0.48rem 0.75rem', fontSize: '0.85rem', outline: 'none', cursor: 'pointer', minWidth: 130 },
  card:       { background: '#0f172a', border: '1px solid #1e293b', borderRadius: 16, overflow: 'hidden' },
  cardHeader: { padding: '0.9rem 1.25rem', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle:  { margin: 0, fontSize: '0.88rem', fontWeight: 600, color: '#e2e8f0' },
  badge:      (bg, color) => ({ display: 'inline-block', padding: '0.18em 0.6em', borderRadius: 20, fontSize: '0.7rem', fontWeight: 600, background: bg, color }),
  primaryBtn: { padding: '0.48rem 1.1rem', background: 'linear-gradient(135deg,#7c3aed,#5b21b6)', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.83rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", whiteSpace: 'nowrap' },
  ghostBtn:   { padding: '0.48rem 1rem', background: 'transparent', color: '#94a3b8', border: '1px solid #1e293b', borderRadius: 8, fontSize: '0.83rem', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" },
  dangerBtn:  { padding: '0.48rem 1rem', background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, fontSize: '0.83rem', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" },
  avatar:     (i) => { const colors = [['#7c3aed','#5b21b6'],['#10b981','#059669'],['#3b82f6','#1d4ed8'],['#f59e0b','#d97706'],['#ef4444','#b91c1c']]; const [a, b] = colors[i % colors.length]; return { width: 36, height: 36, borderRadius: 9, background: `linear-gradient(135deg,${a},${b})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#fff', flexShrink: 0 } },
  formLabel:  { display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: 4, fontWeight: 500 },
  formInput:  { width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0', padding: '0.48rem 0.75rem', fontSize: '0.83rem', outline: 'none', marginBottom: '0.85rem', boxSizing: 'border-box' },
  formSelect: { width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0', padding: '0.48rem 0.75rem', fontSize: '0.83rem', outline: 'none', marginBottom: '0.85rem', cursor: 'pointer', boxSizing: 'border-box' },
  overlay:    { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' },
  modal:      { background: '#0f172a', border: '1px solid #1e293b', borderRadius: 16, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' },
  modalHead:  { padding: '1rem 1.25rem', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  modalTitle: { margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#f1f5f9' },
  modalBody:  { padding: '1.25rem' },
  closeBtn:   { background: 'transparent', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '1.1rem', padding: '0 4px', lineHeight: 1 },
  formGrid2:  { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 0.85rem' },
  spinner:    { display: 'inline-block', width: 26, height: 26, border: '2.5px solid #1e293b', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 0.7s linear infinite' },
  emptyWrap:  { textAlign: 'center', padding: '3rem 1rem', color: '#475569', fontSize: '0.83rem' },
  detailRow:  { display: 'flex', justifyContent: 'space-between', padding: '0.55rem 0', borderBottom: '1px solid #1e293b' },
  detailLabel:{ fontSize: '0.76rem', color: '#64748b' },
  detailValue:{ fontSize: '0.8rem', color: '#e2e8f0', fontWeight: 500, textAlign: 'right' },
}

const STATUS_COLORS = {
  active:     { bg: 'rgba(16,185,129,0.12)',  color: '#34d399' },
  inactive:   { bg: 'rgba(100,116,139,0.12)', color: '#94a3b8' },
  on_leave:   { bg: 'rgba(245,158,11,0.12)',  color: '#fbbf24' },
  terminated: { bg: 'rgba(239,68,68,0.12)',   color: '#f87171' },
}

const EMPTY_FORM = {
  userId: '', firstName: '', lastName: '', email: '', phone: '',
  title: '', department: '', employmentType: 'full_time', salary: '',
  status: 'active', hireDate: new Date().toISOString().split('T')[0],
}

function AdminEmployeesView() {
  const [employees,    setEmployees]   = useState([])
  const [stats,        setStats]       = useState(null)
  const [departments,  setDepartments] = useState([])
  const [loading,      setLoading]     = useState(true)
  const [submitting,   setSubmitting]  = useState(false)
  const [deleting,     setDeleting]    = useState(false)       // ← delete loading state
  const [search,       setSearch]      = useState('')
  const [deptFilter,   setDept]        = useState('')
  const [statusFilter, setStatus]      = useState('')
  const [page,         setPage]        = useState(1)
  const [totalPages,   setTotalPages]  = useState(1)
  const [showAdd,      setShowAdd]     = useState(false)
  const [showDetail,   setShowDetail]  = useState(null)
  const [showEdit,     setShowEdit]    = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)     // ← employee to delete
  const [form,         setForm]        = useState(EMPTY_FORM)
  const setF = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const load = async (p = 1) => {
    setLoading(true)
    try {
      const params = { page: p, limit: 10 }
      if (search)       params.search     = search
      if (deptFilter)   params.department = deptFilter
      if (statusFilter) params.status     = statusFilter
      const [er, sr, dr] = await Promise.allSettled([
        employeeAPI.getAll(params),
        employeeAPI.getStats(),
        departmentAPI.getAll(),
      ])
      if (er.status === 'fulfilled') { setEmployees(er.value.data.employees || []); setTotalPages(er.value.data.pagination?.pages || 1) }
      if (sr.status === 'fulfilled') setStats(sr.value.data)
      if (dr.status === 'fulfilled') setDepartments(dr.value.data.departments || [])
    } catch { toast.error('Failed to load employees') }
    finally { setLoading(false) }
  }

  useEffect(() => { load(1) }, [search, deptFilter, statusFilter])

  const handleAdd = async () => {
    if (!form.userId || !form.firstName || !form.lastName || !form.email)
      return toast.error('User ID, first name, last name and email are required')
    setSubmitting(true)
    try {
      await employeeAPI.create({
        user: form.userId,
        personalInfo: { firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone },
        jobInfo: { title: form.title, department: form.department || undefined, employmentType: form.employmentType, salary: Number(form.salary) || 0, hireDate: form.hireDate },
        status: form.status,
      })
      toast.success('Employee added!')
      setShowAdd(false); setForm(EMPTY_FORM); load(1)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSubmitting(false) }
  }

  const handleUpdate = async () => {
    setSubmitting(true)
    try {
      await employeeAPI.update(showEdit._id, {
        personalInfo: { firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone },
        jobInfo: { title: form.title, department: form.department || undefined, employmentType: form.employmentType, salary: Number(form.salary) || 0, hireDate: form.hireDate },
        status: form.status,
      })
      toast.success('Updated!'); setShowEdit(null); load(page)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSubmitting(false) }
  }

  // ── Delete handler ────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!confirmDelete) return
    setDeleting(true)
    try {
      const res = await employeeAPI.delete(confirmDelete._id)
      const d   = res.data?.deleted || {}
      toast.success(
        `${confirmDelete.personalInfo?.firstName} deleted — `
       
      )
      setConfirmDelete(null)
      load(page)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
    } finally {
      setDeleting(false)
    }
  }
  // ─────────────────────────────────────────────────────────────────────────

  const openEdit = emp => {
    setForm({
      userId: emp.user?._id || '', firstName: emp.personalInfo?.firstName || '', lastName: emp.personalInfo?.lastName || '',
      email: emp.personalInfo?.email || '', phone: emp.personalInfo?.phone || '', title: emp.jobInfo?.title || '',
      department: emp.jobInfo?.department?._id || '', employmentType: emp.jobInfo?.employmentType || 'full_time',
      salary: emp.jobInfo?.salary || '', status: emp.status || 'active',
      hireDate: emp.jobInfo?.hireDate ? new Date(emp.jobInfo.hireDate).toISOString().split('T')[0] : '',
    })
    setShowEdit(emp)
  }

  const EmpForm = ({ onSave, onCancel, isEdit }) => (
    <div style={S.modalBody}>
      {!isEdit && (
        <>
          <label style={S.formLabel}>Auth User ID *</label>
          <input className="emp-form-input" style={S.formInput} value={form.userId} onChange={setF('userId')} placeholder="MongoDB _id from user" />
          <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: -10, marginBottom: '0.85rem' }}>The _id of the registered user account</div>
        </>
      )}
      <div style={S.formGrid2}>
        <div><label style={S.formLabel}>First Name *</label><input className="emp-form-input" style={S.formInput} value={form.firstName} onChange={setF('firstName')} /></div>
        <div><label style={S.formLabel}>Last Name *</label><input className="emp-form-input" style={S.formInput} value={form.lastName} onChange={setF('lastName')} /></div>
      </div>
      <label style={S.formLabel}>Email *</label>
      <input className="emp-form-input" style={S.formInput} type="email" value={form.email} onChange={setF('email')} />
      <div style={S.formGrid2}>
        <div><label style={S.formLabel}>Phone</label><input className="emp-form-input" style={S.formInput} value={form.phone} onChange={setF('phone')} /></div>
        <div><label style={S.formLabel}>Job Title</label><input className="emp-form-input" style={S.formInput} value={form.title} onChange={setF('title')} /></div>
      </div>
      <div style={S.formGrid2}>
        <div>
          <label style={S.formLabel}>Department</label>
          <select className="emp-form-select" style={S.formSelect} value={form.department} onChange={setF('department')}>
            <option value="">No Department</option>
            {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
        </div>
        <div>
          <label style={S.formLabel}>Employment Type</label>
          <select className="emp-form-select" style={S.formSelect} value={form.employmentType} onChange={setF('employmentType')}>
            <option value="full_time">Full Time</option>
            <option value="part_time">Part Time</option>
            <option value="contract">Contract</option>
            <option value="intern">Intern</option>
          </select>
        </div>
      </div>
      <div style={S.formGrid2}>
        <div><label style={S.formLabel}>Salary (₹/month)</label><input className="emp-form-input" style={S.formInput} type="number" value={form.salary} onChange={setF('salary')} /></div>
        <div><label style={S.formLabel}>Hire Date</label><input className="emp-form-input" style={S.formInput} type="date" value={form.hireDate} onChange={setF('hireDate')} /></div>
      </div>
      <label style={S.formLabel}>Status</label>
      <select className="emp-form-select" style={S.formSelect} value={form.status} onChange={setF('status')}>
        {['active', 'inactive', 'on_leave', 'terminated'].map(s => (
          <option key={s} value={s}>{s.replace('_', ' ')}</option>
        ))}
      </select>
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
        <button style={S.ghostBtn} onClick={onCancel}>Cancel</button>
        <button style={S.primaryBtn} onClick={onSave} disabled={submitting}>
          {submitting ? 'Saving…' : isEdit ? 'Update Employee' : 'Add Employee'}
        </button>
      </div>
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        body, #root, .main-content, .page-content, .content-area,
        .layout-content, .content-wrapper, .main-wrapper, .app-content,
        .page-wrapper, [class*="content"], [class*="main"] { background: #080d14 !important; color: #e2e8f0 !important; }
        .emp-row:hover td { background: rgba(255,255,255,0.02) !important; }
        .emp-search { color: #e2e8f0 !important; }
        .emp-search::placeholder { color: #475569 !important; }
        .emp-search:focus { border-color: #7c3aed !important; outline: none !important; box-shadow: 0 0 0 3px rgba(124,58,237,0.12) !important; }
        .emp-select { color: #e2e8f0 !important; }
        .emp-select:focus { border-color: #7c3aed !important; outline: none !important; }
        .emp-select option { background: #1e293b !important; color: #e2e8f0 !important; }
        .emp-form-input { color: #e2e8f0 !important; background: #1e293b !important; border: 1px solid #334155 !important; caret-color: #a78bfa; }
        .emp-form-input::placeholder { color: #475569 !important; }
        .emp-form-input:focus { border-color: #7c3aed !important; box-shadow: 0 0 0 3px rgba(124,58,237,0.12) !important; outline: none !important; }
        .emp-form-input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.6) sepia(1) saturate(3) hue-rotate(220deg); cursor: pointer; opacity: 0.7; }
        .emp-form-input[type="number"]::-webkit-inner-spin-button, .emp-form-input[type="number"]::-webkit-outer-spin-button { filter: invert(1); opacity: 0.4; }
        .emp-form-input:-webkit-autofill, .emp-form-input:-webkit-autofill:focus { -webkit-box-shadow: 0 0 0 1000px #1e293b inset !important; -webkit-text-fill-color: #e2e8f0 !important; }
        .emp-form-select { color: #e2e8f0 !important; background: #1e293b !important; border: 1px solid #334155 !important; appearance: auto; }
        .emp-form-select:focus { border-color: #7c3aed !important; box-shadow: 0 0 0 3px rgba(124,58,237,0.12) !important; outline: none !important; }
        .emp-form-select option { background: #1e293b !important; color: #e2e8f0 !important; }
        .stat-card-hover:hover { border-color: #334155 !important; transform: translateY(-2px); }
        .page-btn { transition: border-color 0.15s, color 0.15s; }
        .page-btn:hover { border-color: #7c3aed !important; color: #a78bfa !important; }
        .emp-ghost-btn { transition: border-color 0.15s, color 0.15s; }
        .emp-ghost-btn:hover { border-color: #334155 !important; color: #e2e8f0 !important; }
        .emp-ghost-violet { transition: border-color 0.15s, color 0.15s; }
        .emp-ghost-violet:hover { border-color: rgba(124,58,237,0.5) !important; color: #c4b5fd !important; }
        .emp-delete-btn { transition: background 0.15s, border-color 0.15s; }
        .emp-delete-btn:hover { background: rgba(239,68,68,0.18) !important; border-color: rgba(239,68,68,0.5) !important; }
        .emp-modal::-webkit-scrollbar { width: 6px; }
        .emp-modal::-webkit-scrollbar-track { background: #0f172a; }
        .emp-modal::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 3px; }
        .emp-modal::-webkit-scrollbar-thumb:hover { background: #334155; }
      `}</style>

      <div style={S.page}>
        {/* Header */}
        <div style={S.header}>
          <div>
            <h4 style={{ ...S.title, fontFamily: "'Syne', sans-serif" }}>Employee Management</h4>
            <p style={S.sub}>Manage your organisation's workforce</p>
          </div>
          <button style={{ ...S.ghostBtn, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem' }} onClick={() => load()}>
            ↻ Refresh
          </button>
        </div>

        {/* Stats */}
        <div style={S.grid4}>
          {[
            { label: 'Total Employees', value: stats?.totalEmployees,  accent: '#7c3aed', bg: 'rgba(124,58,237,0.12)', icon: '👥' },
            { label: 'Active',          value: stats?.activeEmployees,  accent: '#10b981', bg: 'rgba(16,185,129,0.12)',  icon: '✅' },
            { label: 'On Leave',        value: stats?.onLeave,          accent: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  icon: '🏖️' },
            { label: 'New This Month',  value: stats?.newThisMonth,     accent: '#a855f7', bg: 'rgba(168,85,247,0.12)', icon: '🆕' },
          ].map(c => (
            <div key={c.label} className="stat-card-hover" style={{ ...S.statCard(c.accent), transition: 'border-color 0.2s, transform 0.2s' }}>
              <div style={S.statIcon(c.accent, c.bg)}>{c.icon}</div>
              <div style={S.statValue}>{loading ? '…' : (c.value ?? '—')}</div>
              <div style={S.statLabel}>{c.label}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div style={S.toolbar}>
          <div style={S.searchWrap}>
            <span style={S.searchIcon}>🔍</span>
            <input className="emp-search" style={S.input} placeholder="Search by name, email, code…" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
          </div>
          <select className="emp-select" style={S.select} value={deptFilter} onChange={e => { setDept(e.target.value); setPage(1) }}>
            <option value="">All Departments</option>
            {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
          <select className="emp-select" style={S.select} value={statusFilter} onChange={e => { setStatus(e.target.value); setPage(1) }}>
            <option value="">All Status</option>
            {['active', 'inactive', 'on_leave', 'terminated'].map(s => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div style={S.card}>
          <div style={S.cardHeader}>
            <p style={S.cardTitle}>All Employees</p>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '4px 10px', borderRadius: 100, background: 'rgba(100,116,139,0.12)', color: '#94a3b8', border: '1px solid rgba(100,116,139,0.2)' }}>
              {employees.length} shown
            </span>
          </div>

          {loading ? (
            <div style={S.emptyWrap}><div style={S.spinner} /></div>
          ) : employees.length === 0 ? (
            <div style={S.emptyWrap}>No employees found.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
                <thead>
                  <tr>
                    {['Employee', 'Code', 'Department', 'Title', 'Type', 'Status', 'Joined', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '0.7rem 1rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', borderBottom: '1px solid #1e293b', whiteSpace: 'nowrap', background: '#0f172a' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp, i) => {
                    const sc = STATUS_COLORS[emp.status] || STATUS_COLORS.inactive
                    return (
                      <tr key={emp._id} className="emp-row">
                        <td style={{ padding: '0.7rem 1rem', borderBottom: '1px solid #1e293b' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={S.avatar(i)}>
                              {initials(emp.personalInfo?.firstName, emp.personalInfo?.lastName)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: '#f1f5f9' }}>{emp.personalInfo?.firstName} {emp.personalInfo?.lastName}</div>
                              <div style={{ fontSize: '0.72rem', color: '#475569' }}>{emp.personalInfo?.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '0.7rem 1rem', color: '#a78bfa', fontFamily: 'monospace', fontSize: '0.8rem', borderBottom: '1px solid #1e293b' }}>{emp.employeeCode || '—'}</td>
                        <td style={{ padding: '0.7rem 1rem', color: '#94a3b8', borderBottom: '1px solid #1e293b' }}>{emp.jobInfo?.department?.name || '—'}</td>
                        <td style={{ padding: '0.7rem 1rem', color: '#94a3b8', borderBottom: '1px solid #1e293b' }}>{emp.jobInfo?.title || '—'}</td>
                        <td style={{ padding: '0.7rem 1rem', borderBottom: '1px solid #1e293b' }}>
                          <span style={S.badge('rgba(59,130,246,0.1)', '#60a5fa')}>{emp.jobInfo?.employmentType?.replace('_', ' ') || '—'}</span>
                        </td>
                        <td style={{ padding: '0.7rem 1rem', borderBottom: '1px solid #1e293b' }}>
                          <span style={{ display: 'inline-block', padding: '3px 9px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 600, background: sc.bg, color: sc.color, border: `1px solid ${sc.color}33` }}>{emp.status}</span>
                        </td>
                        <td style={{ padding: '0.7rem 1rem', color: '#475569', fontSize: '0.78rem', borderBottom: '1px solid #1e293b', whiteSpace: 'nowrap' }}>{fmt(emp.jobInfo?.hireDate)}</td>
                        <td style={{ padding: '0.7rem 1rem', borderBottom: '1px solid #1e293b' }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="emp-ghost-btn" style={{ ...S.ghostBtn, padding: '0.3rem 0.7rem', fontSize: '0.75rem' }} onClick={() => setShowDetail(emp)}>View</button>
                            <button className="emp-ghost-violet" style={{ ...S.ghostBtn, padding: '0.3rem 0.7rem', fontSize: '0.75rem', color: '#a78bfa', borderColor: 'rgba(124,58,237,0.3)' }} onClick={() => openEdit(emp)}>Edit</button>
                            {/* ── Delete button ── */}
                            <button
                              className="emp-delete-btn"
                              style={{ ...S.dangerBtn, padding: '0.3rem 0.7rem', fontSize: '0.75rem' }}
                              onClick={() => setConfirmDelete(emp)}
                            >
                              <i className="bi bi-trash3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: '1rem' }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} className="page-btn" onClick={() => { setPage(p); load(p) }} style={{ width: 32, height: 32, borderRadius: 7, border: '1px solid #1e293b', background: page === p ? 'rgba(124,58,237,0.2)' : 'transparent', color: page === p ? '#a78bfa' : '#475569', cursor: 'pointer', fontSize: '0.82rem', fontFamily: "'DM Sans',sans-serif" }}>{p}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div style={S.overlay} onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="emp-modal" style={S.modal}>
            <div style={S.modalHead}>
              <p style={S.modalTitle}>Add New Employee</p>
              <button style={S.closeBtn} onClick={() => setShowAdd(false)}>✕</button>
            </div>
            <EmpForm onSave={handleAdd} onCancel={() => setShowAdd(false)} isEdit={false} />
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEdit && (
        <div style={S.overlay} onClick={e => e.target === e.currentTarget && setShowEdit(null)}>
          <div className="emp-modal" style={S.modal}>
            <div style={S.modalHead}>
              <p style={S.modalTitle}>Edit — {showEdit.personalInfo?.firstName} {showEdit.personalInfo?.lastName}</p>
              <button style={S.closeBtn} onClick={() => setShowEdit(null)}>✕</button>
            </div>
            <EmpForm onSave={handleUpdate} onCancel={() => setShowEdit(null)} isEdit={true} />
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && (
        <div style={S.overlay} onClick={e => e.target === e.currentTarget && setShowDetail(null)}>
          <div className="emp-modal" style={S.modal}>
            <div style={S.modalHead}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ ...S.avatar(0), width: 40, height: 40 }}>
                  {initials(showDetail.personalInfo?.firstName, showDetail.personalInfo?.lastName)}
                </div>
                <div>
                  <p style={S.modalTitle}>{showDetail.personalInfo?.firstName} {showDetail.personalInfo?.lastName}</p>
                  <div style={{ fontSize: '0.72rem', color: '#475569' }}>{showDetail.employeeCode}</div>
                </div>
              </div>
              <button style={S.closeBtn} onClick={() => setShowDetail(null)}>✕</button>
            </div>
            <div style={S.modalBody}>
              {[
                { label: 'Email',           value: showDetail.personalInfo?.email },
                { label: 'Phone',           value: showDetail.personalInfo?.phone || '—' },
                { label: 'Job Title',       value: showDetail.jobInfo?.title || '—' },
                { label: 'Department',      value: showDetail.jobInfo?.department?.name || '—' },
                { label: 'Employment Type', value: showDetail.jobInfo?.employmentType?.replace('_', ' ') || '—' },
                { label: 'Salary',          value: showDetail.jobInfo?.salary ? `₹${Number(showDetail.jobInfo.salary).toLocaleString('en-IN')}` : '—' },
                { label: 'Status',          value: showDetail.status },
                { label: 'Hire Date',       value: fmt(showDetail.jobInfo?.hireDate) },
                { label: 'Performance',     value: showDetail.performanceScore ? `${showDetail.performanceScore}/100` : '—' },
              ].map(({ label, value }) => (
                <div key={label} style={S.detailRow}>
                  <span style={S.detailLabel}>{label}</span>
                  <span style={S.detailValue}>{value}</span>
                </div>
              ))}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', justifyContent: 'flex-end' }}>
                <button className="emp-ghost-btn" style={S.ghostBtn} onClick={() => setShowDetail(null)}>Close</button>
                <button className="emp-ghost-violet" style={{ ...S.ghostBtn, color: '#a78bfa', borderColor: 'rgba(124,58,237,0.3)' }} onClick={() => { setShowDetail(null); openEdit(showDetail) }}>Edit</button>
                {/* Delete from detail modal too */}
                <button
                  className="emp-delete-btn"
                  style={S.dangerBtn}
                  onClick={() => { setShowDetail(null); setConfirmDelete(showDetail) }}
                >
                  <i className="bi bi-trash3" /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm Delete Modal ── */}
      {confirmDelete && (
        <div style={S.overlay} onClick={e => e.target === e.currentTarget && !deleting && setConfirmDelete(null)}>
          <div style={{ ...S.modal, maxWidth: 420 }}>
            <div style={S.modalHead}>
              <p style={{ ...S.modalTitle, color: '#f87171' }}>
                <i className="bi bi-exclamation-triangle me-2" />
                Delete Employee
              </p>
              <button style={S.closeBtn} onClick={() => !deleting && setConfirmDelete(null)}>✕</button>
            </div>
            <div style={S.modalBody}>
              {/* Warning box */}
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ fontWeight: 600, color: '#f87171', marginBottom: 6, fontSize: '0.88rem' }}>
                  This action is permanent and cannot be undone.
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.6 }}>
                  Deleting <strong style={{ color: '#f1f5f9' }}>{confirmDelete.personalInfo?.firstName} {confirmDelete.personalInfo?.lastName}</strong> will permanently remove:
                </div>
                <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem', fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.8 }}>
                  <li>All leave requests</li>
                  <li>All payroll records</li>
                  <li>All attendance records</li>
                  <li>All notifications</li>
                  <li>Employee profile & login account</li>
                </ul>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button style={S.ghostBtn} onClick={() => setConfirmDelete(null)} disabled={deleting}>Cancel</button>
                <button
                  style={{ ...S.dangerBtn, background: deleting ? 'rgba(239,68,68,0.06)' : 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', gap: 6 }}
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting
                    ? <><div style={{ ...S.spinner, width: 14, height: 14, border: '2px solid rgba(239,68,68,0.2)', borderTopColor: '#f87171' }} /> Deleting…</>
                    : <><i className="bi bi-trash3" /> Yes, Delete</>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default function EmployeesPage() {
  const user = useSelector(s => s.auth.user)
  const isAdminOrHR = user?.role === 'admin' || user?.role === 'hr'
  return isAdminOrHR ? <AdminEmployeesView /> : <EmployeeSelfPage />
}