
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Link } from "react-router-dom";
import { SidebarProvider, Sidebar, SidebarContent, SidebarTrigger, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarHeader, SidebarFooter } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle, User, Home } from "lucide-react";

const MainLayout = () => {
  const [user, setUser] = useState(null);

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
              <Button asChild variant="outline" className="w-full border-4 border-black transform hover:rotate-1 transition-transform">
                <Link to="/profile">
                  <User className="mr-2 h-4 w-4" />
                  My Profile
                </Link>
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
              {!user && (
                <Button asChild variant="outline" className="border-4 border-black transform hover:rotate-1 transition-transform">
                  <Link to="/auth">Sign In</Link>
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
