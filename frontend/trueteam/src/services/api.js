const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
 
async function request(path, options = {}) {
  const token = localStorage.getItem('token')
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
 
  const json = await res.json().catch(() => ({}))
 
  // token expire ho gaya ya galat hai -> AuthContext ko batao ki logout kare
  if (res.status === 401 && !path.startsWith('/auth/login')) {
    window.dispatchEvent(new Event('auth:logout'))
  }
 
  if (!res.ok) throw new Error(json.message || 'Something went wrong')
  return json
}
 
export const api = {
  get: (p) => request(p),
  post: (p, body) => request(p, { method: 'POST', body }),
  patch: (p, body) => request(p, { method: 'PATCH', body }),
  del: (p) => request(p, { method: 'DELETE' }),
}
 