"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { FilterPanel } from "@/components/dashboard/filter-panel";
import { StartupCard } from "@/components/startup/startup-card";
import { StartupWithRelations } from "@/lib/types/startup";
import { VoteType } from "@prisma/client";
import { Flame, Star, LogOut, Ticket, Briefcase } from "lucide-react";
import { Spinner, Button } from "@nextui-org/react";
import { useAuth } from "@/providers/app-providers";
import { getStartups, toggleVote } from "@/app/actions/startup-actions";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [startups, setStartups] = useState<StartupWithRelations[]>([]);
  const [userVotes, setUserVotes] = useState<Record<string, VoteType | null>>({});
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTechs, setSelectedTechs] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"votes" | "newest">("votes");

  // Fetch startups and map user votes on load
  useEffect(() => {
    async function loadData() {
      try {
        const data = await getStartups();
        setStartups(data);

        if (user) {
          const votesMap: Record<string, VoteType | null> = {};
          data.forEach((s) => {
            const userVoteObj = s.votes.find((v) => v.userId === user.id);
            votesMap[s.id] = userVoteObj ? userVoteObj.voteType : null;
          });
          setUserVotes(votesMap);
        }
      } catch (err) {
        console.error("Failed to load startups from Neon DB:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [user]);

  // Real server-side database action for updating vote counts
  const handleVoteAction = useCallback(async (startupId: string, voteType: VoteType | null) => {
    if (!user) return;

    try {
      const result = await toggleVote(startupId, user.id, voteType);
      
      setUserVotes((prev) => ({
        ...prev,
        [startupId]: voteType,
      }));

      setStartups((currStartups) =>
        currStartups.map((startup) => {
          if (startup.id !== startupId) return startup;
          return {
            ...startup,
            upvoteCount: result.upvoteCount,
            downvoteCount: result.downvoteCount,
          };
        })
      );
    } catch (error) {
      console.error("Failed to submit vote to Neon DB:", error);
    }
  }, [user]);

  // Filter and Sort Startups
  const filteredAndSortedStartups = useMemo(() => {
    return startups
      .filter((startup) => {
        const matchesSearch =
          startup.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          startup.oneLiner.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesTech =
          selectedTechs.length === 0 ||
          selectedTechs.every((tech) => startup.technologies.includes(tech));

        return matchesSearch && matchesTech;
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        // Score calculation: upvotes - downvotes
        const scoreA = a.upvoteCount - a.downvoteCount;
        const scoreB = b.upvoteCount - b.downvoteCount;
        return scoreB - scoreA;
      });
  }, [startups, searchQuery, selectedTechs, sortBy]);

  // Framer Motion staggered grid layout variants
  const gridVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 90,
        damping: 15,
      },
    },
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl space-y-8 min-h-screen">
      {/* Dashboard Headline Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-2 border-b border-divider/60">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest bg-primary/10 border border-primary/20 rounded-full px-3 py-1 w-max">
            <Flame className="w-3.5 h-3.5" />
            <span>Trending Ecosystem</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-default-500 bg-clip-text text-transparent">
            Contributor Dashboard
          </h1>
          <p className="text-sm text-default-500 max-w-xl">
            Discover top startups, cast your votes, and pitch your specialized skills to launch matching contribution tickets.
          </p>
        </div>

        {/* Global Navigation Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {user?.role === "Founder" && (
            <Button
              color="secondary"
              variant="flat"
              onPress={() => router.push("/founder")}
              startContent={<Briefcase className="w-4 h-4" />}
              className="font-semibold text-xs"
            >
              Founder Console
            </Button>
          )}
          <Button
            color="primary"
            variant="flat"
            onPress={() => router.push("/tickets")}
            startContent={<Ticket className="w-4 h-4" />}
            className="font-semibold text-xs"
          >
            My Pitches
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

      {/* Filter panel control */}
      <FilterPanel
        onSearchChange={setSearchQuery}
        onTechChange={setSelectedTechs}
        onSortChange={setSortBy}
      />

      {/* Grid of Startup Cards */}
      {isLoading ? (
        <div className="flex justify-center items-center py-24">
          <Spinner label="Syncing ecosystem with database..." color="primary" size="lg" />
        </div>
      ) : filteredAndSortedStartups.length > 0 ? (
        <motion.ul
          variants={gridVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {filteredAndSortedStartups.map((startup) => (
            <motion.li key={startup.id} variants={itemVariants}>
              <StartupCard
                startup={startup}
                currentUserVote={userVotes[startup.id] || null}
                onVoteAction={handleVoteAction}
              />
            </motion.li>
          ))}
        </motion.ul>
      ) : (
        <div className="flex flex-col items-center justify-center p-16 border border-dashed border-divider rounded-2xl bg-background/30 text-center space-y-4">
          <Star className="w-12 h-12 text-default-300 animate-spin-slow" />
          <div className="space-y-1">
            <h3 className="text-lg font-bold">No Startups Found</h3>
            <p className="text-sm text-default-400 max-w-xs">
              No results matches your current search terms or technology filters.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
