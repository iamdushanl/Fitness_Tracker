import { useContext } from 'react';
import { AuthContext } from './authContextDef';

/**
 * Convenience hook — throws if used outside `<AuthProvider>`.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return ctx;
}
