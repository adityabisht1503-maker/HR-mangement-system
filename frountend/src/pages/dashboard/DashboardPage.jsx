import React, { useState, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { employeeAPI, leaveAPI, aiAPI, departmentAPI } from '../../services/api.js'
import { useSelector } from 'react-redux'

const COLORS = ['#7c3aed','#a855f7','#06b6d4','#10b981','#f59e0b','#f43f5e','#3b82f6']

const greet = () => {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  body, #root, .main-content, .page-content, .content-area,
  .layout-content, .content-wrapper, .main-wrapper, .app-content,
  .page-wrapper, [class*="content"], [class*="main"] {
    background: #080d14 !important;
  }

  .dash-root {
    font-family: 'DM Sans', sans-serif;
    color: #e2e8f0;
    min-height: 100vh;
    padding: 1.5rem;
    background: #080d14;
  }

  .dash-root * { box-sizing: border-box; }

  .dash-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 2rem;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .dash-greeting {
    font-family: 'Syne', sans-serif;
    font-size: clamp(1.4rem, 3vw, 2rem);
    font-weight: 700;
    color: #f1f5f9;
    margin: 0 0 4px 0;
    line-height: 1.2;
  }

  .dash-sub {
    font-size: 0.85rem;
    color: #64748b;
    margin: 0;
    font-weight: 400;
  }

  .dash-date-chip {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: #0f172a;
    border: 1px solid #1e293b;
    border-radius: 100px;
    font-size: 0.78rem;
    color: #64748b;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .dash-date-chip i { color: #475569; }

  .stat-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  @media (max-width: 1100px) { .stat-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 560px)  { .stat-grid { grid-template-columns: 1fr; } }

  .stat-card-new {
    background: #0f172a;
    border: 1px solid #1e293b;
    border-radius: 16px;
    padding: 1.25rem 1.5rem;
    position: relative;
    overflow: hidden;
    transition: border-color 0.2s, transform 0.2s;
  }

  .stat-card-new:hover {
    border-color: #334155;
    transform: translateY(-2px);
  }

  .stat-card-new::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: var(--accent);
    opacity: 0.7;
  }

  .stat-icon-new {
    width: 40px; height: 40px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1rem;
    margin-bottom: 1rem;
    background: var(--accent-bg);
    color: var(--accent);
    flex-shrink: 0;
  }

  .stat-value {
    font-family: 'Syne', sans-serif;
    font-size: 2rem;
    font-weight: 700;
    color: #f1f5f9;
    line-height: 1;
    margin-bottom: 6px;
  }

  .stat-label {
    font-size: 0.78rem;
    color: #64748b;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 4px;
  }

  .stat-sub {
    font-size: 0.75rem;
    color: #475569;
  }

  .chart-grid {
    display: grid;
    grid-template-columns: 1fr 340px;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  @media (max-width: 1100px) { .chart-grid { grid-template-columns: 1fr; } }

  .panel {
    background: #0f172a;
    border: 1px solid #1e293b;
    border-radius: 16px;
    overflow: hidden;
  }

  .panel-header {
    padding: 1.1rem 1.5rem;
    border-bottom: 1px solid #1e293b;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .panel-title {
    font-family: 'Syne', sans-serif;
    font-size: 0.95rem;
    font-weight: 600;
    color: #e2e8f0;
    margin: 0;
  }

  .panel-sub {
    font-size: 0.75rem;
    color: #475569;
    margin: 2px 0 0 0;
  }

  .panel-body { padding: 1.25rem 1.5rem; }
  .panel-body-flush { padding: 0; }

  .badge-new {
    font-size: 0.72rem;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 100px;
    background: var(--b-bg, rgba(16,185,129,0.1));
    color: var(--b-color, #10b981);
    border: 1px solid var(--b-border, rgba(16,185,129,0.2));
  }

  .bottom-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  @media (max-width: 900px) { .bottom-grid { grid-template-columns: 1fr; } }

  .leave-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.85rem 1.5rem;
    border-bottom: 1px solid #1e293b;
    transition: background 0.15s;
  }

  .leave-item:last-child { border-bottom: none; }
  .leave-item:hover { background: rgba(255,255,255,0.02); }

  .leave-avatar {
    width: 36px; height: 36px;
    border-radius: 10px;
    background: linear-gradient(135deg, #7c3aed22, #a855f722);
    border: 1px solid #7c3aed44;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif;
    font-size: 0.8rem;
    font-weight: 700;
    color: #a78bfa;
    flex-shrink: 0;
  }

  .leave-name { font-size: 0.85rem; font-weight: 500; color: #e2e8f0; }
  .leave-meta { font-size: 0.73rem; color: #475569; margin-top: 2px; }

  .leave-badge {
    font-size: 0.7rem;
    font-weight: 600;
    padding: 3px 9px;
    border-radius: 6px;
    background: rgba(245,158,11,0.1);
    color: #f59e0b;
    border: 1px solid rgba(245,158,11,0.2);
    flex-shrink: 0;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 1rem;
    gap: 0.5rem;
  }

  .empty-icon {
    width: 52px; height: 52px;
    border-radius: 14px;
    background: rgba(16,185,129,0.08);
    border: 1px solid rgba(16,185,129,0.15);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.3rem;
    color: #10b981;
    margin-bottom: 0.5rem;
  }

  .empty-title { font-size: 0.9rem; font-weight: 600; color: #94a3b8; margin: 0; }
  .empty-sub   { font-size: 0.78rem; color: #475569; margin: 0; }

  .ai-panel {
    background: #0f172a;
    border: 1px solid rgba(124,58,237,0.25);
    border-radius: 16px;
    overflow: hidden;
    position: relative;
  }

  .ai-panel::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at top right, rgba(124,58,237,0.06) 0%, transparent 60%);
    pointer-events: none;
  }

  .ai-header {
    padding: 1.1rem 1.5rem;
    border-bottom: 1px solid rgba(124,58,237,0.15);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .ai-header-title {
    font-family: 'Syne', sans-serif;
    font-size: 0.95rem;
    font-weight: 600;
    color: #a78bfa;
    margin: 0;
  }

  .ai-health-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: #1e293b;
    border-radius: 12px;
    margin-bottom: 1rem;
  }

  .ai-score-circle {
    width: 52px; height: 52px;
    border-radius: 12px;
    background: rgba(124,58,237,0.15);
    border: 1px solid rgba(124,58,237,0.3);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 1.1rem;
    color: #a78bfa;
    flex-shrink: 0;
  }

  .ai-risk-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 10px 12px;
    border-radius: 10px;
    margin-bottom: 8px;
    background: rgba(245,158,11,0.05);
    border: 1px solid rgba(245,158,11,0.12);
  }

  .ai-risk-item i { color: #f59e0b; font-size: 0.75rem; margin-top: 2px; flex-shrink: 0; }
  .ai-risk-item small { color: #fde68a; font-size: 0.78rem; line-height: 1.5; }

  .ai-empty {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 2.5rem 1rem; text-align: center; gap: 0.5rem;
  }

  .dept-legend {
    display: flex; flex-direction: column; gap: 6px;
    margin-top: 0.75rem;
  }

  .dept-row {
    display: flex; align-items: center;
    justify-content: space-between;
  }

  .dept-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .skel {
    background: linear-gradient(90deg, #1e293b 25%, #263348 50%, #1e293b 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 8px;
  }

  @keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  .custom-tooltip {
    background: #1e293b !important;
    border: 1px solid #334155 !important;
    border-radius: 10px !important;
    color: #e2e8f0 !important;
    font-size: 0.8rem !important;
    padding: 8px 12px !important;
    box-shadow: 0 8px 24px rgba(0,0,0,0.4) !important;
  }
`

const StatCard = ({ icon, label, value, sub, color, accentBg, loading }) => (
  <div className="stat-card-new" style={{ '--accent': color, '--accent-bg': accentBg }}>
    <div className="stat-icon-new">
      <i className={`bi bi-${icon}`} />
    </div>
    {loading
      ? <>
          <div className="skel mb-2" style={{ height: 36, width: '60%' }} />
          <div className="skel" style={{ height: 12, width: '80%' }} />
        </>
      : <>
          <div className="stat-value">{value ?? '—'}</div>
          <div className="stat-label">{label}</div>
          {sub && <div className="stat-sub">{sub}</div>}
        </>
    }
  </div>
)

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="custom-tooltip">
      <div style={{ color: '#94a3b8', marginBottom: 4 }}>{label}</div>
      <div style={{ color: '#a78bfa', fontWeight: 600 }}>{payload[0].value} employees</div>
    </div>
  )
}

const buildHeadcountData = (stats) => {
  if (!stats) return []
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const now = new Date()
  return Array.from({ length: 6 }, (_, i) => {
    const d      = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const growth = stats.newThisMonth || 0
    const base   = (stats.totalEmployees || 0) - growth
    const v      = i < 5
      ? Math.max(0, Math.round(base + (growth / 5) * i))
      : stats.totalEmployees || 0
    return { m: months[d.getMonth()], v }
  })
}

export default function DashboardPage() {
  const [stats,    setStats]    = useState(null)
  const [leaves,   setLeaves]   = useState([])
  const [insights, setInsights] = useState(null)
  const [deptData, setDeptData] = useState([])
  const [loading,  setLoading]  = useState(true)

  const user = useSelector(state => state.auth.user)

  useEffect(() => {
    const load = async () => {
      try {
        const [lr, sr, ar, dr] = await Promise.allSettled([
          leaveAPI.getAll({ status: 'pending', limit: 5 }),
          employeeAPI.getStats(),
          aiAPI.workforceInsights(),
          departmentAPI.getAll(),
        ])

        if (lr.status === 'fulfilled') setLeaves(lr.value.data.leaves || [])
        if (sr.status === 'fulfilled') setStats(sr.value.data)
        if (ar.status === 'fulfilled') setInsights(ar.value.data)

        // ── Department pie chart ─────────────────────────────────────
        // Primary source: departmentAPI (always has your 4 departments)
        // Cross-reference byDept from stats to get employee counts per dept
        if (dr.status === 'fulfilled') {
          const departments = dr.value.data.departments || []
          const byDept      = sr.status === 'fulfilled' ? (sr.value.data.byDept || []) : []

          setDeptData(
            departments.map(dept => {
              // byDept[i]._id is the department ObjectId — match by string
              const match = byDept.find(b => String(b._id) === String(dept._id))
              return { name: dept.name, v: match?.count || 0 }
            })
          )
        }
        // ────────────────────────────────────────────────────────────

      } catch (e) {
        console.error('Dashboard load error:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const headcountData = buildHeadcountData(stats)

  return (
    <>
      <style>{styles}</style>
      <div className="dash-root">

        {/* Header */}
        <div className="dash-header">
          <div>
            <h1 className="dash-greeting">{greet()}, {user?.name?.split(' ')[0]} 👋</h1>
            <p className="dash-sub">Here's what's happening in your organisation today.</p>
          </div>
          <div className="dash-date-chip">
            <i className="bi bi-calendar3" />
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
        </div>

        {/* Stat Cards */}
        <div className="stat-grid">
          <StatCard icon="people-fill"       label="Total Employees"  value={stats?.totalEmployees}                sub={`${stats?.newThisMonth || 0} joined this month`} color="#7c3aed" accentBg="rgba(124,58,237,0.12)"  loading={loading} />
          <StatCard icon="person-check-fill" label="Active Employees" value={stats?.activeEmployees}               sub={`${stats?.onLeave || 0} on leave`}               color="#10b981" accentBg="rgba(16,185,129,0.12)"  loading={loading} />
          <StatCard icon="calendar-x-fill"   label="Pending Leaves"   value={leaves.length}                        sub="Needs attention"                                  color="#f59e0b" accentBg="rgba(245,158,11,0.12)"  loading={loading} />
          <StatCard icon="graph-up-arrow"    label="Avg Performance"  value={insights?.data?.avgPerformance || '—'} sub="Out of 5.0 this quarter"                         color="#a855f7" accentBg="rgba(168,85,247,0.12)" loading={loading} />
        </div>

        {/* Charts Row */}
        <div className="chart-grid">

          {/* Area chart */}
          <div className="panel">
            <div className="panel-header">
              <div>
                <p className="panel-title">Headcount Trend</p>
                <p className="panel-sub">6-month employee growth</p>
              </div>
              {stats && (
                <span className="badge-new" style={{ '--b-bg': 'rgba(16,185,129,0.1)', '--b-color': '#10b981', '--b-border': 'rgba(16,185,129,0.2)' }}>
                  {stats.newThisMonth > 0 ? `+${stats.newThisMonth} this month` : 'Stable'}
                </span>
              )}
            </div>
            <div className="panel-body">
              {loading ? (
                <div className="skel" style={{ height: 220 }} />
              ) : headcountData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={headcountData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="m" stroke="transparent" tick={{ fill: '#475569', fontSize: 11 }} />
                    <YAxis stroke="transparent" tick={{ fill: '#475569', fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="v" stroke="#7c3aed" strokeWidth={2.5} fill="url(#grad)" dot={false} activeDot={{ r: 5, fill: '#7c3aed', stroke: '#0f172a', strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-state" style={{ height: 220 }}>
                  <p style={{ color: '#475569', fontSize: '0.82rem' }}>No headcount data yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Pie chart — real departments from API */}
          <div className="panel">
            <div className="panel-header">
              <div>
                <p className="panel-title">By Department</p>
                <p className="panel-sub">Active headcount</p>
              </div>
            </div>
            <div className="panel-body">
              {loading ? (
                <div className="skel" style={{ height: 140 }} />
              ) : deptData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={140}>
                    <PieChart>
                      <Pie
                        data={deptData}
                        cx="50%" cy="50%"
                        innerRadius={42} outerRadius={62}
                        dataKey="v"
                        strokeWidth={0}
                        paddingAngle={3}
                      >
                        {deptData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 10, color: '#e2e8f0', fontSize: '0.8rem' }}
                        formatter={(value, name) => [value === 0 ? 'No employees yet' : value, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="dept-legend">
                    {deptData.map((d, i) => (
                      <div key={d.name} className="dept-row">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="dept-dot" style={{ background: COLORS[i % COLORS.length] }} />
                          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{d.name}</span>
                        </div>
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8' }}>
                          {d.v}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="empty-state" style={{ padding: '2rem 1rem' }}>
                  <p style={{ color: '#475569', fontSize: '0.82rem' }}>No departments found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="bottom-grid">

          {/* Pending Leaves */}
          <div className="panel">
            <div className="panel-header">
              <div>
                <p className="panel-title">Pending Leave Requests</p>
              </div>
              <span className="badge-new" style={{ '--b-bg': 'rgba(245,158,11,0.1)', '--b-color': '#f59e0b', '--b-border': 'rgba(245,158,11,0.2)' }}>
                {leaves.length} pending
              </span>
            </div>
            <div className="panel-body-flush">
              {leaves.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon"><i className="bi bi-check2-circle" /></div>
                  <p className="empty-title">All caught up!</p>
                  <p className="empty-sub">No pending leave requests</p>
                </div>
              ) : leaves.map(l => (
                <div key={l._id} className="leave-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="leave-avatar">
                      {l.employee?.personalInfo?.firstName?.[0] || '?'}
                    </div>
                    <div>
                      <div className="leave-name">
                        {l.employee?.personalInfo?.firstName} {l.employee?.personalInfo?.lastName}
                      </div>
                      <div className="leave-meta">{l.leaveType} · {l.totalDays} day(s)</div>
                    </div>
                  </div>
                  <span className="leave-badge">Pending</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insights */}
          <div className="ai-panel">
            <div className="ai-header">
              <i className="bi bi-stars" style={{ color: '#7c3aed', fontSize: '1rem' }} />
              <p className="ai-header-title">AI Workforce Insights</p>
            </div>
            <div className="panel-body">
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[80, 60, 60].map((w, i) => (
                    <div key={i} className="skel" style={{ height: 48, width: `${w}%` }} />
                  ))}
                </div>
              ) : insights?.insights ? (
                <>
                  <div className="ai-health-card">
                    <div className="ai-score-circle">{insights.insights.healthScore || 75}</div>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>Workforce Health Score</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>
                        {insights.insights.trend || 'stable'} trend
                      </div>
                    </div>
                  </div>
                  {(insights.insights.keyRisks || []).slice(0, 3).map((r, i) => (
                    <div key={i} className="ai-risk-item">
                      <i className="bi bi-exclamation-triangle" />
                      <small>{r}</small>
                    </div>
                  ))}
                </>
              ) : (
                <div className="ai-empty">
                  <i className="bi bi-stars" style={{ fontSize: '2rem', color: 'rgba(124,58,237,0.3)' }} />
                  <p style={{ fontSize: '0.82rem', color: '#475569', margin: '8px 0 0 0', lineHeight: 1.5 }}>
                    Add <code style={{ color: '#a78bfa', background: 'rgba(124,58,237,0.1)', padding: '1px 6px', borderRadius: 4 }}>ANTHROPIC_API_KEY</code> in backend .env to see AI insights.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
