'use client';

import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';
import { useRouter } from 'nextjs-toploader/app';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	const router = useRouter();

	return (
		<div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background p-4">
			{/* Background Ambient Effects */}
			<div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-20">
				<div className="h-160 w-160 rounded-full bg-destructive/10 blur-[100px]" />
				<div className="absolute top-1/4 left-1/4 h-80 w-80 rounded-full bg-orange-500/10 blur-[80px]" />
				<div className="absolute bottom-1/4 right-1/4 h-120 w-120 rounded-full bg-red-500/10 blur-[90px]" />
			</div>

			<div className="z-10 flex max-w-2xl flex-col items-center text-center">
				<motion.div
					initial={{ opacity: 0, scale: 0.8 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.5, ease: 'easeOut' }}
					className="relative mb-8 flex h-32 w-32 items-center justify-center rounded-3xl border border-border/50 bg-card/50 shadow-2xl backdrop-blur-xl"
				>
					<div className="absolute inset-0 rounded-3xl bg-linear-to-br from-destructive/20 to-transparent p-px" />
					<AlertTriangle
						className="h-16 w-16 text-destructive"
						strokeWidth={1.5}
					/>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.2 }}
				>
					<h1 className="mb-2 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
						Something went wrong!
					</h1>
					<p className="mb-8 text-lg text-muted-foreground">
						We apologize for the inconvenience. An unexpected error
						has occurred.
					</p>
					<div className="mb-8 w-full mx-auto max-w-md rounded-lg border border-destructive/20 bg-destructive/10 p-4 font-mono text-sm text-destructive shadow-sm">
						<p className="wrap-break-word text-center">
							{error.message}
						</p>
					</div>
					{error.digest && (
						<p className="mb-8 font-mono text-xs text-muted-foreground/50">
							Error Digest: {error.digest}
						</p>
					)}
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.4 }}
					className="flex flex-col gap-4 sm:flex-row"
				>
					<Button
						size="lg"
						onClick={reset}
						className="gap-2 shadow-lg shadow-primary/20 transition-shadow hover:shadow-primary/30"
					>
						<RotateCcw className="h-4 w-4" />
						Try Again
					</Button>
					<Button
						size="lg"
						variant="outline"
						onClick={() => router.push('/')}
						className="group gap-2 border-border/50 bg-background/50 backdrop-blur-sm hover:bg-muted/50"
					>
						<Home className="h-4 w-4" />
						Return Home
					</Button>
				</motion.div>
			</div>
		</div>
	);
}
