"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@nextui-org/react";
import { useAuth, GlobalErrorBoundary } from "@/providers/app-providers";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, initialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (initialized && !user) {
      router.replace("/login");
    }
  }, [initialized, user, router]);

  if (!initialized || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
        <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-content1/50 backdrop-blur-md border border-divider">
          <Spinner size="lg" label="Verifying security session..." color="primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-default-50/50">
      <GlobalErrorBoundary>
        {children}
      </GlobalErrorBoundary>
    </div>
  );
}
