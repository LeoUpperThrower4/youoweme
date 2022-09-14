import { createContext, useContext, useState } from "react"

type AuthContextData = {
  username:  string | undefined
  setUsername : (username:  string ) => void
}

type AuthProviderProps = {
  children: React.ReactNode
}

const AuthContext = createContext({} as AuthContextData)

export function AuthProvider({ children }: AuthProviderProps) {
  const [username, setUsername] = useState<string | undefined>(undefined)

  return (
    <AuthContext.Provider value={{ username, setUsername }}>
      {children}
    </AuthContext.Provider>
  ) 
}

export function useAuth() {
  const context = useContext(AuthContext)

  return context
}