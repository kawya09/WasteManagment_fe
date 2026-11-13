import axios from "axios"

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL })

const isAuthRoute = (url?: string) => !!url && ["/auth/login", "/auth/register", "/auth/refresh"].some((p) => url.includes(p))

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ACCESS_TOKEN")
  if (token && !isAuthRoute(config.url)) config.headers.Authorization = `Bearer ${token}`
  return config
})

let refreshing: Promise<string> | null = null

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && original && !original._retry && !isAuthRoute(original.url)) {
      original._retry = true
      try {
        const refreshToken = localStorage.getItem("REFRESH_TOKEN")
        if (!refreshToken) throw new Error("No refresh token")
        refreshing ??= axios
          .post(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh`, { refreshToken })
          .then((r) => r.data.data.access_token as string)
          .finally(() => (refreshing = null))
        const token = await refreshing
        localStorage.setItem("ACCESS_TOKEN", token)
        original.headers.Authorization = `Bearer ${token}`
        return api(original)
      } catch {
        localStorage.removeItem("ACCESS_TOKEN")
        localStorage.removeItem("REFRESH_TOKEN")
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  }
)

export default api
