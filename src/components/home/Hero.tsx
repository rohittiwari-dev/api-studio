'use client';

import Link from 'next/link';
import { useAuthStore } from '@/modules/authentication/store';
import {
	ArrowRight,
	Github,
	Zap,
	Shield,
	Layers,
	Play,
	Server,
	Box,
} from 'lucide-react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { APP_VERSION } from '@/constants';
import { useRef, useState, useEffect } from 'react';

const MotionLink = motion.create(Link);

export default function Hero() {
	const { data } = useAuthStore();
	const isSignedIn = !!data?.session;
	const containerRef = useRef<HTMLDivElement>(null);

	const { scrollY } = useScroll();
	const y1 = useTransform(scrollY, [0, 500], [0, 200]);
	const y2 = useTransform(scrollY, [0, 500], [0, -150]);

	// Animation States
	const [activeTab, setActiveTab] = useState(0);
	const [urlText, setUrlText] = useState('');
	const fullUrl = 'https://api.example.com/v1/users/me';

	useEffect(() => {
		let i = 0;
		const typingInterval = setInterval(() => {
			setUrlText(fullUrl.slice(0, i));
			i++;
			if (i > fullUrl.length) {
				setTimeout(() => {
					i = 0;
				}, 2000); // Wait before restart
			}
		}, 50);

		const tabInterval = setInterval(() => {
			setActiveTab((prev) => (prev === 0 ? 1 : 0));
		}, 4000);

		return () => {
			clearInterval(typingInterval);
			clearInterval(tabInterval);
		};
	}, []);

	return (
		<section
			ref={containerRef}
			className="relative min-h-[90vh] flex items-center overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32"
		>
			{/* Background Decor */}
			<div className="absolute inset-0 z-0 select-none pointer-events-none">
				<div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] mix-blend-screen opacity-30 translate-x-1/3 -translate-y-1/3" />
				<div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px] mix-blend-screen opacity-30 -translate-x-1/3 translate-y-1/3" />
				<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
			</div>

			<div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
				<div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
					{/* Left: Content */}
					<div className="text-center lg:text-left order-2 lg:order-1">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}
							className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/80 border border-border/50 backdrop-blur-md mb-8 ring-1 ring-white/10"
						>
							<span className="relative flex h-2 w-2">
								<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
								<span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
							</span>
							<span className="text-xs font-medium text-foreground/80">
								Api Studio v{APP_VERSION}
							</span>
						</motion.div>

						<motion.h1
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.1 }}
							className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]"
						>
							Master your <br />
							<span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-500 bg-clip-text text-transparent">
								API Workflow
							</span>
						</motion.h1>

						<motion.p
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.2 }}
							className="text-lg text-muted-foreground/80 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed"
						>
							The professional, lightweight API client for
							developers who care about speed. Debug, test, and
							document your endpoints without the bloat.
						</motion.p>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.3 }}
							className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mb-12"
						>
							<MotionLink
								href={isSignedIn ? '/workspace' : '/sign-up'}
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								className="h-10 px-6 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
							>
								{isSignedIn ? 'Open Workspace' : 'Get Started'}
								<ArrowRight className="w-4 h-4" />
							</MotionLink>

							<motion.a
								href="https://github.com/rohittiwari-dev/api-client"
								target="_blank"
								rel="noopener noreferrer"
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								className="h-10 px-6 rounded-lg bg-background border border-border/50 hover:bg-secondary/50 hover:border-border font-medium text-sm transition-all flex items-center justify-center gap-2"
							>
								<Github className="w-4 h-4" />
								<span>Star on GitHub</span>
							</motion.a>
						</motion.div>

						{/* Features List */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.8, delay: 0.4 }}
							className="grid grid-cols-3 gap-6 pt-8 border-t border-border/40"
						>
							<motion.div
								initial={{ opacity: 0, x: -10 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: 0.5 }}
							>
								<div className="flex items-center gap-2 mb-1 text-foreground font-medium text-sm">
									<Zap className="w-4 h-4 text-amber-500" />
									<span>Fast</span>
								</div>
								<p className="text-[10px] text-muted-foreground tracking-tight font-medium">
									Native performance.
								</p>
							</motion.div>
							<motion.div
								initial={{ opacity: 0, x: -10 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: 0.6 }}
							>
								<div className="flex items-center gap-2 mb-1 text-foreground font-medium text-sm">
									<Shield className="w-4 h-4 text-emerald-500" />
									<span>Local</span>
								</div>
								<p className="text-[10px] text-muted-foreground tracking-tight font-medium">
									Your data is local.
								</p>
							</motion.div>
							<motion.div
								initial={{ opacity: 0, x: -10 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: 0.7 }}
							>
								<div className="flex items-center gap-2 mb-1 text-foreground font-medium text-sm">
									<Box className="w-4 h-4 text-blue-500" />
									<span>Open</span>
								</div>
								<p className="text-[10px] text-muted-foreground tracking-tight font-medium">
									100% open source.
								</p>
							</motion.div>
						</motion.div>
					</div>

					{/* Right: Visual (Animated Mockup) */}
					<div className="order-1 lg:order-2 perspective-[2000px] relative">
						<div className="absolute inset-0 bg-gradient-to-tr from-violet-600/20 to-indigo-600/20 rounded-full blur-[100px] -z-10" />

						<motion.div
							initial={{
								rotateY: 15,
								rotateX: 5,
								opacity: 0,
								scale: 0.9,
							}}
							animate={{
								rotateY: -6,
								rotateX: 3,
								opacity: 1,
								scale: 1,
							}}
							whileHover={{
								rotateY: -1,
								rotateX: 1,
								scale: 1.02,
							}}
							transition={{ duration: 1.2, ease: 'easeOut' }}
							style={{ y: y1 }}
							className="relative rounded-xl border border-white/10 bg-[#0d0e12] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden group transition-all duration-500"
						>
							{/* Simulated Cursor */}
							<motion.div
								animate={{
									x:
										activeTab === 0
											? [100, 300, 450]
											: [450, 200, 100],
									y:
										activeTab === 0
											? [100, 80, 150]
											: [150, 200, 100],
								}}
								transition={{
									duration: 3,
									repeat: Infinity,
									repeatType: 'reverse',
								}}
								className="absolute z-50 pointer-events-none"
							>
								<div className="w-4 h-4 border-2 border-white/50 bg-white/20 rounded-full blur-[2px]" />
							</motion.div>

							{/* Window Header */}
							<div className="h-10 border-b border-white/5 flex items-center px-4 gap-2 bg-[#0d0e12]">
								<div className="flex gap-2">
									<div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
									<div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
									<div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
								</div>
								<div className="flex-1 text-center">
									<span className="text-[10px] font-mono text-white/20">
										api-studio-workplace
									</span>
								</div>
							</div>

							<div className="flex h-[400px] md:h-[480px]">
								{/* Sidebar */}
								<div className="w-16 md:w-56 border-r border-white/5 bg-[#0b0c10] flex flex-col pt-4">
									<div className="px-4 mb-5 flex items-center justify-between opacity-20">
										<span className="text-[9px] font-bold tracking-[0.2em] hidden md:block">
											WORKSPACE
										</span>
										<Layers className="w-3.5 h-3.5" />
									</div>
									<div className="space-y-1 px-2">
										<div
											className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
												activeTab === 0
													? 'bg-white/[0.05] text-white'
													: 'text-white/20'
											}`}
										>
											<Box className="w-4 h-4 text-purple-400" />
											<span className="text-[11px] font-medium hidden md:block">
												Active Requests
											</span>
										</div>
										<div className="flex items-center gap-3 px-3 py-2 text-white/20 hover:bg-white/[0.02] cursor-pointer">
											<Server className="w-4 h-4" />
											<span className="text-[11px] font-medium hidden md:block">
												Endpoints
											</span>
										</div>
									</div>
								</div>

								{/* Main Content */}
								<div className="flex-1 flex flex-col bg-[#0d0e12]">
									{/* Tabs Bar */}
									<div className="h-9 flex border-b border-white/5 text-[10px]">
										<motion.div
											className={`w-40 border-r border-white/5 flex items-center px-4 gap-2 font-medium border-t-2 transition-all cursor-pointer ${
												activeTab === 0
													? 'border-t-purple-400 text-white bg-[#0d0e12]'
													: 'border-t-transparent text-white/20 hover:bg-white/[0.02]'
											}`}
											onClick={() => setActiveTab(0)}
										>
											<span className="text-green-500 font-bold">
												GET
											</span>
											<span>/users/me</span>
										</motion.div>
										<motion.div
											className={`w-40 flex items-center px-4 gap-2 font-medium border-t-2 transition-all cursor-pointer ${
												activeTab === 1
													? 'border-t-purple-400 text-white bg-[#0d0e12]'
													: 'border-t-transparent text-white/20 hover:bg-white/[0.02]'
											}`}
											onClick={() => setActiveTab(1)}
										>
											<span className="text-orange-400 font-bold">
												POST
											</span>
											<span>/auth/login</span>
										</motion.div>
									</div>

									{/* URL Bar */}
									<div className="p-3 border-b border-white/5 flex gap-2">
										<div className="flex-1 bg-black/40 border border-white/5 rounded-md flex items-center px-3 gap-2 h-9">
											<span className="text-green-500 text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-500/10">
												GET
											</span>
											<span className="text-[11px] text-white/40 font-mono tracking-tight overflow-hidden whitespace-nowrap">
												{activeTab === 0
													? urlText
													: 'https://api.example.com/v1/auth/login'}
												<motion.span
													animate={{
														opacity: [0, 1],
													}}
													transition={{
														repeat: Infinity,
														duration: 0.8,
													}}
													className="inline-block w-1.5 h-3.5 bg-purple-400 ml-0.5"
												/>
											</span>
										</div>
										<motion.div
											whileHover={{ scale: 1.05 }}
											whileTap={{ scale: 0.95 }}
											className="px-5 h-9 bg-purple-500 text-white rounded-md flex items-center justify-center font-bold text-[11px] gap-2 shadow-lg shadow-purple-500/10 cursor-pointer"
										>
											<Play className="w-3 h-3 fill-current" />
											<span>Send</span>
										</motion.div>
									</div>

									{/* Response View */}
									<div className="flex-1 p-5 font-mono text-[11px] overflow-hidden relative">
										<AnimatePresence mode="wait">
											<motion.div
												key={activeTab}
												initial={{ opacity: 0, y: 10 }}
												animate={{ opacity: 1, y: 0 }}
												exit={{ opacity: 0, y: -10 }}
												transition={{ duration: 0.3 }}
												className="space-y-1.5"
											>
												<div className="flex gap-2 mb-4">
													<span className="text-[9px] text-green-500 bg-green-500/10 px-2 py-0.5 rounded">
														200 OK
													</span>
													<span className="text-[9px] text-white/40 bg-white/5 px-2 py-0.5 rounded">
														45ms
													</span>
												</div>

												<div className="text-purple-400/80">
													{'{'}
												</div>
												{activeTab === 0 ? (
													<>
														<motion.div
															initial={{
																opacity: 0,
																x: -5,
															}}
															animate={{
																opacity: 1,
																x: 0,
															}}
															transition={{
																delay: 0.4,
															}}
															className="pl-4"
														>
															<span className="text-purple-400">
																&quot;id&quot;
															</span>
															:{' '}
															<span className="text-orange-400">
																&quot;usr_pk29&quot;
															</span>
															,
														</motion.div>
														<motion.div
															initial={{
																opacity: 0,
																x: -5,
															}}
															animate={{
																opacity: 1,
																x: 0,
															}}
															transition={{
																delay: 0.6,
															}}
															className="pl-4"
														>
															<span className="text-purple-400">
																&quot;email&quot;
															</span>
															:{' '}
															<span className="text-green-400">
																&quot;dev@api.studio&quot;
															</span>
															,
														</motion.div>
														<motion.div
															initial={{
																opacity: 0,
																x: -5,
															}}
															animate={{
																opacity: 1,
																x: 0,
															}}
															transition={{
																delay: 0.8,
															}}
															className="pl-4"
														>
															<span className="text-purple-400">
																&quot;status&quot;
															</span>
															:{' '}
															<span className="text-green-400">
																&quot;active&quot;
															</span>
														</motion.div>
													</>
												) : (
													<>
														<motion.div
															initial={{
																opacity: 0,
																x: -5,
															}}
															animate={{
																opacity: 1,
																x: 0,
															}}
															transition={{
																delay: 0.4,
															}}
															className="pl-4"
														>
															<span className="text-purple-400">
																&quot;token&quot;
															</span>
															:{' '}
															<span className="text-green-400">
																&quot;jwt_v1_...&quot;
															</span>
															,
														</motion.div>
														<motion.div
															initial={{
																opacity: 0,
																x: -5,
															}}
															animate={{
																opacity: 1,
																x: 0,
															}}
															transition={{
																delay: 0.6,
															}}
															className="pl-4"
														>
															<span className="text-purple-400">
																&quot;expires&quot;
															</span>
															:{' '}
															<span className="text-orange-400">
																3600
															</span>
														</motion.div>
													</>
												)}
												<div className="text-purple-400/80">
													{'}'}
												</div>
											</motion.div>
										</AnimatePresence>
									</div>
								</div>
							</div>
						</motion.div>

						{/* Floating UI Elements */}
						<motion.div
							style={{ y: y2 }}
							animate={{ y: [0, -8, 0] }}
							transition={{
								duration: 4,
								repeat: Infinity,
								ease: 'easeInOut',
							}}
							className="absolute -right-8 top-24 glass-card p-3 rounded-lg border border-white/10 bg-black/60 backdrop-blur-xl shadow-2xl hidden lg:block"
						>
							<div className="flex items-center gap-3 mb-3">
								<div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
								<span className="text-[9px] font-bold text-white/40 tracking-widest uppercase">
									Live Pulse
								</span>
							</div>
							<div className="flex flex-col gap-2 min-w-[120px]">
								{[1, 2, 3].map((i) => (
									<div
										key={i}
										className="flex flex-col gap-1"
									>
										<div className="flex justify-between text-[8px] text-white/30">
											<span>Request {i}</span>
											<span>
												{Math.floor(
													Math.random() * 50 + 20,
												)}
												ms
											</span>
										</div>
										<div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
											<motion.div
												animate={{
													x: ['-100%', '100%'],
												}}
												transition={{
													repeat: Infinity,
													duration: 2,
													delay: i * 0.4,
												}}
												className="h-full w-1/3 bg-purple-400/50"
											/>
										</div>
									</div>
								))}
							</div>
						</motion.div>
					</div>
				</div>
			</div>
		</section>
	);
}
