import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,  // ← kept your original baseURL
  timeout: 30000,
})

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
  login:          d => api.post('/auth/login', d),
  register:       d => api.post('/auth/register', d),
  me:             () => api.get('/auth/me'),
  forgotPassword: e => api.post('/auth/forgot-password', { email: e }),
  updateProfile:  d => api.patch('/auth/profile', d),
  changePassword: d => api.patch('/auth/password', d),
}

// ── Employees ─────────────────────────────────────────────────────────────────
export const employeeAPI = {
  getAll:  p       => api.get('/employees', { params: p }),
  getById: id      => api.get(`/employees/${id}`),
  getStats:()      => api.get('/employees/stats'),
  create:  d       => api.post('/employees', d),
  update:  (id, d) => api.put(`/employees/${id}`, d),
  getMe:   ()      => api.get('/employees/me'),
}

// ── Leaves ────────────────────────────────────────────────────────────────────
export const leaveAPI = {
  getAll:      p       => api.get('/leaves', { params: p }),
  create:      d       => api.post('/leaves', d),
  approve:     (id, d) => api.put(`/leaves/${id}/approve`, d),
  cancel:      id      => api.delete(`/leaves/${id}`),
  getMyLeaves: ()      => api.get('/leaves/my'),
  apply:       d       => api.post('/leaves/apply', d),
}

// ── Attendance ────────────────────────────────────────────────────────────────
export const attendanceAPI = {
  getMy:    () => api.get('/attendance/my'),
  clockIn:  () => api.post('/attendance/clock-in'),
  clockOut: () => api.post('/attendance/clock-out'),
}

// ── Payroll ───────────────────────────────────────────────────────────────────
export const payrollAPI = {
  getMyPayslips: () => api.get('/payroll/my'),
}

// ── Departments ───────────────────────────────────────────────────────────────
export const departmentAPI = {
  getAll: () => api.get('/departments'),
}

// ── AI ────────────────────────────────────────────────────────────────────────
export const aiAPI = {
  analyzeEmployee:   id  => api.post(`/ai/analyze-employee/${id}`),
  generateJD:        d   => api.post('/ai/generate-job-description', d),
  workforceInsights: ()  => api.get('/ai/workforce-insights'),
  chat:              msg => api.post('/ai/chat', { message: msg }),
}

export default api
