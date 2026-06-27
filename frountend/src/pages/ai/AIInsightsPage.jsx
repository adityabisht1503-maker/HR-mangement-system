import React, { useState } from 'react'
import { aiAPI, employeeAPI } from '../../services/api.js'
import toast from 'react-hot-toast'

/* ── Employee Analyzer ─────────────────────────────────────────────────────── */
function EmployeeAnalyzer() {
  const [query,    setQuery]    = useState('')
  const [empId,    setEmpId]    = useState('')
  const [empName,  setEmpName]  = useState('')
  const [results,  setResults]  = useState([])
  const [analysis, setAnalysis] = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [message,  setMessage]  = useState('')  // ✅ new

  const QUICK_PROMPTS = [
    { label: '📋 Attendance',   text: 'Analyze his attendance record and highlight any issues.' },
    { label: '💰 Payroll',      text: 'Summarize his payroll and salary history.'               },
    { label: '🏖️ Leaves',      text: 'Give a summary of leaves taken and any concerns.'        },
    { label: '⭐ Performance',  text: 'Evaluate his overall performance and give suggestions.'  },
  ]

  const search = async (q) => {
    setQuery(q)
    if (q.length < 2) { setResults([]); return }
    try {
      const r = await employeeAPI.getAll({ search: q, limit: 5 })
      setResults(r.data.employees || [])
    } catch {}
  }

  const pick = (emp) => {
    setEmpId(emp._id)
    setEmpName(`${emp.personalInfo?.firstName} ${emp.personalInfo?.lastName}`)
    setQuery(`${emp.personalInfo?.firstName} ${emp.personalInfo?.lastName}`)
    setResults([])
  }

  const analyze = async () => {
    if (!empId)    return toast.error('Please select an employee.')
    if (!message.trim()) return toast.error('Please enter or select a question.')
    setLoading(true)
    setAnalysis(null)
    try {
      const r = await aiAPI.analyzeEmployee(empId, message)  // ✅ pass message
      setAnalysis(r.data.analysis)
      toast.success('Analysis complete!')
    } catch { toast.error('Analysis failed. Check KEY in backend .env') }
    finally { setLoading(false) }
  }

  return (
    <div>
      <div className="card mb-4">
        <div className="card-body">
          <h6 className="text-white fw-semibold mb-3">Select Employee to Analyze</h6>

          {/* Employee Search */}
          <div className="d-flex gap-2 mb-3">
            <div className="flex-grow-1 position-relative">
              <input
                type="text"
                className="form-control"
                placeholder="Search employee by name..."
                value={query}
                onChange={e => search(e.target.value)}
              />
              {results.length > 0 && (
                <div
                  className="position-absolute w-100 mt-1 rounded-3 overflow-hidden shadow-lg"
                  style={{ background: '#21262d', border: '1px solid #30363d', zIndex: 10 }}
                >
                  {results.map(emp => (
                    <div
                      key={emp._id}
                      className="d-flex align-items-center gap-3 px-3 py-2"
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#30363d'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      onClick={() => pick(emp)}
                    >
                      <div className="avatar avatar-sm">{emp.personalInfo?.firstName?.[0]}</div>
                      <div>
                        <div className="text-white small fw-semibold">
                          {emp.personalInfo?.firstName} {emp.personalInfo?.lastName}
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                          {emp.employeeCode} · {emp.jobInfo?.title}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {empId && (
            <small className=" mb-3 d-block">
              <i className="bi bi-check-circle text-success me-1" />{empName} selected
            </small>
          )}

          {/* ✅ Quick Prompt Buttons */}
          <div className="mb-3">
            <small className=" d-block mb-2">Quick Questions:</small>
            <div className="d-flex gap-2 flex-wrap">
              {QUICK_PROMPTS.map(p => (
                <button
                  key={p.label}
                  className="btn btn-sm"
                  onClick={() => setMessage(p.text)}
                  style={{
                    background  : message === p.text ? 'rgba(124,58,237,0.2)' : '#21262d',
                    color       : message === p.text ? '#a78bfa' : '#8b949e',
                    border      : message === p.text ? '1px solid #7c3aed' : '1px solid #30363d',
                    fontSize    : '0.75rem',
                    borderRadius: 8,
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* ✅ Custom Message Input */}
          <div className="d-flex gap-2">
            <input
              type="text"
              className="form-control"
              placeholder="Ask anything e.g. How is his performance this year?"
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && analyze()}
            />
            <button
              className="btn btn-primary d-flex align-items-center gap-2"
              onClick={analyze}
              disabled={loading || !empId || !message.trim()}
            >
              {loading
                ? <span className="spinner-border spinner-border-sm" />
                : <i className="bi bi-stars" />}
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Updated Results - answer + insights + recommendation */}
      {analysis && (
        <div className="row g-3">

          {/* Answer */}
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <small className=" d-block mb-2 text-uppercase fw-semibold" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                  <i className="bi bi-chat-left-text me-1" /> Response
                </small>
                <p className="text-white mb-0">{analysis.answer}</p>
              </div>
            </div>
          </div>

          {/* Insights */}
          <div className="col-md-8">
            <div className="card h-100">
              <div className="card-header">
                <h6 className="text-white mb-0 fw-semibold">
                  <i className="bi bi-lightbulb me-2" style={{ color: '#34d399' }} />Insights
                </h6>
              </div>
              <div className="card-body">
                {(analysis.insights || []).map((s, i) => (
                  <div key={i} className="d-flex gap-2 mb-2">
                    <span style={{ color: '#34d399', flexShrink: 0 }}>✓</span>
                    <p className="text-white small mb-0">{s}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommendation */}
          <div className="col-md-4">
            <div className="h-100 p-3 rounded-3" style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}>
              <div style={{ fontSize: '0.72rem', color: '#a78bfa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                <i className="bi bi-stars me-1" /> AI Recommendation
              </div>
              <p className="mb-0" style={{ color: '#c4b5fd', fontSize: '0.85rem' }}>{analysis.recommendation}</p>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}

/* ── JD Generator ──────────────────────────────────────────────────────────── */
function JDGenerator() {
  const [form,    setForm]    = useState({ title: '', department: '', level: 'Mid-level', skills: '' })
  const [result,  setResult]  = useState(null)
  const [loading, setLoading] = useState(false)
  const setF = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const generate = async () => {
    if (!form.title || !form.department) return toast.error('Title and department are required.')
    setLoading(true)
    try {
      const r = await aiAPI.generateJD({
        ...form,
        requirements: form.skills.split(',').map(s => s.trim()).filter(Boolean),
      })
      setResult(r.data.jobDescription)  // ✅ shape: { title, overview, responsibilities, requirements, benefits }
    } catch { toast.error('Generation failed. Check KEY in backend .env') }
    finally { setLoading(false) }
  }

  return (
    <div>
      <div className="card mb-4">
        <div className="card-body">
          <h6 className="text-white fw-semibold mb-3">Generate Job Description with AI</h6>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Job Title</label>
              <input type="text" className="form-control" placeholder="e.g. Senior React Developer" value={form.title} onChange={setF('title')} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Department</label>
              <input type="text" className="form-control" placeholder="e.g. Engineering" value={form.department} onChange={setF('department')} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Level</label>
              <select className="form-select" value={form.level} onChange={setF('level')}>
                {['Junior', 'Mid-level', 'Senior', 'Lead', 'Director'].map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Key Skills <small className="text-muted">(comma-separated)</small></label>
              <input type="text" className="form-control" placeholder="React, Node.js, MongoDB" value={form.skills} onChange={setF('skills')} />
            </div>
          </div>
          <button className="btn btn-primary mt-3 d-flex align-items-center gap-2" onClick={generate} disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm" /> : <i className="bi bi-file-text" />}
            {loading ? 'Generating...' : 'Generate Job Description'}
          </button>
        </div>
      </div>

      {/* ✅ Fixed: backend returns { title, overview, responsibilities, requirements, benefits } */}
      {result && (
        <div className="card">
          <div className="card-body">
            <h5 className="text-white fw-bold mb-3">{result.title}</h5>

            {result.overview && (
              <div className="mb-4">
                <h6 className="text-muted small text-uppercase fw-semibold mb-2">Overview</h6>
                <p className="text-white">{result.overview}</p>
              </div>
            )}

            {[
              ['responsibilities', 'Responsibilities', '#7c3aed'],
              ['requirements',     'Requirements',     '#10b981'],
              ['benefits',         'Benefits',         '#f59e0b'],
            ].map(([k, label, color]) => result[k] && (
              <div key={k} className="mb-4">
                <h6 className="small text-uppercase fw-semibold mb-2" style={{ color }}>{label}</h6>
                <ul className="mb-0" style={{ paddingLeft: '1.2rem' }}>
                  {result[k].map((item, i) => (
                    <li key={i} className="text-white small mb-1">{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── AI Chat ───────────────────────────────────────────────────────────────── */
function AIChat() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hi! I'm your HR AI Assistant. Ask me anything about HR policies, leave, payroll, or employee relations." }
  ])
  const [input,   setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = React.useRef(null)

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    if (!input.trim() || loading) return
    const msg = input.trim()
    setInput('')
    setMessages(m => [...m, { role: 'user', text: msg }])
    setLoading(true)
    try {
      const r = await aiAPI.chat(msg)
      // ✅ Fixed: backend returns r.data.answer — was r.data.response
      setMessages(m => [...m, { role: 'assistant', text: r.data.answer }])
    } catch {
      setMessages(m => [...m, { role: 'assistant', text: "Unable to connect. Check KEY in backend .env." }])
    } finally { setLoading(false) }
  }

  const SUGGESTED = ['What is the leave policy?', 'How to approve a leave?', 'Explain performance review process']

  return (
    <div className="card">
      <div className="card-header d-flex align-items-center gap-3">
        <div className="d-flex align-items-center justify-content-center rounded-3" style={{ width: 36, height: 36, background: '#7c3aed' }}>
          <i className="bi bi-robot text-white" />
        </div>
        <div>
          <div className="text-white fw-semibold small">HR AI Assistant</div>
          <div className="d-flex align-items-center gap-1" style={{ fontSize: '0.72rem', color: '#10b981' }}>
            <span className="rounded-circle d-inline-block" style={{ width: 6, height: 6, background: '#10b981' }} />
            Online
          </div>
        </div>
      </div>

      <div className="chat-area p-3 d-flex flex-column gap-3">
        {messages.map((msg, i) => (
          <div key={i} className={`d-flex ${msg.role === 'user' ? 'justify-content-end' : 'justify-content-start'} align-items-end gap-2`}>
            {msg.role === 'assistant' && (
              <div className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0" style={{ width: 28, height: 28, background: 'rgba(124,58,237,0.2)' }}>
                <i className="bi bi-stars" style={{ fontSize: '0.75rem', color: '#a78bfa' }} />
              </div>
            )}
            <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'} style={{ fontSize: '0.875rem' }}>
              {msg.text}
            </div>
            {msg.role === 'user' && (
              <div className="avatar avatar-sm flex-shrink-0"><i className="bi bi-person" /></div>
            )}
          </div>
        ))}
        {loading && (
          <div className="d-flex gap-2 align-items-end">
            <div className="d-flex align-items-center justify-content-center rounded-3" style={{ width: 28, height: 28, background: 'rgba(124,58,237,0.2)' }}>
              <i className="bi bi-stars" style={{ fontSize: '0.75rem', color: '#a78bfa' }} />
            </div>
            <div className="chat-bubble-assistant d-flex gap-1 align-items-center" style={{ padding: '10px 14px' }}>
              {[0, 1, 2].map(i => (
                <div key={i} className="rounded-circle" style={{ width: 6, height: 6, background: '#8b949e', animation: `bounce 0.6s ${i * 0.15}s infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="card-footer" style={{ background: 'transparent', borderColor: '#30363d' }}>
        <div className="d-flex gap-2 mb-2 flex-wrap">
          {SUGGESTED.map(q => (
            <button key={q} onClick={() => setInput(q)} className="btn btn-sm"
              style={{ background: '#21262d', color: '#8b949e', border: '1px solid #30363d', fontSize: '0.75rem', borderRadius: 8 }}>
              {q}
            </button>
          ))}
        </div>
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Ask about HR policies, leave, payroll..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
          />
          <button className="btn btn-primary" onClick={send} disabled={loading || !input.trim()}>
            <i className="bi bi-send-fill" />
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Main Page ─────────────────────────────────────────────────────────────── */
export default function AIInsightsPage() {
  const [tab, setTab] = useState('analyzer')
  const TABS = [
    { id: 'analyzer', icon: 'person-lines-fill', label: 'Employee Analyzer' },
    { id: 'jd',       icon: 'file-earmark-text', label: 'Job Description'   },
    { id: 'chat',     icon: 'robot',             label: 'AI Chat'            },
  ]

  return (
    <div>
      <div className="d-flex align-items-center gap-3 mb-4">
        <div className="d-flex align-items-center justify-content-center rounded-3"
          style={{ width: 44, height: 44, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.2)' }}>
          <i className="bi bi-stars fs-5" style={{ color: '#a78bfa' }} />
        </div>
        <div>
          <h4 className="text-white fw-bold mb-0">AI-Powered HR Insights</h4>
          <small className="text-muted">Powered by Gemini AI</small>
        </div>
      </div>

      <ul className="nav nav-pills mb-4 gap-1">
        {TABS.map(t => (
          <li key={t.id} className="nav-item">
            <button
              className={`nav-link d-flex align-items-center gap-2 ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
              style={tab !== t.id
                ? { background: 'transparent', color: '#8b949e', border: '1px solid #30363d' }
                : { background: '#7c3aed', border: '1px solid #7c3aed' }
              }
            >
              <i className={`bi bi-${t.icon}`} /> {t.label}
            </button>
          </li>
        ))}
      </ul>

      {tab === 'analyzer' && <EmployeeAnalyzer />}
      {tab === 'jd'       && <JDGenerator />}
      {tab === 'chat'     && <AIChat />}
    </div>
  )
}
