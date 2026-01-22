'use client';

import { motion } from 'motion/react';
import { Download, Monitor, Zap, Check } from 'lucide-react';
import { useState, useSyncExternalStore } from 'react';

import { usePWA } from '@/components/sw-register';

const subscribe = (callback: () => void) => {
	const query = window.matchMedia('(display-mode: standalone)');
	query.addEventListener('change', callback);
	return () => query.removeEventListener('change', callback);
};

const getSnapshot = () => {
	return window.matchMedia('(display-mode: standalone)').matches;
};

const getServerSnapshot = () => false;

export default function PWAInstall() {
	const { deferredPrompt, promptToInstall } = usePWA();
	const [userInstalled, setUserInstalled] = useState(false);

	const isStandalone = useSyncExternalStore(
		subscribe,
		getSnapshot,
		getServerSnapshot,
	);

	const isInstalled = isStandalone || userInstalled;

	const handleInstallClick = async () => {
		if (!deferredPrompt) {
			return;
		}
		await promptToInstall();
		setUserInstalled(true);
	};

	return (
		<section className="py-24 relative overflow-hidden bg-background">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
					className="max-w-6xl mx-auto"
				>
					<div className="relative rounded-3xl bg-secondary/30 border border-border p-8 md:p-12 overflow-hidden">
						{/* Background Gradient */}
						<div className="absolute inset-0 bg-linear-to-bl from-violet-500/5 via-indigo-500/5 to-rose-500/5 opacity-50" />

						<div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
							{/* Content */}
							<div className="flex-1 text-center md:text-left">
								<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 mb-6">
									<Monitor className="w-3 h-3 text-violet-500" />
									<span className="text-xs font-medium text-violet-500">
										Native Experience
									</span>
								</div>

								<motion.h2
									initial={{ opacity: 0, y: 20 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true }}
									transition={{ delay: 0.1 }}
									className="text-3xl md:text-5xl font-bold mb-6 text-foreground tracking-tight"
								>
									Install as a{' '}
									<span className="bg-linear-to-r from-violet-500 to-indigo-500 bg-clip-text text-transparent">
										Native App
									</span>
								</motion.h2>

								<motion.p
									initial={{ opacity: 0, y: 20 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true }}
									transition={{ delay: 0.2 }}
									className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-lg mx-auto md:mx-0"
								>
									Get the full power of Api Studio directly on
									your desktop or mobile device. Enjoy offline
									support, keyboard shortcuts, and
									zero-latency performance.
								</motion.p>

								<div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
									{/* Install Button - Only show if likely installable or strictly just for demo if not supported/already installed context needed? 
                        User asked: "install button is needed to have if it is supported device"
                    */}
									{!isInstalled && (
										<motion.button
											onClick={handleInstallClick}
											disabled={!deferredPrompt}
											whileHover={{ scale: 1.02 }}
											whileTap={{ scale: 0.98 }}
											className={`px-8 py-3 rounded-xl font-bold text-lg flex items-center gap-2 shadow-md transition-all shadow-violet-500/25  ${
												deferredPrompt
													? 'bg-linear-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white cursor-pointer'
													: 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
											}`}
										>
											<Download className="w-5 h-5" />
											{deferredPrompt
												? 'Install App'
												: 'Not Available'}
										</motion.button>
									)}

									{isInstalled && (
										<div className="px-8 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 font-bold flex items-center gap-2">
											<Check className="w-5 h-5" />
											Installed
										</div>
									)}

									<div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
										<span className="flex items-center gap-1">
											<Zap className="w-4 h-4 text-yellow-500" />{' '}
											Instant Load
										</span>
									</div>
								</div>

								{!deferredPrompt && !isInstalled && (
									<p className="text-xs text-muted-foreground mt-4">
										* Installable on confirmed supported
										browsers (Chrome, Edge, Android).
									</p>
								)}
							</div>

							{/* Animation / Visual */}
							<div className="flex-1 w-full max-w-md relative">
								<div className="relative aspect-square md:aspect-4/3">
									{/* Floating App Window */}
									<motion.div
										initial={{ y: 20, opacity: 0 }}
										whileInView={{ y: 0, opacity: 1 }}
										transition={{
											delay: 0.2,
											duration: 0.8,
										}}
										className="absolute inset-x-4 top-4 bottom-12 rounded-xl bg-gray-900 border border-gray-800 shadow-2xl overflow-hidden z-20"
									>
										<div className="h-8 bg-gray-800/50 border-b border-gray-700 flex items-center px-3 gap-2">
											<div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
											<div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
											<div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
										</div>
										<div className="p-4 space-y-3">
											<div className="h-8 w-3/4 rounded bg-gray-800/50" />
											<div className="grid grid-cols-4 gap-3">
												<div className="h-24 rounded bg-gray-800/30 col-span-1" />
												<div className="h-24 rounded bg-gray-800/30 col-span-3" />
											</div>
											<div className="h-32 rounded bg-gray-800/30" />
										</div>
									</motion.div>

									{/* Phone behind */}
									<motion.div
										initial={{ x: 20, opacity: 0 }}
										whileInView={{ x: 0, opacity: 1 }}
										transition={{
											delay: 0.4,
											duration: 0.8,
										}}
										className="absolute right-0 bottom-0 top-12 w-1/3 rounded-4xl bg-black border-4 border-gray-800 shadow-2xl z-30 overflow-hidden"
									>
										<div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-4 bg-black rounded-b-xl z-10" />
										<div className="h-full w-full bg-gray-900 p-3 space-y-2 pt-8">
											<div className="h-6 w-full rounded bg-gray-800/50" />
											<div className="h-16 w-full rounded bg-gray-800/30" />
											<div className="h-16 w-full rounded bg-gray-800/30" />
											<div className="h-16 w-full rounded bg-gray-800/30" />
										</div>
									</motion.div>

									{/* Decorative Elements */}
									<div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] -z-10" />
									<div className="absolute -bottom-10 -left-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] -z-10" />
								</div>
							</div>
						</div>
					</div>
				</motion.div>
			</div>
		</section>
	);
}
