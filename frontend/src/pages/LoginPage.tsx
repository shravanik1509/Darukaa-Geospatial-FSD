import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Mail, ShieldAlert, Sparkles, UserCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { getErrorMessage } from "../services/api";

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login({ email, password });
      navigate("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const setDemoCredentials = (role: "admin" | "analyst") => {
    if (role === "admin") {
      setEmail("admin@darukaa.earth");
      setPassword("Admin@123456");
    } else {
      setEmail("analyst@darukaa.earth");
      setPassword("Analyst@123456");
    }
  };

  return (
    <Card className="p-6 sm:p-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white tracking-tight">Sign In to Dashboard</h2>
        <p className="text-xs text-slate-400 mt-1">
          Access your global carbon offset and biodiversity project analytics
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@organization.earth"
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>

        <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isLoading}>
          Sign In
        </Button>
      </form>

      {/* 1-Click Demo Login Bar */}
      <div className="mt-6 pt-5 border-t border-slate-800">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Quick Demo Credentials
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setDemoCredentials("admin")}
            className="px-3 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-left text-xs transition"
          >
            <div className="font-semibold text-brand-400 flex items-center gap-1">
              <UserCheck className="w-3 h-3" /> Admin Demo
            </div>
            <div className="text-[10px] text-slate-400">Full Platform Control</div>
          </button>

          <button
            type="button"
            onClick={() => setDemoCredentials("analyst")}
            className="px-3 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-left text-xs transition"
          >
            <div className="font-semibold text-sky-400 flex items-center gap-1">
              <UserCheck className="w-3 h-3" /> Analyst Demo
            </div>
            <div className="text-[10px] text-slate-400">Read & Observations</div>
          </button>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-slate-400">
        Need an account?{" "}
        <Link to="/register" className="text-brand-400 hover:text-brand-300 font-semibold underline underline-offset-4">
          Register new user
        </Link>
      </div>
    </Card>
  );
};
