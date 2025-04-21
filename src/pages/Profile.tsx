
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to access your profile",
          variant: "destructive"
        });
        navigate("/auth");
        return;
      }

      setUser(user);
      setEmail(user.email || "");
      setLoading(false);
    };

    fetchUser();
  }, [navigate, toast]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Signed out successfully",
      });
      navigate("/");
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    
    try {
      // For a real implementation, this would update the user profile in Supabase
      toast({
        title: "Profile updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !user) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="w-16 h-16 border-8 border-black border-t-pink-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl">
      <h1 className="text-4xl font-bold mb-8 bg-black text-white inline-block px-4 py-2 transform -rotate-1">
        My Profile
      </h1>

      <div className="space-y-8">
        {/* Profile Information */}
        <Card className="border-8 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader className="border-b-4 border-black bg-yellow-400">
            <CardTitle className="text-2xl font-bold">Profile Information</CardTitle>
            <CardDescription className="text-black font-medium">
              Update your personal information
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-lg font-bold">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="border-4 border-black p-6 text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-lg font-bold">Email</Label>
                <Input
                  id="email"
                  value={email}
                  disabled
                  className="border-4 border-black p-6 text-lg bg-gray-100"
                />
                <p className="text-sm text-gray-500">Email cannot be changed</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              onClick={handleUpdateProfile}
              disabled={loading}
              className="bg-pink-500 hover:bg-pink-600 text-white border-4 border-black transform hover:-rotate-1 transition-transform py-6 text-lg font-bold"
            >
              {loading ? "Updating..." : "Update Profile"}
            </Button>
          </CardFooter>
        </Card>

        {/* Saved Resumes */}
        <Card className="border-8 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader className="border-b-4 border-black bg-blue-500">
            <CardTitle className="text-2xl font-bold text-white">My Resumes</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-lg text-gray-500 mb-4">You haven't created any resumes yet.</p>
              <Button 
                onClick={() => navigate('/builder')}
                className="bg-yellow-400 hover:bg-yellow-500 text-black border-4 border-black transform hover:rotate-1 transition-transform"
              >
                Create Your First Resume
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card className="border-8 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader className="border-b-4 border-black bg-red-500">
            <CardTitle className="text-2xl font-bold text-white">Account Settings</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="w-full border-4 border-black transform hover:rotate-1 transition-transform py-6 text-lg font-bold"
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
