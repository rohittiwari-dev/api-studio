'use client';

import React, { useRef, useEffect, useLayoutEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from '@/components/ui/hover-card';
import { cn } from '@/lib/utils';
import useEnvironmentStore from '@/modules/apis/environment/store/environment.store';
import { Check, Copy, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface EnvironmentVariableInputProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
	id?: string;
	onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
	onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

interface VariableMatch {
	name: string;
	start: number;
	end: number;
	exists: boolean;
	value?: string;
	type?: 'default' | 'secret';
	isRevealed?: boolean;
}

const VariablePreview = ({
	match,
	activeEnv,
}: {
	match: VariableMatch;
	activeEnv: any;
}) => {
	const [isCopied, setIsCopied] = useState(false);

	// Subscribe to revealedSecretKeys for reactivity
	const revealedSecretKeys = useEnvironmentStore(
		(state) => state.revealedSecretKeys,
	);
	const toggleSecretVisibility = useEnvironmentStore(
		(state) => state.toggleSecretVisibility,
	);

	// Get secret metadata directly from the match and store state
	const isSecret = match.type === 'secret';
	const isRevealed = !isSecret || revealedSecretKeys.includes(match.name);
	const displayValue = isRevealed ? match.value : '••••••••';

	const handleCopy = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (match.value) {
			navigator.clipboard.writeText(match.value);
			setIsCopied(true);
			toast.success('Value copied to clipboard');
			setTimeout(() => setIsCopied(false), 2000);
		}
	};

	const handleToggleVisibility = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		toggleSecretVisibility(match.name);
	};

	return (
		<HoverCard openDelay={100} closeDelay={50}>
			<HoverCardTrigger asChild>
				<span
					className={cn(
						'rounded cursor-pointer pointer-events-auto',
						match.exists
							? isSecret
								? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
								: 'bg-orange-500/20 text-orange-600 dark:text-orange-400'
							: 'bg-rose-500/20 text-rose-600 dark:text-rose-400',
					)}
				>
					{`{{${match.name}}}`}
				</span>
			</HoverCardTrigger>
			<HoverCardContent
				className="w-72 p-3 z-[100]"
				side="top"
				sideOffset={8}
				align="start"
			>
				<div className="space-y-2">
					<div className="flex items-center justify-between gap-4">
						<div className="flex items-center gap-2">
							<span
								className={cn(
									'h-2 w-2 rounded-full shrink-0',
									match.exists
										? isSecret
											? 'bg-amber-500'
											: 'bg-orange-500'
										: 'bg-rose-500',
								)}
							/>
							<span className="text-sm font-medium font-mono truncate">
								{match.name}
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
							{match.exists && match.value && (
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
					{match.exists ? (
						<>
							<div className="text-xs text-muted-foreground">
								Environment:{' '}
								<span className="text-foreground font-medium">
									{activeEnv?.name || 'Unknown'}
								</span>
							</div>
							<div
								className={cn(
									'rounded p-2 font-mono text-xs break-all max-h-32 overflow-auto',
									isSecret
										? 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
										: 'bg-orange-500/10 text-orange-700 dark:text-orange-300',
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
						<div className="text-xs bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded p-2">
							Variable not found
							{activeEnv
								? ` in "${activeEnv.name}"`
								: '. No environment selected.'}
						</div>
					)}
				</div>
			</HoverCardContent>
		</HoverCard>
	);
};

/**
 * Input component that detects {{variableName}} patterns and shows them as colored pills
 * with hover preview showing the variable value
 */
export const EnvironmentVariableInput: React.FC<
	EnvironmentVariableInputProps
> = ({ value, onChange, placeholder, className, id, onKeyDown, onBlur }) => {
	const inputRef = useRef<HTMLInputElement>(null);
	const overlayRef = useRef<HTMLDivElement>(null);
	const [inputStyles, setInputStyles] = useState<React.CSSProperties>({});

	// Subscribe to store state for reactivity
	const environments = useEnvironmentStore((state) => state.environments);
	const activeEnvironmentId = useEnvironmentStore(
		(state) => state.activeEnvironmentId,
	);

	// Get active environment
	const activeEnv =
		environments.find((env) => env.id === activeEnvironmentId) || null;

	// Get variables as record
	const variables: Record<string, string> = {};
	const variableTypes: Record<string, 'default' | 'secret'> = {};
	if (activeEnv?.variables) {
		activeEnv.variables.forEach((v: any) => {
			if (v.enabled !== false && v.key) {
				variables[v.key] = v.value || '';
				variableTypes[v.key] = v.type || 'default';
			}
		});
	}

	// Parse text for variable patterns
	const parseVariables = (text: string): VariableMatch[] => {
		const regex = /\{\{([^{}]+)\}\}/g;
		const matches: VariableMatch[] = [];
		let match;

		while ((match = regex.exec(text)) !== null) {
			const name = match[1]?.trim();
			matches.push({
				name,
				start: match.index,
				end: match.index + match[0].length,
				exists: name in variables,
				value: variables[name],
				type: variableTypes[name] || 'default',
			});
		}

		return matches;
	};

	const variableMatches = parseVariables(value || '');
	const hasVariables = variableMatches.length > 0;

	// Get computed styles from input to match overlay exactly
	useLayoutEffect(() => {
		if (!inputRef.current) {
			return;
		}

		const computed = window.getComputedStyle(inputRef.current);
		setInputStyles({
			paddingLeft: computed.paddingLeft,
			paddingRight: computed.paddingRight,
			paddingTop: computed.paddingTop,
			paddingBottom: computed.paddingBottom,
			fontSize: computed.fontSize,
			fontFamily: computed.fontFamily,
			lineHeight: computed.lineHeight,
			letterSpacing: computed.letterSpacing,
		});
	}, [className, value, hasVariables]);

	// Sync scroll between input and overlay
	useEffect(() => {
		const input = inputRef.current;
		const overlay = overlayRef.current;

		if (!input || !overlay) {
			return;
		}

		const syncScroll = () => {
			overlay.scrollLeft = input.scrollLeft;
		};

		input.addEventListener('scroll', syncScroll);
		return () => input.removeEventListener('scroll', syncScroll);
	}, []);

	// Render overlay content with colored pills
	const renderOverlay = () => {
		if (!value || !hasVariables) {
			return null;
		}

		const parts: React.ReactNode[] = [];
		let lastIndex = 0;

		variableMatches.forEach((match, i) => {
			// Add visible text before variable
			if (match.start > lastIndex) {
				parts.push(
					<span
						key={`text-${i}`}
						className="whitespace-pre text-inherit"
					>
						{value.substring(lastIndex, match.start)}
					</span>,
				);
			}

			// Add variable pill with HoverCard
			parts.push(
				<VariablePreview
					key={`var-${i}`}
					match={match}
					activeEnv={activeEnv}
				/>,
			);

			lastIndex = match.end;
		});

		// Add visible text after last variable
		if (lastIndex < value.length) {
			parts.push(
				<span key="text-end" className="whitespace-pre text-inherit">
					{value.substring(lastIndex)}
				</span>,
			);
		}

		return parts;
	};

	return (
		<div className="relative w-full">
			{/* Actual Input - handles editing and copy/paste */}
			<Input
				ref={inputRef}
				id={id}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				onKeyDown={onKeyDown}
				placeholder={placeholder}
				className={cn(
					'relative z-10',
					hasVariables &&
						'!text-transparent selection:!bg-primary/30',
					className,
				)}
				style={
					hasVariables
						? {
								color: 'transparent',
								caretColor: 'var(--foreground)',
							}
						: undefined
				}
				autoComplete="off"
				spellCheck={false}
				onBlur={onBlur}
			/>

			{/* Overlay - shows colored pills, positioned to match input exactly */}
			{hasVariables && (
				<div
					ref={overlayRef}
					className="absolute inset-0 flex items-center pointer-events-none overflow-hidden whitespace-nowrap z-20"
					style={inputStyles}
				>
					{renderOverlay()}
				</div>
			)}
		</div>
	);
};

export default EnvironmentVariableInput;
