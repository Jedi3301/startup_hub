"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Card,
  CardBody,
  Input,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  User as UserAvatar,
  Textarea,
  Divider,
  Tabs,
  Tab,
  cn,
  Spinner,
} from "@nextui-org/react";
import {
  Rocket,
  TrendingUp,
  TrendingDown,
  Layers,
  Check,
  X,
  PlusCircle,
  Eye,
  Settings,
  Trash2,
  ArrowLeft,
  LogOut,
  Pencil,
  Save,
  FileText,
} from "lucide-react";
import { LayoutBuilder } from "@/components/founder/layout-builder";
import { StartupWithRelations, CustomizationLayout } from "@/lib/types/startup";
import { TicketStatus } from "@prisma/client";
import { useAuth } from "@/providers/app-providers";
import { getFounderStartup, registerStartup, updateStartupLayout, updateStartupProfile } from "@/app/actions/startup-actions";
import { updateTicketStatus } from "@/app/actions/contribution-actions";

// Zod Validation Schema for Startup Onboarding Wizard
const OnboardingSchema = z.object({
  name: z.string().min(3, "Startup name must be at least 3 characters"),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  logoUrl: z.string().url("Must be a valid URL").or(z.literal("")),
  oneLiner: z.string().min(10, "One-liner must be at least 10 characters"),
  technologiesText: z.string().min(2, "List at least one technology tag separated by commas"),
});

type OnboardingInput = z.infer<typeof OnboardingSchema>;

export default function FounderConsolePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  // Enforce Founder role access control
  useEffect(() => {
    if (user && user.role !== "Founder") {
      router.replace("/dashboard");
    }
  }, [user, router]);

  const [startup, setStartup] = useState<StartupWithRelations | null>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasStartup, setHasStartup] = useState(false);
  const [isOnboardingSubmitting, setIsOnboardingSubmitting] = useState(false);

  // Onboarding Wizard Form hook
  const {
    register,
    handleSubmit,
    formState: { errors: onboardingErrors },
    reset: resetOnboarding,
  } = useForm<OnboardingInput>({
    resolver: zodResolver(OnboardingSchema),
    defaultValues: {
      name: "",
      slug: "",
      logoUrl: "",
      oneLiner: "",
      technologiesText: "",
    },
  });

  // Fetch founder's startup on load or user change
  useEffect(() => {
    async function loadFounderStartup() {
      if (!user) return;
      try {
        const data = await getFounderStartup(user.id);
        if (data) {
          setStartup(data);
          setTickets(data.contributionTickets || []);
          setHasStartup(true);
        } else {
          setHasStartup(false);
        }
      } catch (err) {
        console.error("Failed to load founder startup from database:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadFounderStartup();
  }, [user]);

  const handleOnboardingSubmit = async (data: OnboardingInput) => {
    if (!user) return;
    setIsOnboardingSubmitting(true);
    try {
      await registerStartup({
        founderId: user.id,
        name: data.name,
        slug: data.slug,
        logoUrl: data.logoUrl || null,
        oneLiner: data.oneLiner,
        technologies: data.technologiesText.split(",").map((t) => t.trim()),
      });

      // Query full relations of newly created startup
      const startupDetails = await getFounderStartup(user.id);
      if (startupDetails) {
        setStartup(startupDetails);
        setTickets(startupDetails.contributionTickets || []);
        setHasStartup(true);
      }
      resetOnboarding();
    } catch (err) {
      console.error("Failed to register startup to database:", err);
    } finally {
      setIsOnboardingSubmitting(false);
    }
  };

  const handleLayoutSave = async (updatedLayout: CustomizationLayout) => {
    if (!user || !startup) return;
    try {
      await updateStartupLayout(user.id, updatedLayout);
      setStartup((prev) => prev ? {
        ...prev,
        customizationLayout: updatedLayout,
      } : null);
    } catch (err) {
      console.error("Failed to save customization layout:", err);
    }
  };

  // --- Profile Editor State ---
  const [profileName, setProfileName] = useState("");
  const [profileSlug, setProfileSlug] = useState("");
  const [profileLogoUrl, setProfileLogoUrl] = useState("");
  const [profileOneLiner, setProfileOneLiner] = useState("");
  const [profileSummary, setProfileSummary] = useState("");
  const [profileTechnologies, setProfileTechnologies] = useState("");
  const [profileFundingStage, setProfileFundingStage] = useState("");
  const [profileMrr, setProfileMrr] = useState("");
  const [profileUsersCount, setProfileUsersCount] = useState("");
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [profileSaveMessage, setProfileSaveMessage] = useState<string | null>(null);

  // Sync profile editor fields when startup data loads
  useEffect(() => {
    if (startup) {
      setProfileName(startup.name || "");
      setProfileSlug(startup.slug || "");
      setProfileLogoUrl(startup.logoUrl || "");
      setProfileOneLiner(startup.oneLiner || "");
      setProfileSummary(startup.summaryMarkdown || "");
      setProfileTechnologies(startup.technologies?.join(", ") || "");
      setProfileFundingStage(startup.metricsJson?.fundingStage || "");
      setProfileMrr(startup.metricsJson?.mrr?.toString() || "");
      setProfileUsersCount(startup.metricsJson?.usersCount?.toString() || "");
    }
  }, [startup]);

  const handleProfileSave = async () => {
    if (!user || !startup) return;
    setIsProfileSaving(true);
    setProfileSaveMessage(null);
    try {
      await updateStartupProfile(user.id, {
        name: profileName,
        slug: profileSlug,
        logoUrl: profileLogoUrl || null,
        oneLiner: profileOneLiner,
        summaryMarkdown: profileSummary,
        technologies: profileTechnologies.split(",").map((t) => t.trim()).filter(Boolean),
        metricsJson: {
          fundingStage: profileFundingStage || undefined,
          mrr: profileMrr ? Number(profileMrr) : undefined,
          usersCount: profileUsersCount ? Number(profileUsersCount) : undefined,
        },
      });

      // Refresh startup data after save
      const refreshed = await getFounderStartup(user.id);
      if (refreshed) {
        setStartup(refreshed);
        setTickets(refreshed.contributionTickets || []);
      }
      setProfileSaveMessage("Profile saved successfully!");
      setTimeout(() => setProfileSaveMessage(null), 3000);
    } catch (err) {
      console.error("Failed to save startup profile:", err);
      setProfileSaveMessage("Failed to save. Please try again.");
    } finally {
      setIsProfileSaving(false);
    }
  };

  const handleTicketStatusChange = async (ticketId: string, status: TicketStatus) => {
    try {
      await updateTicketStatus(ticketId, status);
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, status } : t))
      );
    } catch (err) {
      console.error("Failed to update contribution ticket status:", err);
    }
  };

  const handleResetStartup = () => {
    // Direct view state reset
    setHasStartup(false);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-4">
        <Spinner label="Loading founder telemetry console..." size="lg" />
      </div>
    );
  }

  // Safe fallback properties
  const primaryColor = startup?.customizationLayout?.primaryColor || "#3b82f6";

  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl space-y-8 min-h-screen">
      <AnimatePresence mode="wait">
        {!hasStartup ? (
          /* View State 1: Onboarding Wizard */
          <motion.div
            key="onboarding-state"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-2xl mx-auto space-y-6"
          >
            <div className="flex justify-between items-center w-full">
              <Button
                variant="light"
                onPress={() => router.push("/dashboard")}
                startContent={<ArrowLeft className="w-4 h-4" />}
                className="font-semibold text-xs text-default-500"
              >
                Back to Dashboard
              </Button>
              <Button
                variant="light"
                color="danger"
                onPress={() => {
                  logout();
                  router.push("/login");
                }}
                startContent={<LogOut className="w-4 h-4" />}
                className="font-semibold text-xs"
              >
                Log Out
              </Button>
            </div>

            <div className="space-y-2 text-center">
              <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-2xl mx-auto">
                <Rocket className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">Onboard Your Startup</h1>
              <p className="text-sm text-default-500 max-w-sm mx-auto">
                List your startup on the hub to source skilled contribution tickets and receive upvotes.
              </p>
            </div>

            <Card className="border border-divider bg-background/50 backdrop-blur-md p-6">
              <CardBody>
                <form
                  onSubmit={handleSubmit(handleOnboardingSubmit)}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <Input
                      {...register("name")}
                      label="Startup Name"
                      placeholder="e.g., OrbitPay"
                      variant="bordered"
                      labelPlacement="outside"
                      isInvalid={!!onboardingErrors.name}
                      errorMessage={onboardingErrors.name?.message}
                      classNames={{ inputWrapper: "border-divider hover:border-foreground/30 focus-within:!border-primary" }}
                    />
                    <Input
                      {...register("slug")}
                      label="Public Slug URL"
                      placeholder="e.g., orbitpay"
                      variant="bordered"
                      labelPlacement="outside"
                      isInvalid={!!onboardingErrors.slug}
                      errorMessage={onboardingErrors.slug?.message}
                      classNames={{ inputWrapper: "border-divider hover:border-foreground/30 focus-within:!border-primary" }}
                    />
                  </div>

                  <Input
                    {...register("logoUrl")}
                    label="Logo Image URL"
                    placeholder="https://images.unsplash.com/..."
                    variant="bordered"
                    labelPlacement="outside"
                    isInvalid={!!onboardingErrors.logoUrl}
                    errorMessage={onboardingErrors.logoUrl?.message}
                    classNames={{ inputWrapper: "border-divider hover:border-foreground/30 focus-within:!border-primary" }}
                  />

                  <Input
                    {...register("oneLiner")}
                    label="One-Liner Hook"
                    placeholder="Describe your startup value proposition in one sentence..."
                    variant="bordered"
                    labelPlacement="outside"
                    isInvalid={!!onboardingErrors.oneLiner}
                    errorMessage={onboardingErrors.oneLiner?.message}
                    classNames={{ inputWrapper: "border-divider hover:border-foreground/30 focus-within:!border-primary" }}
                  />

                  <Textarea
                    {...register("technologiesText")}
                    label="Technologies (Separated by commas)"
                    placeholder="React, Next.js, Go, Redis, Docker"
                    variant="bordered"
                    labelPlacement="outside"
                    isInvalid={!!onboardingErrors.technologiesText}
                    errorMessage={onboardingErrors.technologiesText?.message}
                    classNames={{ inputWrapper: "border-divider hover:border-foreground/30 focus-within:!border-primary" }}
                  />

                  <Button
                    type="submit"
                    color="primary"
                    className="w-full font-bold shadow-lg shadow-primary/20"
                    isLoading={isOnboardingSubmitting}
                    endContent={<Check className="w-4 h-4" />}
                  >
                    Register Startup
                  </Button>
                </form>
              </CardBody>
            </Card>
          </motion.div>
        ) : (
          /* View State 2: Active Founder Console */
          <motion.div
            key="dashboard-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8 animate-fade-in"
          >
            {/* Header branding */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-2 border-b border-divider/60">
              <div className="flex items-center gap-4">
                <Rocket className="w-8 h-8 text-primary" style={{ color: primaryColor }} />
                <div>
                  <h1 className="text-3xl font-extrabold tracking-tight">Founder Console</h1>
                  <p className="text-sm text-default-500">
                    Manage <strong className="text-foreground">{startup!.name}</strong> telemetry and layout controls.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  color="primary"
                  variant="flat"
                  onPress={() => router.push("/dashboard")}
                  startContent={<ArrowLeft className="w-4 h-4" />}
                  className="font-semibold text-xs"
                >
                  Back to Dashboard
                </Button>
                <Button
                  color="danger"
                  variant="flat"
                  size="sm"
                  onClick={handleResetStartup}
                  startContent={<Trash2 className="w-4 h-4" />}
                  className="font-semibold text-xs"
                >
                  Reset Startup
                </Button>
                <Button
                  color="danger"
                  variant="light"
                  onPress={() => {
                    logout();
                    router.push("/login");
                  }}
                  startContent={<LogOut className="w-4 h-4" />}
                  className="font-semibold text-xs"
                >
                  Log Out
                </Button>
              </div>
            </div>

            {/* Quick Analytics Telemetry row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Card className="border border-divider bg-background/50 backdrop-blur-md">
                <CardBody className="p-6 flex flex-row items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-default-400 uppercase tracking-wider block">
                      Upvotes Received
                    </span>
                    <span className="text-3xl font-black text-success mt-1 inline-block">
                      {startup!.upvoteCount}
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-success-50/10 text-success flex items-center justify-center border border-success/20">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </CardBody>
              </Card>

              <Card className="border border-divider bg-background/50 backdrop-blur-md">
                <CardBody className="p-6 flex flex-row items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-default-400 uppercase tracking-wider block">
                      Downvotes Received
                    </span>
                    <span className="text-3xl font-black text-danger mt-1 inline-block">
                      {startup!.downvoteCount}
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-danger-50/10 text-danger flex items-center justify-center border border-danger/20">
                    <TrendingDown className="w-6 h-6" />
                  </div>
                </CardBody>
              </Card>

              <Card className="border border-divider bg-background/50 backdrop-blur-md">
                <CardBody className="p-6 flex flex-row items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-default-400 uppercase tracking-wider block">
                      Active Tickets
                    </span>
                    <span className="text-3xl font-black text-primary mt-1 inline-block" style={{ color: primaryColor }}>
                      {tickets.filter((t) => t.status === "PENDING").length}
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-primary-50/10 text-primary flex items-center justify-center border border-primary/20" style={{ color: primaryColor, borderColor: primaryColor + "20" }}>
                    <Layers className="w-6 h-6" />
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Split layout: Tickets list vs Layout Builder config */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Tickets Ledger Table */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-xl font-bold tracking-tight">Pending Contribution Tickets</h3>
                
                <Card className="border border-divider bg-background/50 backdrop-blur-md">
                  <CardBody className="p-0">
                    {tickets.length > 0 ? (
                      <Table aria-label="Contribution tickets ledger" className="shadow-none border-none">
                        <TableHeader>
                          <TableColumn className="font-bold bg-transparent">CONTRIBUTOR</TableColumn>
                          <TableColumn className="font-bold bg-transparent">PROPOSAL DETAILS</TableColumn>
                          <TableColumn className="font-bold bg-transparent">COMMITMENT</TableColumn>
                          <TableColumn className="font-bold bg-transparent text-right">DECISION</TableColumn>
                        </TableHeader>
                        <TableBody>
                          {tickets.map((ticket) => (
                            <TableRow key={ticket.id} className="border-b border-divider/60 last:border-0 hover:bg-default-50/50">
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="text-sm font-semibold">{ticket.user?.legalName || "Unknown Contributor"}</span>
                                  <span className="text-xs text-default-400">{ticket.user?.email || ""}</span>
                                </div>
                              </TableCell>
                              <TableCell className="max-w-[280px]">
                                <div className="space-y-1">
                                  <p className="text-xs font-bold text-foreground">{ticket.title}</p>
                                  <p className="text-xs text-default-500 line-clamp-2" title={ticket.pitchDescription}>
                                    {ticket.pitchDescription}
                                  </p>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {ticket.skillsOffered.map((skill: string) => (
                                      <Chip key={skill} size="sm" variant="flat" className="h-4 text-[9px] bg-default-100 font-bold">
                                        {skill}
                                      </Chip>
                                    ))}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {ticket.financialFundingAmount ? (
                                  <Chip size="sm" color="success" variant="flat" className="font-bold text-xs">
                                    ${Number(ticket.financialFundingAmount).toLocaleString()}
                                  </Chip>
                                ) : (
                                  <Chip size="sm" color="secondary" variant="flat" className="font-bold text-xs">
                                    Talent
                                  </Chip>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                {ticket.status === "PENDING" ? (
                                  <div className="flex items-center justify-end gap-1.5">
                                    <Button
                                      isIconOnly
                                      size="sm"
                                      color="success"
                                      variant="flat"
                                      onClick={() => handleTicketStatusChange(ticket.id, "ACCEPTED")}
                                      className="rounded-lg"
                                    >
                                      <Check className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      isIconOnly
                                      size="sm"
                                      color="danger"
                                      variant="flat"
                                      onClick={() => handleTicketStatusChange(ticket.id, "REJECTED")}
                                      className="rounded-lg"
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <Chip
                                    size="sm"
                                    color={ticket.status === "ACCEPTED" ? "success" : "danger"}
                                    variant="solid"
                                    className="font-bold text-xs uppercase"
                                  >
                                    {ticket.status}
                                  </Chip>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="p-8 text-center text-default-400 text-xs font-semibold">
                        No pending contribution tickets registered yet.
                      </div>
                    )}
                  </CardBody>
                </Card>
              </div>

              {/* Startup Profile & Layout Editor */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" style={{ color: primaryColor }} />
                  Startup Settings
                </h3>

                <Tabs
                  aria-label="Startup Settings Tabs"
                  color="primary"
                  variant="underlined"
                  classNames={{
                    tabList: "gap-4 w-full border-b border-divider",
                    tab: "font-semibold text-xs",
                    panel: "pt-4",
                  }}
                >
                  {/* Tab 1: Profile Editor */}
                  <Tab
                    key="profile"
                    title={
                      <div className="flex items-center gap-1.5">
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Edit Profile</span>
                      </div>
                    }
                  >
                    <div className="space-y-7">
                      <Input
                        label="Startup Name"
                        placeholder="e.g., OrbitPay"
                        variant="bordered"
                        labelPlacement="outside"
                        value={profileName}
                        onValueChange={setProfileName}
                        classNames={{ inputWrapper: "border-divider hover:border-foreground/30 focus-within:!border-primary" }}
                      />
                      <Input
                        label="URL Slug"
                        placeholder="e.g., orbitpay"
                        variant="bordered"
                        labelPlacement="outside"
                        value={profileSlug}
                        onValueChange={setProfileSlug}
                        classNames={{ inputWrapper: "border-divider hover:border-foreground/30 focus-within:!border-primary" }}
                      />
                      <Input
                        label="Logo URL"
                        placeholder="https://..."
                        variant="bordered"
                        labelPlacement="outside"
                        value={profileLogoUrl}
                        onValueChange={setProfileLogoUrl}
                        classNames={{ inputWrapper: "border-divider hover:border-foreground/30 focus-within:!border-primary" }}
                      />
                      <Input
                        label="One-Liner Hook"
                        placeholder="Describe your startup in one sentence"
                        variant="bordered"
                        labelPlacement="outside"
                        value={profileOneLiner}
                        onValueChange={setProfileOneLiner}
                        classNames={{ inputWrapper: "border-divider hover:border-foreground/30 focus-within:!border-primary" }}
                      />
                      <Textarea
                        label="Product Summary (Markdown)"
                        placeholder="### Welcome\n\nDescribe your product, features, and roadmap here..."
                        variant="bordered"
                        labelPlacement="outside"
                        minRows={5}
                        maxRows={12}
                        value={profileSummary}
                        onValueChange={setProfileSummary}
                        classNames={{ inputWrapper: "border-divider hover:border-foreground/30 focus-within:!border-primary" }}
                      />
                      <Textarea
                        label="Technologies (comma-separated)"
                        placeholder="React, Next.js, Go, Redis, Docker"
                        variant="bordered"
                        labelPlacement="outside"
                        minRows={2}
                        value={profileTechnologies}
                        onValueChange={setProfileTechnologies}
                        classNames={{ inputWrapper: "border-divider hover:border-foreground/30 focus-within:!border-primary" }}
                      />

                      <Divider className="my-2" />
                      <p className="text-xs font-bold text-default-400 uppercase tracking-wider">Performance Metrics</p>

                      <Input
                        label="Funding Stage"
                        placeholder="e.g., Seed, Series A"
                        variant="bordered"
                        labelPlacement="outside"
                        value={profileFundingStage}
                        onValueChange={setProfileFundingStage}
                        classNames={{ inputWrapper: "border-divider hover:border-foreground/30 focus-within:!border-primary" }}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          label="Monthly Revenue (MRR)"
                          placeholder="e.g., 5000"
                          type="number"
                          variant="bordered"
                          labelPlacement="outside"
                          value={profileMrr}
                          onValueChange={setProfileMrr}
                          classNames={{ inputWrapper: "border-divider hover:border-foreground/30 focus-within:!border-primary" }}
                        />
                        <Input
                          label="Active Users"
                          placeholder="e.g., 1200"
                          type="number"
                          variant="bordered"
                          labelPlacement="outside"
                          value={profileUsersCount}
                          onValueChange={setProfileUsersCount}
                          classNames={{ inputWrapper: "border-divider hover:border-foreground/30 focus-within:!border-primary" }}
                        />
                      </div>

                      {/* Save Feedback */}
                      <AnimatePresence>
                        {profileSaveMessage && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={cn(
                              "text-xs font-semibold px-3 py-2 rounded-lg border",
                              profileSaveMessage.includes("success")
                                ? "text-success bg-success-50/10 border-success/20"
                                : "text-danger bg-danger-50/10 border-danger/20"
                            )}
                          >
                            {profileSaveMessage}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <Button
                        onPress={handleProfileSave}
                        isLoading={isProfileSaving}
                        color="primary"
                        className="w-full font-bold shadow-md shadow-primary/20 text-white"
                        style={{ backgroundColor: primaryColor }}
                        endContent={<Save className="w-4 h-4" />}
                      >
                        Save Profile Changes
                      </Button>
                    </div>
                  </Tab>

                  {/* Tab 2: Layout Builder */}
                  <Tab
                    key="layout"
                    title={
                      <div className="flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5" />
                        <span>Page Layout</span>
                      </div>
                    }
                  >
                    <LayoutBuilder
                      initialLayout={startup!.customizationLayout}
                      onSaveAction={handleLayoutSave}
                    />
                  </Tab>
                </Tabs>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
