'use client';

import { useSyncExternalStore } from 'react';
import { useTheme } from 'next-themes';
import {
	IconDeviceDesktopFilled,
	IconMoonFilled,
	IconSunFilled,
} from '@tabler/icons-react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

// Hydration-safe way to detect client-side mounting
const emptySubscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export default function ThemeSwitcher({
	className,
	variant = 'multiple',
}: {
	className?: string;
	variant?: 'single' | 'multiple';
}) {
	const { resolvedTheme, setTheme, theme } = useTheme();
	const mounted = useSyncExternalStore(
		emptySubscribe,
		getSnapshot,
		getServerSnapshot,
	);

	// Toggle theme function
	const toggleTheme = () => {
		const newTheme = resolvedTheme === 'light' ? 'dark' : 'light';
		setTheme(newTheme);
		document.documentElement.setAttribute('data-theme', newTheme);
		localStorage.setItem('theme', newTheme);
	};

	return (
		mounted &&
		(variant === 'multiple' ? (
			<VariantMultipleButton
				className={className}
				setTheme={setTheme}
				theme={theme as 'light' | 'dark'}
			/>
		) : (
			<VariantSingleButton
				className={className}
				toggleTheme={toggleTheme}
				theme={resolvedTheme as 'light' | 'dark'}
			/>
		))
	);
}

const VariantSingleButton = ({
	className,
	toggleTheme,
	theme,
}: {
	className?: string;
	toggleTheme: () => void;
	theme: 'light' | 'dark';
}) => {
	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={toggleTheme}
			className={cn(
				'bg-muted hover:dark:bg-primary dark:bg-secondary ring-accent! rounded-full p-4 ring-1 transition-colors duration-200',
				className,
			)}
		>
			<AnimatePresence mode="wait" initial={false}>
				{theme === 'light' ? (
					<motion.div
						key="moon"
						initial={{ scale: 0.8, opacity: 0.5 }}
						animate={{ scale: 1, opacity: 1 }}
						exit={{
							scale: 0.8,
							opacity: 0.5,
						}}
						transition={{ duration: 0.2 }}
					>
						<IconMoonFilled className="text-shadow-primary text-primary/90 dark:text-primary-foreground h-6 w-6 opacity-65! transition-colors duration-200" />
					</motion.div>
				) : (
					<motion.div
						key="sun"
						initial={{ scale: 0.8, opacity: 0.5 }}
						animate={{ scale: 1, opacity: 1 }}
						exit={{
							scale: 0.8,
							opacity: 0.5,
						}}
						transition={{ duration: 0.2 }}
					>
						<IconSunFilled className="text-primary-foreground/60! dark:text-primary-foreground/60! h-6 w-6 opacity-85 transition-colors duration-200" />
					</motion.div>
				)}
			</AnimatePresence>
		</Button>
	);
};

const VariantMultipleButton = ({
	className,
	setTheme,
	theme,
	themes = [
		{ key: 'light', icon: IconSunFilled, label: 'Light Theme' },
		{ key: 'dark', icon: IconMoonFilled, label: 'Dark Theme' },
		{ key: 'system', icon: IconDeviceDesktopFilled, label: 'System Theme' },
	],
}: {
	className?: string;
	setTheme: (theme: 'light' | 'dark' | 'system') => void;
	theme: 'light' | 'dark';
	themes?: Array<{ key: string; icon: React.ElementType; label: string }>;
}) => {
	return (
		<div
			className={cn(
				'bg-muted ring-border relative flex h-[32px] rounded-full p-1 px-1.5 ring-1',
				className,
			)}
		>
			{themes.map(({ key, icon: Icon, label }) => {
				const isActive = theme === key;

				return (
					<button
						type="button"
						key={key}
						className="relative h-6 w-6 cursor-pointer rounded-full"
						onClick={() =>
							setTheme(key as 'light' | 'dark' | 'system')
						}
						aria-label={label}
					>
						{isActive && (
							<motion.div
								layoutId="activeTheme"
								className="bg-primary dark:bg-primary/80 absolute inset-0 rounded-full"
								transition={{ type: 'spring', duration: 0.5 }}
							/>
						)}
						<Icon
							className={cn(
								'relative m-auto size-4',
								isActive
									? 'text-primary-foreground dark:text-primary-foreground'
									: 'text-muted-foreground/80 dark:text-muted-foreground',
							)}
						/>
					</button>
				);
			})}
		</div>
	);
};
