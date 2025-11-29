import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { login as apiLogin, register as apiRegister, googleLogin as apiGoogleLogin, LoginData, RegisterData } from "@/services/api";

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  googleLogin: (idToken: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if token exists in localStorage on mount
    const storedToken = localStorage.getItem("auth_token");
    if (storedToken) {
      setToken(storedToken);
    }
    setIsLoading(false);
  }, []);

  const login = async (data: LoginData) => {
    const response = await apiLogin(data);
    localStorage.setItem("auth_token", response.access_token);
    setToken(response.access_token);
  };

  const register = async (data: RegisterData) => {
    const response = await apiRegister(data);
    localStorage.setItem("auth_token", response.access_token);
    setToken(response.access_token);
  };

  const googleLogin = async (idToken: string) => {
    const response = await apiGoogleLogin(idToken);
    localStorage.setItem("auth_token", response.access_token);
    setToken(response.access_token);
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!token,
        token,
        login,
        register,
        googleLogin,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
