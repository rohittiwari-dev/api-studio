'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface RenameRequestDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	currentName: string;
	onRename: (newName: string) => void;
}

export function RenameRequestDialog({
	open,
	onOpenChange,
	currentName,
	onRename,
}: RenameRequestDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]" data-no-dnd="true">
				<DialogHeader>
					<DialogTitle>Rename Request</DialogTitle>
					<DialogDescription>
						Enter a new name for your request.
					</DialogDescription>
				</DialogHeader>
				<RenameRequestForm
					currentName={currentName}
					onRename={onRename}
					onClose={() => onOpenChange(false)}
				/>
			</DialogContent>
		</Dialog>
	);
}

function RenameRequestForm({
	currentName,
	onRename,
	onClose,
}: {
	currentName: string;
	onRename: (newName: string) => void;
	onClose: () => void;
}) {
	const [newName, setNewName] = useState(currentName);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (newName?.trim()) {
			onRename(newName?.trim());
			onClose();
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<div className="grid gap-4 py-4">
				<div className="grid grid-cols-4 items-center gap-4">
					<Label
						htmlFor="old-name"
						className="text-right text-muted-foreground"
					>
						Current
					</Label>
					<Input
						id="old-name"
						value={currentName}
						disabled
						className="col-span-3 opacity-60"
					/>
				</div>
				<div className="grid grid-cols-4 items-center gap-4">
					<Label htmlFor="new-name" className="text-right">
						New Name
					</Label>
					<Input
						id="new-name"
						value={newName}
						onChange={(e) => setNewName(e.target.value)}
						className="col-span-3"
						autoFocus
						placeholder="Enter new name"
					/>
				</div>
			</div>
			<DialogFooter>
				<Button type="button" variant="outline" onClick={onClose}>
					Cancel
				</Button>
				<Button
					type="submit"
					disabled={
						!newName?.trim() || newName?.trim() === currentName
					}
				>
					Rename
				</Button>
			</DialogFooter>
		</form>
	);
}
