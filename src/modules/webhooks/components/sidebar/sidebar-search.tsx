'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { SidebarInput, useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

interface SidebarSearchProps {
	value: string;
	onChange: (value: string) => void;
}

const SidebarSearch: React.FC<SidebarSearchProps> = ({ value, onChange }) => {
	const { state } = useSidebar();

	return (
		<div
			className={cn(
				'px-3 py-2 transition-all duration-200',
				state === 'collapsed' && 'opacity-0 h-0 overflow-hidden',
			)}
		>
			<div className="relative group/search">
				{/* Subtle glow on focus */}
				<div className="absolute -inset-0.5 bg-violet-500/10 rounded-xl opacity-0 group-focus-within/search:opacity-100 blur-sm transition-opacity duration-300 pointer-events-none" />

				<div className="relative">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/50 group-focus-within/search:text-violet-400 transition-colors duration-200" />

					<SidebarInput
						placeholder="Search webhooks..."
						value={value}
						onChange={(e) => onChange(e.target.value)}
						className="h-9 pl-9 pr-3 bg-white/80 border-neutral-300/80 dark:border-neutral-800/80 dark:bg-white/5 border  hover:border-border focus:border-violet-500/20 focus:bg-white/70 dark:focus:bg-white/5 text-sm placeholder:text-muted-foreground/40 rounded-lg transition-all duration-200 ring-0 focus:ring-0"
					/>
				</div>
			</div>
		</div>
	);
};

export default SidebarSearch;
