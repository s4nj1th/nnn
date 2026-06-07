"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Brain, Eye, EyeOff, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { BackButton } from "@/components/ui/back-button";
import { createClient } from "@/lib/supabase/client";
import { useUIStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";

const signupSchema = z.object({
    email: z.string().email("Please enter a valid email"),
    username: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(30, "Username must be at most 30 characters")
        .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Include at least one uppercase letter")
        .regex(/[0-9]/, "Include at least one number"),
});

type SignupForm = z.infer<typeof signupSchema>;

const passwordRules = [
    { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
    { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
    { label: "One number", test: (p: string) => /[0-9]/.test(p) },
];

export default function SignupPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [password, setPassword] = useState("");
    const { addToast } = useUIStore();

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm<SignupForm>({ resolver: zodResolver(signupSchema) });

    const onSubmit = async (data: SignupForm) => {
        setIsLoading(true);
        try {
            const supabase = createClient();
            const { error } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: { username: data.username },
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) {
                setError("root", { message: error.message });
                return;
            }

            addToast({
                type: "success",
                title: "Account created!",
                description: "Check your email to verify your account.",
            });
            // Redirect to a verification page or show a message
            router.push("/verify-email");
            router.refresh();
        } catch {
            setError("root", {
                message: "An unexpected error occurred. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const passwordFieldProps = register("password", {
        onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
            setPassword(e.target.value),
    });

    return (
        <div className="min-h-screen bg-background font-sans">
            <header className="px-6 h-16 flex items-center justify-between border-b border-border">
                <div className="flex items-center gap-4">
                    <BackButton href="/" />
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                            <Brain className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <span className="text-sm font-bold text-foreground">
                            Neural Network Nook
                        </span>
                    </Link>
                </div>
                <ThemeToggle />
            </header>

            <main className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-sm">
                    <div className="mb-8 text-center">
                        <h1 className="text-2xl font-bold text-foreground mb-2">
                            Create your account
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Start building neural networks for free. Please
                            confirm your email after signing up.
                        </p>
                    </div>

                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-4"
                        noValidate
                    >
                        <Input
                            {...register("email")}
                            type="email"
                            label="Email"
                            placeholder="you@example.com"
                            error={errors.email?.message}
                            autoComplete="email"
                            autoFocus
                        />

                        <Input
                            {...register("username")}
                            type="text"
                            label="Username"
                            placeholder="your_username"
                            error={errors.username?.message}
                            autoComplete="username"
                        />

                        <div>
                            <Input
                                {...passwordFieldProps}
                                type={showPassword ? "text" : "password"}
                                label="Password"
                                placeholder="Create a strong password"
                                error={errors.password?.message}
                                autoComplete="new-password"
                                rightIcon={
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="hover:text-foreground transition-colors"
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                }
                            />
                            {password.length > 0 && (
                                <div className="mt-2 space-y-1">
                                    {passwordRules.map((rule) => (
                                        <div
                                            key={rule.label}
                                            className="flex items-center gap-2"
                                        >
                                            <div
                                                className={cn(
                                                    "w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
                                                    rule.test(password)
                                                        ? "bg-nnn-success"
                                                        : "bg-border",
                                                )}
                                            >
                                                {rule.test(password) && (
                                                    <Check className="w-2 h-2 text-white" />
                                                )}
                                            </div>
                                            <span
                                                className={cn(
                                                    "text-xs transition-colors",
                                                    rule.test(password)
                                                        ? "text-nnn-success"
                                                        : "text-muted-foreground",
                                                )}
                                            >
                                                {rule.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {errors.root && (
                            <p
                                className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2"
                                role="alert"
                            >
                                {errors.root.message}
                            </p>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            variant="accent"
                            size="lg"
                            isLoading={isLoading}
                        >
                            {!isLoading && (
                                <>
                                    Create Account
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </form>

                    <p className="mt-6 text-center text-xs text-muted-foreground">
                        By creating an account you agree to our{" "}
                        <Link
                            href="/terms"
                            className="text-primary hover:underline"
                        >
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link
                            href="/privacy"
                            className="text-primary hover:underline"
                        >
                            Privacy Policy
                        </Link>
                        .
                    </p>

                    <p className="mt-4 text-center text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="text-primary hover:underline font-medium"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </main>
        </div>
    );
}
