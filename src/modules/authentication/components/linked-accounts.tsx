'use client';

import React, { useState } from 'react';
import {
	Link2,
	Trash2,
	Loader2,
	Key,
	CheckCircle2,
	Plus,
	Eye,
	EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	useAccountsQuery,
	useLinkSocialMutation,
	useUnlinkAccountMutation,
	useAddCredentialsAccountMutation,
} from '@/modules/authentication/hooks/use-security-query';

const GoogleIcon = () => (
	<svg className="size-4" viewBox="0 0 24 24">
		<path
			fill="currentColor"
			d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
		/>
		<path
			fill="currentColor"
			d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
		/>
		<path
			fill="currentColor"
			d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
		/>
		<path
			fill="currentColor"
			d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
		/>
	</svg>
);

const getProviderIcon = (providerId: string) => {
	switch (providerId) {
		case 'google':
			return <GoogleIcon />;
		case 'credential':
			return <Key className="size-4" />;
		default:
			return <Link2 className="size-4" />;
	}
};

const formatDate = (date: Date) => {
	return new Date(date).toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
};

export function LinkedAccounts() {
	const { data: accounts, isLoading } = useAccountsQuery();
	const linkSocialMutation = useLinkSocialMutation();
	const unlinkMutation = useUnlinkAccountMutation();
	const addCredentialsMutation = useAddCredentialsAccountMutation();

	const [showPasswordDialog, setShowPasswordDialog] = useState(false);
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);

	const hasGoogleLinked = accounts?.some((a) => a.providerId === 'google');
	const hasPasswordAccount = accounts?.some(
		(a) => a.providerId === 'credential',
	);
	const socialAccounts =
		accounts?.filter((a) => a.providerId !== 'credential') || [];
	const credentialAccount = accounts?.find(
		(a) => a.providerId === 'credential',
	);

	const handleLinkGoogle = () => {
		linkSocialMutation.mutate({
			provider: 'google',
			callbackURL: window.location.href,
		});
	};

	const handleAddPassword = async () => {
		if (!newPassword || !confirmPassword) {
			return;
		}
		if (newPassword !== confirmPassword) {
			return;
		}
		if (newPassword.length < 8) {
			return;
		}

		try {
			await addCredentialsMutation.mutateAsync(newPassword);
			setShowPasswordDialog(false);
			setNewPassword('');
			setConfirmPassword('');
		} catch {
			// Error handled by mutation
		}
	};

	const resetPasswordDialog = () => {
		setShowPasswordDialog(false);
		setNewPassword('');
		setConfirmPassword('');
		setShowPassword(false);
	};

	return (
		<>
			<div className="space-y-4">
				<div className="flex items-center gap-3">
					<div className="p-2 rounded-lg bg-violet-500/10">
						<Link2 className="size-5 text-violet-500" />
					</div>
					<div>
						<h3 className="text-sm font-medium">Linked Accounts</h3>
						<p className="text-xs text-muted-foreground">
							Manage your sign-in methods and connected accounts
						</p>
					</div>
				</div>

				<div className="pl-11 space-y-3">
					{isLoading ? (
						<div className="flex items-center justify-center py-6">
							<Loader2 className="size-5 animate-spin text-muted-foreground" />
						</div>
					) : (
						<>
							{/* Password/Credential Account */}
							<div className="space-y-2">
								<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
									Password
								</p>
								{hasPasswordAccount && credentialAccount ? (
									<div className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-background/40">
										<div className="flex items-center gap-3">
											<Key className="size-4 text-primary" />
											<div>
												<p className="text-sm font-medium">
													Email & Password
												</p>
												<p className="text-xs text-muted-foreground">
													Added{' '}
													{formatDate(
														credentialAccount.createdAt,
													)}
												</p>
											</div>
										</div>
										<Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30">
											<CheckCircle2 className="size-3 mr-1" />
											Active
										</Badge>
									</div>
								) : (
									<div className="flex items-center justify-between p-3 rounded-lg border border-dashed border-border/60 bg-muted/20">
										<div className="flex items-center gap-3">
											<Key className="size-4 text-muted-foreground" />
											<div>
												<p className="text-sm font-medium text-muted-foreground">
													Email & Password
												</p>
												<p className="text-xs text-muted-foreground">
													Add a password to enable 2FA
													and sign in with email
												</p>
											</div>
										</div>
										<Button
											variant="outline"
											size="sm"
											className="gap-1.5"
											onClick={() =>
												setShowPasswordDialog(true)
											}
										>
											<Plus className="size-3" />
											Add Password
										</Button>
									</div>
								)}
							</div>

							{/* Social Accounts */}
							<div className="space-y-2 pt-2">
								<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
									Social Accounts
								</p>

								{socialAccounts.map((account) => (
									<div
										key={account.id}
										className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-background/40"
									>
										<div className="flex items-center gap-3">
											{getProviderIcon(
												account.providerId,
											)}
											<div>
												<p className="text-sm font-medium capitalize">
													{account.providerId}
												</p>
												<p className="text-xs text-muted-foreground">
													Connected{' '}
													{formatDate(
														account.createdAt,
													)}
												</p>
											</div>
										</div>
										<Button
											variant="ghost"
											size="sm"
											className="text-red-500 hover:text-red-500 hover:bg-red-500/10"
											onClick={() =>
												unlinkMutation.mutate(
													account.providerId,
												)
											}
											disabled={unlinkMutation.isPending}
										>
											{unlinkMutation.isPending ? (
												<Loader2 className="size-4 animate-spin" />
											) : (
												<Trash2 className="size-4" />
											)}
										</Button>
									</div>
								))}

								{/* Link Google - only show if not already linked */}
								{!hasGoogleLinked && (
									<Button
										variant="outline"
										className="gap-2 w-full justify-start"
										onClick={handleLinkGoogle}
										disabled={linkSocialMutation.isPending}
									>
										{linkSocialMutation.isPending ? (
											<Loader2 className="size-4 animate-spin" />
										) : (
											<GoogleIcon />
										)}
										Link Google Account
									</Button>
								)}

								{/* Message when already linked */}
								{hasGoogleLinked &&
									socialAccounts.length > 0 && (
										<p className="text-xs text-muted-foreground">
											You can only link one Google account
										</p>
									)}
							</div>
						</>
					)}
				</div>
			</div>

			{/* Add Password Dialog */}
			<Dialog
				open={showPasswordDialog}
				onOpenChange={resetPasswordDialog}
			>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<Key className="size-5 text-primary" />
							Set Password
						</DialogTitle>
						<DialogDescription>
							Create a password for your account. This will allow
							you to sign in with email and enable two-factor
							authentication.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-2">
						<div className="space-y-2">
							<Label className="text-sm">Password</Label>
							<div className="relative">
								<Input
									type={showPassword ? 'text' : 'password'}
									value={newPassword}
									onChange={(e) =>
										setNewPassword(e.target.value)
									}
									placeholder="Enter password (min. 8 characters)"
									className="pr-10"
								/>
								<button
									type="button"
									onClick={() =>
										setShowPassword(!showPassword)
									}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
								>
									{showPassword ? (
										<EyeOff className="size-4" />
									) : (
										<Eye className="size-4" />
									)}
								</button>
							</div>
							{newPassword && newPassword.length < 8 && (
								<p className="text-xs text-muted-foreground">
									Password must be at least 8 characters
								</p>
							)}
						</div>
						<div className="space-y-2">
							<Label className="text-sm">Confirm Password</Label>
							<Input
								type={showPassword ? 'text' : 'password'}
								value={confirmPassword}
								onChange={(e) =>
									setConfirmPassword(e.target.value)
								}
								placeholder="Confirm password"
								onKeyDown={(e) => {
									if (
										e.key === 'Enter' &&
										newPassword &&
										confirmPassword &&
										newPassword === confirmPassword &&
										newPassword.length >= 8
									) {
										handleAddPassword();
									}
								}}
							/>
							{confirmPassword &&
								newPassword !== confirmPassword && (
									<p className="text-xs text-red-500">
										Passwords do not match
									</p>
								)}
						</div>
					</div>

					<DialogFooter className="gap-2">
						<Button variant="outline" onClick={resetPasswordDialog}>
							Cancel
						</Button>
						<Button
							onClick={handleAddPassword}
							disabled={
								!newPassword ||
								!confirmPassword ||
								newPassword !== confirmPassword ||
								newPassword.length < 8 ||
								addCredentialsMutation.isPending
							}
						>
							{addCredentialsMutation.isPending && (
								<Loader2 className="size-4 animate-spin mr-2" />
							)}
							Set Password
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
