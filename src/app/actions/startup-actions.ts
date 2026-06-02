"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";
import { VoteType } from "@prisma/client";
import { CustomizationLayout } from "@/lib/types/startup";

/**
 * Fetches all startups from the Prisma database.
 * If the database is empty, auto-seeds mock data first.
 */
export async function getStartups() {
  // Return startups from DB including relation votes
  const list = await db.startup.findMany({
    include: {
      votes: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Map database entries to match frontend interfaces
  return list.map((item) => ({
    ...item,
    metricsJson: (item.metricsJson as any) || {},
    customizationLayout: (item.customizationLayout as any) || {},
  }));
}

/**
 * Fetches a single startup by its ID or unique slug, including its votes and founder user record.
 */
export async function getStartupByIdOrSlug(idOrSlug: string) {
  if (!idOrSlug) return null;
  const startup = await db.startup.findFirst({
    where: {
      OR: [
        { id: idOrSlug },
        { slug: idOrSlug },
      ],
    },
    include: {
      votes: true,
      founder: true,
    },
  });

  if (!startup) return null;

  return {
    ...startup,
    metricsJson: (startup.metricsJson as any) || {},
    customizationLayout: (startup.customizationLayout as any) || {},
  };
}

/**
 * Fetches the startup owned by a specific founder, including its votes and associated contribution tickets with contributor details.
 */
export async function getFounderStartup(founderId: string) {
  if (!founderId) return null;
  const startup = await db.startup.findFirst({
    where: { founderId },
    include: {
      votes: true,
      contributionTickets: {
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!startup) return null;

  return {
    ...startup,
    metricsJson: (startup.metricsJson as any) || {},
    customizationLayout: (startup.customizationLayout as any) || {},
  };
}


/**
 * Registers a new Startup in the system, setting a default customization layout
 */
export async function registerStartup(data: {
  name: string;
  slug: string;
  logoUrl: string | null;
  oneLiner: string;
  technologies: string[];
  founderId: string;
}) {
  if (!data.name || !data.slug || !data.oneLiner) {
    throw new Error("Missing required startup information fields");
  }

  const defaultLayout: CustomizationLayout = {
    theme: "dark",
    primaryColor: "#3b82f6",
    accentColor: "#60a5fa",
    layoutStyle: "modern",
    showMetrics: true,
  };

  const startup = await db.startup.create({
    data: {
      founderId: data.founderId,
      name: data.name,
      slug: data.slug,
      logoUrl: data.logoUrl,
      oneLiner: data.oneLiner,
      summaryMarkdown: `### Welcome to ${data.name}\n\nIntroduce your product features and roadmap here.`,
      technologies: data.technologies,
      metricsJson: {},
      customizationLayout: defaultLayout as any,
      upvoteCount: 0,
      downvoteCount: 0,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/founder");
  return startup;
}

/**
 * Updates a startup's customization layout using the founder's user ID
 */
export async function updateStartupLayout(founderId: string, layout: CustomizationLayout) {
  const startup = await db.startup.findFirst({
    where: { founderId },
  });

  if (!startup) {
    throw new Error("No startup found registered under this founder account");
  }

  const updated = await db.startup.update({
    where: { id: startup.id },
    data: {
      customizationLayout: layout as any,
    },
  });

  revalidatePath(`/startup/${startup.id}`);
  revalidatePath(`/startup/${startup.slug}`);
  revalidatePath("/dashboard");
  revalidatePath("/founder");
  return updated;
}

/**
 * Updates a startup's editable profile fields (name, slug, one-liner, summary, technologies, logo, metrics).
 */
export async function updateStartupProfile(founderId: string, data: {
  name: string;
  slug: string;
  logoUrl: string | null;
  oneLiner: string;
  summaryMarkdown: string;
  technologies: string[];
  metricsJson: {
    fundingStage?: string;
    mrr?: number;
    usersCount?: number;
  };
}) {
  const startup = await db.startup.findFirst({
    where: { founderId },
  });

  if (!startup) {
    throw new Error("No startup found registered under this founder account");
  }

  const updated = await db.startup.update({
    where: { id: startup.id },
    data: {
      name: data.name,
      slug: data.slug,
      logoUrl: data.logoUrl,
      oneLiner: data.oneLiner,
      summaryMarkdown: data.summaryMarkdown,
      technologies: data.technologies,
      metricsJson: data.metricsJson as any,
    },
  });

  revalidatePath(`/startup/${startup.id}`);
  revalidatePath(`/startup/${startup.slug}`);
  revalidatePath("/dashboard");
  revalidatePath("/founder");
  return updated;
}

/**
 * Safely handles voting (UP/DOWN/NONE) using database transactions to prevent race conditions
 */
export async function toggleVote(startupId: string, userId: string, voteType: VoteType | null) {
  if (!startupId || !userId) {
    throw new Error("Startup ID and User ID are required to toggle vote");
  }

  return await db.$transaction(async (tx) => {
    const existingVote = await tx.vote.findUnique({
      where: {
        userId_startupId: {
          userId,
          startupId,
        },
      },
    });

    let upvoteDiff = 0;
    let downvoteDiff = 0;

    if (existingVote) {
      if (existingVote.voteType === "UP") {
        upvoteDiff -= 1;
      } else {
        downvoteDiff -= 1;
      }

      if (voteType === null) {
        await tx.vote.delete({
          where: {
            userId_startupId: {
              userId,
              startupId,
            },
          },
        });
      } else {
        await tx.vote.update({
          where: {
            userId_startupId: {
              userId,
              startupId,
            },
          },
          data: { voteType },
        });

        if (voteType === "UP") {
          upvoteDiff += 1;
        } else {
          downvoteDiff += 1;
        }
      }
    } else {
      if (voteType !== null) {
        await tx.vote.create({
          data: {
            userId,
            startupId,
            voteType,
          },
        });

        if (voteType === "UP") {
          upvoteDiff += 1;
        } else {
          downvoteDiff += 1;
        }
      }
    }

    const updatedStartup = await tx.startup.update({
      where: { id: startupId },
      data: {
        upvoteCount: { increment: upvoteDiff },
        downvoteCount: { increment: downvoteDiff },
      },
    });

    revalidatePath("/dashboard");
    revalidatePath(`/startup/${startupId}`);
    revalidatePath(`/startup/${updatedStartup.slug}`);

    return {
      success: true,
      upvoteCount: updatedStartup.upvoteCount,
      downvoteCount: updatedStartup.downvoteCount,
      userVote: voteType,
    };
  });
}
