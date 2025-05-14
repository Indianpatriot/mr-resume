
import { useState, useEffect } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { SidebarProvider, Sidebar, SidebarContent, SidebarTrigger, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarHeader, SidebarFooter } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle, User, Home, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const MainLayout = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };

    getSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event);
        setUser(session?.user || null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Sign out failed",
        description: "An error occurred while signing out.",
        variant: "destructive",
      });
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-100">
        <Sidebar className="border-r-8 border-black">
          <SidebarHeader className="p-4">
            <Link to="/" className="flex items-center justify-center">
              <h1 className="text-2xl font-bold bg-yellow-400 px-4 py-2 border-4 border-black transform -rotate-1">MR.<span className="text-pink-500">RESUME</span></h1>
            </Link>
          </SidebarHeader>
          <SidebarContent className="p-2">
            <SidebarGroup>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to="/" className="flex items-center gap-2">
                      <Home className="w-5 h-5" />
                      <span>Home</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to="/builder" className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      <span>Resume Builder</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to="/ats-checker" className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      <span>ATS Checker</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to="/profile" className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      <span>Profile</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-4">
            {user ? (
              <Button 
                onClick={handleSignOut}
                variant="outline" 
                className="w-full border-4 border-black transform hover:rotate-1 transition-transform flex items-center justify-center"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            ) : (
              <Button asChild className="w-full bg-pink-500 hover:bg-pink-600 border-4 border-black transform hover:-rotate-1 transition-transform">
                <Link to="/auth">Sign In</Link>
              </Button>
            )}
          </SidebarFooter>
        </Sidebar>
        
        <div className="flex-1">
          <header className="bg-white border-b-8 border-black p-4 flex justify-between items-center">
            <div className="flex items-center">
              <SidebarTrigger className="mr-4" />
              <h2 className="text-xl font-bold">MR.RESUME</h2>
            </div>
            <div>
              {!user ? (
                <Button asChild variant="outline" className="border-4 border-black transform hover:rotate-1 transition-transform">
                  <Link to="/auth">Sign In</Link>
                </Button>
              ) : (
                <Button 
                  onClick={handleSignOut}
                  variant="outline" 
                  className="border-4 border-black transform hover:rotate-1 transition-transform flex items-center"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              )}
            </div>
          </header>
          <main className="p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
