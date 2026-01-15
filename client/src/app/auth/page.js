"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Mail, Lock, User, Phone, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

function AuthForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { isAuthenticated } = useAuth();

    const tabFromUrl = searchParams.get("tab") || "login";
    const [activeTab, setActiveTab] = useState(tabFromUrl);

    useEffect(() => {
        setActiveTab(tabFromUrl);
    }, [tabFromUrl]);

    useEffect(() => {
        if (isAuthenticated) {
            router.push("/");
        }
    }, [isAuthenticated, router]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        router.push(`/auth?tab=${tab}`, { scroll: false });
    };

    return (
        <div className="pt-20">
            <section className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-12 px-4 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5">
                <div className="w-full max-w-md">
                    {/* Card */}
                    <div className="bg-card/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border overflow-hidden">
                        {/* Tabs */}
                        <div className="flex border-b border-border">
                            <button
                                onClick={() => handleTabChange("login")}
                                className={`flex-1 py-4 text-center font-semibold transition-colors ${activeTab === "login"
                                    ? "text-primary border-b-2 border-primary bg-primary/5"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                Login
                            </button>
                            <button
                                onClick={() => handleTabChange("register")}
                                className={`flex-1 py-4 text-center font-semibold transition-colors ${activeTab === "register"
                                    ? "text-primary border-b-2 border-primary bg-primary/5"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                Register
                            </button>
                        </div>

                        <div className="p-6 md:p-8">
                            {activeTab === "login" && <LoginForm />}
                            {activeTab === "register" && <RegisterForm />}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error("Email and password are required");
            return;
        }

        setIsSubmitting(true);

        try {
            await login(email, password);
            sessionStorage.setItem("justLoggedIn", "true");
            toast.success("Login successful! Redirecting...");

            const returnUrl = searchParams.get("returnUrl") || searchParams.get("redirect");

            setTimeout(() => {
                router.push(returnUrl ? decodeURIComponent(returnUrl) : "/");
            }, 300);
        } catch (error) {
            const errorMessage = error.message || "Login failed. Please check your credentials.";

            if (errorMessage.toLowerCase().includes("verify") || errorMessage.toLowerCase().includes("verification")) {
                toast.error(
                    <div>
                        {errorMessage}{" "}
                        <Link href="/resend-verification" className="text-black font-medium underline">
                            Resend verification email
                        </Link>
                    </div>
                );
            } else {
                toast.error(errorMessage);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="text-center mb-6">
                <h1 className="font-display text-2xl font-bold text-foreground">Welcome Back</h1>
                <p className="text-muted-foreground text-sm mt-1">Sign in to your account</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="you@example.com"
                        className="w-full pl-11 pr-4 py-3 border border-input rounded-xl bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="w-full pl-11 pr-12 py-3 border border-input rounded-xl bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            <div className="text-right">
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                    Forgot password?
                </Link>
            </div>

            <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold" disabled={isSubmitting}>
                {isSubmitting ? (
                    <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Signing in...
                    </>
                ) : (
                    <>
                        Sign In
                        <ArrowRight className="h-5 w-5 ml-2" />
                    </>
                )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href="/auth?tab=register" className="text-primary font-medium hover:underline">
                    Register
                </Link>
            </p>
        </form>
    );
}

function RegisterForm() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register } = useAuth();
    const router = useRouter();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        if (formData.name.trim().length < 3) {
            toast.error("Name should be at least 3 characters");
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast.error("Please enter a valid email address");
            return false;
        }

        if (formData.password.length < 8) {
            toast.error("Password should be at least 8 characters");
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            await register({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
            });

            toast.success("Registration successful! Enter the OTP sent to your email.", { duration: 3000 });
            localStorage.setItem("registeredEmail", formData.email);

            setTimeout(() => {
                router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
            }, 600);
        } catch (error) {
            toast.error(error.message || "Registration failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="text-center mb-6">
                <h1 className="font-display text-2xl font-bold text-foreground">Create Account</h1>
                <p className="text-muted-foreground text-sm mt-1">Join DJ-Challenger today</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Your full name"
                        className="w-full pl-11 pr-4 py-3 border border-input rounded-xl bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="you@example.com"
                        className="w-full pl-11 pr-4 py-3 border border-input rounded-xl bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Phone (Optional)</label>
                <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 9876543210"
                        className="w-full pl-11 pr-4 py-3 border border-input rounded-xl bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder="Min 8 characters"
                        className="w-full pl-11 pr-12 py-3 border border-input rounded-xl bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Confirm Password</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                        type={showPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        placeholder="Confirm your password"
                        className="w-full pl-11 pr-4 py-3 border border-input rounded-xl bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    />
                </div>
            </div>

            <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold" disabled={isSubmitting}>
                {isSubmitting ? (
                    <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Registering...
                    </>
                ) : (
                    <>
                        Create Account
                        <ArrowRight className="h-5 w-5 ml-2" />
                    </>
                )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/auth?tab=login" className="text-primary font-medium hover:underline">
                    Sign In
                </Link>
            </p>
        </form>
    );
}

export default function AuthPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <AuthForm />
        </Suspense>
    );
}
