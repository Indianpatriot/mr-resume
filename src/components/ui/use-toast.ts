
// Import the toast functionality from our hooks
import { useToast as useHookToast, toast } from "@/hooks/use-toast";

// Re-export them for use in the application
export { toast };
export const useToast = useHookToast;
