import {
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  Mail,
  XCircle,
} from "lucide-react";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import auth from "@/lib/auth";
import {
  acceptInvitation,
  getInvitation,
  rejectInvitation,
} from "@/modules/workspace/server/invitation.actions";
import { getWorkspaceById } from "@/modules/workspace/server/workspace.actions";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InvitationPage({ params }: PageProps) {
  const { id } = await params;
  const headersList = await headers();

  // Get session
  const session = await auth.api.getSession({
    headers: headersList,
  });

  // If not signed in, redirect to sign-in with callback
  if (!session?.user) {
    redirect(`/sign-in?callbackUrl=/invite/${id}`);
  }

  // Get invitation details
  const invitation = await getInvitation(id);

  if (!invitation) {
    return (
      <div className="w-full bg-background/60 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-2xl">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 mb-4">
            <Mail className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Invitation Not Found</h1>
          <p className="text-muted-foreground mb-6">
            This invitation doesn&apos;t exist, has expired, or has already been
            used.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Go Home
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Check if invitation is for this user
  if (invitation?.data?.email !== session.user.email) {
    return (
      <div className="w-full bg-background/60 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-2xl">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-4">
            <AlertCircle className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Wrong Account</h1>
          <p className="text-muted-foreground mb-2">
            This invitation was sent to a different email address.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Please sign in with{" "}
            <span className="font-medium text-foreground">
              {invitation?.data?.email}
            </span>{" "}
            to accept this invitation.
          </p>
          <Link
            href="/sign-in"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Sign in with different account
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Check if invitation is expired
  const isExpired = new Date(invitation?.data?.expiresAt) < new Date();
  if (isExpired) {
    return (
      <div className="w-full bg-background/60 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-2xl">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-4">
            <Clock className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Invitation Expired</h1>
          <p className="text-muted-foreground mb-6">
            This invitation has expired. Please ask the workspace admin to send
            a new invitation.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Go Home
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Handle accept
  async function handleAccept() {
    "use server";
    const result = await acceptInvitation(id);
    if (result) {
      redirect(`/workspace`);
    }
  }

  // Handle reject
  async function handleReject() {
    "use server";
    await rejectInvitation(id);
    redirect("/");
  }

  const organization = await getWorkspaceById(invitation?.data?.organizationId);
  return (
    <div className="w-full bg-background/60 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-2xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-violet-600/20 border border-primary/30 mb-4">
          {organization?.logo ? (
            <Image
              src={organization.logo}
              alt={organization.name}
              width={12}
              height={12}
              className="w-12 h-12 rounded-xl object-cover"
            />
          ) : (
            <Building2 className="w-10 h-10 text-primary" />
          )}
        </div>
        <h1 className="text-2xl font-bold mb-2">Join {organization?.name}</h1>
        <p className="text-muted-foreground">
          You&apos;ve been invited by{" "}
          <span className="font-medium text-foreground">
            {invitation?.data?.inviterEmail}
          </span>
        </p>
      </div>

      {/* Invitation Info */}
      <div className="bg-muted/30 rounded-xl p-4 mb-6 border border-border/30 space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-background border border-border/50">
            <Mail className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">{invitation?.data?.email}</p>
            <p className="text-xs text-muted-foreground">Invited email</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-background border border-border/50">
            <Clock className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">
              Expires{" "}
              {new Date(invitation?.data?.expiresAt).toLocaleDateString()}
            </p>
            <p className="text-xs text-muted-foreground">Invitation validity</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <form action={handleReject} className="flex-1">
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-muted text-muted-foreground font-medium hover:bg-muted/80 transition-colors flex items-center justify-center gap-2"
          >
            <XCircle className="w-5 h-5" />
            Decline
          </button>
        </form>
        <form action={handleAccept} className="flex-1">
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            Accept
          </button>
        </form>
      </div>

      <p className="text-xs text-muted-foreground text-center mt-4">
        Signed in as <span className="font-medium">{session.user.email}</span>
      </p>
    </div>
  );
}
