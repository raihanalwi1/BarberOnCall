// Isi file src/navigation/AuthContext.tsx lu harusnya gini cuy:
import { createContext, useContext } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  userId: string | null; 
  login: (id: string) => Promise<void>; // 👈 Dibuat Promise karena fungsi lu pake async
  logout: () => Promise<void>;          // 👈 Dibuat Promise karena fungsi lu pake async
}

export const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  userId: null,
  login: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);