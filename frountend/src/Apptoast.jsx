

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const toastIcons = {
  success: (
    <span style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      width: '22px', height: '22px', borderRadius: '50%',
      backgroundColor: 'rgba(34,197,94,0.15)', flexShrink: 0,
    }}>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M2 6l3 3 5-5" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </span>
  ),
  error: (
    <span style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      width: '22px', height: '22px', borderRadius: '50%',
      backgroundColor: 'rgba(239,68,68,0.15)', flexShrink: 0,
    }}>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M3 3l6 6M9 3l-6 6" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    </span>
  ),
  warning: (
    <span style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      width: '22px', height: '22px', borderRadius: '50%',
      backgroundColor: 'rgba(234,179,8,0.15)', flexShrink: 0,
    }}>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M6 2v5M6 9.5v.5" stroke="#eab308" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    </span>
  ),
  info: (
    <span style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      width: '22px', height: '22px', borderRadius: '50%',
      backgroundColor: 'rgba(139,92,246,0.15)', flexShrink: 0,
    }}>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M6 5v4M6 3v.5" stroke="#a78bfa" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    </span>
  ),
};

const toastStyle = {
  backgroundColor: '#13151f',
  color: '#e2e8f0',
  borderRadius: '10px',
  border: '1px solid rgba(139, 92, 246, 0.2)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(139,92,246,0.08)',
  fontSize: '13.5px',
  fontWeight: '450',
  fontFamily: 'Inter, system-ui, sans-serif',
  letterSpacing: '0.01em',
  padding: '14px 16px',
  minHeight: '56px',
  backdropFilter: 'blur(12px)',
};

const progressStyle = {
  background: 'linear-gradient(90deg, #7c3aed, #a78bfa)',
  height: '2px',
};

const containerStyle = {
  top: '20px',
  right: '20px',
  width: '340px',
};

const AppToast = () => {
  return (
    <ToastContainer
      position="top-right"
      autoClose={4000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      pauseOnHover
      draggable={false}
      theme="dark"
      toastStyle={toastStyle}
      progressStyle={progressStyle}
      style={containerStyle}
      icon={({ type }) => toastIcons[type] ?? null}
    />
  );
};

export default AppToast;