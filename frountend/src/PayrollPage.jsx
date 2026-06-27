import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'


import { employeeAPI, payrollAPI } from './services/api'
import { toast } from 'react-toastify'

// ─── helpers ─────────────────────────────────────────────────────────────────
const fmt     = d => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
const fmtMonth = d => d ? new Date(d).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '—'
const currency = n => n != null ? `₹${Number(n).toLocaleString('en-IN')}` : '—'
const initials = (f, l) => `${f?.[0] || ''}${l?.[0] || ''}`.toUpperCase()

// ─── styles ──────────────────────────────────────────────────────────────────
const S = {
  page:        { fontFamily: "'DM Sans', sans-serif", color: '#e2e8f0', padding: '1.5rem', background: '#080d14', minHeight: '100vh' },
  header:      { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' },
  title:       { margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#f1f5f9', fontFamily: "'Syne', sans-serif" },
  sub:         { margin: '0.2rem 0 0', fontSize: '0.82rem', color: '#64748b' },
  grid4:       { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem', marginBottom: '1.5rem' },

  statCard: (accent) => ({
    background: '#0f172a',
    border: '1px solid #1e293b',
    borderTop: `2px solid ${accent}`,
    borderRadius: 16,
    padding: '1.1rem 1.25rem',
    position: 'relative',
    overflow: 'hidden',
    transition: 'border-color 0.2s, transform 0.2s',
    cursor: 'default',
  }),

  statIcon: (accent, bg) => ({
    width: 36, height: 36, borderRadius: 9,
    background: bg,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: '0.75rem', color: accent, fontSize: '1rem',
    flexShrink: 0,
  }),

  statValue:   { fontSize: '1.65rem', fontWeight: 700, color: '#f1f5f9', lineHeight: 1, marginBottom: 3 },
  statLabel:   { fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 },
  statSub:     { fontSize: '0.72rem', color: '#475569', marginTop: 2 },

  toolbar:     { display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' },

  input: {
    background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8,
    color: '#e2e8f0', padding: '0.48rem 0.75rem', fontSize: '0.85rem',
    outline: 'none', boxSizing: 'border-box',
  },

  select: {
    background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8,
    color: '#e2e8f0', padding: '0.48rem 0.75rem', fontSize: '0.85rem',
    outline: 'none', cursor: 'pointer', minWidth: 140,
  },

  card:        { background: '#0f172a', border: '1px solid #1e293b', borderRadius: 16, overflow: 'hidden' },
  cardHeader:  { padding: '0.9rem 1.25rem', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle:   { margin: 0, fontSize: '0.88rem', fontWeight: 600, color: '#e2e8f0' },

  primaryBtn: {
    padding: '0.48rem 1.1rem',
    background: 'linear-gradient(135deg,#7c3aed,#5b21b6)',
    color: '#fff', border: 'none', borderRadius: 8,
    fontSize: '0.83rem', fontWeight: 600, cursor: 'pointer',
    fontFamily: "'DM Sans',sans-serif", whiteSpace: 'nowrap',
    display: 'flex', alignItems: 'center', gap: 6,
  },

  ghostBtn: {
    padding: '0.48rem 1rem', background: 'transparent',
    color: '#94a3b8', border: '1px solid #1e293b',
    borderRadius: 8, fontSize: '0.83rem', cursor: 'pointer',
    fontFamily: "'DM Sans',sans-serif",
  },

  greenBtn: {
    padding: '0.3rem 0.8rem', background: 'rgba(16,185,129,0.1)',
    color: '#34d399', border: '1px solid rgba(16,185,129,0.25)',
    borderRadius: 6, fontSize: '0.75rem', cursor: 'pointer',
    fontFamily: "'DM Sans',sans-serif", fontWeight: 600,
  },

  avatar: (i) => {
    const colors = [['#7c3aed','#5b21b6'],['#10b981','#059669'],['#3b82f6','#1d4ed8'],['#f59e0b','#d97706'],['#ef4444','#b91c1c']]
    const [a, b] = colors[i % colors.length]
    return {
      width: 34, height: 34, borderRadius: 9,
      background: `linear-gradient(135deg,${a},${b})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '0.73rem', fontWeight: 700, color: '#fff', flexShrink: 0,
    }
  },

  formLabel:  { display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: 4, fontWeight: 500 },
  formInput:  { width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0', padding: '0.48rem 0.75rem', fontSize: '0.83rem', outline: 'none', marginBottom: '0.85rem', boxSizing: 'border-box' },
  formSelect: { width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0', padding: '0.48rem 0.75rem', fontSize: '0.83rem', outline: 'none', marginBottom: '0.85rem', cursor: 'pointer', boxSizing: 'border-box' },
  formGrid2:  { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 0.85rem' },

  overlay:    { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' },
  modal:      { background: '#0f172a', border: '1px solid #1e293b', borderRadius: 16, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' },
  modalHead:  { padding: '1rem 1.25rem', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  modalTitle: { margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#f1f5f9', fontFamily: "'Syne', sans-serif" },
  modalBody:  { padding: '1.25rem' },
  closeBtn:   { background: 'transparent', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '1.1rem', padding: '0 4px', lineHeight: 1 },

  spinner:    { display: 'inline-block', width: 24, height: 24, border: '2.5px solid #1e293b', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 0.7s linear infinite' },
  emptyWrap:  { textAlign: 'center', padding: '3rem 1rem', color: '#475569', fontSize: '0.83rem' },

  slipCard:   { background: '#0f172a', border: '1px solid #1e293b', borderRadius: 16, padding: '1.25rem', marginBottom: '1rem', transition: 'border-color 0.2s' },
  slipRow:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.45rem 0', borderBottom: '1px solid #1e293b' },
  slipLabel:  { fontSize: '0.78rem', color: '#64748b' },
  slipValue:  { fontSize: '0.82rem', color: '#e2e8f0', fontWeight: 500 },
}

const STATUS = {
  pending: { bg: 'rgba(245,158,11,0.1)',  color: '#fbbf24', border: 'rgba(245,158,11,0.25)' },
  paid:    { bg: 'rgba(16,185,129,0.1)',  color: '#34d399', border: 'rgba(16,185,129,0.25)' },
  failed:  { bg: 'rgba(239,68,68,0.1)',   color: '#f87171', border: 'rgba(239,68,68,0.25)'  },
}

const StatusBadge = ({ s }) => {
  const c = STATUS[s] || STATUS.pending
  return (
    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 600, background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
      {s}
    </span>
  )
}

const EMPTY_FORM = { employeeId: '', month: '', basicSalary: '', allowances: '', deductions: '' }

// ═══════════════════════════════════════════════════
// ADMIN / HR VIEW
// ═══════════════════════════════════════════════════
function AdminPayrollView() {
  const [payroll,     setPayroll]     = useState([])
  const [employees,   setEmployees]   = useState([])
  const [loading,     setLoading]     = useState(true)
  const [submitting,  setSubmitting]  = useState(false)
  const [markingId,   setMarkingId]   = useState(null)
  const [monthFilter, setMonthFilter] = useState('')
  const [statusFilter,setStatusFilter]= useState('')
  const [page,        setPage]        = useState(1)
  const [totalPages,  setTotalPages]  = useState(1)
  const [showAdd,     setShowAdd]     = useState(false)
  const [showDetail,  setShowDetail]  = useState(null)
  const [form,        setForm]        = useState(EMPTY_FORM)
  const [empSearch,   setEmpSearch]   = useState('')
  const [empResults,  setEmpResults]  = useState([])
  const setF = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  // stats derived from current page data
  const totalGross  = payroll.reduce((s, p) => s + (p.basicSalary + (p.allowances || 0)), 0)
  const totalNet    = payroll.reduce((s, p) => s + (p.netSalary ?? (p.basicSalary + (p.allowances||0) - (p.deductions||0))), 0)
  const pendingCount = payroll.filter(p => p.status === 'pending').length
  const paidCount    = payroll.filter(p => p.status === 'paid').length

  const load = async (p = 1) => {
    setLoading(true)
    try {
      const params = { page: p, limit: 15 }
      if (monthFilter)  params.month  = monthFilter
      if (statusFilter) params.status = statusFilter
      const r = await payrollAPI.getAll(params)
      setPayroll(r.data.payroll || [])
      setTotalPages(r.data.pagination?.pages || 1)
    } catch { toast.error('Failed to load payroll') }
    finally { setLoading(false) }
  }

  useEffect(() => { load(1) }, [monthFilter, statusFilter])

  // employee search for add form
  const searchEmp = async (q) => {
    setEmpSearch(q)
    if (q.length < 2) { setEmpResults([]); return }
    try {
      const r = await employeeAPI.getAll({ search: q, limit: 5 })
      setEmpResults(r.data.employees || [])
    } catch {}
  }

  const pickEmp = (emp) => {
    setForm(f => ({
      ...f,
      employeeId:  emp._id,
      basicSalary: emp.jobInfo?.salary || '',
    }))
    setEmpSearch(`${emp.personalInfo?.firstName} ${emp.personalInfo?.lastName}`)
    setEmpResults([])
  }

  const handleAdd = async () => {
    if (!form.employeeId || !form.month || !form.basicSalary)
      return toast.error('Employee, month and basic salary are required')
    setSubmitting(true)
    try {
      await payrollAPI.create({
        employee:    form.employeeId,
        month:       form.month,
        basicSalary: Number(form.basicSalary),
        allowances:  Number(form.allowances) || 0,
        deductions:  Number(form.deductions) || 0,
      })
      toast.success('Payslip created!')
      setShowAdd(false); setForm(EMPTY_FORM); setEmpSearch(''); load(1)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSubmitting(false) }
  }

  const handleMarkPaid = async (id) => {
    setMarkingId(id)
    try {
      await payrollAPI.markAsPaid(id)
      toast.success('Marked as paid!')
      load(page)
    } catch { toast.error('Failed to mark as paid') }
    finally { setMarkingId(null) }
  }

  const net = (p) => p.netSalary ?? (p.basicSalary + (p.allowances || 0) - (p.deductions || 0))

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

        .pay-row:hover td { background: rgba(255,255,255,0.02) !important; }
        .stat-card-hover:hover { border-color: #334155 !important; transform: translateY(-2px); }

        .pay-input { color: #e2e8f0 !important; }
        .pay-input::placeholder { color: #475569 !important; }
        .pay-input:focus { border-color: #7c3aed !important; outline: none !important; box-shadow: 0 0 0 3px rgba(124,58,237,0.12) !important; }

        .pay-select { color: #e2e8f0 !important; }
        .pay-select:focus { border-color: #7c3aed !important; outline: none !important; }
        .pay-select option { background: #1e293b !important; color: #e2e8f0 !important; }

        .pay-form-input {
          color: #e2e8f0 !important;
          background: #1e293b !important;
          border: 1px solid #334155 !important;
          caret-color: #a78bfa;
        }
        .pay-form-input::placeholder { color: #475569 !important; }
        .pay-form-input:focus { border-color: #7c3aed !important; box-shadow: 0 0 0 3px rgba(124,58,237,0.12) !important; outline: none !important; }
        .pay-form-input:-webkit-autofill,
        .pay-form-input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px #1e293b inset !important;
          -webkit-text-fill-color: #e2e8f0 !important;
        }
        .pay-form-input[type="month"]::-webkit-calendar-picker-indicator { filter: invert(0.7); cursor: pointer; }

        .pay-form-select {
          color: #e2e8f0 !important;
          background: #1e293b !important;
          border: 1px solid #334155 !important;
        }
        .pay-form-select:focus { border-color: #7c3aed !important; box-shadow: 0 0 0 3px rgba(124,58,237,0.12) !important; outline: none !important; }
        .pay-form-select option { background: #1e293b !important; color: #e2e8f0 !important; }

        .emp-drop-item:hover { background: rgba(124,58,237,0.1) !important; }

        .pay-modal::-webkit-scrollbar { width: 6px; }
        .pay-modal::-webkit-scrollbar-track { background: #0f172a; }
        .pay-modal::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 3px; }

        .page-btn { transition: border-color 0.15s, color 0.15s; }
        .page-btn:hover { border-color: #7c3aed !important; color: #a78bfa !important; }

        .pay-ghost:hover { border-color: #334155 !important; color: #e2e8f0 !important; }
        .pay-green:hover { background: rgba(16,185,129,0.18) !important; }

        .slip-card:hover { border-color: #334155 !important; }
      `}</style>

      <div style={S.page}>
        {/* ── Header ── */}
        <div style={S.header}>
          <div>
            <h4 style={S.title}>Payroll Management</h4>
            <p style={S.sub}>Manage payslips, salaries and disbursements</p>
          </div>
          <button style={S.primaryBtn} onClick={() => { setForm(EMPTY_FORM); setEmpSearch(''); setShowAdd(true) }}>
            <span style={{ fontSize: '1rem', lineHeight: 1 }}>＋</span> Create Payslip
          </button>
        </div>

        {/* ── Stats ── */}
        <div style={S.grid4}>
          {[
            { label: 'Total Payslips',  value: payroll.length,  accent: '#7c3aed', bg: 'rgba(124,58,237,0.12)', icon: '🧾', sub: 'this view' },
            { label: 'Pending',         value: pendingCount,    accent: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  icon: '⏳', sub: 'awaiting payment' },
            { label: 'Paid',            value: paidCount,       accent: '#10b981', bg: 'rgba(16,185,129,0.12)',  icon: '✅', sub: 'disbursed' },
            { label: 'Total Net Payout',value: currency(totalNet), accent: '#a855f7', bg: 'rgba(168,85,247,0.12)', icon: '💰', sub: currency(totalGross) + ' gross' },
          ].map(c => (
            <div key={c.label} className="stat-card-hover" style={S.statCard(c.accent)}>
              <div style={S.statIcon(c.accent, c.bg)}>{c.icon}</div>
              <div style={S.statValue}>{loading ? '…' : c.value}</div>
              <div style={S.statLabel}>{c.label}</div>
              <div style={S.statSub}>{c.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Filters ── */}
        <div style={S.toolbar}>
          <input
            className="pay-input"
            style={{ ...S.input, minWidth: 160 }}
            type="month"
            value={monthFilter}
            onChange={e => { setMonthFilter(e.target.value); setPage(1) }}
            placeholder="Filter by month"
          />
          <select className="pay-select" style={S.select} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
          </select>
          {(monthFilter || statusFilter) && (
            <button style={{ ...S.ghostBtn, fontSize: '0.78rem', padding: '0.4rem 0.8rem' }}
              onClick={() => { setMonthFilter(''); setStatusFilter(''); setPage(1) }}>
              ✕ Clear
            </button>
          )}
        </div>

        {/* ── Table ── */}
        <div style={S.card}>
          <div style={S.cardHeader}>
            <p style={S.cardTitle}>All Payslips</p>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '4px 10px', borderRadius: 100, background: 'rgba(100,116,139,0.12)', color: '#94a3b8', border: '1px solid rgba(100,116,139,0.2)' }}>
              {payroll.length} shown
            </span>
          </div>

          {loading ? (
            <div style={S.emptyWrap}><div style={S.spinner} /></div>
          ) : payroll.length === 0 ? (
            <div style={S.emptyWrap}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>🧾</div>
              No payslips found.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
                <thead>
                  <tr>
                    {['Employee', 'Month', 'Basic', 'Allowances', 'Deductions', 'Net Pay', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '0.7rem 1rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', borderBottom: '1px solid #1e293b', whiteSpace: 'nowrap', background: '#0f172a' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payroll.map((p, i) => (
                    <tr key={p._id} className="pay-row">
                      <td style={{ padding: '0.7rem 1rem', borderBottom: '1px solid #1e293b' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={S.avatar(i)}>
                            {initials(p.employee?.personalInfo?.firstName, p.employee?.personalInfo?.lastName)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#f1f5f9' }}>
                              {p.employee?.personalInfo?.firstName} {p.employee?.personalInfo?.lastName}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#475569' }}>
                              {p.employee?.employeeCode || '—'} · {p.employee?.jobInfo?.title || '—'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.7rem 1rem', color: '#a78bfa', borderBottom: '1px solid #1e293b', whiteSpace: 'nowrap' }}>
                        {fmtMonth(p.month)}
                      </td>
                      <td style={{ padding: '0.7rem 1rem', color: '#94a3b8', borderBottom: '1px solid #1e293b', whiteSpace: 'nowrap' }}>
                        {currency(p.basicSalary)}
                      </td>
                      <td style={{ padding: '0.7rem 1rem', color: '#34d399', borderBottom: '1px solid #1e293b', whiteSpace: 'nowrap' }}>
                        +{currency(p.allowances || 0)}
                      </td>
                      <td style={{ padding: '0.7rem 1rem', color: '#f87171', borderBottom: '1px solid #1e293b', whiteSpace: 'nowrap' }}>
                        -{currency(p.deductions || 0)}
                      </td>
                      <td style={{ padding: '0.7rem 1rem', borderBottom: '1px solid #1e293b', whiteSpace: 'nowrap' }}>
                        <span style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.88rem' }}>{currency(net(p))}</span>
                      </td>
                      <td style={{ padding: '0.7rem 1rem', borderBottom: '1px solid #1e293b' }}>
                        <StatusBadge s={p.status} />
                      </td>
                      <td style={{ padding: '0.7rem 1rem', borderBottom: '1px solid #1e293b' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="pay-ghost" style={{ ...S.ghostBtn, padding: '0.28rem 0.65rem', fontSize: '0.74rem' }}
                            onClick={() => setShowDetail(p)}>
                            View
                          </button>
                          {p.status === 'pending' && (
                            <button className="pay-green" style={{ ...S.greenBtn, opacity: markingId === p._id ? 0.6 : 1 }}
                              onClick={() => handleMarkPaid(p._id)}
                              disabled={markingId === p._id}>
                              {markingId === p._id ? '…' : '✓ Pay'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: '1rem' }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} className="page-btn" onClick={() => { setPage(p); load(p) }}
                  style={{ width: 32, height: 32, borderRadius: 7, border: '1px solid #1e293b', background: page === p ? 'rgba(124,58,237,0.2)' : 'transparent', color: page === p ? '#a78bfa' : '#475569', cursor: 'pointer', fontSize: '0.82rem', fontFamily: "'DM Sans',sans-serif" }}>{p}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Create Payslip Modal ── */}
      {showAdd && (
        <div style={S.overlay} onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="pay-modal" style={S.modal}>
            <div style={S.modalHead}>
              <p style={S.modalTitle}>Create Payslip</p>
              <button style={S.closeBtn} onClick={() => setShowAdd(false)}>✕</button>
            </div>
            <div style={S.modalBody}>
              {/* Employee search */}
              <label style={S.formLabel}>Employee *</label>
              <div style={{ position: 'relative', marginBottom: '0.85rem' }}>
                <input
                  className="pay-form-input"
                  style={{ ...S.formInput, marginBottom: 0 }}
                  placeholder="Search employee by name…"
                  value={empSearch}
                  onChange={e => searchEmp(e.target.value)}
                />
                {empResults.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#1e293b', border: '1px solid #334155', borderRadius: 10, zIndex: 20, overflow: 'hidden', marginTop: 4, boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
                    {empResults.map(emp => (
                      <div key={emp._id} className="emp-drop-item"
                        style={{ padding: '0.6rem 1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}
                        onClick={() => pickEmp(emp)}>
                        <div style={{ ...S.avatar(0), width: 28, height: 28, fontSize: '0.65rem' }}>
                          {initials(emp.personalInfo?.firstName, emp.personalInfo?.lastName)}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.83rem', color: '#f1f5f9', fontWeight: 600 }}>
                            {emp.personalInfo?.firstName} {emp.personalInfo?.lastName}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#475569' }}>{emp.employeeCode} · {emp.jobInfo?.title}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Month */}
              <label style={S.formLabel}>Month *</label>
              <input className="pay-form-input" style={S.formInput} type="month" value={form.month} onChange={setF('month')} />

              {/* Salary fields */}
              <div style={S.formGrid2}>
                <div>
                  <label style={S.formLabel}>Basic Salary (₹) *</label>
                  <input className="pay-form-input" style={S.formInput} type="number" value={form.basicSalary} onChange={setF('basicSalary')} placeholder="0" />
                </div>
                <div>
                  <label style={S.formLabel}>Allowances (₹)</label>
                  <input className="pay-form-input" style={S.formInput} type="number" value={form.allowances} onChange={setF('allowances')} placeholder="0" />
                </div>
              </div>
              <label style={S.formLabel}>Deductions (₹)</label>
              <input className="pay-form-input" style={S.formInput} type="number" value={form.deductions} onChange={setF('deductions')} placeholder="0" />

              {/* Net preview */}
              {form.basicSalary && (
                <div style={{ background: 'rgba(124,58,237,0.07)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: '#a78bfa', fontWeight: 600 }}>Net Pay Preview</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9', fontFamily: "'Syne', sans-serif" }}>
                    {currency((Number(form.basicSalary) || 0) + (Number(form.allowances) || 0) - (Number(form.deductions) || 0))}
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button style={S.ghostBtn} onClick={() => setShowAdd(false)}>Cancel</button>
                <button style={S.primaryBtn} onClick={handleAdd} disabled={submitting}>
                  {submitting ? 'Creating…' : 'Create Payslip'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Detail Modal ── */}
      {showDetail && (
        <div style={S.overlay} onClick={e => e.target === e.currentTarget && setShowDetail(null)}>
          <div className="pay-modal" style={S.modal}>
            <div style={S.modalHead}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ ...S.avatar(0), width: 40, height: 40 }}>
                  {initials(showDetail.employee?.personalInfo?.firstName, showDetail.employee?.personalInfo?.lastName)}
                </div>
                <div>
                  <p style={S.modalTitle}>{showDetail.employee?.personalInfo?.firstName} {showDetail.employee?.personalInfo?.lastName}</p>
                  <div style={{ fontSize: '0.72rem', color: '#475569' }}>{fmtMonth(showDetail.month)} Payslip</div>
                </div>
              </div>
              <button style={S.closeBtn} onClick={() => setShowDetail(null)}>✕</button>
            </div>
            <div style={S.modalBody}>
              {/* Salary breakdown */}
              <div style={{ background: '#1e293b', borderRadius: 12, overflow: 'hidden', marginBottom: '1rem' }}>
                {[
                  { label: 'Employee Code',   value: showDetail.employee?.employeeCode || '—' },
                  { label: 'Job Title',        value: showDetail.employee?.jobInfo?.title || '—' },
                  { label: 'Department',       value: showDetail.employee?.jobInfo?.department?.name || '—' },
                  { label: 'Pay Month',        value: fmtMonth(showDetail.month) },
                  { label: 'Status',           value: <StatusBadge s={showDetail.status} /> },
                ].map(({ label, value }) => (
                  <div key={label} style={{ ...S.slipRow, padding: '0.6rem 1rem' }}>
                    <span style={S.slipLabel}>{label}</span>
                    <span style={S.slipValue}>{value}</span>
                  </div>
                ))}
              </div>

              {/* Earnings / Deductions */}
              <div style={{ background: '#1e293b', borderRadius: 12, overflow: 'hidden', marginBottom: '1rem' }}>
                <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid #1e293b', fontSize: '0.7rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', background: '#0f172a' }}>Earnings</div>
                {[
                  { label: 'Basic Salary',  value: currency(showDetail.basicSalary), color: '#e2e8f0' },
                  { label: 'Allowances',    value: `+${currency(showDetail.allowances || 0)}`, color: '#34d399' },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ ...S.slipRow, padding: '0.6rem 1rem' }}>
                    <span style={S.slipLabel}>{label}</span>
                    <span style={{ ...S.slipValue, color }}>{value}</span>
                  </div>
                ))}
                <div style={{ padding: '0.5rem 1rem', borderTop: '1px solid #334155', borderBottom: '1px solid #1e293b', fontSize: '0.7rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', background: '#0f172a' }}>Deductions</div>
                <div style={{ ...S.slipRow, padding: '0.6rem 1rem' }}>
                  <span style={S.slipLabel}>Total Deductions</span>
                  <span style={{ ...S.slipValue, color: '#f87171' }}>-{currency(showDetail.deductions || 0)}</span>
                </div>
              </div>

              {/* Net */}
              <div style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 12, padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#a78bfa' }}>Net Pay</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f1f5f9', fontFamily: "'Syne', sans-serif" }}>
                  {currency(showDetail.netSalary ?? (showDetail.basicSalary + (showDetail.allowances||0) - (showDetail.deductions||0)))}
                </span>
              </div>

              {showDetail.paidAt && (
                <div style={{ fontSize: '0.75rem', color: '#475569', textAlign: 'center', marginBottom: '1rem' }}>
                  Paid on {fmt(showDetail.paidAt)}
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button className="pay-ghost" style={S.ghostBtn} onClick={() => setShowDetail(null)}>Close</button>
                {showDetail.status === 'pending' && (
                  <button style={S.primaryBtn} onClick={() => { handleMarkPaid(showDetail._id); setShowDetail(null) }}>
                    ✓ Mark as Paid
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ═══════════════════════════════════════════════════
// EMPLOYEE SELF VIEW  — My Payslips
// ═══════════════════════════════════════════════════
function EmployeePayrollView() {
  const [payslips, setPayslips] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const r = await payrollAPI.getMine()
        setPayslips(r.data.payslips || [])
      } catch { toast.error('Failed to load payslips') }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const net = (p) => p.netSalary ?? (p.basicSalary + (p.allowances || 0) - (p.deductions || 0))

  const totalPaid   = payslips.filter(p => p.status === 'paid').reduce((s, p) => s + net(p), 0)
  const lastPayslip = payslips[0]

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

        .slip-card:hover { border-color: #334155 !important; }
        .pay-ghost:hover { border-color: #334155 !important; color: #e2e8f0 !important; }
        .pay-modal::-webkit-scrollbar { width: 6px; }
        .pay-modal::-webkit-scrollbar-track { background: #0f172a; }
        .pay-modal::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 3px; }
      `}</style>

      <div style={S.page}>
        <div style={S.header}>
          <div>
            <h4 style={S.title}>My Payslips</h4>
            <p style={S.sub}>Your salary history and disbursements</p>
          </div>
        </div>

        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Total Payslips',     value: payslips.length,        accent: '#7c3aed', bg: 'rgba(124,58,237,0.12)', icon: '🧾' },
            { label: 'Total Earned (paid)', value: currency(totalPaid),   accent: '#10b981', bg: 'rgba(16,185,129,0.12)',  icon: '💰' },
            { label: 'Last Pay Month',     value: lastPayslip ? fmtMonth(lastPayslip.month) : '—', accent: '#a855f7', bg: 'rgba(168,85,247,0.12)', icon: '📅' },
            { label: 'Last Net Pay',       value: lastPayslip ? currency(net(lastPayslip)) : '—', accent: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: '💳' },
          ].map(c => (
            <div key={c.label} style={S.statCard(c.accent)}>
              <div style={S.statIcon(c.accent, c.bg)}>{c.icon}</div>
              <div style={S.statValue}>{loading ? '…' : c.value}</div>
              <div style={S.statLabel}>{c.label}</div>
            </div>
          ))}
        </div>

        {/* Payslips list */}
        {loading ? (
          <div style={S.emptyWrap}><div style={S.spinner} /></div>
        ) : payslips.length === 0 ? (
          <div style={{ ...S.emptyWrap, ...S.card, padding: '3rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🧾</div>
            <div style={{ color: '#64748b', fontWeight: 600 }}>No payslips yet</div>
            <div style={{ color: '#475569', fontSize: '0.78rem', marginTop: 4 }}>Your payslips will appear here once HR generates them</div>
          </div>
        ) : (
          <div>
            {payslips.map((p, i) => (
              <div key={p._id} className="slip-card" style={{ ...S.slipCard, cursor: 'pointer' }} onClick={() => setSelected(p)}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🧾</div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.92rem', fontFamily: "'Syne', sans-serif" }}>{fmtMonth(p.month)}</div>
                      <div style={{ fontSize: '0.73rem', color: '#475569', marginTop: 2 }}>
                        Basic {currency(p.basicSalary)} · Allowances +{currency(p.allowances||0)} · Deductions -{currency(p.deductions||0)}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <StatusBadge s={p.status} />
                    <span style={{ fontWeight: 800, color: '#f1f5f9', fontSize: '1.1rem', fontFamily: "'Syne', sans-serif" }}>{currency(net(p))}</span>
                    <span style={{ color: '#475569', fontSize: '0.8rem' }}>›</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <div style={S.overlay} onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="pay-modal" style={S.modal}>
            <div style={S.modalHead}>
              <div>
                <p style={S.modalTitle}>{fmtMonth(selected.month)} Payslip</p>
                <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: 2 }}>Salary breakdown</div>
              </div>
              <button style={S.closeBtn} onClick={() => setSelected(null)}>✕</button>
            </div>
            <div style={S.modalBody}>
              <div style={{ background: '#1e293b', borderRadius: 12, overflow: 'hidden', marginBottom: '1rem' }}>
                {[
                  { label: 'Pay Month',       value: fmtMonth(selected.month) },
                  { label: 'Status',          value: <StatusBadge s={selected.status} /> },
                  { label: 'Basic Salary',    value: currency(selected.basicSalary), color: '#e2e8f0' },
                  { label: 'Allowances',      value: `+${currency(selected.allowances||0)}`, color: '#34d399' },
                  { label: 'Deductions',      value: `-${currency(selected.deductions||0)}`, color: '#f87171' },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ ...S.slipRow, padding: '0.65rem 1rem' }}>
                    <span style={S.slipLabel}>{label}</span>
                    <span style={{ ...S.slipValue, ...(color ? { color } : {}) }}>{value}</span>
                  </div>
                ))}
              </div>

              <div style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 12, padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#a78bfa' }}>Net Pay</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f1f5f9', fontFamily: "'Syne', sans-serif" }}>
                  {currency(net(selected))}
                </span>
              </div>

              {selected.paidAt && (
                <div style={{ fontSize: '0.75rem', color: '#475569', textAlign: 'center', marginBottom: '1rem' }}>
                  Paid on {fmt(selected.paidAt)}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="pay-ghost" style={S.ghostBtn} onClick={() => setSelected(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ═══════════════════════════════════════════════════
// MAIN EXPORT — role gate
// ═══════════════════════════════════════════════════
export default function PayrollPage() {
  const user = useSelector(s => s.auth.user)
  const isAdminOrHR = user?.role === 'admin' || user?.role === 'hr'
  return isAdminOrHR ? <AdminPayrollView /> : <EmployeePayrollView />
}
