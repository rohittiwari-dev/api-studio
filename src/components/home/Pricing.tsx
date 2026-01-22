'use client';

import Link from 'next/link';
import { Check } from 'lucide-react';
import { useAuthStore } from '@/modules/authentication/store';

const plans = [
	{
		name: 'Free',
		price: '$0',
		period: 'forever',
		description: 'Perfect for personal projects and learning',
		features: [
			'Unlimited requests',
			'5 collections',
			'REST support',
			'Basic auth helpers',
			'Community support',
		],
		cta: 'Get Started Free',
		popular: false,
	},
	{
		name: 'Pro',
		price: '$12',
		period: '/month',
		description: 'For professional developers and small teams',
		features: [
			'Everything in Free',
			'Unlimited collections',
			'WebSocket support',
			'Environment variables',
			'Code generation',
			'Priority support',
			'Team sharing (up to 5)',
		],
		cta: 'Start Pro Trial',
		popular: true,
	},
	{
		name: 'Enterprise',
		price: 'Custom',
		period: '',
		description: 'For large teams and organizations',
		features: [
			'Everything in Pro',
			'Unlimited team members',
			'SSO / SAML',
			'Audit logs',
			'Custom integrations',
			'Dedicated support',
			'SLA guarantee',
		],
		cta: 'Contact Sales',
		popular: false,
	},
];

export default function Pricing() {
	const { data } = useAuthStore();
	const isSignedIn = !!data?.session;

	return (
		<section id="pricing" className="py-24 relative">
			{/* Background */}
			<div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent" />

			<div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
				{/* Section Header */}
				<div className="text-center max-w-3xl mx-auto mb-16">
					<h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
						Simple,{' '}
						<span className="bg-gradient-to-r from-violet-500 to-indigo-500 bg-clip-text text-transparent">
							transparent
						</span>{' '}
						pricing
					</h2>
					<p className="text-lg text-muted-foreground">
						Start free and scale as you grow. No hidden fees, no
						surprise charges.
					</p>
				</div>

				{/* Pricing Cards */}
				<div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
					{plans.map((plan, index) => (
						<div
							key={index}
							className={`relative glass-card rounded-2xl p-8 ${
								plan.popular
									? 'ring-2 ring-violet-500 scale-105'
									: ''
							} transition-all hover:shadow-xl hover:shadow-violet-500/10`}
						>
							{/* Popular Badge */}
							{plan.popular && (
								<div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium">
									Most Popular
								</div>
							)}

							{/* Plan Name */}
							<h3 className="text-xl font-bold mb-2">
								{plan.name}
							</h3>
							<p className="text-sm text-muted-foreground mb-4">
								{plan.description}
							</p>

							{/* Price */}
							<div className="mb-6">
								<span className="text-4xl font-bold">
									{plan.price}
								</span>
								<span className="text-muted-foreground">
									{plan.period}
								</span>
							</div>

							{/* Features */}
							<ul className="space-y-3 mb-8">
								{plan.features.map((feature, i) => (
									<li
										key={i}
										className="flex items-center gap-3 text-sm"
									>
										<Check className="w-5 h-5 text-green-500 flex-shrink-0" />
										<span>{feature}</span>
									</li>
								))}
							</ul>

							{/* CTA */}
							<Link
								href={isSignedIn ? '/workspace' : '/sign-up'}
								className={`block w-full py-3 rounded-xl font-semibold text-center transition-all ${
									plan.popular
										? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25'
										: 'glass hover:bg-accent'
								}`}
							>
								{plan.cta}
							</Link>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
