import { useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { useGetMyProfile } from "@workspace/api-client-react";
import { useLocation } from "wouter";

export function useProtectedRoute(adminOnly = false) {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: profile, isLoading: profileLoading } = useGetMyProfile({
    query: {
      enabled: !!user,
      retry: false,
    },
  });

  const loading = authLoading || (!!user && profileLoading);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        setLocation("/login");
      } else if (adminOnly && profile?.role !== "admin") {
        setLocation("/dashboard");
      }
    }
  }, [user, loading, adminOnly, profile, setLocation]);

  return { user, profile, loading };
}
