import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Rocket } from "lucide-react";

export default function Register() {
  const handleRegister = async () => {
    await base44.auth.redirectToRegister("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        {/* Logo */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 border border-primary/20">
            <Rocket className="h-6 w-6 text-primary" />
          </div>
          <h1 className="font-heading text-3xl font-bold">
            <span className="text-primary">Sound</span>Ready
          </h1>
          <p className="text-muted-foreground">Create your account</p>
        </div>

        {/* Form */}
        <div className="rounded-2xl bg-card border border-border p-8 space-y-5">
          <p className="text-sm text-muted-foreground text-center">Create a new account to get started with SoundReady.</p>
          <Button
            onClick={handleRegister}
            className="w-full h-11 text-base font-semibold"
          >
            Sign Up
          </Button>
        </div>

        {/* Login link */}
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}