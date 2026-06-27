import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'

import { toast } from 'react-toastify'
import NotificationBell from '../../NotificationBell'
import { logout } from '../../store/authslice'

const ADMIN_NAV = [
  { to: '/dashborad',   icon: 'speedometer2',  label: 'Dashboard'   },
  { to: '/employee',   icon: 'people',         label: 'Employees'   },
  { to: '/leaves',      icon: 'calendar-check', label: 'Leaves'      },
  { to: '/payroll',     icon: 'cash-coin',      label: 'Payroll'     },
  { to: '/request', icon: 'star',           label: 'Request' },
  { to: '/departments', icon: 'building',       label: 'Departments' },
  { to: 'ai', icon: 'stars',          label: 'AI Insights' },
]

const EMPLOYEE_NAV = [
  { to: '/employee',    icon: 'person-circle',  label: 'My Profile'  },
  { to: '/profile',     icon: 'gear',           label: 'Settings'    },
]

const ROLE_BADGE = {
  admin:    'bg-primary text-white',
  employee: 'bg-secondary text-white',
}

const initials = (name = '') => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false)

  const user     = useSelector(state => state.auth.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const isAdmin = user?.role === 'admin'
  const NAV     = isAdmin ? ADMIN_NAV : EMPLOYEE_NAV

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('role')
    dispatch(logout())
    toast.success('Logged out')
    navigate('/')
  }

  return (
    <div className="page-wrapper">
      {/* ── Sidebar ── */}
      <aside className={`sidebar d-flex flex-column ${collapsed ? 'collapsed' : ''}`}>

        {/* Logo */}
        <div className="d-flex align-items-center gap-2 px-3 py-3" style={{ borderBottom: '1px solid #30363d', minHeight: 60 }}>
          <div className="avatar" style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)', flexShrink: 0 }}>
            <i className="bi bi-shield-fill-check" />
          </div>
          {!collapsed && (
            <div className="sidebar-label">
              <div className="fw-bold text-white" style={{ fontSize: '0.95rem' }}>HRFlow</div>
              <div className="" style={{ fontSize: '0.7rem' ,color:'#8b949e' } }>Management System</div>
            </div>
          )}
        </div>

        {/* User info */}
        {!collapsed && (
          <div className="px-3 py-3" style={{ borderBottom: '1px solid #30363d' }}>
            <div className="d-flex align-items-center gap-2 p-2 rounded-3" style={{ background: '#21262d' }}>
              <div className="avatar avatar-sm">{initials(user?.name)}</div>
              <div className="sidebar-label overflow-hidden">
                <div className="text-white fw-semibold text-truncate" style={{ fontSize: '0.8rem' }}>{user?.name}</div>
                <span className={`badge ${ROLE_BADGE[user?.role] || 'bg-secondary text-white'} mt-1`} style={{ fontSize: '0.65rem' }}>
                  {user?.role}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Nav links — admin sees all, employee sees only their links */}
        <nav className="flex-grow-1 p-2 overflow-auto">
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''} mb-1`}>
              <i className={`bi bi-${n.icon}`} />
              <span className="sidebar-label">{n.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-2" style={{ borderTop: '1px solid #30363d' }}>
          <button
            onClick={handleLogout}
            className="nav-link border-0 bg-transparent w-100 text-start mt-1"
            style={{ color: '#8b949e' }}
            onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
            onMouseLeave={e => e.currentTarget.style.color = '#8b949e'}
          >
            <i className="bi bi-box-arrow-right" />
            <span className="sidebar-label">Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="main-content d-flex flex-column">
        {/* Topbar */}
        <header className="topbar d-flex align-items-center justify-content-between px-3 px-lg-4">
          <button className="btn btn-sm btn-outline-secondary border-0" onClick={() => setCollapsed(c => !c)}>
            <i className={`bi bi-${collapsed ? 'layout-sidebar-inset' : 'layout-sidebar'} fs-5`} />
          </button>
          <div className="d-flex align-items-center gap-2">
            <NotificationBell/>
            <div
              className="avatar avatar-sm"
              onClick={() => navigate(isAdmin ? '/dashboard' : '/employee')}
              style={{ cursor: 'pointer' }}
            >
              {initials(user?.name)}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-grow-1 p-3 p-lg-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
