
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        toast({
          title: "Successfully logged in",
          description: "Welcome back to MR.RESUME!",
        });
        navigate("/builder");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (error) throw error;
        
        toast({
          title: "Registration successful!",
          description: "Please check your email to confirm your registration.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-8 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform rotate-1">
        <CardHeader className="border-b-4 border-black bg-yellow-400">
          <CardTitle className={`text-3xl font-bold ${!isLogin ? "-rotate-1" : "rotate-1"} inline-block bg-white px-2 text-black`}>
            {isLogin ? "Login" : "Sign Up"}
          </CardTitle>
          <CardDescription className="text-black font-medium">
            {isLogin ? "Access your resume builder account" : "Create a new account to get started"}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleAuth}>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-lg font-bold">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                className="border-4 border-black p-6 text-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-lg font-bold">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="border-4 border-black p-6 text-lg"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white border-4 border-black p-6 text-lg font-bold transform hover:-rotate-1 transition-transform"
            >
              {loading ? "Processing..." : isLogin ? "Login" : "Sign Up"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full border-4 border-black p-6 text-lg font-bold transform hover:rotate-1 transition-transform"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Need an account? Sign up" : "Already have an account? Login"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Auth;
