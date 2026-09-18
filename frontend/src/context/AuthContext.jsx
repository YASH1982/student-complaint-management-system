import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

const AuthContext = createContext()

let logoutHandler = null

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    sessionStorage.getItem('token')
  )

  const [user, setUser] = useState(() => {
    const savedUser = sessionStorage.getItem('user')

    return savedUser
      ? JSON.parse(savedUser)
      : null
  })

  const login = (loginData) => {
    const { token, ...userData } = loginData

    sessionStorage.setItem('token', token)
    sessionStorage.setItem(
      'user',
      JSON.stringify(userData)
    )

    setToken(token)
    setUser(userData)
  }

  const logout = () => {
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')

    setToken(null)
    setUser(null)
  }

  useEffect(() => {
    logoutHandler = logout

    return () => {
      logoutHandler = null
    }
  }, [])

  const isAuthenticated = !!token

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function forceLogout() {
  if (logoutHandler) {
    logoutHandler()
  }
}

export function useAuth() {
  return useContext(AuthContext)
}