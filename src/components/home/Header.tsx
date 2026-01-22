'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/modules/authentication/store';
import { Menu, X, Github, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import ThemeSwitcher from '@/components/app-ui/theme-switcher';

const MotionLink = motion.create(Link);

export default function Header() {
	const { data } = useAuthStore();
	const isSignedIn = !!data?.session;
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const { scrollY } = useScroll();

	// Dynamic header styles based on scroll
	const headerY = useTransform(scrollY, [0, 100], [0, -10]);
	const headerBorder = useTransform(
		scrollY,
		[0, 20],
		['rgba(255,255,255,0)', 'rgba(255,255,255,0.1)'],
	);
	const headerBackdrop = useTransform(
		scrollY,
		[0, 20],
		['blur(0px)', 'blur(12px)'],
	);
	const headerBg = useTransform(
		scrollY,
		[0, 20],
		['rgba(var(--background), 0)', 'rgba(var(--background), 0.8)'],
	);

	return (
		<motion.header
			style={{
				y: headerY,
			}}
			className="fixed top-0 left-0 right-0 z-50 pt-4 px-4"
		>
			<motion.div className="max-w-7xl mx-auto rounded-full border border-white/10 bg-white/5 backdrop-blur-md shadow-lg transition-all duration-300">
				<div className="px-6 py-2.5">
					<div className="flex items-center justify-between">
						{/* Logo */}
						<Link
							href="/"
							className="flex items-center gap-3 group"
						>
							<motion.div
								className="relative w-9 h-9"
								whileHover={{ rotate: 180 }}
								transition={{ duration: 0.6, type: 'spring' }}
							>
								<Image
									src="/logo.png"
									alt="Api Studio Logo"
									fill
									className="object-contain"
								/>
							</motion.div>
							<span className="text-lg font-bold tracking-tight bg-linear-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 bg-clip-text text-transparent">
								Api Studio
							</span>
						</Link>

						{/* Desktop Navigation */}
						<nav className="hidden md:flex items-center bg-secondary/30 rounded-full px-2 py-1.5 border border-white/5">
							{[
								{ label: 'Features', href: '/#features' },
								{ label: 'Community', href: '/#testimonials' },
								{ label: 'Docs', href: '/docs' },
							].map((link) => (
								<Link
									key={link.label}
									href={link.href}
									className="px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-full hover:bg-background/80 transition-all duration-300"
								>
									{link.label}
								</Link>
							))}
						</nav>

						<div className="hidden md:flex items-center gap-3">
							<ThemeSwitcher
								variant="single"
								className="w-9 h-9"
							/>

							<motion.a
								href="https://github.com/rohittiwari-dev/api-client"
								target="_blank"
								rel="noopener noreferrer"
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								className="p-2 text-muted-foreground hover:text-foreground transition-colors"
								aria-label="GitHub"
							>
								<Github className="w-5 h-5" />
							</motion.a>

							<div className="w-px h-6 bg-border/50 mx-1" />

							{isSignedIn ? (
								<MotionLink
									href="/workspace"
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									className="pl-4 pr-3 py-2 rounded-full bg-primary text-primary-foreground font-medium text-sm shadow-lg shadow-primary/20 flex items-center gap-1.5 hover:brightness-110 transition-all"
								>
									Open App
									<div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
										<ChevronRight className="w-3 h-3" />
									</div>
								</MotionLink>
							) : (
								<>
									<Link
										href="/sign-in"
										className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2"
									>
										Sign In
									</Link>
									<MotionLink
										href="/sign-up"
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
										className="px-5 py-2 rounded-full bg-foreground text-background font-medium text-sm hover:opacity-90 transition-opacity"
									>
										Get Started
									</MotionLink>
								</>
							)}
						</div>

						{/* Mobile Menu Button */}
						<div className="flex items-center gap-3 md:hidden">
							<ThemeSwitcher
								variant="single"
								className="w-9 h-9"
							/>
							<motion.button
								whileTap={{ scale: 0.95 }}
								onClick={() =>
									setMobileMenuOpen(!mobileMenuOpen)
								}
								className="p-2 rounded-full hover:bg-muted/50 transition-colors"
								aria-label="Menu"
							>
								{mobileMenuOpen ? (
									<X className="w-5 h-5" />
								) : (
									<Menu className="w-5 h-5" />
								)}
							</motion.button>
						</div>
					</div>
				</div>
			</motion.div>

			{/* Mobile Menu Overlay */}
			<AnimatePresence>
				{mobileMenuOpen && (
					<motion.div
						initial={{ opacity: 0, scale: 0.95, y: -20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: -20 }}
						transition={{ duration: 0.2 }}
						className="absolute top-20 left-4 right-4 p-4 rounded-3xl bg-background/90 backdrop-blur-2xl border border-border shadow-2xl md:hidden"
					>
						<nav className="flex flex-col gap-2">
							{[
								{ label: 'Features', href: '/#features' },
								{ label: 'Community', href: '/#testimonials' },
								{ label: 'Docs', href: '/docs' },
							].map((link) => (
								<Link
									key={link.label}
									href={link.href}
									className="px-4 py-3 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors"
									onClick={() => setMobileMenuOpen(false)}
								>
									{link.label}
								</Link>
							))}

							<div className="h-px bg-border/50 my-2" />

							<a
								href="https://github.com/rohittiwari-dev/api-client"
								target="_blank"
								rel="noopener noreferrer"
								className="px-4 py-3 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors flex items-center gap-2"
							>
								<Github className="w-5 h-5" />
								GitHub
							</a>

							<div className="grid grid-cols-2 gap-3 mt-2">
								{isSignedIn ? (
									<Link
										href="/workspace"
										className="col-span-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-center"
										onClick={() => setMobileMenuOpen(false)}
									>
										Open App
									</Link>
								) : (
									<>
										<Link
											href="/sign-in"
											className="px-4 py-3 rounded-xl bg-muted text-foreground font-medium text-center hover:bg-muted/80 transition-colors"
											onClick={() =>
												setMobileMenuOpen(false)
											}
										>
											Sign In
										</Link>
										<Link
											href="/sign-up"
											className="px-4 py-3 rounded-xl bg-foreground text-background font-medium text-center hover:opacity-90 transition-opacity"
											onClick={() =>
												setMobileMenuOpen(false)
											}
										>
											Get Started
										</Link>
									</>
								)}
							</div>
						</nav>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.header>
	);
}
