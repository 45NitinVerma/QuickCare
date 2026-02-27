import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { authApi, ROLE_MAP, setTokens, clearTokens, getToken } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [isLoading, setIsLoading] = useState(true); // true while restoring session

  // Map backend user response → frontend user object
  const mapUser = (u) => ({
    id:                   u.id,
    name:                 u.name,
    contact:              u.contact,
    email:                u.email || '',
    age:                  u.age   || null,
    gender:               u.gender || '',
    blood_group:          u.blood_group || '',
    role:                 ROLE_MAP[u.roles?.id] || 'Patient',
    roles:                u.roles,
    is_partial_onboarding:   u.is_partial_onboarding  || false,
    is_complete_onboarding:  u.is_complete_onboarding || false,
  });

  // Restore session from stored token on mount
  useEffect(() => {
    const restore = async () => {
      if (!getToken()) { setIsLoading(false); return; }
      try {
        const { data } = await authApi.me();
        setUser(mapUser(data));
      } catch {
        clearTokens();
      } finally {
        setIsLoading(false);
      }
    };
    restore();
  }, []);

  /**
   * Login with contact number + password.
   * Returns { success, role, error }
   */
  const login = useCallback(async (contact, password) => {
    try {
      const { data } = await authApi.login(contact, password);
      setTokens(data.access, data.refresh);
      const u = mapUser(data.user);
      setUser(u);
      return { 
        success: true, 
        role: u.role, 
        is_partial_onboarding: u.is_partial_onboarding,
        is_complete_onboarding: u.is_complete_onboarding 
      };
    } catch (err) {
      const msg = err.response?.data?.message
        || err.response?.data?.detail
        || 'Invalid credentials. Please try again.';
      return { success: false, error: msg };
    }
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
  }, []);

  /**
   * Call after OTP-verified registration completes and we have tokens.
   * Used by PatientRegister & HospitalAdminRegister to set the user.
   */
  const setUserFromTokens = useCallback((access, refresh, userData) => {
    // Only overwrite tokens if real values are passed
    // (PatientRegister step3 already stored tokens after step2 OTP verification)
    if (access && refresh) {
      setTokens(access, refresh);
    }
    setUser(mapUser(userData));
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, setUserFromTokens }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
