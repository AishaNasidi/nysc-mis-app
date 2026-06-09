import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import nyscLogo from "../assets/NYSC-LOGO.png";
import { supabase } from "../supabase/config";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const FEATURES = [
  "Automated corps member registration with 21-field profiles",
  "Instant ID card generation and printing",
  "Real-time reports, filters, and audit logging",
];

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async ({ email, password }) => {
    setLoading(true);
    setServerError("");
    try {
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw new Error(authError.message);

      const user = authData.user;
      const { data: profile } = await supabase
        .from("officers")
        .select("role")
        .eq("uid", user.id)
        .maybeSingle();

      if (!profile) {
        await supabase.auth.signOut();
        setServerError("Account not authorized. Contact your administrator.");
        return;
      }

      toast.success(`Welcome back!`);
      if (profile.role === "member") {
        navigate("/my-record");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setServerError(
        err.message === "Invalid login credentials"
          ? "Incorrect email or password."
          : err.message,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="relative flex-col items-center justify-center hidden px-12 overflow-hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-900 via-green-800 to-green-700">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 translate-x-32 -translate-y-32 rounded-full bg-white/5" />
        <div className="absolute bottom-0 left-0 -translate-x-48 translate-y-48 rounded-full w-96 h-96 bg-white/5" />

        <div className="relative z-10 max-w-md text-center">
          <img
            src={nyscLogo}
            alt="NYSC Logo"
            className="w-40 h-auto mx-auto mb-8 drop-shadow-2xl"
          />
          <h1 className="mb-3 text-2xl font-bold leading-snug text-white">
            Computerized NYSC Management Information System
          </h1>
          <p className="mb-8 text-sm text-green-200">
            NYSC State Coordination Office — Digital Records Platform
          </p>
          <ul className="space-y-3 text-left">
            {FEATURES.map((f) => (
              <li
                key={f}
                className="flex items-start gap-3 text-sm text-green-100"
              >
                <CheckCircle2 className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex items-center justify-center flex-1 px-6 py-12 bg-slate-50">
        <div className="w-full max-w-md animate-fadeIn">
          {/* Mobile logo */}
          <div className="flex flex-col items-center mb-8 lg:hidden">
            <img
              src={nyscLogo}
              alt="NYSC Logo"
              className="w-20 h-auto mb-3 drop-shadow"
            />
            <p className="text-sm text-center text-slate-500">
              NYSC Management Information System
            </p>
          </div>

          <div className="p-8 bg-white border shadow-xl rounded-2xl border-slate-100">
            <div className="mb-7">
              <h2 className="text-2xl font-bold text-slate-900">Sign in</h2>
              <p className="mt-1 text-sm text-slate-500">
                Enter your credentials to continue
              </p>
            </div>

            {serverError && (
              <div className="px-4 py-3 mb-5 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50">
                {serverError}
              </div>
            )}

            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="space-y-5"
            >
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-slate-400" />
                  <input
                    type="email"
                    {...register("email")}
                    placeholder="officer@nysc.gov.ng"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute -translate-y-1/2 right-3 top-1/2 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-800 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-green-700 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 rounded-full border-white/30 border-t-white animate-spin" />
                    Signing in…
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <p className="mt-6 text-xs text-center text-slate-400">
              NYSC CNMIS — Restricted Access. Authorised Personnel Only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
