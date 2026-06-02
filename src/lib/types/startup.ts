import { User, Vote, VoteType, ContributionTicket } from "@prisma/client";

export interface CustomizationLayout {
  theme: "light" | "dark" | "glass";
  primaryColor: string;
  accentColor: string;
  bannerUrl?: string;
  layoutStyle: "classic" | "modern" | "minimal";
  showMetrics: boolean;
}

export interface StartupMetrics {
  mrr?: number;
  arr?: number;
  usersCount?: number;
  growthRate?: number;
  fundingStage?: string;
}

export interface StartupWithRelations {
  id: string;
  founderId: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  oneLiner: string;
  summaryMarkdown: string;
  technologies: string[];
  metricsJson: StartupMetrics;
  customizationLayout: CustomizationLayout;
  upvoteCount: number;
  downvoteCount: number;
  createdAt: Date;
  
  founder?: Omit<User, "passwordHash">;
  votes?: Vote[];
  contributionTickets?: ContributionTicket[];
}

export interface OptimisticVoteState {
  upvoteCount: number;
  downvoteCount: number;
  userVote: VoteType | null;
}
