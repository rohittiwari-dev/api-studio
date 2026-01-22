'use client';

import React, { useState, useEffect } from 'react';
import { LogOut, Mail, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
} from '@/components/ui/sheet';
import Avatar from '@/modules/authentication/components/avatar';
import { useAuthStore } from '@/modules/authentication/store';
import { getInitialsFromName } from '@/lib/utils';
import UserInvitationsSheetList from '../../workspace/components/UserInvitationsSheetList';
import authClient from '@/lib/authClient';
import useCookieStore from '@/modules/apis/cookies/store/cookie.store';
import { redirect } from 'next/navigation';
import Spinner from '@/components/app-ui/spinner';
import { useUserInvitationsQuery } from '@/modules/workspace/hooks/use-invitaions-query';

import { Session, User } from 'better-auth';

export default function WorkspaceUserButton({
	session,
}: {
	session?: {
		user: User;
		session: Session;
	} | null;
}) {
	const { data, setAuthSession } = useAuthStore();
	const { clearCookies } = useCookieStore();
	const [sheetOpen, setSheetOpen] = useState(false);
	const [isLoggingOut, setIsLoggingOut] = useState(false);

	useEffect(() => {
		if (session && !data) {
			setAuthSession(session);
		}
	}, [session, data, setAuthSession]);

	// Fetch invitations to show badge/count if needed, or just to know
	const { data: invitations } = useUserInvitationsQuery();
	const pendingCount =
		invitations?.filter((i) => i.status === 'pending')?.length || 0;

	const user = data?.user;
	const name = user?.name || '';
	const image = user?.image || undefined;

	const handleLogout = async () => {
		setIsLoggingOut(true);
		await authClient?.signOut({
			fetchOptions: {
				onSuccess: () => {
					setIsLoggingOut(false);
					setAuthSession({
						session: null,
						user: null,
					});
					clearCookies();
					document.cookie =
						'better-auth.session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
					document.cookie =
						'__Secure-better-auth.session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
					redirect('/sign-in');
				},
				onError: () => {
					setIsLoggingOut(false);
				},
			},
		});
	};

	const [showNotification, setShowNotification] = useState(false);
	const [prevCount, setPrevCount] = useState(0);

	if (pendingCount !== prevCount) {
		setPrevCount(pendingCount);
		if (pendingCount > prevCount) {
			setShowNotification(true);
		}
	}

	return (
		<div className="relative">
			<AnimatePresence>
				{pendingCount > 0 && showNotification && (
					<motion.div
						initial={{ opacity: 0, y: 15, scale: 0.8, rotate: -5 }}
						animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
						exit={{ opacity: 0, y: 10, scale: 0.8 }}
						transition={{
							type: 'spring',
							stiffness: 400,
							damping: 25,
						}}
						className="absolute top-12 right-0 z-50 w-64 origin-top-right"
					>
						<div className="relative bg-linear-to-br from-indigo-500/80 via-purple-600/80 to-pink-500/80 dark:from-indigo-500/40 dark:via-purple-600/40 dark:to-pink-500/40 rounded-2xl shadow-xl shadow-purple-500/20 p-4 pt-3 text-white  border border-white/10 ring-1 ring-black/5">
							{/* Arrow */}

							<div className="relative z-10 flex items-start gap-3">
								<div className="shrink-0 size-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mt-0.5 ring-1 ring-white/30 shadow-inner">
									<Mail className="size-5 text-white drop-shadow-sm" />
								</div>
								<div className="flex-1">
									<p className="text-xs font-bold text-white/95 mb-0.5 tracking-wide uppercase">
										Hey there! 👋
									</p>
									<p className="text-[11px] text-white/90 leading-tight font-medium">
										You have{' '}
										<span className="bg-white/20 px-1 rounded text-white font-bold">
											{pendingCount}
										</span>{' '}
										pending invitation
										{pendingCount !== 1 ? 's' : ''} waiting
										for you!
									</p>
								</div>
								<button
									onClick={(e) => {
										e.stopPropagation();
										setShowNotification(false);
									}}
									className="text-white/60 hover:text-white hover:bg-white/20 rounded-full p-0.5 transition-all"
								>
									<X className="size-3.5" />
								</button>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			<DropdownMenu>
				<DropdownMenuTrigger asChild className="outline-none">
					<Button
						variant="ghost"
						size="icon"
						className="rounded-full h-10 w-10 p-0 border border-border/10 hover:bg-muted/50"
					>
						<Avatar
							className="h-8 w-8 rounded-full"
							fallbackClassName="h-8 w-8 rounded-full"
							href={image}
							alt={name}
							initial={getInitialsFromName(name)}
						/>
						{pendingCount > 0 && (
							<span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-red-500 border-2 border-background" />
						)}
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					className="w-[260px] rounded-2xl p-1.5 border-border/50 bg-background/80 backdrop-blur-xl shadow-2xl"
					align="end"
					sideOffset={8}
				>
					<div className="p-1.5 mb-1.5 rounded-xl bg-muted/40 border border-border/40">
						<div className="flex items-center gap-3">
							<Avatar
								className="h-9 w-9 rounded-xl border border-border/50 shadow-sm"
								fallbackClassName="rounded-xl"
								href={image}
								alt={name}
								initial={getInitialsFromName(name)}
							/>
							<div className="grid flex-1 text-left leading-tight">
								<span className="truncate font-semibold text-foreground text-sm">
									{name}
								</span>
								<span className="truncate text-[11px] text-muted-foreground">
									{user?.email}
								</span>
							</div>
						</div>
					</div>

					<DropdownMenuGroup className="space-y-0.5">
						<DropdownMenuItem
							onClick={() => setSheetOpen(true)}
							className="p-1.5 cursor-pointer focus:bg-accent/50 rounded-lg group"
						>
							<div className="flex items-center justify-center size-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 mr-2 group-hover:bg-blue-500/20 transition-colors">
								<Mail className="size-3.5" />
							</div>
							<div className="flex flex-col flex-1">
								<span className="text-sm font-medium">
									Invitations
								</span>
								<span className="text-[11px] text-muted-foreground">
									Manage invites
								</span>
							</div>
							{pendingCount > 0 && (
								<span className="ml-auto text-xs bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded-full">
									{pendingCount}
								</span>
							)}
						</DropdownMenuItem>
					</DropdownMenuGroup>

					<DropdownMenuSeparator className="my-1.5 bg-border/50" />

					<DropdownMenuItem
						onClick={handleLogout}
						className="p-1.5 cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-500/10 dark:focus:bg-red-500/10 mt-1 rounded-lg group"
					>
						<div className="flex items-center justify-center size-7 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 mr-2 group-hover:bg-red-500/20 transition-colors">
							{isLoggingOut ? (
								<Spinner className="size-3.5" />
							) : (
								<LogOut className="size-3.5" />
							)}
						</div>
						<div className="flex flex-col">
							<span className="text-sm font-medium">Log out</span>
							<span className="text-[11px] text-muted-foreground">
								End your session
							</span>
						</div>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
				<SheetContent
					className="sm:max-w-md w-full backdrop-blur-3xl bg-white/90 dark:bg-neutral-800/30 border-l border-white/20 dark:border-white/10 shadow-[0_0_40px_-10px_rgba(0,0,0,0.1)] p-0 gap-0 fixed top-[2vh] right-[2vh] bottom-[2vh] h-[96vh] rounded-3xl outline-none data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right overflow-hidden ring-1 ring-border/5"
					side="right"
				>
					{/* Subtle Gradient Overlay */}
					<div className="absolute inset-0 bg-linear-to-b from-indigo-500/5 via-transparent to-transparent pointer-events-none" />

					<div className="p-6 h-full flex flex-col relative z-10 w-full">
						<SheetHeader className="text-left mb-6 pb-4 border-b border-border/10">
							<SheetTitle className="text-xl font-bold tracking-tight">
								Your Invitations
							</SheetTitle>
							<SheetDescription className="text-muted-foreground/80">
								Manage your pending workspace invitations.
							</SheetDescription>
						</SheetHeader>
						<div className="flex-1 overflow-y-auto -mx-6 px-6 scrollbar-none hover:scrollbar-thin scrollbar-thumb-muted-foreground/20">
							<UserInvitationsSheetList />
						</div>
					</div>
				</SheetContent>
			</Sheet>
		</div>
	);
}
