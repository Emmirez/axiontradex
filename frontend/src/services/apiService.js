import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
})

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth endpoints that should never trigger the refresh interceptor
const AUTH_ENDPOINTS = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/resend-verification',
  '/auth/verify-email',
  '/auth/refresh-token',
]

const isAuthEndpoint = (url = '') => {
  return AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint))
}

// Queue to hold requests while token is refreshing
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)))
  failedQueue = []
}

// Auto-refresh token on 401 — skips auth endpoints entirely
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    // Auth endpoint errors always bubble up directly to the component catch block
    if (isAuthEndpoint(original?.url)) {
      return Promise.reject(error)
    }

    // For protected routes — attempt token refresh once
    if (error.response?.status === 401 && !original._retry) {
      // If already refreshing, queue this request until done
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            original.headers.Authorization = `Bearer ${token}`
            return api(original)
          })
          .catch((err) => Promise.reject(err))
      }

      original._retry = true
      isRefreshing = true

      try {
        const { data } = await axios.post(
          `${BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        )
        const newToken = data.data.accessToken // ✅ fixed: was data.data.accessToken
        localStorage.setItem('accessToken', newToken)
        api.defaults.headers.Authorization = `Bearer ${newToken}`
        processQueue(null, newToken)
        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      } catch (err) {
        processQueue(err, null)
        localStorage.removeItem('accessToken')
        localStorage.removeItem('user')

        const authPages = ['/login', '/register', '/forgot-password']
        if (!authPages.includes(window.location.pathname)) {
          window.location.href = '/login'
        }

        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api