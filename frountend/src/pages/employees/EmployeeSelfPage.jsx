import React, { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
// ✅ ALL imports fixed — was only importing employeeAPI before
import { employeeAPI, leaveAPI, attendanceAPI, payrollAPI } from '../../services/api.js'
import { toast } from 'react-toastify'

// ─── helpers ─────────────────────────────────────────────────────────────────
const initials  = name => (name || '').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
const greet     = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening' }
const fmtDate   = d => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
const fmtTime   = d => d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'

const LEAVE_QUOTA = { annual: 18, sick: 12, casual: 6, maternity: 90, paternity: 15 }

const STATUS_COLOR = {
  pending:  { bg: 'rgba(245,158,11,0.12)',  color: '#fbbf24' },
  approved: { bg: 'rgba(16,185,129,0.12)',  color: '#34d399' },
  rejected: { bg: 'rgba(239,68,68,0.12)',   color: '#f87171' },
}
const ATT_COLOR = {
  present: { bg: 'rgba(16,185,129,0.12)',  color: '#34d399' },
  late:    { bg: 'rgba(245,158,11,0.12)',  color: '#fbbf24' },
  absent:  { bg: 'rgba(239,68,68,0.12)',   color: '#f87171' },
  holiday: { bg: 'rgba(124,58,237,0.12)',  color: '#a78bfa' },
}

// ─── Live clock ───────────────────────────────────────────────────────────────
function LiveClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return (
    <div style={{ fontFamily: 'monospace', fontSize: '2.2rem', fontWeight: 700, color: '#f0f6fc', letterSpacing: '0.06em', lineHeight: 1 }}>
      {now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </div>
  )
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
function ProgressBar({ pct, color }) {
  return (
    <div style={{ height: 5, background: '#21262d', borderRadius: 99, overflow: 'hidden', marginTop: 4 }}>
      <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: color, borderRadius: 99, transition: 'width 0.4s ease' }} />
    </div>
  )
}

export default function EmployeeSelfPage() {
  const user = useSelector(s => s.auth.user)

  const [tab,        setTab]        = useState('overview')
  const [profile,    setProfile]    = useState(null)
  const [leaves,     setLeaves]     = useState([])
  const [attendance, setAttendance] = useState([])
  const [payslips,   setPayslips]   = useState([])
  const [todayAtt,   setTodayAtt]   = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [clocking,   setClocking]   = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [leaveForm,  setLeaveForm]  = useState({ leaveType: 'annual', startDate: '', endDate: '', reason: '' })

  // ── initial load ─────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [pr, lr, ar, pay] = await Promise.allSettled([
          employeeAPI.getMe(),
          leaveAPI.getMyLeaves(),
          attendanceAPI.getMy(),
          payrollAPI.getMyPayslips(),
        ])
        if (pr.status  === 'fulfilled') setProfile(pr.value.data.employee || pr.value.data)
        if (lr.status  === 'fulfilled') setLeaves(lr.value.data.leaves || [])
        if (ar.status  === 'fulfilled') {
          const list = ar.value.data.attendance || []
          setAttendance(list)
          const today = new Date().toDateString()
          setTodayAtt(list.find(a => new Date(a.date).toDateString() === today) || null)
        }
        if (pay.status === 'fulfilled') setPayslips(pay.value.data.payslips || [])
      } catch { toast.error('Failed to load your data') }
      finally { setLoading(false) }
    }
    load()
  }, [])

  // ── clock in / out ────────────────────────────────────────────────────────
  const handleClock = async () => {
    setClocking(true)
    try {
      if (!todayAtt?.clockIn) {
        const r = await attendanceAPI.clockIn()
         
        
        setTodayAtt(r.data.attendance)
        toast.success('Clocked in! Have a productive day 🚀')
      } else if (!todayAtt?.clockOut) {
        const r = await attendanceAPI.clockOut()
        setTodayAtt(r.data.attendance)
        toast.success('Clocked out! See you tomorrow 👋')
      }
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to record attendance') }
    finally { setClocking(false) }
  }

  // ── apply leave ───────────────────────────────────────────────────────────
  const handleLeaveSubmit = async () => {
    if (!leaveForm.startDate || !leaveForm.endDate || !leaveForm.reason) {
      return toast.error('Please fill all fields')
    }
    setSubmitting(true)
    try {
      await leaveAPI.apply(leaveForm)
      toast.success('Leave request submitted!')
      setLeaveForm({ leaveType: 'annual', startDate: '', endDate: '', reason: '' })
      const r = await leaveAPI.getMyLeaves()
      setLeaves(r.data.leaves || [])
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to submit') }
    finally { setSubmitting(false) }
  }

  // ── derived stats ─────────────────────────────────────────────────────────
  const p            = profile
  const thisMonth    = attendance.filter(a => new Date(a.date).getMonth() === new Date().getMonth())
  const presentDays  = thisMonth.filter(a => a.status === 'present').length
  const lateDays     = thisMonth.filter(a => a.status === 'late').length
  const usedLeave    = type => leaves.filter(l => l.leaveType === type && l.status === 'approved').reduce((s, l) => s + (l.totalDays || 0), 0)
  const clockedIn    = todayAtt?.clockIn  && !todayAtt?.clockOut
  const clockedOut   = todayAtt?.clockIn  &&  todayAtt?.clockOut
  const pendingLeaves = leaves.filter(l => l.status === 'pending').length

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 36, height: 36, border: '3px solid #21262d', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'selfSpin 0.7s linear infinite', margin: '0 auto' }} />
        <p style={{ marginTop: '0.75rem', fontSize: '0.82rem', color: '#6e7681' }}>Loading your dashboard…</p>
      </div>
    </div>
  )

  // ─── Tab definitions ───────────────────────────────────────────────────────
  const TABS = [
    { key: 'overview',   icon: '🏠', label: 'Overview'   },
    { key: 'attendance', icon: '🕐', label: 'Attendance' },
    { key: 'leaves',     icon: '📋', label: 'Leaves'     },
    { key: 'payslips',   icon: '💰', label: 'Payslips'   },
  ]

  return (
    <>
      {/* ── Google Fonts ── */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap" rel="stylesheet" />

      <style>{`
        @keyframes selfSpin   { to { transform: rotate(360deg); } }
        @keyframes selfPulse  { 0%,100%{opacity:1} 50%{opacity:0.45} }
        @keyframes selfFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

        /* force dark bg on any layout wrapper */
        body,#root,.main-content,.page-content,.content-area,
        .layout-content,.content-wrapper,.main-wrapper,.app-content,
        .page-wrapper,[class*="content"],[class*="main"] {
          background: #0d1117 !important;
        }

        .self-page      { font-family: 'DM Sans',sans-serif; color: #e6edf3; padding: 0; animation: selfFadeIn 0.3s ease; }
        .self-page *    { box-sizing: border-box; }

        /* header */
        .self-header    { display:flex; align-items:center; justify-content:space-between; margin-bottom:1.75rem; flex-wrap:wrap; gap:1rem; }
        .self-title     { margin:0; font-size:1.55rem; font-weight:700; color:#f0f6fc; }
        .self-sub       { margin:0.2rem 0 0; font-size:0.82rem; color:#6e7681; }
        .self-chip      { display:flex; align-items:center; gap:8px; padding:7px 15px; background:#161b22; border:1px solid #21262d; border-radius:100px; font-size:0.78rem; color:#6e7681; white-space:nowrap; }

        /* stat grid */
        .self-grid4     { display:grid; grid-template-columns:repeat(auto-fit,minmax(165px,1fr)); gap:1rem; margin-bottom:1.5rem; }
        .self-stat      { background:#161b22; border:1px solid #21262d; border-radius:14px; padding:1.1rem 1.25rem; position:relative; overflow:hidden; transition:transform 0.15s,box-shadow 0.15s; }
        .self-stat:hover{ transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,0.3); }
        .self-stat-top  { width:2px; position:absolute; top:0; left:0; right:0; height:2px; }
        .self-stat-icon { width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center; font-size:1rem; margin-bottom:0.75rem; }
        .self-stat-val  { font-size:1.7rem; font-weight:700; color:#f0f6fc; line-height:1; margin-bottom:3px; }
        .self-stat-lbl  { font-size:0.7rem; color:#6e7681; text-transform:uppercase; letter-spacing:0.05em; font-weight:600; }
        .self-stat-sub  { font-size:0.71rem; color:#475569; margin-top:3px; }

        /* tabs */
        .self-tabs      { display:flex; gap:4px; margin-bottom:1.5rem; background:#161b22; border:1px solid #21262d; border-radius:11px; padding:4px; width:fit-content; flex-wrap:wrap; }
        .self-tab       { padding:0.42rem 1rem; border-radius:8px; font-size:0.82rem; font-weight:500; border:none; background:transparent; color:#6e7681; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.15s; white-space:nowrap; }
        .self-tab:hover { background:rgba(255,255,255,0.04); color:#c9d1d9; }
        .self-tab.active{ background:rgba(124,58,237,0.18); color:#a78bfa; font-weight:600; }

        /* cards */
        .self-card      { background:#161b22; border:1px solid #21262d; border-radius:14px; overflow:hidden; }
        .self-card-head { padding:0.9rem 1.25rem; border-bottom:1px solid #21262d; display:flex; align-items:center; justify-content:space-between; }
        .self-card-title{ margin:0; font-size:0.88rem; font-weight:600; color:#f0f6fc; }
        .self-card-body { padding:1.25rem; }

        /* two-col grid */
        .self-grid2     { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
        @media(max-width:768px){ .self-grid2 { grid-template-columns:1fr; } }

        /* info rows */
        .self-info-row  { display:flex; justify-content:space-between; align-items:center; padding:0.55rem 0; border-bottom:1px solid #21262d; }
        .self-info-row:last-child{ border-bottom:none; }
        .self-info-lbl  { font-size:0.78rem; color:#6e7681; }
        .self-info-val  { font-size:0.81rem; color:#e6edf3; font-weight:500; text-align:right; }

        /* badge */
        .self-badge     { display:inline-block; padding:0.2em 0.65em; border-radius:20px; font-size:0.7rem; font-weight:600; }

        /* avatar */
        .self-avatar    { width:52px; height:52px; border-radius:50%; background:linear-gradient(135deg,#7c3aed,#5b21b6); display:flex; align-items:center; justify-content:center; font-size:1.15rem; font-weight:700; color:#fff; flex-shrink:0; box-shadow:0 0 0 3px rgba(124,58,237,0.2); }

        /* buttons */
        .self-btn-primary{ padding:0.55rem 1.3rem; background:linear-gradient(135deg,#7c3aed,#5b21b6); color:#fff; border:none; border-radius:9px; font-size:0.85rem; font-weight:600; cursor:pointer; font-family:'DM Sans',sans-serif; transition:opacity 0.15s; width:100%; }
        .self-btn-primary:hover{ opacity:0.88; }
        .self-btn-primary:disabled{ opacity:0.5; cursor:not-allowed; }

        /* clock card special states */
        .clock-idle     { background:#161b22; border:1px solid #21262d; }
        .clock-in       { background:rgba(16,185,129,0.05); border:1px solid rgba(16,185,129,0.2); }
        .clock-out      { background:rgba(59,130,246,0.05); border:1px solid rgba(59,130,246,0.2); }

        /* form elements */
        .self-label     { display:block; font-size:0.75rem; color:#6e7681; margin-bottom:4px; font-weight:500; }
        .self-input     { width:100%; background:#0d1117; border:1px solid #30363d; border-radius:8px; color:#e6edf3; padding:0.5rem 0.75rem; font-size:0.84rem; font-family:'DM Sans',sans-serif; outline:none; margin-bottom:0.85rem; transition:border-color 0.15s; }
        .self-input:focus{ border-color:#7c3aed; }
        .self-select    { width:100%; background:#0d1117; border:1px solid #30363d; border-radius:8px; color:#e6edf3; padding:0.5rem 0.75rem; font-size:0.84rem; font-family:'DM Sans',sans-serif; outline:none; margin-bottom:0.85rem; cursor:pointer; }
        .self-textarea  { width:100%; background:#0d1117; border:1px solid #30363d; border-radius:8px; color:#e6edf3; padding:0.5rem 0.75rem; font-size:0.84rem; font-family:'DM Sans',sans-serif; outline:none; margin-bottom:0.85rem; resize:vertical; min-height:80px; transition:border-color 0.15s; }
        .self-textarea:focus{ border-color:#7c3aed; }

        /* table */
        .self-table     { width:100%; border-collapse:collapse; font-size:0.83rem; }
        .self-table th  { padding:0.65rem 1.1rem; text-align:left; font-size:0.7rem; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; color:#6e7681; border-bottom:1px solid #21262d; white-space:nowrap; }
        .self-table td  { padding:0.65rem 1.1rem; border-bottom:1px solid #21262d; }
        .self-table tr:last-child td { border-bottom:none; }
        .self-table tbody tr:hover td { background:rgba(255,255,255,0.02); }

        /* leave item */
        .leave-item     { display:flex; align-items:center; justify-content:space-between; padding:0.75rem 1.25rem; border-bottom:1px solid #21262d; }
        .leave-item:last-child{ border-bottom:none; }

        /* payslip row */
        .payslip-row    { display:flex; align-items:center; justify-content:space-between; padding:0.9rem 1.25rem; border-bottom:1px solid #21262d; flex-wrap:wrap; gap:0.75rem; transition:background 0.1s; }
        .payslip-row:hover{ background:rgba(255,255,255,0.02); }
        .payslip-row:last-child{ border-bottom:none; }

        /* empty state */
        .self-empty     { text-align:center; padding:2.5rem 1rem; color:#6e7681; font-size:0.82rem; }
        .self-empty-icon{ font-size:2rem; margin-bottom:0.5rem; display:block; opacity:0.5; }
      `}</style>

      <div className="self-page">

        {/* ── Header ── */}
        <div className="self-header">
          <div>
            <h4 className="self-title">{greet()}, {user?.name?.split(' ')[0]} 👋</h4>
            <p className="self-sub">Your personal HR dashboard</p>
          </div>
          <div className="self-chip">
            📅 {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="self-grid4">
          {[
            { icon: '📋', val: leaves.length,  lbl: 'Leaves Applied', sub: `${leaves.filter(l=>l.status==='approved').length} approved · ${pendingLeaves} pending`, accent: '#7c3aed', iconBg: 'rgba(124,58,237,0.12)' },
            { icon: '✅', val: presentDays,     lbl: 'Present This Month', sub: `${lateDays} late arrivals`, accent: '#34d399', iconBg: 'rgba(16,185,129,0.12)' },
            { icon: '💰', val: payslips.length, lbl: 'Payslips', sub: payslips[0] ? `Latest: ${fmtDate(payslips[0].month)}` : 'No payslips yet', accent: '#fbbf24', iconBg: 'rgba(245,158,11,0.12)' },
            { icon: '⭐', val: p?.performanceScore || '—', lbl: 'Performance', sub: p?.performanceScore ? `Score out of 100` : 'Not rated yet', accent: '#60a5fa', iconBg: 'rgba(59,130,246,0.12)' },
          ].map(c => (
            <div key={c.lbl} className="self-stat">
              <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:c.accent }} />
              <div className="self-stat-icon" style={{ background: c.iconBg, color: c.accent }}>{c.icon}</div>
              <div className="self-stat-val">{c.val}</div>
              <div className="self-stat-lbl">{c.lbl}</div>
              <div className="self-stat-sub">{c.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div className="self-tabs">
          {TABS.map(t => (
            <button
              key={t.key}
              className={`self-tab ${tab === t.key ? 'active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ══ OVERVIEW ══════════════════════════════════════════════════════════ */}
        {tab === 'overview' && (
          <div className="self-grid2">

            {/* Profile card */}
            <div className="self-card">
              <div className="self-card-head">
                <p className="self-card-title">My Profile</p>
                <span
                  className="self-badge"
                  style={{ background:'rgba(124,58,237,0.12)', color:'#a78bfa' }}
                >
                  {p?.jobInfo?.title || 'Employee'}
                </span>
              </div>
              <div className="self-card-body">
                <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1.25rem' }}>
                  <div className="self-avatar">{initials(user?.name)}</div>
                  <div>
                    <div style={{ fontWeight:700, color:'#f0f6fc', fontSize:'1rem' }}>
                      {p?.personalInfo?.firstName} {p?.personalInfo?.lastName}
                    </div>
                    <div style={{ fontSize:'0.72rem', color:'#6e7681', marginTop:2 }}>
                      {p?.employeeCode || user?.email}
                    </div>
                  </div>
                </div>
                {[
                  { lbl:'Email',      val: p?.personalInfo?.email || user?.email },
                  { lbl:'Phone',      val: p?.personalInfo?.phone || '—' },
                  { lbl:'Department', val: p?.jobInfo?.department?.name || '—' },
                  { lbl:'Type',       val: p?.jobInfo?.employmentType?.replace('_',' ') || '—' },
                  { lbl:'Status',     val: p?.status || '—' },
                   { lbl:'Salary',     val: (p?.jobInfo?.salary) },
                  { lbl:'Joined',     val: fmtDate(p?.jobInfo?.hireDate) },
                ].map(({ lbl, val }) => (
                  <div key={lbl} className="self-info-row">
                    <span className="self-info-lbl">{lbl}</span>
                    <span className="self-info-val">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right column: clock card + leave balance */}
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>

              {/* Clock card */}
              <div
                className={`self-card ${clockedIn ? 'clock-in' : clockedOut ? 'clock-out' : 'clock-idle'}`}
                style={{ borderRadius:14, overflow:'hidden' }}
              >
                <div className="self-card-head">
                  <p className="self-card-title">Today's Attendance</p>
                  {clockedIn  && <span className="self-badge" style={{ background:'rgba(16,185,129,0.12)', color:'#34d399', animation:'selfPulse 2s infinite' }}>● Live</span>}
                  {clockedOut && <span className="self-badge" style={{ background:'rgba(59,130,246,0.12)', color:'#60a5fa' }}>✓ Done</span>}
                  {!todayAtt  && <span className="self-badge" style={{ background:'rgba(100,116,139,0.12)', color:'#94a3b8' }}>Not started</span>}
                </div>
                <div className="self-card-body" style={{ textAlign:'center' }}>
                  <LiveClock />
                  <div style={{ fontSize:'0.78rem', color:'#6e7681', margin:'4px 0 1.25rem' }}>
                    {new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })}
                  </div>

                  {/* Clock times */}
                  <div style={{ display:'flex', gap:'1rem', justifyContent:'center', marginBottom:'1.25rem' }}>
                    <div style={{ textAlign:'center' }}>
                      <div style={{ fontSize:'0.7rem', color:'#6e7681', marginBottom:4 }}>Clock In</div>
                      <div style={{ fontSize:'1rem', fontWeight:700, color: todayAtt?.clockIn ? '#34d399' : '#3d444d' }}>
                        {todayAtt?.clockIn ? fmtTime(todayAtt.clockIn) : '--:--'}
                      </div>
                    </div>
                    <div style={{ width:1, background:'#21262d' }} />
                    <div style={{ textAlign:'center' }}>
                      <div style={{ fontSize:'0.7rem', color:'#6e7681', marginBottom:4 }}>Clock Out</div>
                      <div style={{ fontSize:'1rem', fontWeight:700, color: todayAtt?.clockOut ? '#60a5fa' : '#3d444d' }}>
                        {todayAtt?.clockOut ? fmtTime(todayAtt.clockOut) : '--:--'}
                      </div>
                    </div>
                    {todayAtt?.hoursWorked > 0 && (
                      <>
                        <div style={{ width:1, background:'#21262d' }} />
                        <div style={{ textAlign:'center' }}>
                          <div style={{ fontSize:'0.7rem', color:'#6e7681', marginBottom:4 }}>Hours</div>
                          <div style={{ fontSize:'1rem', fontWeight:700, color:'#fbbf24' }}>
                            {todayAtt.hoursWorked?.toFixed(1)}h
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {!clockedOut ? (
                    <button
                      className="self-btn-primary"
                      style={{
                        background: clockedIn
                          ? 'linear-gradient(135deg,#ef4444,#b91c1c)'
                          : 'linear-gradient(135deg,#10b981,#059669)',
                        boxShadow: clockedIn
                          ? '0 4px 14px rgba(239,68,68,0.25)'
                          : '0 4px 14px rgba(16,185,129,0.25)',
                      }}
                      onClick={handleClock}
                      disabled={clocking}
                    >
                      {clocking ? 'Recording…' : clockedIn ? '🔴 Clock Out' : '🟢 Clock In'}
                    </button>
                  ) : (
                    <div style={{ fontSize:'0.83rem', color:'#34d399', padding:'0.6rem', background:'rgba(16,185,129,0.08)', borderRadius:9, border:'1px solid rgba(16,185,129,0.15)' }}>
                      ✓ Attendance recorded for today
                    </div>
                  )}
                </div>
              </div>

              {/* Leave balance mini */}
              <div className="self-card">
                <div className="self-card-head">
                  <p className="self-card-title">Leave Balance</p>
                </div>
                <div className="self-card-body">
                  {['annual','sick','casual'].map(type => {
                    const total = LEAVE_QUOTA[type]
                    const used  = usedLeave(type)
                    const left  = Math.max(total - used, 0)
                    const pct   = (used / total) * 100
                    const color = left > total * 0.4 ? '#34d399' : left > total * 0.2 ? '#fbbf24' : '#f87171'
                    return (
                      <div key={type} style={{ marginBottom:'0.9rem' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                          <span style={{ fontSize:'0.78rem', color:'#c9d1d9', textTransform:'capitalize' }}>{type} Leave</span>
                          <span style={{ fontSize:'0.74rem' }}>
                            <span style={{ color, fontWeight:600 }}>{left}</span>
                            <span style={{ color:'#6e7681' }}>/{total} days</span>
                          </span>
                        </div>
                        <ProgressBar pct={pct} color={color} />
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ ATTENDANCE ════════════════════════════════════════════════════════ */}
        {tab === 'attendance' && (
          <div className="self-card">
            <div className="self-card-head">
              <p className="self-card-title">Attendance History</p>
              <span className="self-badge" style={{ background:'rgba(100,116,139,0.12)', color:'#94a3b8' }}>
                {thisMonth.length} days this month
              </span>
            </div>
            {attendance.length === 0 ? (
              <div className="self-empty">
                <span className="self-empty-icon">🕐</span>
                No attendance records yet.
              </div>
            ) : (
              <div style={{ overflowX:'auto' }}>
                <table className="self-table">
                  <thead>
                    <tr>
                      {['Date','Clock In','Clock Out','Hours','Status'].map(h => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.slice(0, 30).map((a, i) => {
                      const sc = ATT_COLOR[a.status] || ATT_COLOR.absent
                      return (
                        <tr key={i}>
                          <td style={{ color:'#c9d1d9' }}>{fmtDate(a.date)}</td>
                          <td style={{ color: a.clockIn ? '#34d399' : '#3d444d', fontFamily:'monospace' }}>{fmtTime(a.clockIn)}</td>
                          <td style={{ color: a.clockOut ? '#60a5fa' : '#3d444d', fontFamily:'monospace' }}>{fmtTime(a.clockOut)}</td>
                          <td style={{ color:'#fbbf24', fontWeight:600 }}>{a.hoursWorked ? `${a.hoursWorked.toFixed(1)}h` : '—'}</td>
                          <td>
                            <span className="self-badge" style={{ background:sc.bg, color:sc.color }}>
                              {a.status}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ══ LEAVES ════════════════════════════════════════════════════════════ */}
        {tab === 'leaves' && (
          <div className="self-grid2">

            {/* Apply form */}
            <div className="self-card">
              <div className="self-card-head">
                <p className="self-card-title">Apply for Leave</p>
              </div>
              <div className="self-card-body">
                <label className="self-label">Leave Type</label>
                <select
                  className="self-select"
                  value={leaveForm.leaveType}
                  onChange={e => setLeaveForm(f => ({ ...f, leaveType: e.target.value }))}
                >
                  {Object.entries(LEAVE_QUOTA).map(([type, total]) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)} ({Math.max(total - usedLeave(type), 0)} days left)
                    </option>
                  ))}
                  <option value="unpaid">Unpaid Leave</option>
                </select>

                <label className="self-label">Start Date</label>
                <input
                  className="self-input"
                  type="date"
                  value={leaveForm.startDate}
                  onChange={e => setLeaveForm(f => ({ ...f, startDate: e.target.value }))}
                />

                <label className="self-label">End Date</label>
                <input
                  className="self-input"
                  type="date"
                  value={leaveForm.endDate}
                  onChange={e => setLeaveForm(f => ({ ...f, endDate: e.target.value }))}
                />

                <label className="self-label">Reason</label>
                <textarea
                  className="self-textarea"
                  placeholder="Briefly describe your reason…"
                  value={leaveForm.reason}
                  onChange={e => setLeaveForm(f => ({ ...f, reason: e.target.value }))}
                />

                <button
                  className="self-btn-primary"
                  onClick={handleLeaveSubmit}
                  disabled={submitting}
                >
                  {submitting ? 'Submitting…' : 'Submit Leave Request'}
                </button>
              </div>
            </div>

            {/* Balance + history */}
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>

              {/* Full balance */}
              <div className="self-card">
                <div className="self-card-head"><p className="self-card-title">Leave Balance</p></div>
                <div className="self-card-body">
                  {Object.entries(LEAVE_QUOTA).map(([type, total]) => {
                    const used  = usedLeave(type)
                    const left  = Math.max(total - used, 0)
                    const pct   = (used / total) * 100
                    const color = left > total * 0.4 ? '#34d399' : left > total * 0.2 ? '#fbbf24' : '#f87171'
                    return (
                      <div key={type} style={{ marginBottom:'0.9rem' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                          <span style={{ fontSize:'0.79rem', color:'#c9d1d9', textTransform:'capitalize' }}>{type} Leave</span>
                          <span style={{ fontSize:'0.75rem' }}>
                            <span style={{ color, fontWeight:600 }}>{left}</span>
                            <span style={{ color:'#6e7681' }}>/{total}</span>
                          </span>
                        </div>
                        <ProgressBar pct={pct} color={color} />
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* History */}
              <div className="self-card">
                <div className="self-card-head">
                  <p className="self-card-title">History</p>
                  <span className="self-badge" style={{ background:'rgba(100,116,139,0.12)', color:'#94a3b8' }}>
                    {leaves.length} total
                  </span>
                </div>
                {leaves.length === 0 ? (
                  <div className="self-empty">
                    <span className="self-empty-icon">📋</span>
                    No leave requests yet.
                  </div>
                ) : leaves.map(l => {
                  const sc = STATUS_COLOR[l.status] || STATUS_COLOR.pending
                  return (
                    <div key={l._id} className="leave-item">
                      <div>
                        <div style={{ fontSize:'0.83rem', fontWeight:600, color:'#e6edf3', textTransform:'capitalize' }}>
                          {l.leaveType} Leave
                        </div>
                        <div style={{ fontSize:'0.74rem', color:'#6e7681', marginTop:2 }}>
                          {fmtDate(l.startDate)} → {fmtDate(l.endDate)} · {l.totalDays} day(s)
                        </div>
                      </div>
                      <span className="self-badge" style={{ background:sc.bg, color:sc.color }}>
                        {l.status}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ══ PAYSLIPS ══════════════════════════════════════════════════════════ */}
        {tab === 'payslips' && (
          <div className="self-card">
            <div className="self-card-head">
              <p className="self-card-title">My Payslips</p>
              <span className="self-badge" style={{ background:'rgba(100,116,139,0.12)', color:'#94a3b8' }}>
                {payslips.length} total
              </span>
            </div>
            {payslips.length === 0 ? (
              <div className="self-empty">
                <span className="self-empty-icon">💰</span>
                No payslips available yet.
              </div>
            ) : payslips.map((ps, i) => (
              <div key={ps._id || i} className="payslip-row">
                {/* Left — month + net */}
                <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                  <div style={{ width:38, height:38, borderRadius:10, background:'rgba(124,58,237,0.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem', color:'#a78bfa', flexShrink:0 }}>💰</div>
                  <div>
                    <div style={{ fontSize:'0.85rem', fontWeight:600, color:'#f0f6fc' }}>
                      {ps.month
                        ? new Date(ps.month).toLocaleDateString('en-US', { month:'long', year:'numeric' })
                        : `Payslip #${i + 1}`
                      }
                    </div>
                    <div style={{ fontSize:'0.74rem', color:'#6e7681', marginTop:2 }}>
                      Net Pay: <span style={{ color:'#34d399', fontWeight:600 }}>₹{ps.netSalary?.toLocaleString('en-IN') || '—'}</span>
                    </div>
                  </div>
                </div>

                {/* Right — breakdown + status */}
                <div style={{ display:'flex', alignItems:'center', gap:'1.25rem', flexWrap:'wrap' }}>
                  {[
                    { lbl:'Basic',       val:`₹${ps.basicSalary?.toLocaleString('en-IN') || '—'}`,  color:'#c9d1d9' },
                    { lbl:'Allowances',  val:`+₹${ps.allowances?.toLocaleString('en-IN') || '0'}`,  color:'#34d399' },
                    { lbl:'Deductions',  val:`-₹${ps.deductions?.toLocaleString('en-IN') || '0'}`,  color:'#f87171' },
                  ].map(({ lbl, val, color }) => (
                    <div key={lbl} style={{ textAlign:'center' }}>
                      <div style={{ fontSize:'0.68rem', color:'#6e7681' }}>{lbl}</div>
                      <div style={{ fontSize:'0.81rem', fontWeight:600, color }}>{val}</div>
                    </div>
                  ))}
                  <span
                    className="self-badge"
                    style={{
                      background: ps.status === 'paid' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
                      color:      ps.status === 'paid' ? '#34d399' : '#fbbf24',
                    }}
                  >
                    {ps.status || 'pending'}
                  </span>
                  {ps.pdfUrl && (
                    <a
                      href={ps.pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ padding:'0.32rem 0.8rem', background:'linear-gradient(135deg,#7c3aed,#5b21b6)', color:'#fff', borderRadius:7, fontSize:'0.77rem', fontWeight:600, textDecoration:'none' }}
                    >
                      ↓ PDF
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </>
  )
}
