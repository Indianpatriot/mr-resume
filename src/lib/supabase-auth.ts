
import { supabase } from "@/integrations/supabase/client";

/**
 * Get current user ID or return anonymous
 */
export const getCurrentUserId = (): string => {
  return supabase.auth.getUser().then(({ data }) => {
    return data.user?.id || 'anonymous';
  }).catch(() => 'anonymous');
};

/**
 * Get access token for authenticated requests
 */
export const getAccessToken = async (): Promise<string | null> => {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || null;
};

/**
 * Check if user is logged in
 */
export const isLoggedIn = async (): Promise<boolean> => {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
};
