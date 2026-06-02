"use client";

import React, { useState, useEffect } from "react";
import { Card, CardBody, Avatar, Chip, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Spinner, Button } from "@nextui-org/react";
import { Ticket, Star, FileText, CheckCircle2, Clock, ExternalLink, ArrowLeft, LogOut } from "lucide-react";
import { useAuth } from "@/providers/app-providers";
import { getContributorTickets } from "@/app/actions/contribution-actions";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ContributorTicketsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  // Enforce Contributor role access control
  useEffect(() => {
    if (user && user.role !== "Contributor") {
      router.replace(user.role === "Founder" ? "/founder" : "/dashboard");
    }
  }, [user, router]);

  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTickets() {
      if (!user) return;
      try {
        const data = await getContributorTickets(user.id);
        setTickets(data);
      } catch (err) {
        console.error("Failed to load contributor tickets from Neon DB:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadTickets();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-4">
        <Spinner label="Loading your contribution pitches..." size="lg" />
      </div>
    );
  }

  // Calculate statistics
  const totalPitches = tickets.length;
  const acceptedPitches = tickets.filter(t => t.status === "ACCEPTED").length;
  const pendingPitches = tickets.filter(t => t.status === "PENDING").length;

  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl space-y-8 min-h-screen">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-2 border-b border-divider/60">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest bg-primary/10 border border-primary/20 rounded-full px-3 py-1 w-max">
            <Ticket className="w-3.5 h-3.5" />
            <span>My Ledgers</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-default-500 bg-clip-text text-transparent">
            Contribution Pitch History
          </h1>
          <p className="text-sm text-default-500 max-w-xl">
            Track the processing status of your talent applications and investment commitment tickets.
          </p>
        </div>

        {/* Global Navigation Actions */}
        <div className="flex items-center gap-2">
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

      {/* Telemetry row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="border border-divider bg-background/50 backdrop-blur-md">
          <CardBody className="p-6 flex flex-row items-center justify-between">
            <div>
              <span className="text-xs font-bold text-default-400 uppercase tracking-wider block">
                Total Pitches
              </span>
              <span className="text-3xl font-black text-foreground mt-1 inline-block">
                {totalPitches}
              </span>
            </div>
            <div className="w-12 h-12 rounded-full bg-default-100 flex items-center justify-center border border-divider">
              <FileText className="w-6 h-6 text-default-500" />
            </div>
          </CardBody>
        </Card>

        <Card className="border border-divider bg-background/50 backdrop-blur-md">
          <CardBody className="p-6 flex flex-row items-center justify-between">
            <div>
              <span className="text-xs font-bold text-default-400 uppercase tracking-wider block">
                Accepted Pitches
              </span>
              <span className="text-3xl font-black text-success mt-1 inline-block">
                {acceptedPitches}
              </span>
            </div>
            <div className="w-12 h-12 rounded-full bg-success-50/10 text-success flex items-center justify-center border border-success/20">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </CardBody>
        </Card>

        <Card className="border border-divider bg-background/50 backdrop-blur-md">
          <CardBody className="p-6 flex flex-row items-center justify-between">
            <div>
              <span className="text-xs font-bold text-default-400 uppercase tracking-wider block">
                Pending Pitches
              </span>
              <span className="text-3xl font-black text-warning mt-1 inline-block">
                {pendingPitches}
              </span>
            </div>
            <div className="w-12 h-12 rounded-full bg-warning-50/10 text-warning flex items-center justify-center border border-warning/20">
              <Clock className="w-6 h-6" />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Tickets Ledger Table */}
      <Card className="border border-divider bg-background/50 backdrop-blur-md p-2">
        <CardBody className="p-0">
          {tickets.length > 0 ? (
            <Table aria-label="My Contribution Pitches Ledger" className="shadow-none border-none">
              <TableHeader>
                <TableColumn className="font-bold bg-transparent">STARTUP</TableColumn>
                <TableColumn className="font-bold bg-transparent">PROPOSAL</TableColumn>
                <TableColumn className="font-bold bg-transparent">COMMITMENT</TableColumn>
                <TableColumn className="font-bold bg-transparent">SUBMITTED</TableColumn>
                <TableColumn className="font-bold bg-transparent text-right">STATUS</TableColumn>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow key={ticket.id} className="border-b border-divider/60 last:border-0 hover:bg-default-50/50">
                    <TableCell>
                      <Link href={`/startup/${ticket.startup.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <Avatar
                          src={ticket.startup.logoUrl || undefined}
                          name={ticket.startup.name}
                          size="sm"
                          isBordered
                          className="flex-shrink-0"
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-bold flex items-center gap-1">
                            {ticket.startup.name}
                            <ExternalLink className="w-3 h-3 text-default-400" />
                          </span>
                          <span className="text-xs text-default-400 uppercase tracking-wider">
                            {(ticket.startup.metricsJson as any)?.fundingStage || "Seed"}
                          </span>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="max-w-[320px]">
                      <div className="space-y-1 py-1">
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
                          Talent Pitch
                        </Chip>
                      )}
                    </TableCell>
                    <TableCell className="text-xs font-medium text-default-400">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Chip
                        size="sm"
                        color={
                          ticket.status === "ACCEPTED"
                            ? "success"
                            : ticket.status === "REJECTED"
                            ? "danger"
                            : "warning"
                        }
                        variant={ticket.status === "PENDING" ? "flat" : "solid"}
                        className="font-bold text-xs uppercase"
                      >
                        {ticket.status}
                      </Chip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center p-16 text-center space-y-4">
              <Star className="w-12 h-12 text-default-300 animate-spin-slow" />
              <div className="space-y-1">
                <h3 className="text-lg font-bold">No Pitches Registered</h3>
                <p className="text-sm text-default-400 max-w-xs mx-auto">
                  You have not pitched any contributions or funding commitments to our ecosystem startups yet.
                </p>
              </div>
              <Button color="primary" variant="flat" as={Link} href="/dashboard" className="font-semibold text-xs mt-2">
                Explore Startups
              </Button>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
