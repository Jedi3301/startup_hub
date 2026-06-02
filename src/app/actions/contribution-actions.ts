"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";
import { TicketStatus } from "@prisma/client";

interface SubmitTicketInput {
  startupId: string;
  userId: string;
  title: string;
  pitchDescription: string;
  skillsOffered: string[];
  financialFundingAmount: number | null;
}

/**
 * Creates a new ContributionTicket in the database for founder review
 */
export async function submitContributionTicket(data: SubmitTicketInput) {
  if (!data.startupId || !data.userId || !data.title || !data.pitchDescription) {
    throw new Error("Missing required parameters to submit a contribution ticket");
  }

  const ticket = await db.contributionTicket.create({
    data: {
      startupId: data.startupId,
      userId: data.userId,
      title: data.title,
      pitchDescription: data.pitchDescription,
      skillsOffered: data.skillsOffered,
      financialFundingAmount: data.financialFundingAmount,
      status: "PENDING",
    },
  });

  // Revalidate related paths to refresh data displays
  revalidatePath("/dashboard");
  revalidatePath("/founder");
  revalidatePath(`/startup/${data.startupId}`);
  revalidatePath("/tickets");

  return ticket;
}

/**
 * Updates a contribution ticket's status (PENDING, ACCEPTED, REJECTED)
 */
export async function updateTicketStatus(ticketId: string, status: TicketStatus) {
  if (!ticketId || !status) {
    throw new Error("Ticket ID and Status are required to update status");
  }

  const ticket = await db.contributionTicket.update({
    where: { id: ticketId },
    data: { status },
    include: {
      startup: true,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/founder");
  revalidatePath(`/startup/${ticket.startupId}`);
  revalidatePath("/tickets");

  return ticket;
}

/**
 * Fetches all contribution tickets submitted by a specific contributor, including associated startup info
 */
export async function getContributorTickets(userId: string) {
  if (!userId) return [];
  return await db.contributionTicket.findMany({
    where: { userId },
    include: {
      startup: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
