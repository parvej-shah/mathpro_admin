"use client";

import { useState, useEffect, useRef } from "react";
import lottie from "lottie-web";
import { useLogin } from "@/hooks/useAuth";
import { isLoggedIn } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mail, Lock, ShieldCheck } from "lucide-react";
import Link from "next/link";

const mathMotifs = [
  { value: "∫", className: "left-4 top-24 text-[8rem] md:text-[14rem]", rotation: "10deg", delay: "0s" },
  { value: "π", className: "right-3 top-1/4 text-[7rem] md:text-[12rem]", rotation: "-12deg", delay: "-3s" },
  { value: "√", className: "bottom-20 left-8 text-[7rem] md:text-[11rem]", rotation: "28deg", delay: "-6s" },
  { value: "∞", className: "bottom-8 right-12 text-[6rem] md:text-[10rem]", rotation: "-8deg", delay: "-9s" },
];

function AuthLottie() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const animation = lottie.loadAnimation({
      container: containerRef.current,
      renderer: "svg",
      loop: true,
      autoplay: true,
      path: "/assets/LottieFile/LottieOnlineEducation.json",
      rendererSettings: {
        preserveAspectRatio: "xMidYMid meet",
      },
    });

    return () => {
      animation.destroy();
    };
  }, []);

  return <div ref={containerRef} className="h-full w-full drop-shadow-2xl" aria-hidden />;
}

export default function LoginPage() {
  const login = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({ email: "", password: "" });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isLoggedIn()) {
      window.location.href = "/";
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setFormData((prev) => ({ ...prev, email: rememberedEmail, rememberMe: true }));
    }
  }, []);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    setErrors(newErrors as typeof errors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (formData.rememberMe) {
      localStorage.setItem("rememberedEmail", formData.email);
    } else {
      localStorage.removeItem("rememberedEmail");
    }

    login.mutate({ login: formData.email, password: formData.password });
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-section-a text-foreground">
      {/* Ambient blobs */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -left-24 -top-24 size-96 rounded-full bg-primary/12 blur-3xl" />
        <div className="absolute right-0 top-1/4 size-80 rounded-full bg-teal/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 size-72 rounded-full bg-accent/8 blur-3xl" />
      </div>

      {/* Grid overlay */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 opacity-80"
        style={{
          backgroundImage:
            "linear-gradient(to right, color-mix(in oklch, var(--primary) 10%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklch, var(--primary) 10%, transparent) 1px, transparent 1px)",
          backgroundSize: "38px 38px",
        }}
      />

      {/* Floating math motifs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 select-none overflow-hidden">
        {mathMotifs.map((motif) => (
          <span
            key={motif.value}
            className={`absolute font-serif font-black leading-none text-primary/10 animate-motif-float ${motif.className}`}
            style={{
              ["--motif-rot" as string]: motif.rotation,
              ["--motif-tx" as string]: "10px",
              ["--motif-ty" as string]: "-12px",
              ["--motif-dr" as string]: "2deg",
              animationDelay: motif.delay,
            }}
          >
            {motif.value}
          </span>
        ))}
      </div>

      {/* Two-column layout */}
      <section className="relative z-10 mx-auto grid min-h-screen w-[92%] max-w-7xl grid-cols-1 items-start gap-8 pb-10 pt-28 md:w-[88%] lg:min-h-[calc(100vh-7rem)] lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:pb-14 lg:pt-32">

        {/* Left — Lottie animation (desktop only) */}
        <div className="hidden min-h-[650px] items-center justify-center lg:flex lg:pt-8">
          <div className="relative flex min-h-[650px] w-full items-center justify-center">
            <div aria-hidden className="absolute inset-x-4 bottom-16 h-28 rounded-full bg-primary/12 blur-3xl" />
            <div aria-hidden className="absolute left-4 top-20 h-96 w-36 -rotate-12 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative h-[520px] w-full max-w-4xl">
              <AuthLottie />
            </div>
          </div>
        </div>

        {/* Right — Login form */}
        <div className="mx-auto w-full max-w-xl lg:pt-4">
          <div className="rounded-3xl border border-border/70 bg-card/88 p-5 shadow-2xl shadow-primary/10 backdrop-blur-xl sm:p-7">
            {/* Header */}
            <div className="mb-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="hidden size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 sm:flex">
                  <ShieldCheck className="size-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-primary">MathPro</p>
                  <h1 className="text-3xl font-extrabold leading-tight text-heading sm:text-[2.6rem]">
                    Welcome Back
                  </h1>
                </div>
              </div>
              <p className="text-base leading-7 text-muted-foreground">
                Sign in to access your admin dashboard
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold" htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="admin@mathpro.org"
                    autoComplete="email"
                    className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-3 text-base outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/25"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full rounded-lg border border-input bg-background pl-10 pr-10 py-3 text-base outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/25"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Remember me + Forgot password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberMe"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, rememberMe: checked as boolean }))
                    }
                  />
                  <Label htmlFor="rememberMe" className="text-sm font-normal cursor-pointer">
                    Remember me
                  </Label>
                </div>
                <Link
                  href="https://www.mathpro.org/auth/forgot-password"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={login.isPending}
                className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {login.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()}{" "}
              <a href="https://mathpro.org" className="font-medium text-primary hover:underline">
                Math Pro
              </a>
              . All rights reserved.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
