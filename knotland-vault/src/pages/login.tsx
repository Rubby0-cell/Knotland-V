import { useState } from "react";
import { Link, useLocation } from "wouter";
import { PublicLayout } from "@/components/layout/public-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { Mail, KeyRound, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setLocation("/dashboard");
    } catch (err: unknown) {
      toast({ title: "Access denied", description: err instanceof Error ? err.message : "Invalid credentials", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="flex-1 relative flex items-center justify-center px-4 py-32 min-h-screen">
        <div className="absolute inset-0 bg-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(196,26,26,0.12),transparent_60%)]" />

        <div className="relative w-full max-w-md opacity-0 animate-fade-up" style={{ animationFillMode: "forwards" }}>
          {/* Icon */}
          <div className="flex justify-center mb-10">
            <div className="relative w-16 h-16 animate-float">
              <div className="absolute inset-0 border border-primary/40 rotate-45" />
              <div className="absolute inset-3 border border-primary/15 rotate-45" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Lock className="w-5 h-5 text-primary/70" />
              </div>
            </div>
          </div>

          <div className="text-center mb-10">
            <h1 className="font-serif text-3xl tracking-[0.3em] text-white mb-3">MEMBER ACCESS</h1>
            <p className="font-display italic text-white/35 text-lg">Enter your credentials to open the vault</p>
          </div>

          <form onSubmit={handleLogin} className="glass rounded-sm p-8 space-y-6">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-[0.2em] text-white/40 font-sans">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <Input
                  id="email"
                  data-testid="input-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="member@example.com"
                  className="pl-10 bg-white/4 border-white/8 focus:border-primary/50 text-white placeholder:text-white/20 h-11"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-[0.2em] text-white/40 font-sans">Password</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <Input
                  id="password"
                  data-testid="input-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 bg-white/4 border-white/8 focus:border-primary/50 text-white placeholder:text-white/20 h-11"
                  required
                />
              </div>
            </div>

            <Button
              data-testid="button-submit-login"
              type="submit"
              disabled={loading}
              className="w-full h-12 text-xs uppercase tracking-[0.3em] bg-primary hover:bg-primary/90 text-white font-sans font-semibold animate-pulse-glow border-0"
            >
              {loading ? "Verifying..." : "Enter The Vault"}
            </Button>
          </form>

          <p className="text-center text-sm text-white/25 mt-6">
            Not a member?{" "}
            <Link href="/register" className="text-primary/80 hover:text-primary transition-colors">Apply for access</Link>
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
