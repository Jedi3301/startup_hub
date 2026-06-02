"use client";

import React, { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Avatar, Chip, Card, CardBody, Divider, Spinner } from "@nextui-org/react";
import { ChevronLeft, Flame, DollarSign, Users, Award, ShieldAlert, FileText, ArrowRight } from "lucide-react";
import { ContributionModal } from "@/components/startup/contribution-modal";
import { StartupWithRelations } from "@/lib/types/startup";
import { VoteType } from "@prisma/client";
import { useAuth } from "@/providers/app-providers";
import { getStartupByIdOrSlug } from "@/app/actions/startup-actions";
import { submitContributionTicket } from "@/app/actions/contribution-actions";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Helper: Basic Markdown Parser converting syntax into styled HTML
function parseMarkdown(markdown: string) {
  if (!markdown) return null;
  return markdown.split("\n").map((line, index) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("### ")) {
      return (
        <h3 key={index} className="text-xl font-bold text-foreground mt-6 mb-3">
          {trimmed.substring(4)}
        </h3>
      );
    }
    if (trimmed.startsWith("#### ")) {
      return (
        <h4 key={index} className="text-lg font-bold text-foreground mt-4 mb-2">
          {trimmed.substring(5)}
        </h4>
      );
    }
    if (trimmed.startsWith("- ")) {
      // Bold text handling
      const content = trimmed.substring(2);
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = content.split(boldRegex);
      return (
        <li key={index} className="ml-6 list-disc text-default-600 py-1 text-sm">
          {parts.map((part, i) =>
            i % 2 === 1 ? <strong key={i} className="text-foreground">{part}</strong> : part
          )}
        </li>
      );
    }
    if (trimmed === "") {
      return <div key={index} className="h-2" />;
    }
    return (
      <p key={index} className="text-sm leading-relaxed text-default-600 mb-2">
        {trimmed}
      </p>
    );
  });
}

export default function StartupPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user } = useAuth();
  
  const [startup, setStartup] = useState<StartupWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function loadStartup() {
      try {
        const data = await getStartupByIdOrSlug(resolvedParams.id);
        setStartup(data);
      } catch (err) {
        console.error("Failed to load startup from Neon DB:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadStartup();
  }, [resolvedParams.id]);

  const handleTicketSubmit = async (payload: any) => {
    if (!user) {
      throw new Error("You must be logged in to pitch a contribution.");
    }
    await submitContributionTicket({
      ...payload,
      userId: user.id,
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-4">
        <Spinner label="Syncing startup layout telemetry..." size="lg" />
      </div>
    );
  }

  if (!startup) {
    return (
      <div className="container mx-auto px-6 py-24 max-w-xl text-center space-y-6">
        <h2 className="text-3xl font-extrabold tracking-tight">Startup Not Found</h2>
        <p className="text-default-500 text-sm">
          The startup you are trying to view does not exist in our ecosystem or might have been removed.
        </p>
        <Button color="primary" onClick={() => router.push("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const layout = startup.customizationLayout as any;
  const primaryColor = layout?.primaryColor || "#3b82f6";
  const layoutStyle = layout?.layoutStyle || "modern";
  const showMetricsSection = layout?.showMetrics !== false;

  // Dynamic Content Order based on customization layout style configuration
  // For classic: Product -> Metrics -> Team
  // For modern: Metrics -> Product -> Team
  // For minimal: Product -> Team
  const getRenderOrder = () => {
    switch (layoutStyle) {
      case "classic":
        return ["product", "metrics", "team"];
      case "minimal":
        return ["product", "team"];
      case "modern":
      default:
        return ["metrics", "product", "team"];
    }
  };

  const renderSection = (section: string) => {
    switch (section) {
      case "product":
        return (
          <div key="product" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" style={{ color: primaryColor }} />
              Product Overview
            </h2>
            <Card className="border border-divider bg-background/50 backdrop-blur-md">
              <CardBody className="p-6">
                {parseMarkdown(startup.summaryMarkdown)}
              </CardBody>
            </Card>
          </div>
        );
      case "metrics":
        if (!showMetricsSection) return null;
        return (
          <div key="metrics" className="space-y-4 animate-fade-in">
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" style={{ color: primaryColor }} />
              Performance Metrics
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="border border-divider bg-background/50 backdrop-blur-md">
                <CardBody className="p-5 flex flex-col gap-1">
                  <span className="text-xs text-default-400 font-semibold uppercase tracking-wider">
                    Funding Stage
                  </span>
                  <span className="text-2xl font-bold text-primary uppercase" style={{ color: primaryColor }}>
                    {startup.metricsJson.fundingStage}
                  </span>
                </CardBody>
              </Card>
              <Card className="border border-divider bg-background/50 backdrop-blur-md">
                <CardBody className="p-5 flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-default-400 font-semibold uppercase tracking-wider">
                      Monthly Revenue (MRR)
                    </span>
                    <DollarSign className="w-4 h-4 text-default-400" />
                  </div>
                  <span className="text-2xl font-bold">
                    {startup.metricsJson.mrr
                      ? `$${startup.metricsJson.mrr.toLocaleString()}`
                      : "Unlisted"}
                  </span>
                </CardBody>
              </Card>
              <Card className="border border-divider bg-background/50 backdrop-blur-md">
                <CardBody className="p-5 flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-default-400 font-semibold uppercase tracking-wider">
                      Active Users
                    </span>
                    <Users className="w-4 h-4 text-default-400" />
                  </div>
                  <span className="text-2xl font-bold">
                    {startup.metricsJson.usersCount
                      ? startup.metricsJson.usersCount.toLocaleString()
                      : "Unlisted"}
                  </span>
                </CardBody>
              </Card>
            </div>
          </div>
        );
      case "team":
        return (
          <div key="team" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" style={{ color: primaryColor }} />
              Founders & Team
            </h2>
            <Card className="border border-divider bg-background/50 backdrop-blur-md">
              <CardBody className="p-6 flex flex-row items-center gap-4">
                <Avatar
                  name={startup.founder?.legalName || "Founder"}
                  size="lg"
                  isBordered
                  style={{ borderColor: primaryColor }}
                  className="font-bold text-lg"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-base truncate">{startup.founder?.legalName || "Unknown Founder"}</h4>
                  <p className="text-xs text-default-400 font-semibold uppercase tracking-wider">
                    Founder & CEO
                  </p>
                  <p className="text-sm text-default-500 mt-1">
                    Registered founder and manager of {startup.name}. Contact at: {startup.founder?.email}
                  </p>
                </div>
              </CardBody>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl space-y-8 min-h-screen">
      {/* Back button */}
      <Button
        variant="light"
        onClick={() => router.push("/dashboard")}
        startContent={<ChevronLeft className="w-4 h-4" />}
        className="font-semibold text-default-500 hover:text-foreground pl-0"
      >
        Dashboard
      </Button>

      {/* Header Splash Card */}
      <div
        className="p-8 rounded-3xl border border-divider flex flex-col sm:flex-row gap-6 items-center justify-between relative overflow-hidden bg-background/50 backdrop-blur-lg"
        style={{
          boxShadow: `0 10px 40px -15px ${primaryColor}20`,
        }}
      >
        <div className="flex items-center gap-6">
          <Avatar
            src={startup.logoUrl || undefined}
            name={startup.name}
            isBordered
            className="w-20 h-20 shadow-lg"
            style={{ borderColor: primaryColor }}
          />
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold tracking-tight">{startup.name}</h1>
              <Chip
                size="sm"
                color="secondary"
                variant="flat"
                className="font-bold uppercase tracking-wider"
              >
                {startup.metricsJson.fundingStage}
              </Chip>
            </div>
            <p className="text-default-500 text-sm max-w-xl">{startup.oneLiner}</p>
            <div className="flex flex-wrap gap-1.5">
              {startup.technologies.map((tech) => (
                <Chip
                  key={tech}
                  size="sm"
                  variant="flat"
                  className="bg-default-100 font-semibold text-default-500"
                >
                  {tech}
                </Chip>
              ))}
            </div>
          </div>
        </div>

        {/* Score tracker */}
        <div className="flex flex-col items-center justify-center p-4 bg-default-100/50 rounded-2xl border border-divider">
          <span className="text-xs text-default-400 uppercase tracking-widest font-semibold">
            Score
          </span>
          <span className="text-3xl font-black mt-1" style={{ color: primaryColor }}>
            {startup.upvoteCount - startup.downvoteCount}
          </span>
          <span className="text-[10px] text-default-400 mt-1 font-semibold">
            {startup.upvoteCount} upvotes
          </span>
        </div>
      </div>

      {/* Layout Split: Main view vs Right sticky panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Section Renderer */}
        <div className="lg:col-span-2 space-y-8">
          {getRenderOrder().map((section) => renderSection(section))}
        </div>

        {/* Right Sticky Action Panel */}
        <div className="space-y-6 lg:sticky lg:top-8">
          <Card className="border border-divider bg-background/50 backdrop-blur-md shadow-lg p-3">
            <CardBody className="space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-bold text-primary uppercase tracking-wider" style={{ color: primaryColor }}>
                  Get Involved
                </span>
                <h3 className="text-lg font-bold">Open Contribution Portal</h3>
                <p className="text-xs text-default-500">
                  Submit a ticket to build features, join operations, or provide milestone-based angel investment support.
                </p>
              </div>

              <Divider className="bg-divider" />

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-success-50/10 text-success border border-success/20 flex items-center justify-center">
                    <Award className="w-4 h-4" />
                  </div>
                  <div className="text-xs flex-1">
                    <p className="font-semibold">Review Period: 48h</p>
                    <p className="text-default-400">Founder responds directly to pitches.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-warning-50/10 text-warning border border-warning/20 flex items-center justify-center">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div className="text-xs flex-1">
                    <p className="font-semibold">Milestone Checked</p>
                    <p className="text-default-400">Funds locked or tasks verified before release.</p>
                  </div>
                </div>
              </div>

              <Button
                color="primary"
                onPress={() => setIsModalOpen(true)}
                style={{ backgroundColor: primaryColor }}
                endContent={<ArrowRight className="w-4 h-4" />}
                className="w-full font-bold shadow-lg shadow-primary/20 text-white"
              >
                Pitch Contribution
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Contribution Modal */}
      <ContributionModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        startupName={startup.name}
        startupId={startup.id}
        onSubmitAction={handleTicketSubmit}
      />
    </div>
  );
}
