'use client';

import React, { useState } from 'react';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import useEnvironmentStore from '@/modules/apis/environment/store/environment.store';
import { Eye, EyeOff, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface EnvironmentVariablePillProps {
	variableName: string;
	className?: string;
}

/**
 * A pill-style component that displays an environment variable.
 * - Orange color if the variable exists in the current environment
 * - Amber color if the variable is a secret
 * - Rose color if the variable is missing
 * Shows variable value on hover in a popover
 */
export const EnvironmentVariablePill: React.FC<
	EnvironmentVariablePillProps
> = ({ variableName, className }) => {
	// Subscribe to revealedSecretKeys for reactivity
	const revealedSecretKeys = useEnvironmentStore(
		(state) => state.revealedSecretKeys,
	);
	const environments = useEnvironmentStore((state) => state.environments);
	const activeEnvironmentId = useEnvironmentStore(
		(state) => state.activeEnvironmentId,
	);
	const toggleSecretVisibility = useEnvironmentStore(
		(state) => state.toggleSecretVisibility,
	);

	const [isCopied, setIsCopied] = useState(false);

	// Get active environment
	const activeEnv =
		environments.find((env) => env.id === activeEnvironmentId) || null;

	// Get variables as record
	const variables: Record<string, string> = {};
	if (activeEnv?.variables) {
		activeEnv.variables.forEach((v: any) => {
			if (v.enabled !== false && v.key) {
				variables[v.key] = v.value || '';
			}
		});
	}

	const exists = variableName in variables;
	const value = exists ? variables[variableName] : undefined;

	// Get secret metadata
	const variable = activeEnv?.variables?.find(
		(v: any) => v.key === variableName && v.enabled !== false,
	);
	const isSecret = variable?.type === 'secret';
	const isRevealed = !isSecret || revealedSecretKeys.includes(variableName);
	const displayValue = isRevealed ? value : '••••••••';

	const handleCopy = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (value) {
			navigator.clipboard.writeText(value);
			setIsCopied(true);
			toast.success('Value copied to clipboard');
			setTimeout(() => setIsCopied(false), 2000);
		}
	};

	const handleToggleVisibility = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		toggleSecretVisibility(variableName);
	};

	return (
		<Popover>
			<PopoverTrigger asChild>
				<span
					className={cn(
						'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium cursor-pointer transition-all',
						'border hover:opacity-80',
						exists
							? isSecret
								? 'bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-400'
								: 'bg-orange-500/10 text-orange-600 border-orange-500/30 dark:text-orange-400'
							: 'bg-rose-500/10 text-rose-600 border-rose-500/30 dark:text-rose-400',
						className,
					)}
				>
					{`{{${variableName}}}`}
				</span>
			</PopoverTrigger>
			<PopoverContent className="w-72 p-3" side="top">
				<div className="space-y-2">
					<div className="flex items-center justify-between gap-4">
						<div className="flex items-center gap-2">
							<span
								className={cn(
									'h-2 w-2 rounded-full',
									exists
										? isSecret
											? 'bg-amber-500'
											: 'bg-orange-500'
										: 'bg-rose-500',
								)}
							/>
							<span className="text-sm font-medium">
								{variableName}
							</span>
							{isSecret && (
								<span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 font-medium">
									SECRET
								</span>
							)}
						</div>
						<div className="flex items-center gap-1">
							{isSecret && (
								<Button
									variant="ghost"
									size="icon"
									className="h-6 w-6 shrink-0"
									onClick={handleToggleVisibility}
									title={
										isRevealed ? 'Hide value' : 'Show value'
									}
								>
									{isRevealed ? (
										<EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
									) : (
										<Eye className="h-3.5 w-3.5 text-muted-foreground" />
									)}
								</Button>
							)}
							{exists && value && (
								<Button
									variant="ghost"
									size="icon"
									className="h-6 w-6 shrink-0"
									onClick={handleCopy}
									title="Copy value"
								>
									{isCopied ? (
										<Check className="h-3.5 w-3.5 text-green-500" />
									) : (
										<Copy className="h-3.5 w-3.5 text-muted-foreground" />
									)}
								</Button>
							)}
						</div>
					</div>
					{exists ? (
						<>
							<div className="text-xs text-muted-foreground">
								Environment:{' '}
								<span className="text-foreground">
									{activeEnv?.name || 'Unknown'}
								</span>
							</div>
							<div
								className={cn(
									'rounded p-2 font-mono text-xs break-all',
									isSecret
										? 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
										: 'bg-muted',
								)}
							>
								{displayValue || (
									<span className="text-muted-foreground italic">
										Empty value
									</span>
								)}
							</div>
						</>
					) : (
						<div className="text-xs text-rose-500">
							Variable not found in current environment
							{activeEnv
								? ` (${activeEnv.name})`
								: '. No environment selected.'}
						</div>
					)}
				</div>
			</PopoverContent>
		</Popover>
	);
};

/**
 * Parse a string and replace {{variableName}} patterns with EnvironmentVariablePill components
 */
export const parseTextWithVariables = (
	text: string,
	className?: string,
): React.ReactNode[] => {
	if (!text) {
		return [text];
	}

	const regex = /(\{\{[^{}]+\}\})/g;
	const parts = text.split(regex);

	return parts
		.map((part, index) => {
			const match = part.match(/^\{\{(.+)\}\}$/);
			if (match) {
				return (
					<EnvironmentVariablePill
						key={index}
						variableName={match[1]?.trim()}
						className={className}
					/>
				);
			}
			return part ? <span key={index}>{part}</span> : null;
		})
		.filter(Boolean);
};

export default EnvironmentVariablePill;
