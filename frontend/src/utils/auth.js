// Helper functions for authentication
// These help us save and retrieve login information

export const getAuthToken = () => {
  return localStorage.getItem('token')
}

export const setAuthToken = (token) => {
  localStorage.setItem('token', token)
}

export const getUser = () => {
  const userStr = localStorage.getItem('user')
  return userStr ? JSON.parse(userStr) : null
}

export const setUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user))
}

export const clearAuth = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

