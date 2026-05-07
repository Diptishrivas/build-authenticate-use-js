import { useState, useEffect } from 'react'

const API = 'https://api.freeapi.app/api/v1/users'

async function api(endpoint, options = {}) {
  const res = await fetch(`${API}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...options,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Something went wrong')
  return data
}

function App() {
  const [view, setView] = useState('loading') // loading | login | register | dashboard
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null) // { type: 'error'|'success', text: '' }

  // Check if already logged in
  useEffect(() => {
    api('/current-user')
      .then(res => {
        setUser(res.data)
        setView('dashboard')
      })
      .catch(() => setView('login'))
  }, [])

  const showMsg = (type, text) => {
    setMsg({ type, text })
    setTimeout(() => setMsg(null), 4000)
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMsg(null)
    const fd = new FormData(e.target)
    try {
      await api('/register', {
        method: 'POST',
        body: JSON.stringify({
          username: fd.get('username'),
          email: fd.get('email'),
          password: fd.get('password'),
          role: 'ADMIN',
        }),
      })
      showMsg('success', 'Account created! Please login.')
      e.target.reset()
      setTimeout(() => setView('login'), 1000)
    } catch (err) {
      showMsg('error', err.message)
    }
    setLoading(false)
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMsg(null)
    const fd = new FormData(e.target)
    try {
      const res = await api('/login', {
        method: 'POST',
        body: JSON.stringify({
          username: fd.get('username'),
          password: fd.get('password'),
        }),
      })
      setUser(res.data.user)
      setView('dashboard')
      showMsg('success', 'Logged in successfully!')
    } catch (err) {
      showMsg('error', err.message)
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    setLoading(true)
    try {
      await api('/logout', { method: 'POST' })
      setUser(null)
      setView('login')
      showMsg('success', 'Logged out!')
    } catch (err) {
      showMsg('error', err.message)
    }
    setLoading(false)
  }

  if (view === 'loading') {
    return (
      <div className="page-loader">
        <div className="spinner"></div>
        <span>Loading...</span>
      </div>
    )
  }

  // ── Auth Forms ──
  if (view === 'login' || view === 'register') {
    return (
      <div className="auth-card">
        <h1>{view === 'login' ? 'Welcome back' : 'Create account'}</h1>
        <p className="subtitle">
          {view === 'login'
            ? 'Sign in to your account'
            : 'Register a new account'}
        </p>

        {msg && <div className={`msg ${msg.type}`}>{msg.text}</div>}

        <form onSubmit={view === 'login' ? handleLogin : handleRegister}>
          <div className="form-group">
            <label>Username</label>
            <input name="username" placeholder="e.g. johndoe" required />
          </div>

          {view === 'register' && (
            <div className="form-group">
              <label>Email</label>
              <input name="email" type="email" placeholder="you@example.com" required />
            </div>
          )}

          <div className="form-group">
            <label>Password</label>
            <input name="password" type="password" placeholder="••••••••" required minLength={6} />
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading && <div className="spinner"></div>}
            {view === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="toggle">
          {view === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <span onClick={() => { setView(view === 'login' ? 'register' : 'login'); setMsg(null) }}>
            {view === 'login' ? 'Register' : 'Sign In'}
          </span>
        </p>
      </div>
    )
  }

  // ── Dashboard ──
  return (
    <div className="dashboard">
      <div className="dash-header">
        <h1>My Profile</h1>
      </div>

      {msg && <div className={`msg ${msg.type}`}>{msg.text}</div>}

      <div className="profile-card">
        <div className="profile-top">
          <div className="avatar">
            {user?.username?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <div className="profile-name">{user?.username}</div>
            <span className="profile-role">{user?.role}</span>
          </div>
        </div>

        <div className="profile-details">
          <div className="detail-row">
            <span className="label">Email</span>
            <span className="value">{user?.email}</span>
          </div>
          <div className="detail-row">
            <span className="label">Email Verified</span>
            {user?.isEmailVerified ? (
              <span className="verified">✓ Verified</span>
            ) : (
              <span className="unverified">Not verified</span>
            )}
          </div>
          <div className="detail-row">
            <span className="label">Login Type</span>
            <span className="value">{user?.loginType || 'EMAIL_PASSWORD'}</span>
          </div>
          <div className="detail-row">
            <span className="label">Account Created</span>
            <span className="value">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
            </span>
          </div>
        </div>

        <div className="logout-section">
          <button className="btn btn-danger" onClick={handleLogout} disabled={loading}>
            {loading && <div className="spinner"></div>}
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
