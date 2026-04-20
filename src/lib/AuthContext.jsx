import React, { createContext, useState, useContext, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth as firebaseAuth, db } from '@/api/firebase';
import { base44 } from '@/api/base44Client';

const AuthContext = createContext();

const getUserProfile = async (firebaseUser) => {
  const ref = doc(db, 'users', firebaseUser.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    // Create profile on first sign-in
    const profile = {
      email: firebaseUser.email,
      full_name: firebaseUser.displayName ?? '',
      role: 'user',
      onboarding_completed: false,
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString(),
    };
    await setDoc(ref, profile);
    return { id: firebaseUser.uid, ...profile };
  }
  const profile = snap.data();
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email,
    full_name: profile.full_name ?? firebaseUser.displayName ?? '',
    ...profile,
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!firebaseAuth) return;
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await getUserProfile(firebaseUser);
          setUser(profile);
          setIsAuthenticated(true);

          // Send welcome email on first login
          const welcomeKey = `welcome_sent_${firebaseUser.email}`;
          if (!localStorage.getItem(welcomeKey) && firebaseUser.email) {
            localStorage.setItem(welcomeKey, '1');
            base44.functions
              .invoke('sendWelcomeEmail', { data: { email: firebaseUser.email, full_name: firebaseUser.displayName } })
              .catch(() => {});
          }
        } catch (err) {
          console.error('Failed to load user profile:', err);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setIsLoadingAuth(false);
      setAuthChecked(true);
    });

    return unsubscribe;
  }, []);

  const logout = (shouldRedirect = true) => {
    signOut(firebaseAuth).then(() => {
      setUser(null);
      setIsAuthenticated(false);
      if (shouldRedirect) window.location.href = '/';
    });
  };

  const navigateToLogin = () => {
    sessionStorage.setItem('auth_redirect', window.location.href);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings: false,
      authChecked,
      authError: null,
      appPublicSettings: null,
      logout,
      navigateToLogin,
      checkAppState: () => {},
      checkUserAuth: () => {},
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
