import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,  // ← kept your original baseURL
  timeout: 30000,
})
const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`
  }
});

// ── Request interceptor ───────────────────────────────────────────────────────
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Response interceptor ─────────────────────────────────────────────────────
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('role')
      window.location.href = '/'
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  login:          d => api.post('/api/auth/', d),
  register:       d => api.post('/api/auth/register', d),
  me:             () => api.get('/api/auth/me'),
  forgotPassword: e => api.post('/api/auth/forgot-password', { email: e }),
  updateProfile:  d => api.patch('/api/auth/profile', d),
  changePassword: d => api.patch('/api/auth/password', d),
}
export const hrAPI = {
  getVerificationRequests: (status) => api.get('/api/hr/verifications', { params: { status } }),
  getVerificationStats:    ()       => api.get('/api/hr/verifications/stats'),
  approveUser:             (id)     => api.put(`/api/hr/verifications/${id}/approve`),
  rejectUser:              (id)     => api.delete(`/api/hr/verifications/${id}/reject`),
  revokeUser:              (id)     => api.put(`/api/hr/verifications/${id}/revoke`),
}
// ── Employees ─────────────────────────────────────────────────────────────────
export const employeeAPI = {
  getAll:  p       => api.get('/api/employees', { params: p }),
  getById: id      => api.get(`/api/employees/${id}`),
  getStats:()      => api.get('/api/employees/stats'),
  create:  d       => api.post('/api/employees', d),
  update:  (id, d) => api.put(`/api/employees/${id}`, d),
  getMe:   ()      => api.get('/api/employees/me'),
delete: (id) => api.delete(`/api/employees/${id}`)
}

// ── Leaves ────────────────────────────────────────────────────────────────────
export const leaveAPI = {
  getAll:      p       => api.get('/api/leaves', { params: p }),
  create:      d       => api.post('/api/leaves', d),
  approve:     (id, d) => api.put(`/api/leaves/${id}/approve`, d),
  cancel:      id      => api.delete(`/api/leaves/${id}`),
  getMyLeaves: ()      => api.get('/api/leaves/my'),
  apply:       d       => api.post('/api/leaves/apply', d),
}

// ── Attendance ────────────────────────────────────────────────────────────────
export const attendanceAPI = {
  getMy:    () => api.get('/api/attendance/my'),
  clockIn:  () => api.post('/api/attendance/clock-in'),
  clockOut: () => api.post('/api/attendance/clock-out'),
}

// ── Payroll ───────────────────────────────────────────────────────────────────
export const payrollAPI = {
  // Admin/HR — fetch all payslips (pagination + filters)
  getAll: (params) => api.get('/api/payroll/',{params}),
  //  params: { page, limit, month, status }

  // Admin/HR — create a new payslip
  create: (data) => api.post('/api/payroll', data),
  //  body: { employee, month, basicSalary, allowances, deductions }

  // Admin/HR — mark a payslip as paid
  markAsPaid: (id) => api.put(`/api/payroll/${id}/pay`),

  // Employee — fetch own payslips
  getMine: () => api.get('/api/payroll/my'),
   getMyPayslips: ()       => api.get('/api/payroll/my'),
}

// ── Departments ───────────────────────────────────────────────────────────────
export const departmentAPI = {
  getAll: () => api.get('/api/departments'),
  create: d=> api.post('/api/departments/create',d),
  delete: (id)=>api.delete(`/api/departments/delete/${id}`),
}

// ── AI ────────────────────────────────────────────────────────────────────────
export const aiAPI = {
  analyzeEmployee: (id, message) => api.post(`/api/ai/analyze/${id}`, { message }),
  generateJD:        d   => api.post('/api/ai/generate-job-description', d),
  workforceInsights: ()  => api.get('/api/ai/workforce-insights'),
  chat:              msg => api.post('/api/ai/chat', { message: msg }),
}

export default api
