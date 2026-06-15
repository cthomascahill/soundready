import { createContext, useContext } from 'react';

const MOCK_USER = { id: 'local', email: 'local@soundready.app', full_name: 'Local User' };

const AuthContext = createContext({
  user: MOCK_USER,
  isAuthenticated: true,
  isLoadingAuth: false,
  authChecked: true,
  authError: null,
  appPublicSettings: null,
  logout: () => {},
  navigateToLogin: () => {},
});

export const AuthProvider = ({ children }) => (
  <AuthContext.Provider value={{
    user: MOCK_USER,
    isAuthenticated: true,
    isLoadingAuth: false,
    isLoadingPublicSettings: false,
    authChecked: true,
    authError: null,
    appPublicSettings: null,
    logout: () => {},
    navigateToLogin: () => {},
    checkAppState: () => {},
    checkUserAuth: () => {},
  }}>
    {children}
  </AuthContext.Provider>
);

export const useAuth = () => useContext(AuthContext);
