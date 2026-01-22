'use client';

import { Star, Quote, Heart } from 'lucide-react';
import { motion } from 'motion/react';

const testimonials = [
	{
		name: 'Sarah Chen',
		role: 'Senior Backend Developer',
		company: 'TechCorp',
		avatar: 'SC',
		content:
			"Api Studio has completely transformed how I test APIs. The WebSocket support is incredible, and the UI is so much cleaner than other tools I've used.",
		gradient: 'from-violet-500 to-purple-500',
	},
	{
		name: 'Marcus Johnson',
		role: 'Full Stack Engineer',
		company: 'StartupXYZ',
		avatar: 'MJ',
		content:
			'Finally, an API client that looks as good as it works. The collections feature saves me hours every week. Highly recommended!',
		gradient: 'from-blue-500 to-cyan-500',
	},
	{
		name: 'Emily Rodriguez',
		role: 'DevOps Lead',
		company: 'CloudScale',
		avatar: 'ER',
		content:
			'The environment switching is seamless. I can test across dev, staging, and prod without any hassle. Game changer for our team.',
		gradient: 'from-pink-500 to-rose-500',
	},
	{
		name: 'Alex Kim',
		role: 'API Developer',
		company: 'DataFlow',
		avatar: 'AK',
		content:
			"Been using this for development and it's perfect. The query builder and response visualization are top-notch.",
		gradient: 'from-green-500 to-emerald-500',
	},
	{
		name: 'Jordan Taylor',
		role: 'Tech Lead',
		company: 'InnovateTech',
		avatar: 'JT',
		content:
			'Our entire team switched to Api Studio. The collaboration features and shared collections make API development so much smoother.',
		gradient: 'from-orange-500 to-amber-500',
	},
	{
		name: 'Priya Patel',
		role: 'Software Architect',
		company: 'BuildRight',
		avatar: 'PP',
		content:
			'The code generation feature alone is worth it. Export to any language in seconds. Beautiful interface too!',
		gradient: 'from-indigo-500 to-violet-500',
	},
];

export default function Testimonials() {
	return (
		<section
			id="testimonials"
			className="py-24 relative overflow-hidden bg-background"
		>
			{/* Background */}
			<div className="absolute inset-0 pointer-events-none">
				<div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
				<div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/5 rounded-full blur-[120px]" />
			</div>

			<div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
				{/* Section Header */}
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
					className="text-center max-w-3xl mx-auto mb-16"
				>
					<motion.div
						initial={{ opacity: 0, scale: 0.8 }}
						whileInView={{ opacity: 1, scale: 1 }}
						viewport={{ once: true }}
						className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/20 mb-6"
					>
						<Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
						<span className="text-sm font-medium text-pink-500 dark:text-pink-300">
							Loved by Developers
						</span>
					</motion.div>

					<h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-foreground">
						Trusted by{' '}
						<span className="bg-gradient-to-r from-pink-600 via-violet-600 to-indigo-600 dark:from-pink-400 dark:via-violet-400 dark:to-indigo-400 bg-clip-text text-transparent">
							developers worldwide
						</span>
					</h2>
					<p className="text-lg text-muted-foreground">
						Join the growing community of developers who have made
						Api Studio their daily driver for API development and
						testing.
					</p>
				</motion.div>

				{/* Testimonials Grid */}
				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
					{testimonials.map((testimonial, index) => (
						<motion.div
							key={index}
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5, delay: index * 0.1 }}
							whileHover={{ y: -5, scale: 1.02 }}
							className="group relative rounded-2xl bg-card border border-border p-6 hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-md"
						>
							{/* Quote Icon */}
							<Quote className="w-10 h-10 text-primary/10 mb-4 group-hover:text-primary/20 transition-colors" />

							{/* Content */}
							<p className="text-foreground/90 mb-6 leading-relaxed text-sm">
								&ldquo;{testimonial.content}&rdquo;
							</p>

							{/* Rating */}
							<div className="flex gap-1 mb-4">
								{[...Array(5)].map((_, i) => (
									<motion.div
										key={i}
										initial={{ opacity: 0, scale: 0 }}
										whileInView={{ opacity: 1, scale: 1 }}
										viewport={{ once: true }}
										transition={{ delay: 0.5 + i * 0.1 }}
									>
										<Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
									</motion.div>
								))}
							</div>

							{/* Author */}
							<div className="flex items-center gap-3">
								<motion.div
									whileHover={{ scale: 1.1 }}
									className={`w-10 h-10 rounded-full bg-gradient-to-r ${testimonial.gradient} flex items-center justify-center text-white font-semibold text-sm shadow-lg`}
								>
									{testimonial.avatar}
								</motion.div>
								<div>
									<div className="font-semibold text-sm text-foreground">
										{testimonial.name}
									</div>
									<div className="text-xs text-muted-foreground">
										{testimonial.role} at{' '}
										{testimonial.company}
									</div>
								</div>
							</div>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}
