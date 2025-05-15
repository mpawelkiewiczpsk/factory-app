import axios from 'axios'

export const axiosInstance = axios.create({
  baseURL: '/api/',
  timeout: 1000,
})

let isRefreshing = false
let refreshSubscribers = []

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb)
}

function onRefreshed(newToken) {
  refreshSubscribers.forEach((callback) => callback(newToken))
  refreshSubscribers = []
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true

      if (!isRefreshing) {
        isRefreshing = true
        try {
          const { data } = await axiosInstance.post('refresh')
          const newToken = data.accessToken
          onRefreshed(newToken)
          isRefreshing = false
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError)
          window.location.href = '/login'
          return Promise.reject(refreshError)
        }
      }

      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((newToken) => {
          resolve(axiosInstance(originalRequest))
        })
      })
    }

    return Promise.reject(error)
  },
)
