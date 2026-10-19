import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '../services/api'

const AuthContext = createContext(null)

function readJSON(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback
  } catch {
    return fallback
  }
}

// "Employee" in the sign-up form = employee. Everything else = HR side.
export function roleFromJob(jobRole) {
  return jobRole === 'Employee' ? 'employee' : 'hr'
}

export function homeFor(role) {
  return role === 'hr' ? '/hr/dashboard' : '/employee/dashboard'
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readJSON('user', null))

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }, [])

  // api.js 401 milne par yeh event bhejta hai (token expire ho gaya)
  useEffect(() => {
    window.addEventListener('auth:logout', logout)
    return () => window.removeEventListener('auth:logout', logout)
  }, [logout])

  // app khulte hi check karo ki saved login abhi bhi sahi hai
  useEffect(() => {
    if (!localStorage.getItem('token')) {
      // purana demo user bacha hai bina token ke, hata do
      if (user) logout()
      return
    }
    api
      .get('/auth/me')
      .then(({ data }) => {
        setUser(data)
        localStorage.setItem('user', JSON.stringify(data))
      })
      .catch(() => {
        // 401 ho to api.js khud logout kara dega; network error pe login rehne do
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ab yeh async hai. galat password pe error throw karta hai
  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email: email.trim(), password })
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }

  // Public signup band hai. Accounts HR banata hai (POST /api/auth/users).
  function register() {
    throw new Error('Accounts are created by your HR team. Please contact HR.')
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}