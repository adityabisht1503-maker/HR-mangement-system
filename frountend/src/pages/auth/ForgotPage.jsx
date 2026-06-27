import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

import api from '../../api'
import { toast } from 'react-toastify'

// Steps: 1 = find account, 2 = enter OTP, 3 = new password, 4 = success
const STEP = { FIND: 1, OTP: 2, PASSWORD: 3, SUCCESS: 4 }

export default function ForgotPage() {
  const [step, setStep]               = useState(STEP.FIND)
  const [email, setEmail]             = useState('')
  const [otp, setOtp]                 = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPass, setShowPass]       = useState(false)
  const [loading, setLoading]         = useState(false)
  const navigate = useNavigate()

  // ── Step 1: Find account by email ──────────────────────────────────
  const handleFindAccount = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/api/auth/findgmail', { email })
      toast.success('OTP sent to your email!')
      setStep(STEP.OTP)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Account not found.')
    } finally {
      setLoading(false)
    }
  }

  // ── Step 2: Verify OTP ─────────────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/api/auth/verify-otp', { email, otp })
      toast.success('OTP verified!')
      setStep(STEP.PASSWORD)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired OTP.')
    } finally {
      setLoading(false)
    }
  }

  // ── Step 3: Set new password ───────────────────────────────────────
  const handleSetPassword = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match.')
    if (newPassword.length < 8) return toast.error('Password must be at least 8 characters.')
    setLoading(true)
    try {
      await api.post('/api/auth/reset-password', { email, password: newPassword })
      toast.success('Password reset successfully!')
      setStep(STEP.SUCCESS)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password.')
    } finally {
      setLoading(false)
    }
  }

  // ── Step indicator ─────────────────────────────────────────────────
  const steps = ['Find Account', 'Verify OTP', 'New Password']
  const currentStepIndex = step - 1 // 0-based for display

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-4"
      style={{ background: '#0d1117' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div className="d-flex align-items-center gap-2 mb-4">
          <div className="avatar"><i className="bi bi-shield-fill-check" /></div>
          <span className="text-white fw-bold fs-5">HRFlow</span>
        </div>

        {/* Step indicator — only show during steps 1-3 */}
        {step !== STEP.SUCCESS && (
          <div className="d-flex align-items-center gap-2 mb-4">
            {steps.map((label, i) => {
              const done    = i < currentStepIndex
              const current = i === currentStepIndex
              return (
                <React.Fragment key={label}>
                  <div className="d-flex flex-column align-items-center" style={{ flex: 1 }}>
                    <div className="d-flex align-items-center justify-content-center rounded-circle mb-1"
                      style={{
                        width: 32, height: 32,
                        background: done ? '#10b981' : current ? '#7c3aed' : '#21262d',
                        border: `2px solid ${done ? '#10b981' : current ? '#7c3aed' : '#30363d'}`,
                        fontSize: '0.75rem', fontWeight: 700,
                        color: done || current ? '#fff' : '#8b949e',
                        transition: 'all 0.2s'
                      }}>
                      {done ? <i className="bi bi-check-lg" /> : i + 1}
                    </div>
                    <span style={{ fontSize: '0.65rem', color: current ? '#a78bfa' : '#8b949e', whiteSpace: 'nowrap' }}>
                      {label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div style={{
                      height: 2, flex: 2, marginBottom: 16,
                      background: done ? '#10b981' : '#30363d',
                      transition: 'background 0.3s'
                    }} />
                  )}
                </React.Fragment>
              )
            })}
          </div>
        )}

        {/* ── STEP 1: Find Account ──────────────────────────────────── */}
        {step === STEP.FIND && (
          <>
            <h4 className="text-white fw-bold mb-1">Forgot Password?</h4>
            <p style={{ color: '#8b949e' }} className="mb-4 small">
              Enter your email address and we'll send you an OTP to reset your password.
            </p>
            <form onSubmit={handleFindAccount}>
              <div className="mb-4">
                <label className="form-label" style={{ color: '#8b949e' }}>Email Address</label>
                <div className="input-group">
                  <span className="input-group-text"
                    style={{ background: '#21262d', border: '1px solid #30363d', color: '#8b949e' }}>
                    <i className="bi bi-envelope" />
                  </span>
                  <input type="email" className="form-control" placeholder="you@company.com"
                    value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
              </div>
              <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold" disabled={loading}>
                {loading
                  ? <><span className="spinner-border spinner-border-sm me-2" />Finding Account...</>
                  : <><i className="bi bi-search me-2" />Find Account</>}
              </button>
            </form>
            <div className="text-center mt-3">
              <Link to="/" className="small text-decoration-none" style={{ color: '#8b949e' }}>
                <i className="bi bi-arrow-left me-1" />Back to Login
              </Link>
            </div>
          </>
        )}

        {/* ── STEP 2: Verify OTP ───────────────────────────────────── */}
        {step === STEP.OTP && (
          <>
            <h4 className="text-white fw-bold mb-1">Verify OTP</h4>
            <p style={{ color: '#8b949e' }} className="mb-1 small">
              We sent a 6-digit OTP to
            </p>
            <p className="mb-4 small fw-semibold" style={{ color: '#a78bfa' }}>
              <i className="bi bi-envelope me-1" />{email}
            </p>

            <form onSubmit={handleVerifyOtp}>
              <div className="mb-2">
                <label className="form-label" style={{ color: '#8b949e' }}>Enter OTP</label>
                <div className="input-group">
                  <span className="input-group-text"
                    style={{ background: '#21262d', border: '1px solid #30363d', color: '#8b949e' }}>
                    <i className="bi bi-shield-lock" />
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    required
                    style={{ letterSpacing: '0.3em', fontSize: '1.1rem' }}
                  />
                </div>
              </div>
              <div className="mb-4 text-end">
                <button type="button" className="btn btn-link btn-sm p-0 text-decoration-none"
                  style={{ color: '#a78bfa', fontSize: '0.8rem' }}
                  onClick={() => { handleFindAccount({ preventDefault: () => {} }) }}>
                  <i className="bi bi-arrow-clockwise me-1" />Resend OTP
                </button>
              </div>
              <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold" disabled={loading}>
                {loading
                  ? <><span className="spinner-border spinner-border-sm me-2" />Verifying...</>
                  : <><i className="bi bi-check-circle me-2" />Verify OTP</>}
              </button>
            </form>

            <button className="btn btn-link w-100 mt-2 text-decoration-none small"
              style={{ color: '#8b949e' }} onClick={() => setStep(STEP.FIND)}>
              <i className="bi bi-arrow-left me-1" />Use different email
            </button>
          </>
        )}

        {/* ── STEP 3: New Password ─────────────────────────────────── */}
        {step === STEP.PASSWORD && (
          <>
            <h4 className="text-white fw-bold mb-1">Create New Password</h4>
            <p style={{ color: '#8b949e' }} className="mb-4 small">
              Choose a strong password for your account.
            </p>
            <form onSubmit={handleSetPassword}>
              <div className="mb-3">
                <label className="form-label" style={{ color: '#8b949e' }}>New Password</label>
                <div className="input-group">
                  <span className="input-group-text"
                    style={{ background: '#21262d', border: '1px solid #30363d', color: '#8b949e' }}>
                    <i className="bi bi-lock" />
                  </span>
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="form-control"
                    placeholder="Min 8 chars"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                  />
                  <button type="button" className="input-group-text"
                    onClick={() => setShowPass(s => !s)}
                    style={{ background: '#21262d', border: '1px solid #30363d', color: '#8b949e', cursor: 'pointer' }}>
                    <i className={`bi bi-${showPass ? 'eye-slash' : 'eye'}`} />
                  </button>
                </div>
              </div>
              <div className="mb-4">
                <label className="form-label" style={{ color: '#8b949e' }}>Confirm Password</label>
                <div className="input-group">
                  <span className="input-group-text"
                    style={{ background: '#21262d', border: '1px solid #30363d', color: '#8b949e' }}>
                    <i className="bi bi-lock-fill" />
                  </span>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                {/* Password match indicator */}
                {confirmPassword && (
                  <div className="mt-1" style={{ fontSize: '0.75rem' }}>
                    {newPassword === confirmPassword
                      ? <span style={{ color: '#10b981' }}><i className="bi bi-check-circle me-1" />Passwords match</span>
                      : <span style={{ color: '#ef4444' }}><i className="bi bi-x-circle me-1" />Passwords do not match</span>}
                  </div>
                )}
              </div>
              <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold" disabled={loading}>
                {loading
                  ? <><span className="spinner-border spinner-border-sm me-2" />Resetting...</>
                  : <><i className="bi bi-lock-fill me-2" />Reset Password</>}
              </button>
            </form>
          </>
        )}

        {/* ── STEP 4: Success ──────────────────────────────────────── */}
        {step === STEP.SUCCESS && (
          <div className="text-center py-4">
            <div className="mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle"
              style={{ width: 80, height: 80, background: 'rgba(16,185,129,0.1)', border: '2px solid rgba(16,185,129,0.3)' }}>
              <i className="bi bi-check-lg fs-2" style={{ color: '#10b981' }} />
            </div>
            <h4 className="text-white fw-bold mb-2">Password Reset!</h4>
            <p style={{ color: '#8b949e' }} className="mb-4 small">
              Your password has been reset successfully. You can now log in with your new password.
            </p>
            <button className="btn btn-primary w-100 py-2 fw-semibold" onClick={() => navigate('/')}>
              <i className="bi bi-box-arrow-in-right me-2" />Go to Login
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
