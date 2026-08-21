import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import type { LoginRequest, SignupRequest, UserDto } from "@aca/contracts";
import { setAccessToken } from "../../shared/api/token-store";
import { fetchMe, login as loginRequest, logoutSession, signup as signupRequest } from "./auth-api";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface AuthContextValue {
  status: AuthStatus;
  user: UserDto | null;
  /**
   * Calls `/auth/me`. With no access token yet, that 401s and the API
   * client's interceptor transparently refreshes using the HttpOnly
   * cookie — so this single call is also how a fresh page load silently
   * re-establishes an existing session, and how the OAuth callback screen
   * establishes the very first one.
   */
  refetchUser: () => Promise<boolean>;
  /** Unlike GitHub sign-in, signup/login return the session directly — no redirect, no refetch needed. */
  signup: (body: SignupRequest) => Promise<void>;
  login: (body: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }): ReactElement {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<UserDto | null>(null);

  const refetchUser = useCallback(async () => {
    try {
      const { user: fetchedUser } = await fetchMe();
      setUser(fetchedUser);
      setStatus("authenticated");
      return true;
    } catch {
      setAccessToken(null);
      setUser(null);
      setStatus("unauthenticated");
      return false;
    }
  }, []);

  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps --
     Restores an existing session on first mount by asking /auth/me — the 401
     interceptor in the API client transparently refreshes it from the
     HttpOnly cookie if one exists. The resulting setState is necessarily
     async (it depends on a network round trip), not a synchronous
     render-time update, so this is the standard fetch-on-mount pattern
     rather than the anti-pattern these rules guard against. Deliberately
     runs once on mount, not on every `refetchUser` identity change. */
  useEffect(() => {
    void refetchUser();
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  const signup = useCallback(async (body: SignupRequest) => {
    const result = await signupRequest(body);
    setAccessToken(result.accessToken);
    setUser(result.user);
    setStatus("authenticated");
  }, []);

  const login = useCallback(async (body: LoginRequest) => {
    const result = await loginRequest(body);
    setAccessToken(result.accessToken);
    setUser(result.user);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(async () => {
    await logoutSession().catch(() => undefined);
    setAccessToken(null);
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, refetchUser, signup, login, logout }),
    [status, user, refetchUser, signup, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
