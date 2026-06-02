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
  RadioGroup,
  Radio,
  Divider,
  cn,
} from "@nextui-org/react";
import {
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  Briefcase,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

import { RegisterSchema, RegisterInput } from "@/lib/validations/auth";
import { useAuth } from "@/providers/app-providers";
import { registerUser } from "@/app/actions/auth-actions";
import Link from "next/link";

export default function SignupPage() {
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
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      legalName: "",
      email: "",
      role: "Contributor",
      password: "",
    },
  });

  const selectedRole = watch("role");

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const onSubmit = async (data: RegisterInput) => {
    setIsSubmitting(true);
    setSubmitFeedback(null);

    try {
      // Call actual Server Action to save user to Neon database
      const res = await registerUser(data);
      
      if (!res.success) {
        setSubmitFeedback({
          type: "error",
          message: res.error || "Registration failed. Please try again.",
        });
        setIsSubmitting(false);
        return;
      }

      const registeredUser = res.user!;
      
      // Save user state in React context & cookie
      login(registeredUser);

      setSubmitFeedback({
        type: "success",
        message: `Registration complete! Welcome ${registeredUser.legalName}. Redirecting...`,
      });

      setTimeout(() => {
        router.push(registeredUser.role === "Founder" ? "/founder" : "/dashboard");
      }, 1000);
    } catch (error: any) {
      setSubmitFeedback({
        type: "error",
        message: error.message || "Registration failed. Please try again.",
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

      <div className="w-full max-w-lg">
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
              <h2 className="text-xl font-bold tracking-tight mb-2">Create Account</h2>
              <p className="text-xs text-default-500">
                Register as Founder to list startups or Contributor to offer your skills.
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
                    "p-4 rounded-xl border mb-6 text-sm flex gap-3 items-start",
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
                {...register("legalName")}
                type="text"
                label="Legal Name"
                placeholder="Enter your legal full name"
                variant="bordered"
                labelPlacement="outside"
                startContent={<UserIcon className="text-default-400 w-4 h-4" />}
                isInvalid={!!errors.legalName}
                errorMessage={errors.legalName?.message}
                classNames={{
                  inputWrapper: "border-divider hover:border-foreground/30 focus-within:!border-primary",
                }}
              />

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

              <RadioGroup
                label="Select Your Profile Role"
                value={selectedRole}
                onValueChange={(val) =>
                  setValue("role", val as "Founder" | "Contributor")
                }
                orientation="horizontal"
                classNames={{
                  label: "text-sm text-default-600 mb-2",
                }}
              >
                <div className="grid grid-cols-2 gap-4 w-full">
                  <Radio
                    value="Founder"
                    classNames={{
                      base: cn(
                        "inline-flex m-0 bg-content1 hover:bg-content2 items-center justify-between",
                        "flex-row-reverse w-full cursor-pointer rounded-xl gap-2 p-4 border border-divider",
                        "data-[selected=true]:border-primary"
                      ),
                    }}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-semibold flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-primary" /> Founder
                      </span>
                      <span className="text-xs text-default-400">Launch & list startup</span>
                    </div>
                  </Radio>
                  <Radio
                    value="Contributor"
                    classNames={{
                      base: cn(
                        "inline-flex m-0 bg-content1 hover:bg-content2 items-center justify-between",
                        "flex-row-reverse w-full cursor-pointer rounded-xl gap-2 p-4 border border-divider",
                        "data-[selected=true]:border-primary"
                      ),
                    }}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-semibold flex items-center gap-1.5">
                        <UserIcon className="w-3.5 h-3.5 text-primary" /> Contributor
                      </span>
                      <span className="text-xs text-default-400">Pitch skills & fund</span>
                    </div>
                  </Radio>
                </div>
              </RadioGroup>

              <Input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                label="Password"
                placeholder="Create a strong password"
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

              {/* Password requirements hint checklist */}
              <div className="bg-default-50 p-3 rounded-lg border border-divider space-y-1">
                <p className="text-[11px] font-semibold text-default-500 uppercase tracking-wider">
                  Security Check
                </p>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                  <div className="flex items-center gap-1.5 text-xs">
                    <div className={cn("w-1.5 h-1.5 rounded-full", watch("password")?.length >= 8 ? "bg-success" : "bg-default-300")} />
                    <span className={cn(watch("password")?.length >= 8 ? "text-success font-medium" : "text-default-500")}>Min 8 characters</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <div className={cn("w-1.5 h-1.5 rounded-full", /[A-Z]/.test(watch("password") || "") ? "bg-success" : "bg-default-300")} />
                    <span className={cn(/[A-Z]/.test(watch("password") || "") ? "text-success font-medium" : "text-default-500")}>1 Uppercase (A-Z)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <div className={cn("w-1.5 h-1.5 rounded-full", /[a-z]/.test(watch("password") || "") ? "bg-success" : "bg-default-300")} />
                    <span className={cn(/[a-z]/.test(watch("password") || "") ? "text-success font-medium" : "text-default-500")}>1 Lowercase (a-z)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <div className={cn("w-1.5 h-1.5 rounded-full", /[0-9]/.test(watch("password") || "") ? "bg-success" : "bg-default-300")} />
                    <span className={cn(/[0-9]/.test(watch("password") || "") ? "text-success font-medium" : "text-default-500")}>1 Number (0-9)</span>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                color="primary"
                className="w-full font-bold shadow-lg shadow-primary/20"
                isLoading={isSubmitting}
                endContent={!isSubmitting && <ChevronRight className="w-4 h-4" />}
              >
                Create Account
              </Button>
            </form>

            <Divider className="my-6 bg-divider" />

            <div className="text-center">
              <p className="text-xs text-default-500">
                Already have an account?{" "}
                <Link href="/login" className="text-primary font-bold hover:underline">
                  Sign In
                </Link>
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
