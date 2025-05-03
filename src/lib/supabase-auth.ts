
import { supabase } from "@/integrations/supabase/client";

/**
 * Get current user ID or return anonymous
 */
export const getCurrentUserId = async (): Promise<string> => {
  try {
    const { data } = await supabase.auth.getUser();
    return data.user?.id || 'anonymous';
  } catch (error) {
    console.error('Error getting user ID:', error);
    return 'anonymous';
  }
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
