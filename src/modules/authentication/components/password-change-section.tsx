'use client';

import React, { useState } from 'react';
import { Key, Lock, Eye, EyeOff, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useChangePasswordMutation } from '@/modules/authentication/hooks/use-security-query';

export function PasswordChangeSection() {
	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);

	const mutation = useChangePasswordMutation();

	const handleChangePassword = async () => {
		if (!currentPassword) {
			return;
		}
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
			await mutation.mutateAsync({ currentPassword, newPassword });
			setCurrentPassword('');
			setNewPassword('');
			setConfirmPassword('');
		} catch {
			// Error handled by mutation
		}
	};

	const isValidForm =
		currentPassword &&
		newPassword &&
		confirmPassword &&
		newPassword === confirmPassword &&
		newPassword.length >= 8;

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-3">
				<div className="p-2 rounded-lg bg-primary/10">
					<Key className="size-5 text-primary" />
				</div>
				<div>
					<h3 className="text-sm font-medium">Change Password</h3>
					<p className="text-xs text-muted-foreground">
						Update your password regularly to keep your account
						secure
					</p>
				</div>
			</div>

			<div className="grid gap-4 pl-11">
				<div className="space-y-2">
					<Label htmlFor="current-password" className="text-sm">
						Current Password
					</Label>
					<div className="relative">
						<Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
						<Input
							id="current-password"
							type={showPassword ? 'text' : 'password'}
							value={currentPassword}
							onChange={(e) => setCurrentPassword(e.target.value)}
							className="pl-10 pr-10"
							placeholder="Enter current password"
						/>
						<button
							type="button"
							onClick={() => setShowPassword(!showPassword)}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
						>
							{showPassword ? (
								<EyeOff className="size-4" />
							) : (
								<Eye className="size-4" />
							)}
						</button>
					</div>
				</div>

				<div className="space-y-2">
					<Label htmlFor="new-password" className="text-sm">
						New Password
					</Label>
					<div className="relative">
						<Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
						<Input
							id="new-password"
							type={showPassword ? 'text' : 'password'}
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
							className="pl-10"
							placeholder="Enter new password"
						/>
					</div>
				</div>

				<div className="space-y-2">
					<Label htmlFor="confirm-password" className="text-sm">
						Confirm New Password
					</Label>
					<div className="relative">
						<Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
						<Input
							id="confirm-password"
							type={showPassword ? 'text' : 'password'}
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							className="pl-10"
							placeholder="Confirm new password"
						/>
					</div>
					{confirmPassword && newPassword !== confirmPassword && (
						<p className="text-xs text-red-500">
							Passwords do not match
						</p>
					)}
					{newPassword && newPassword.length < 8 && (
						<p className="text-xs text-muted-foreground">
							Password must be at least 8 characters
						</p>
					)}
				</div>

				<Button
					onClick={handleChangePassword}
					disabled={mutation.isPending || !isValidForm}
					className="w-fit gap-2"
				>
					{mutation.isPending ? (
						<Loader2 className="size-4 animate-spin" />
					) : (
						<Save className="size-4" />
					)}
					{mutation.isPending ? 'Saving...' : 'Change Password'}
				</Button>
			</div>
		</div>
	);
}
