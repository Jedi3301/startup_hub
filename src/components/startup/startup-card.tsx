"use client";

import React, { useOptimistic, useTransition } from "react";
import Link from "next/link";
import { Card, CardBody, Avatar, Chip, Tooltip } from "@nextui-org/react";
import { ChevronUp, ChevronDown, TrendingUp, Users, DollarSign, ExternalLink } from "lucide-react";
import { StartupWithRelations } from "@/lib/types/startup";
import { VoteType } from "@prisma/client";

interface StartupCardProps {
  startup: StartupWithRelations;
  currentUserVote: VoteType | null;
  onVoteAction: (startupId: string, voteType: VoteType | null) => Promise<void>;
}

interface OptimisticState {
  upvotes: number;
  downvotes: number;
  userVote: VoteType | null;
}

export function StartupCard({ startup, currentUserVote, onVoteAction }: StartupCardProps) {
  const [isPending, startTransition] = useTransition();

  // Initial state for voting
  const initialState: OptimisticState = {
    upvotes: startup.upvoteCount,
    downvotes: startup.downvoteCount,
    userVote: currentUserVote,
  };

  // React 19 useOptimistic hook
  const [optimisticVote, setOptimisticVote] = useOptimistic(
    initialState,
    (state, action: VoteType | null) => {
      const prevVote = state.userVote;
      const nextVote = action;

      let upvoteDelta = 0;
      let downvoteDelta = 0;

      // Reverse previous vote impact
      if (prevVote === "UP") {
        upvoteDelta -= 1;
      } else if (prevVote === "DOWN") {
        downvoteDelta -= 1;
      }

      // Apply new vote impact
      if (nextVote === "UP") {
        upvoteDelta += 1;
      } else if (nextVote === "DOWN") {
        downvoteDelta += 1;
      }

      return {
        upvotes: state.upvotes + upvoteDelta,
        downvotes: state.downvotes + downvoteDelta,
        userVote: nextVote,
      };
    }
  );

  const handleVoteClick = (clickedType: VoteType) => {
    // If user clicks the current active vote, it toggles off (null)
    const nextVote = optimisticVote.userVote === clickedType ? null : clickedType;

    startTransition(async () => {
      // Optimistically update UI
      setOptimisticVote(nextVote);
      
      // Perform server update
      try {
        await onVoteAction(startup.id, nextVote);
      } catch (error) {
        console.error("Failed to submit vote:", error);
      }
    });
  };

  // Format funding stage/mrr metrics
  const formatMRR = (mrr?: number) => {
    if (!mrr) return null;
    return mrr >= 1000 ? `$${(mrr / 1000).toFixed(1)}k` : `$${mrr}`;
  };

  const primaryColor = startup.customizationLayout?.primaryColor || "#3b82f6";
  const showMetrics = startup.customizationLayout?.showMetrics !== false;

  return (
    <Card 
      className="group relative border border-divider hover:border-foreground/20 bg-background/50 hover:bg-background/80 backdrop-blur-md shadow-sm transition-all duration-300 rounded-2xl overflow-hidden"
      style={{
        boxShadow: optimisticVote.userVote 
          ? `0 4px 20px -2px ${primaryColor}15, inset 0 0 0 1px ${primaryColor}20` 
          : undefined
      }}
    >
      <CardBody className="p-6 flex flex-row gap-6">
        {/* Left Voting Column */}
        <div className="flex flex-col items-center gap-1.5 self-start pt-1">
          <button
            onClick={() => handleVoteClick("UP")}
            disabled={isPending}
            style={{ 
              color: optimisticVote.userVote === "UP" ? primaryColor : undefined 
            }}
            className={`p-1.5 rounded-lg transition-all ${
              optimisticVote.userVote === "UP"
                ? "bg-default-100 scale-110"
                : "text-default-400 hover:text-foreground hover:bg-default-100"
            }`}
          >
            <ChevronUp className="w-6 h-6 stroke-[2.5]" />
          </button>
          
          <Tooltip content={`Score: ${optimisticVote.upvotes - optimisticVote.downvotes}`}>
            <span className="text-sm font-bold min-w-[24px] text-center">
              {optimisticVote.upvotes - optimisticVote.downvotes}
            </span>
          </Tooltip>

          <button
            onClick={() => handleVoteClick("DOWN")}
            disabled={isPending}
            className={`p-1.5 rounded-lg transition-all ${
              optimisticVote.userVote === "DOWN"
                ? "bg-default-100 text-danger scale-110"
                : "text-default-400 hover:text-danger hover:bg-default-100"
            }`}
          >
            <ChevronDown className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Central Content Area */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div className="space-y-3">
            {/* Header: Logo, Name, Custom Actions */}
            <div className="flex items-start gap-4">
              <Link href={`/startup/${startup.id}`} className="flex items-start gap-4 flex-1 min-w-0">
                <Avatar
                  src={startup.logoUrl || undefined}
                  name={startup.name}
                  radius="full"
                  size="md"
                  isBordered
                  style={{ borderColor: primaryColor }}
                  className="shadow-sm flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg leading-snug truncate hover:text-primary transition-colors cursor-pointer">
                      {startup.name}
                    </h3>
                    <ExternalLink className="w-3.5 h-3.5 text-default-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p suppressHydrationWarning className="text-xs text-default-400">
                    Created {new Date(startup.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            </div>

            {/* One-liner description */}
            <p className="text-sm text-default-600 font-medium leading-relaxed line-clamp-2">
              {startup.oneLiner}
            </p>

            {/* Technology Badge Track */}
            <div className="flex flex-wrap gap-1.5 py-1 w-full">
              {startup.technologies.map((tech) => (
                <Chip
                  key={tech}
                  size="sm"
                  variant="flat"
                  className="bg-default-100/60 font-semibold text-default-600"
                >
                  {tech}
                </Chip>
              ))}
            </div>
          </div>

          {/* Metrics display row at the bottom */}
          {showMetrics && (
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-divider text-xs text-default-500">
              {startup.metricsJson.fundingStage && (
                <div className="flex items-center gap-1 font-semibold bg-primary-50/10 text-primary dark:bg-primary-900/10 px-2 py-0.5 rounded-md">
                  <span>Stage:</span>
                  <span className="uppercase">{startup.metricsJson.fundingStage}</span>
                </div>
              )}
              {startup.metricsJson.mrr && (
                <div className="flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-default-400" />
                  <span>MRR:</span>
                  <span className="font-bold text-foreground">
                    {formatMRR(startup.metricsJson.mrr)}
                  </span>
                </div>
              )}
              {startup.metricsJson.usersCount && (
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-default-400" />
                  <span>Users:</span>
                  <span className="font-bold text-foreground">
                    {startup.metricsJson.usersCount.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
