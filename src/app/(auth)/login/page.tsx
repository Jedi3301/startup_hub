"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Card,
  CardBody,
  Input,
  Button,
  Divider,
  cn,
} from "@nextui-org/react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ChevronRight,
  ShieldCheck,
  Briefcase,
} from "lucide-react";

import { LoginSchema, LoginInput } from "@/lib/validations/auth";
import { useAuth } from "@/providers/app-providers";
import { loginUser } from "@/app/actions/auth-actions";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const onSubmit = async (data: LoginInput) => {
    setIsSubmitting(true);
    setSubmitFeedback(null);
    
    try {
      // Call actual Server Action
      const res = await loginUser(data);
      
      if (!res.success) {
        setSubmitFeedback({
          type: "error",
          message: res.error || "Invalid credentials. Please try again.",
        });
        setIsSubmitting(false);
        return;
      }

      const authenticatedUser = res.user!;
      
      // Save authenticated user in React context & cookie
      login(authenticatedUser);

      setSubmitFeedback({
        type: "success",
        message: `Welcome back, ${authenticatedUser.legalName}! Redirecting...`,
      });

      setTimeout(() => {
        router.push(authenticatedUser.role === "Founder" ? "/founder" : "/dashboard");
      }, 1000);
    } catch (error: any) {
      setSubmitFeedback({
        type: "error",
        message: error.message || "Invalid credentials. Please try again.",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/* Decorative background grid and gradients */}
      <div className="absolute inset-0 -z-10 bg-background bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      <div className="absolute top-1/4 left-1/4 -z-10 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 w-96 h-96 bg-secondary/20 rounded-full blur-[100px] animate-pulse delay-75" />

      <div className="w-full max-w-md">
        {/* Branding Logo */}
        <div className="flex items-center gap-2 justify-center mb-8 font-bold text-2xl tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          <Briefcase className="w-8 h-8 text-primary" />
          <span>StartupHub</span>
        </div>

        {/* Auth Glassmorphism Card */}
        <Card className="border border-divider bg-background/50 backdrop-blur-lg shadow-2xl rounded-3xl">
          <CardBody className="p-8">
            {/* Header info */}
            <div className="mb-6">
              <h2 className="text-xl font-bold tracking-tight mb-2">Welcome Back</h2>
              <p className="text-xs text-default-500">
                Log in to discover startups, vote, and pitch contributions.
              </p>
            </div>

            {/* Submission Feedback Alert */}
            <AnimatePresence>
              {submitFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={cn(
                    "p-4 rounded-xl border mb-6 text-xs flex gap-3 items-start",
                    submitFeedback.type === "success"
                      ? "bg-success-50/10 border-success/20 text-success"
                      : "bg-danger-50/10 border-danger/20 text-danger"
                  )}
                >
                  <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">
                      {submitFeedback.type === "success" ? "Success" : "Error"}
                    </span>
                    <span>{submitFeedback.message}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <Input
                {...register("email")}
                type="email"
                label="Email Address"
                placeholder="Enter your email"
                variant="bordered"
                labelPlacement="outside"
                startContent={<Mail className="text-default-400 w-4 h-4" />}
                isInvalid={!!errors.email}
                errorMessage={errors.email?.message}
                classNames={{
                  inputWrapper: "border-divider hover:border-foreground/30 focus-within:!border-primary",
                }}
              />

              <Input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                label="Password"
                placeholder="Enter your password"
                variant="bordered"
                labelPlacement="outside"
                startContent={<Lock className="text-default-400 w-4 h-4" />}
                endContent={
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="text-default-400 hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                }
                isInvalid={!!errors.password}
                errorMessage={errors.password?.message}
                classNames={{
                  inputWrapper: "border-divider hover:border-foreground/30 focus-within:!border-primary",
                }}
              />

              <div className="flex justify-between items-center text-xs">
                <span className="text-default-500">
                  Tip: Use email containing "founder" to log in as Founder.
                </span>
                <button
                  type="button"
                  className="text-primary hover:underline font-semibold"
                >
                  Forgot?
                </button>
              </div>

              <Button
                type="submit"
                color="primary"
                className="w-full font-bold shadow-lg shadow-primary/20"
                isLoading={isSubmitting}
                endContent={!isSubmitting && <ChevronRight className="w-4 h-4" />}
              >
                Sign In
              </Button>
            </form>

            <Divider className="my-6 bg-divider" />

            <div className="text-center">
              <p className="text-xs text-default-500">
                New to the hub?{" "}
                <Link href="/signup" className="text-primary font-bold hover:underline">
                  Create an account
                </Link>
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
