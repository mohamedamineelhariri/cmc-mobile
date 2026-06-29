import { useEffect, useCallback } from "react";
import { router } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/api/endpoints";
import { setToken as persistToken, getToken } from "@/utils/storage";

export function useAuth() {
  const { user, token, isLoading, setUser, setToken, setLoading, logout: storeLogout } = useAuthStore();

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    setLoading(true);
    const stored = await getToken();
    if (stored) {
      setToken(stored);
      try {
        const me = await authApi.me();
        setUser(me);
      } catch {
        await persistToken(null);
        setToken(null);
      }
    }
    setLoading(false);
  };

  const login = useCallback(async (username: string, password: string) => {
    const res = await authApi.login(username, password);
    await persistToken(res.access_token);
    setToken(res.access_token);
    const me = await authApi.me();
    setUser(me);
    router.replace("/(tabs)");
  }, []);

  const logout = useCallback(async () => {
    await persistToken(null);
    storeLogout();
    router.replace("/(auth)/login");
  }, []);

  return { user, token, isLoading, login, logout, isAuthenticated: !!token && !!user };
}
