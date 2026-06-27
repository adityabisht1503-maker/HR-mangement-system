import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { login } from '../../store/authSlice'
import api from '../../api'

const DEMOS = [
  { label: 'Admin',    email: 'admin@hrflow.com',    password: 'Admin@123!',    role: 'super_admin' },
  { label: 'Employee', email: 'employee@hrflow.com', password: 'Employee@123!', role: 'employee'    },
]

export default function LoginPage() {
  const [form,     setForm]     = useState({ email: '', password: '' })
  const [show,     setShow]     = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [selected, setSelected] = useState(null)

  const dispatch       = useDispatch()
  const navigate       = useNavigate()
  const particlesRef   = useRef(null)

  /* ── Floating particles ─────────────────────────────────────────── */
  useEffect(() => {
    const container = particlesRef.current
    if (!container) return
    for (let i = 0; i < 28; i++) {
      const p     = document.createElement('div')
      const size  = 1.5 + Math.random() * 3
      const dur   = 9   + Math.random() * 14
      const delay = Math.random() * 14
      const left  = Math.random() * 100
      p.style.cssText = [
        'position:absolute',
        `left:${left}%`,
        'bottom:-10px',
        `width:${size}px`,
        `height:${size}px`,
        'border-radius:50%',
        `background:rgba(255,255,255,${0.3 + Math.random() * 0.4})`,
        `animation:hrDriftUp ${dur}s ${delay}s linear infinite`,
      ].join(';')
      container.appendChild(p)
    }
    return () => { container.innerHTML = '' }
  }, [])

  /* ── Demo toggle ────────────────────────────────────────────────── */
  const handleDemoClick = (demo) => {
    if (selected?.label === demo.label) {
      setSelected(null)
      setForm({ email: '', password: '' })
    } else {
      setSelected(demo)
      setForm({ email: demo.email, password: demo.password })
    }
  }

  /* ── Submit ─────────────────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/api/auth/login', {
        email:    form.email,
        password: form.password,
        role:     selected?.role || null,
      })

      if (res.data?.status === 1 || res.data?.message === 'Login successful') {
        const { token, user } = res.data
        const { role }        = res.data.user

        localStorage.setItem('token', token)
        localStorage.setItem('user',  JSON.stringify(user))
        localStorage.setItem('role',  JSON.stringify(role))

        dispatch(login({ ...user, role }))
        toast.success(`Welcome, ${user?.name || 'back'}!`)

        if (role === 'admin' || user?.role === 'admin') navigate('/dashborad')
        else navigate('/employee')
      } else {
        toast.error(res.data?.message || 'Login failed')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  /* ── Styles ─────────────────────────────────────────────────────── */
  const css = {
    page: {
      minHeight: '100vh',
      display: 'flex',
      background: '#080d14',
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      margin: 0,
      padding: 0,
      overflow: 'hidden',
    },

    /* LEFT */
    left: {
      flex: '0 0 50%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '2.5rem',
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(145deg,#2d0558 0%,#5b1fa8 40%,#7c3aed 75%,#6d28d9 100%)',
    },

    /* orbs */
    orb1: {
      position: 'absolute', top: -130, left: -130,
      width: 380, height: 380, borderRadius: '50%', pointerEvents: 'none',
      background: 'radial-gradient(circle,rgba(167,139,250,0.18) 0%,rgba(124,58,237,0.08) 60%,transparent 100%)',
      animation: 'hrFloatA 10s ease-in-out infinite',
    },
    orb2: {
      position: 'absolute', bottom: -120, right: -100,
      width: 340, height: 340, borderRadius: '50%', pointerEvents: 'none',
      background: 'radial-gradient(circle,rgba(139,92,246,0.2) 0%,rgba(91,27,168,0.08) 60%,transparent 100%)',
      animation: 'hrFloatB 13s ease-in-out infinite',
    },
    orb3: {
      position: 'absolute', top: '42%', left: '38%',
      width: 200, height: 200, borderRadius: '50%', pointerEvents: 'none',
      background: 'radial-gradient(circle,rgba(255,255,255,0.07) 0%,transparent 70%)',
      animation: 'hrFloatC 7s ease-in-out infinite',
    },
    orb4: {
      position: 'absolute', top: '20%', right: '15%',
      width: 120, height: 120, borderRadius: '50%', pointerEvents: 'none',
      background: 'radial-gradient(circle,rgba(216,180,254,0.12) 0%,transparent 70%)',
      animation: 'hrFloatD 9s ease-in-out infinite',
    },

    /* rings */
    ring1: {
      position: 'absolute', top: '50%', left: '50%',
      width: 500, height: 500, borderRadius: '50%', pointerEvents: 'none',
      border: '1px solid rgba(255,255,255,0.07)',
      transform: 'translate(-50%,-50%)',
      animation: 'hrRingPulse 6s ease-in-out infinite',
    },
    ring2: {
      position: 'absolute', top: '50%', left: '50%',
      width: 700, height: 700, borderRadius: '50%', pointerEvents: 'none',
      border: '1px solid rgba(255,255,255,0.05)',
      transform: 'translate(-50%,-50%)',
      animation: 'hrRingPulse 6s 2s ease-in-out infinite',
    },

    scanline: {
      position: 'absolute', top: 0, left: 0, right: 0,
      height: 2, pointerEvents: 'none',
      background: 'linear-gradient(transparent,rgba(255,255,255,0.05),transparent)',
      animation: 'hrScanline 8s linear infinite',
    },

    particles: {
      position: 'absolute', inset: 0,
      overflow: 'hidden', pointerEvents: 'none',
    },

    leftContent: {
      position: 'relative', zIndex: 2,
      display: 'flex', flexDirection: 'column',
      height: '100%', justifyContent: 'space-between',
    },

    /* brand */
    brand: {
      display: 'flex', alignItems: 'center', gap: 12,
      animation: 'hrFadeSlideUp 0.7s ease both',
    },
    brandIcon: {
      width: 46, height: 46, borderRadius: 12,
      background: 'rgba(255,255,255,0.18)',
      border: '1px solid rgba(255,255,255,0.3)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '1.3rem', color: '#fff',
    },
    brandName: {
      fontSize: '1.5rem', fontWeight: 800,
      color: '#fff', letterSpacing: '-0.03em',
    },
    brandBadge: {
      fontSize: '0.65rem', fontWeight: 600, color: '#c4b5fd',
      background: 'rgba(255,255,255,0.12)',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: 20, padding: '2px 8px',
      marginLeft: 6, verticalAlign: 'middle',
    },

    /* hero */
    hero: {
      flex: 1, display: 'flex',
      flexDirection: 'column', justifyContent: 'center',
      padding: '1rem 0',
    },
    heroEyebrow: {
      fontSize: '0.72rem', fontWeight: 600,
      color: '#c4b5fd', letterSpacing: '0.12em',
      textTransform: 'uppercase', marginBottom: '0.8rem',
      animation: 'hrFadeSlideUp 0.6s 0.15s ease both', opacity: 0,
    },
    heroTitle: {
      fontSize: '3.4rem', fontWeight: 800,
      lineHeight: 1.12, color: '#fff',
      letterSpacing: '-0.03em', marginBottom: '1rem',
      animation: 'hrFadeSlideUp 0.6s 0.25s ease both', opacity: 0,
    },
    heroSub: {
      fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)',
      lineHeight: 1.65, margin: 0,
      animation: 'hrFadeSlideUp 0.6s 0.35s ease both', opacity: 0,
    },

    featureList: {
      display: 'flex', flexDirection: 'column', gap: 8,
      marginTop: '1.25rem',
      animation: 'hrFadeSlideUp 0.6s 0.45s ease both', opacity: 0,
    },
    featureItem: {
      display: 'flex', alignItems: 'center', gap: 10,
      fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)',
    },
    featureDot: {
      width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
      background: 'rgba(167,139,250,0.25)',
      border: '1px solid rgba(167,139,250,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '0.6rem', color: '#c4b5fd',
    },

    /* stats */
    statsGrid: {
      display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
    },
    statTile: (i) => ({
      background: 'rgba(255,255,255,0.08)',
      border: '1px solid rgba(255,255,255,0.14)',
      borderRadius: 14, padding: '1rem 1.1rem',
      animation: `hrStatIn 0.5s ${0.5 + i * 0.12}s ease both`,
      opacity: 0,
    }),
    statVal:   { fontSize: '1.5rem', fontWeight: 800, color: '#fff', lineHeight: 1, marginBottom: 4 },
    statLabel: { fontSize: '0.73rem', color: 'rgba(255,255,255,0.62)', fontWeight: 400 },

    /* RIGHT */
    right: {
      flex: '0 0 50%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem', background: '#080d14', overflowY: 'auto',
    },
    formWrap: { width: '100%', maxWidth: 420 },

    heading: { fontSize: '1.75rem', fontWeight: 800, color: '#f1f5f9', margin: '0 0 4px', letterSpacing: '-0.025em' },
    subhead:  { fontSize: '0.86rem', color: '#475569', margin: '0 0 1.75rem' },

    demoBox: {
      background: 'rgba(124,58,237,0.08)',
      border: '1px solid rgba(124,58,237,0.22)',
      borderRadius: 14, padding: '0.9rem 1rem',
      marginBottom: '1.5rem',
    },
    demoLabel: { fontSize: '0.75rem', color: '#64748b', marginBottom: '0.6rem', display: 'block' },
    demoRow:   { display: 'flex', gap: 8 },
    demoBtn: (active) => ({
      padding: '6px 18px', borderRadius: 8, cursor: 'pointer',
      fontSize: '0.82rem', fontWeight: active ? 600 : 400,
      border: active ? '1px solid #7c3aed' : '1px solid rgba(124,58,237,0.3)',
      background: active ? '#7c3aed' : 'rgba(124,58,237,0.12)',
      color: active ? '#fff' : '#a78bfa',
      transition: 'all 0.15s',
      fontFamily: "'DM Sans', sans-serif",
    }),
    demoHint: { fontSize: '0.72rem', color: '#a78bfa', marginTop: '0.5rem', display: 'block' },

    fieldWrap:  { marginBottom: '1rem' },
    fieldLabel: { display: 'block', fontSize: '0.76rem', fontWeight: 500, color: '#64748b', marginBottom: 6 },
    inputGroup: {
      display: 'flex', borderRadius: 10, overflow: 'hidden',
      border: '1px solid #1e293b', background: '#0f172a',
      transition: 'border-color 0.15s, box-shadow 0.15s',
    },
    inputAddon: {
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      width: 42, background: '#0f172a',
      borderRight: '1px solid #1e293b', color: '#475569',
      fontSize: '0.9rem', flexShrink: 0,
    },
    input: {
      flex: 1, padding: '0.65rem 0.75rem',
      background: '#0f172a', border: 'none', outline: 'none',
      color: '#e2e8f0', fontSize: '0.87rem',
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    },
    eyeBtn: {
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      width: 40, background: '#0f172a', border: 'none',
      borderLeft: '1px solid #1e293b', color: '#475569',
      cursor: 'pointer', fontSize: '0.9rem',
    },
    forgotRow:  { display: 'flex', justifyContent: 'flex-end', marginBottom: '1.25rem' },
    forgotLink: { fontSize: '0.81rem', color: '#a78bfa', textDecoration: 'none' },

    submitBtn: (loading) => ({
      width: '100%', padding: '0.72rem',
      background: loading ? 'rgba(124,58,237,0.5)' : 'linear-gradient(135deg,#7c3aed,#5b21b6)',
      color: '#fff', border: 'none', borderRadius: 10,
      fontSize: '0.9rem', fontWeight: 700,
      cursor: loading ? 'not-allowed' : 'pointer',
      fontFamily: "'DM Sans', sans-serif",
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      transition: 'opacity 0.15s, transform 0.1s',
      position: 'relative', overflow: 'hidden',
    }),
    shimmer: {
      position: 'absolute', inset: 0, pointerEvents: 'none',
      background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)',
      backgroundSize: '200%',
      animation: 'hrShimmer 2.5s infinite',
    },
    spinner: {
      width: 16, height: 16,
      border: '2px solid rgba(255,255,255,0.3)',
      borderTopColor: '#fff', borderRadius: '50%',
      animation: 'hrSpin 0.7s linear infinite', flexShrink: 0,
    },

    footer:     { textAlign: 'center', marginTop: '1.5rem', fontSize: '0.82rem', color: '#475569' },
    footerLink: { color: '#a78bfa', textDecoration: 'none', fontWeight: 600 },
  }

  const STATS = [['10K+','Employees'],['50K+','AI Insights'],['99.9%','Accuracy'],['4.9★','Rating']]
  const FEATURES = [
    'Real-time attendance & leave tracking',
    'AI-powered performance insights',
    'Automated payroll processing',
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,700;9..40,800&display=swap');

        /* ── keyframes (prefixed hr* to avoid clashes) ── */
        @keyframes hrFloatA {
          0%,100% { transform: translate(0,0) scale(1); }
          33%     { transform: translate(22px,-28px) scale(1.08); }
          66%     { transform: translate(-16px,18px) scale(0.94); }
        }
        @keyframes hrFloatB {
          0%,100% { transform: translate(0,0) scale(1); }
          40%     { transform: translate(-24px,22px) scale(1.06); }
          70%     { transform: translate(20px,-14px) scale(0.96); }
        }
        @keyframes hrFloatC {
          0%,100% { transform: translate(0,0); }
          50%     { transform: translate(14px,-20px); }
        }
        @keyframes hrFloatD {
          0%,100% { transform: translate(0,0) scale(1); }
          25%     { transform: translate(-10px,-18px) scale(1.04); }
          75%     { transform: translate(12px,8px) scale(0.97); }
        }
        @keyframes hrDriftUp {
          0%   { transform: translateY(0) rotate(0deg);   opacity: 0; }
          8%   { opacity: 0.7; }
          92%  { opacity: 0.3; }
          100% { transform: translateY(-700px) rotate(180deg); opacity: 0; }
        }
        @keyframes hrRingPulse {
          0%,100% { transform: translate(-50%,-50%) scale(1);    opacity: 0.12; }
          50%     { transform: translate(-50%,-50%) scale(1.12); opacity: 0.05; }
        }
        @keyframes hrScanline {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes hrFadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes hrStatIn {
          from { opacity: 0; transform: translateY(16px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
        @keyframes hrShimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes hrSpin { to { transform: rotate(360deg); } }

        /* autofill overrides */
        .hr-input:-webkit-autofill,
        .hr-input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px #0f172a inset !important;
          -webkit-text-fill-color: #e2e8f0 !important;
          caret-color: #e2e8f0 !important;
        }
        .hr-input::placeholder { color: #334155 !important; }

        /* input group focus glow */
        .hr-group:focus-within {
          border-color: #7c3aed !important;
          box-shadow: 0 0 0 3px rgba(124,58,237,0.15) !important;
        }

        /* submit hover */
        .hr-submit:not(:disabled):hover  { opacity: 0.92; transform: translateY(-1px); }
        .hr-submit:not(:disabled):active { transform: translateY(0); }

        /* forgot hover */
        .hr-forgot:hover { text-decoration: underline; }

        /* hide left panel on mobile */
        @media (max-width: 900px) {
          .hr-left  { display: none !important; }
          .hr-right { flex: unset !important; width: 100% !important; }
        }
      `}</style>

      <div style={css.page}>

        {/* ══════════════ LEFT PANEL ══════════════ */}
        <div className="hr-left" style={css.left}>

          {/* grid background */}
          <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none', opacity:1 }}
               xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hrGrid" width="36" height="36" patternUnits="userSpaceOnUse">
                <path d="M 36 0 L 0 0 0 36" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.4"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hrGrid)"/>
          </svg>

          {/* scanline */}
          <div style={css.scanline} />

          {/* orbs */}
          <div style={css.orb1} />
          <div style={css.orb2} />
          <div style={css.orb3} />
          <div style={css.orb4} />

          {/* rings */}
          <div style={css.ring1} />
          <div style={css.ring2} />

          {/* particles */}
          <div ref={particlesRef} style={css.particles} />

          {/* ── content ── */}
          <div style={css.leftContent}>

            {/* Brand */}
            <div style={css.brand}>
              <div style={css.brandIcon}>
                <i className="bi bi-shield-fill-check" />
              </div>
              <div>
                <span style={css.brandName}>HRFlow</span>
                <span style={css.brandBadge}>v2.0</span>
              </div>
            </div>

            {/* Hero */}
            <div style={css.hero}>
              <p style={css.heroEyebrow}>
                <i className="bi bi-stars" style={{ marginRight: 6 }} />
                Next-gen workforce OS
              </p>
              <h2 style={css.heroTitle}>
                Modern HR<br />
                <span style={{ background:'linear-gradient(90deg,#fff 0%,#e9d5ff 50%,#c4b5fd 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
                  Management
                </span><br />
                Platform
              </h2>
              <p style={css.heroSub}>
                Streamline your workforce with AI-powered insights,<br />
                automated payroll, and comprehensive analytics.
              </p>

              <div style={css.featureList}>
                {FEATURES.map(f => (
                  <div key={f} style={css.featureItem}>
                    <div style={css.featureDot}>
                      <i className="bi bi-check" />
                    </div>
                    {f}
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div style={css.statsGrid}>
              {STATS.map(([v, l], i) => (
                <div key={l} style={css.statTile(i)}>
                  <div style={css.statVal}>{v}</div>
                  <div style={css.statLabel}>{l}</div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* ══════════════ RIGHT PANEL ══════════════ */}
        <div className="hr-right" style={css.right}>
          <div style={css.formWrap}>

            <h2 style={css.heading}>Welcome back</h2>
            <p style={css.subhead}>Sign in to your HR Management account</p>

            {/* Demo box */}
            <div style={css.demoBox}>
              <span style={css.demoLabel}>
                <i className="bi bi-stars" style={{ color:'#a78bfa', marginRight: 5 }} />
                Quick Demo Login
              </span>
              <div style={css.demoRow}>
                {DEMOS.map(demo => {
                  const active = selected?.label === demo.label
                  return (
                    <button
                      key={demo.label}
                      type="button"
                      style={css.demoBtn(active)}
                      onClick={() => handleDemoClick(demo)}
                    >
                      {active && <i className="bi bi-check-lg" style={{ marginRight: 4 }} />}
                      {demo.label}
                    </button>
                  )
                })}
              </div>
              {selected && (
                <span style={css.demoHint}>
                  <i className="bi bi-info-circle" style={{ marginRight: 4 }} />
                  Logging in as <strong>{selected.label}</strong> · {selected.email}
                </span>
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>

              {/* Email */}
              <div style={css.fieldWrap}>
                <label style={css.fieldLabel}>Email Address</label>
                <div className="hr-group" style={css.inputGroup}>
                  <div style={css.inputAddon}>
                    <i className="bi bi-envelope" />
                  </div>
                  <input
                    className="hr-input"
                    type="email"
                    placeholder="you@company.com"
                    value={form.email}
                    style={css.input}
                    onChange={e => { setForm({ ...form, email: e.target.value }); setSelected(null) }}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div style={css.fieldWrap}>
                <label style={css.fieldLabel}>Password</label>
                <div className="hr-group" style={css.inputGroup}>
                  <div style={css.inputAddon}>
                    <i className="bi bi-lock" />
                  </div>
                  <input
                    className="hr-input"
                    type={show ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    style={css.input}
                    onChange={e => { setForm({ ...form, password: e.target.value }); setSelected(null) }}
                    required
                  />
                  <button
                    type="button"
                    style={css.eyeBtn}
                    onClick={() => setShow(s => !s)}
                    aria-label="Toggle password visibility"
                  >
                    <i className={`bi bi-${show ? 'eye-slash' : 'eye'}`} />
                  </button>
                </div>
              </div>

              {/* Forgot */}
              <div style={css.forgotRow}>
                <Link to="/forgot" className="hr-forgot" style={css.forgotLink}>
                  Forgot password?
                </Link>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="hr-submit"
                style={css.submitBtn(loading)}
                disabled={loading}
              >
                {/* shimmer overlay */}
                {!loading && <span style={css.shimmer} />}
                {loading && <div style={css.spinner} />}
                {loading ? 'Signing in…' : 'Sign In'}
              </button>

            </form>

            <p style={css.footer}>
              Don't have an account?{' '}
              <Link to="/register" style={css.footerLink}>Create account</Link>
            </p>

          </div>
        </div>

      </div>
    </>
  )
}