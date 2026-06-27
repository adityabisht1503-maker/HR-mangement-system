import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'


import api from '../../api'
import { toast } from 'react-toastify'

export default function RegisterPage() {
  const [form, setForm]     = useState({ name: '', email: '', password: '', confirm: '', role: 'employee' })
  const [show, setShow]     = useState(false)
  const [loading, setLoading] = useState(false)
  const [showOtp, setShowOtp] = useState(false)
  const [otp, setOtp]       = useState('')
  const navigate = useNavigate();
  

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  // ── Step 1: Register ────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) return toast.error('Passwords do not match')

    setLoading(true)
    try {
      const res = await api.post('/api/auth/register', {
        name:     form.name,
        email:    form.email,
        password: form.password,
        role:     form.role,
      })

      // ✅ Fixed broken if/else — was missing closing brace
      if (res.data?.status === 1 || res.data?.message === 'Signup successful') {
        toast.success('OTP sent to your email!')
        setShowOtp(true)
      } else {
        toast.error(res.data?.message || 'Signup failed')
      }

    } catch (error) {
      if (error.response?.status === 409) {
        toast.error('Email already exists. Please use another email or login.')
      } else {
        toast.error(error.response?.data?.message || 'Signup failed.')
      }
    } finally {
      setLoading(false)
    }
  }
console.log(otp);

  // ── Step 2: Verify OTP ──────────────────────────────────────────────
  const handleOtpSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
 
    try {
      const res = await api.post('/api/auth/verify-otp', {  // ✅ fixed: was using undefined `api`
           email: form.email,
        otp,
        // ✅ fixed: was using undefined `email` variable
      })
    
      

      if (res.data?.status === 1) {
        toast.success('OTP Verified Successfully!')

        // ✅ Save to localStorage + dispatch login if token returned
        
        navigate('/')

      } else {
        toast.error(res.data?.message || 'Invalid OTP')
      }

    } catch (err) {
      toast.error(err.response?.data?.message || 'OTP verification failed')
    } finally {
      setLoading(false)
    }
  }

  // ── Resend OTP ──────────────────────────────────────────────────────
  const handleResend = async () => {
    try {
      await api.post('/api/auth/resend-otp', { email: form.email })
      toast.success('OTP resent!')
    } catch {
      toast.error('Failed to resend OTP.')
    }
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-4"
      style={{ background: '#0d1117' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>

        {/* ── REGISTER FORM ─────────────────────────────────────── */}
        {!showOtp ? (
          <>
            {/* Logo */}
            <div className="d-flex align-items-center gap-2 mb-4">
              <div className="avatar"><i className="bi bi-shield-fill-check" /></div>
              <span className="text-white fw-bold fs-5">HRFlow</span>
            </div>

            <h2 className="text-white fw-bold mb-1">Create account</h2>
            <p style={{ color: '#8b949e' }} className="mb-4">Join your organisation's HR platform</p>

            <form onSubmit={handleSubmit}>

              {/* Name + Email */}
              {[['name', 'Full Name', 'person', 'text'], ['email', 'Email', 'envelope', 'email']].map(([k, lbl, ico, type]) => (
                <div className="mb-3" key={k}>
                  <label className="form-label" style={{ color: '#8b949e' }}>{lbl}</label>
                  <div className="input-group">
                    <span className="input-group-text"
                      style={{ background: '#21262d', border: '1px solid #30363d', color: '#8b949e' }}>
                      <i className={`bi bi-${ico}`} />
                    </span>
                    <input type={type} className="form-control" value={form[k]} onChange={set(k)} required />
                  </div>
                </div>
              ))}

              {/* Role */}
              <div className="mb-3">
                <label className="form-label" style={{ color: '#8b949e' }}>Role</label>
                <select className="form-select" value={form.role} onChange={set('role')}>
                  <option value="employee">Employee</option>
                </select>
              </div>

              {/* Password */}
              <div className="mb-3">
                <label className="form-label" style={{ color: '#8b949e' }}>Password</label>
                <div className="input-group">
                  <span className="input-group-text"
                    style={{ background: '#21262d', border: '1px solid #30363d', color: '#8b949e' }}>
                    <i className="bi bi-lock" />
                  </span>
                  <input
                    type={show ? 'text' : 'password'}
                    className="form-control"
                    value={form.password}
                    onChange={set('password')}
                    placeholder="Min 8 chars, upper, number, symbol"
                    required
                  />
                  <button type="button" className="input-group-text"
                    onClick={() => setShow(s => !s)}
                    style={{ background: '#21262d', border: '1px solid #30363d', color: '#8b949e', cursor: 'pointer' }}>
                    <i className={`bi bi-${show ? 'eye-slash' : 'eye'}`} />
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="mb-4">
                <label className="form-label" style={{ color: '#8b949e' }}>Confirm Password</label>
                <div className="input-group">
                  <span className="input-group-text"
                    style={{ background: '#21262d', border: '1px solid #30363d', color: '#8b949e' }}>
                    <i className="bi bi-lock-fill" />
                  </span>
                  <input type="password" className="form-control"
                    value={form.confirm} onChange={set('confirm')} required />
                </div>
                {/* Live match indicator */}
                {form.confirm && (
                  <div className="mt-1" style={{ fontSize: '0.75rem' }}>
                    {form.password === form.confirm
                      ? <span style={{ color: '#10b981' }}><i className="bi bi-check-circle me-1" />Passwords match</span>
                      : <span style={{ color: '#ef4444' }}><i className="bi bi-x-circle me-1" />Passwords do not match</span>}
                  </div>
                )}
              </div>

              <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold" disabled={loading}>
                {loading
                  ? <><span className="spinner-border spinner-border-sm me-2" />Creating...</>
                  : 'Create Account'}
              </button>
            </form>

            <p className="text-center mt-4 small" style={{ color: '#8b949e' }}>
              Already have an account?{' '}
              <Link to="/" style={{ color: '#a78bfa', textDecoration: 'none' }}>Sign in</Link>
            </p>
          </>

        ) : (

          /* ── OTP FORM ───────────────────────────────────────────── */
          <>
            {/* Logo */}
            <div className="d-flex align-items-center gap-2 mb-4">
              <div className="avatar"><i className="bi bi-shield-fill-check" /></div>
              <span className="text-white fw-bold fs-5">HRFlow</span>
            </div>

            {/* Icon */}
            <div className="text-center mb-4">
              <div className="mx-auto d-flex align-items-center justify-content-center rounded-circle mb-3"
                style={{ width: 72, height: 72, background: 'rgba(124,58,237,0.1)', border: '2px solid rgba(124,58,237,0.3)' }}>
                <i className="bi bi-shield-lock fs-3" style={{ color: '#a78bfa' }} />
              </div>
              <h4 className="text-white fw-bold mb-1">Verify Your Email</h4>
              <p style={{ color: '#8b949e' }} className="small mb-0">We sent a 6-digit OTP to</p>
              <p className="fw-semibold small" style={{ color: '#a78bfa' }}>
                <i className="bi bi-envelope me-1" />{form.email}
              </p>
            </div>

            <form onSubmit={handleOtpSubmit}>
              <div className="mb-2">
                <label className="form-label" style={{ color: '#8b949e' }}>Enter OTP</label>
                <div className="input-group">
                  <span className="input-group-text"
                    style={{ background: '#21262d', border: '1px solid #30363d', color: '#8b949e' }}>
                    <i className="bi bi-key" />
                  </span>
                  <input
                    type="text"
                    className="form-control text-center"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    required
                    style={{ letterSpacing: '0.4em', fontSize: '1.2rem' }}
                  />
                </div>
              </div>

              {/* Resend */}
              <div className="text-end mb-4">
                <button type="button" onClick={handleResend}
                  className="btn btn-link btn-sm p-0 text-decoration-none"
                  style={{ color: '#a78bfa', fontSize: '0.8rem' }}>
                  <i className="bi bi-arrow-clockwise me-1" />Resend OTP
                </button>
              </div>

              <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold" disabled={loading}>
                {loading
                  ? <><span className="spinner-border spinner-border-sm me-2" />Verifying...</>
                  : <><i className="bi bi-check-circle me-2" />Verify OTP</>}
              </button>
            </form>

            {/* Back */}
            <button className="btn btn-link w-100 mt-3 text-decoration-none small"
              style={{ color: '#8b949e' }}
              onClick={() => { setShowOtp(false); setOtp('') }}>
              <i className="bi bi-arrow-left me-1" />Back to Register
            </button>
          </>
        )}

      </div>
    </div>
  )
}
