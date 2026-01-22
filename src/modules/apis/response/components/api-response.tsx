'use client';

import React from 'react';
import { motion } from 'motion/react';
import {
	Loader2,
	Clock,
	HardDrive,
	FileCode,
	FileText,
	Cookie,
	Send,
	AlertCircle,
	Check,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import useResponseStore from '../store/response.store';
import ResponseBodyTabContent from './response-body-tab-content';
import { CodeEditor } from '@/components/ui/code-editor';
import useRequestSyncStoreState from '@/modules/apis/requests/hooks/requestSyncStore';

const tabs = [
	{ name: 'Body', value: 'body', icon: FileCode },
	{ name: 'Headers', value: 'headers', icon: FileText },
	{ name: 'Cookies', value: 'cookies', icon: Cookie },
	{ name: 'Request', value: 'actual-request', icon: Send },
];

const ApiResponse = () => {
	const [activeTab, setActiveTab] = React.useState('body');
	const tabRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
	const [underlineStyle, setUnderlineStyle] = React.useState({
		left: 0,
		width: 0,
	});

	const { activeRequest } = useRequestSyncStoreState();
	const { getResponse } = useResponseStore();

	// Get response for active request
	const response = activeRequest?.id ? getResponse(activeRequest.id) : null;
	const isLoading = response?.loading || false;

	React.useLayoutEffect(() => {
		const activeIndex = tabs.findIndex((tab) => tab.value === activeTab);
		const activeTabElement = tabRefs.current[activeIndex];

		if (activeTabElement) {
			const { offsetLeft, offsetWidth } = activeTabElement;
			setUnderlineStyle({
				left: offsetLeft,
				width: offsetWidth,
			});
		}
	}, [activeTab]);

	const formatSize = (bytes: number) => {
		if (!bytes) {
			return '0 B';
		}
		if (bytes < 1024) {
			return `${bytes} B`;
		}
		if (bytes < 1024 * 1024) {
			return `${(bytes / 1024).toFixed(1)} KB`;
		}
		return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
	};

	const getStatusConfig = (status: number) => {
		if (status >= 200 && status < 300) {
			return {
				color: 'text-emerald-600 dark:text-emerald-400',
				bg: 'bg-emerald-500/10 border-emerald-500/20',
			};
		}
		if (status >= 300 && status < 400) {
			return {
				color: 'text-blue-600 dark:text-blue-400',
				bg: 'bg-blue-500/10 border-blue-500/20',
			};
		}
		if (status >= 400 && status < 500) {
			return {
				color: 'text-orange-600 dark:text-orange-400',
				bg: 'bg-orange-500/10 border-orange-500/20',
			};
		}
		if (status >= 500) {
			return {
				color: 'text-rose-600 dark:text-rose-400',
				bg: 'bg-rose-500/10 border-rose-500/20',
			};
		}
		return {
			color: 'text-muted-foreground',
			bg: 'bg-muted/50 border-border',
		};
	};

	const renderHeaders = () => {
		if (!response?.headers || Object.keys(response.headers).length === 0) {
			return (
				<div className="flex-1 flex flex-col items-center justify-center gap-3 py-12">
					<div className="size-12 rounded-xl bg-muted/50 border border-dashed border-border/50 flex items-center justify-center">
						<FileText className="size-5 text-muted-foreground/40" />
					</div>
					<p className="text-sm text-muted-foreground">
						No response headers
					</p>
				</div>
			);
		}

		return (
			<div className="h-full overflow-auto p-2">
				<div className="flex flex-col gap-0.5">
					{Object.entries(response.headers).map(([key, value]) => (
						<div
							key={key}
							className="grid grid-cols-[minmax(140px,auto)_1fr] gap-3 px-3 py-1.5 rounded-lg hover:bg-muted/50 transition-colors"
						>
							<span className="font-mono text-xs text-primary font-medium truncate">
								{key}
							</span>
							<span className="font-mono text-xs text-foreground/80 break-all">
								{value}
							</span>
						</div>
					))}
				</div>
			</div>
		);
	};

	const renderCookies = () => {
		// Use raw setCookie array if available, otherwise fall back to header
		const setCookieData =
			response?.setCookie || response?.headers?.['set-cookie'];

		if (
			!setCookieData ||
			(Array.isArray(setCookieData) && setCookieData.length === 0)
		) {
			return (
				<div className="flex-1 flex flex-col items-center justify-center gap-3 py-12">
					<div className="size-12 rounded-xl bg-muted/50 border border-dashed border-border/50 flex items-center justify-center">
						<Cookie className="size-5 text-muted-foreground/40" />
					</div>
					<p className="text-sm text-muted-foreground">
						No cookies in response
					</p>
				</div>
			);
		}

		const cookieStrings = Array.isArray(setCookieData)
			? setCookieData
			: [setCookieData];
		const requestDomain = response?.actualRequest?.url
			? new URL(response.actualRequest.url).hostname
			: '';

		return (
			<div className="h-full overflow-auto p-2">
				<div className="flex flex-col gap-2">
					{cookieStrings.map((cookieStr, index) => {
						const parts = cookieStr
							.split(';')
							.map((p: string) => p?.trim());
						const [keyVal, ...attrs] = parts;
						const [name, ...valueParts] = keyVal.split('=');
						const value = valueParts.join('=');

						// Parse attributes for badges
						const attributes = attrs.reduce(
							(acc, attr) => {
								const [k, v] = attr.split('=');
								acc[k.toLowerCase()] = v || true;
								return acc;
							},
							{} as Record<string, string | boolean>,
						);

						const isSecure = attributes['secure'];
						const isHttpOnly = attributes['httponly'];
						const sameSite = attributes['samesite'] as string;
						const domain = attributes['domain'] as string;
						const isThirdParty =
							domain &&
							requestDomain &&
							!requestDomain.endsWith(domain.replace(/^\./, ''));

						return (
							<div
								key={index}
								className="flex flex-col gap-2 p-3 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/30 transition-colors"
							>
								{/* Header: Name & Value */}
								<div className="flex items-start justify-between gap-2">
									<div className="flex flex-col gap-0.5 min-w-0">
										<div className="flex items-center gap-2">
											<span className="font-mono text-sm font-semibold text-primary truncate">
												{name}
											</span>
											{isThirdParty && (
												<span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20 uppercase tracking-wider">
													3rd Party
												</span>
											)}
										</div>
										<span className="font-mono text-xs text-foreground/80 break-all">
											{value}
										</span>
									</div>
								</div>

								{/* Metadata Grid */}
								<div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-2 border-y border-border/30">
									<div className="flex flex-col gap-0.5">
										<span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
											Domain
										</span>
										<span
											className="font-mono text-xs truncate"
											title={
												(domain as string) ||
												requestDomain
											}
										>
											{domain || requestDomain}
										</span>
									</div>
									<div className="flex flex-col gap-0.5">
										<span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
											Path
										</span>
										<span className="font-mono text-xs truncate">
											{(attributes['path'] as string) ||
												'/'}
										</span>
									</div>
									<div className="flex flex-col gap-0.5 col-span-2">
										<span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
											Expires
										</span>
										<span className="font-mono text-xs truncate">
											{(attributes[
												'expires'
											] as string) || 'Session'}
										</span>
									</div>
								</div>

								{/* Flags */}
								<div className="flex flex-wrap gap-1.5">
									{isSecure && (
										<span className="px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
											<Check className="size-3" /> Secure
										</span>
									)}
									{isHttpOnly && (
										<span className="px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 flex items-center gap-1">
											<Check className="size-3" />{' '}
											HttpOnly
										</span>
									)}
									{sameSite && (
										<span className="px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
											SameSite: {sameSite}
										</span>
									)}
									{attributes['partitioned'] && (
										<span className="px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
											Partitioned
										</span>
									)}
								</div>
							</div>
						);
					})}
				</div>
			</div>
		);
	};

	const renderActualRequest = () => {
		if (!response?.actualRequest) {
			return (
				<div className="flex-1 flex flex-col items-center justify-center gap-3 py-12">
					<div className="size-12 rounded-xl bg-muted/50 border border-dashed border-border/50 flex items-center justify-center">
						<Send className="size-5 text-muted-foreground/40" />
					</div>
					<p className="text-sm text-muted-foreground">
						Send a request to see details
					</p>
				</div>
			);
		}

		const { url, method, headers, body, cookies } = response.actualRequest;
		const formattedBody =
			typeof body === 'string' ? body : JSON.stringify(body, null, 2);

		const methodColors: Record<string, string> = {
			GET: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
			POST: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
			PUT: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
			DELETE: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
			PATCH: 'bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30',
		};

		return (
			<div className="h-full overflow-auto p-3 space-y-3">
				{/* URL Section */}
				<div className="rounded-lg border border-border/50 bg-muted/20 p-3">
					<div className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-bold mb-2">
						Request URL
					</div>
					<div className="flex items-start gap-2">
						<span
							className={cn(
								'px-2 py-0.5 rounded-md text-[10px] font-bold border shrink-0',
								methodColors[method] ||
									'bg-muted text-muted-foreground',
							)}
						>
							{method}
						</span>
						<span className="font-mono text-xs text-foreground break-all">
							{url}
						</span>
					</div>
				</div>

				{/* Headers Section */}
				<div className="rounded-lg border border-border/50 bg-muted/20 p-3">
					<div className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-bold mb-2">
						Headers
					</div>
					<div className="flex flex-col gap-0.5">
						{Object.entries(headers || {}).map(([key, value]) => (
							<div
								key={key}
								className="grid grid-cols-[minmax(120px,auto)_1fr] gap-2 font-mono text-[11px]"
							>
								<span className="text-primary font-medium">
									{key}:
								</span>
								<span className="text-foreground/80 break-all">
									{value}
								</span>
							</div>
						))}
						{Object.keys(headers || {}).length === 0 && (
							<span className="text-muted-foreground text-[11px] italic">
								No headers
							</span>
						)}
					</div>
				</div>

				{/* Cookies Section */}
				{cookies && cookies.length > 0 && (
					<div className="rounded-lg border border-border/50 bg-muted/20 p-3">
						<div className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-bold mb-2">
							Cookies
						</div>
						<div className="flex flex-col gap-1">
							{cookies.map((cookie: any, i: number) => (
								<div
									key={i}
									className="flex items-center gap-2 font-mono text-[11px]"
								>
									<span className="text-primary font-medium">
										{cookie.key}
									</span>
									<span className="text-muted-foreground">
										=
									</span>
									<span className="text-foreground/80 truncate max-w-[200px]">
										{cookie.value}
									</span>
									<div className="flex gap-1 ml-auto">
										{cookie.secure && (
											<span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
												Secure
											</span>
										)}
										{cookie.httpOnly && (
											<span className="px-1.5 py-0.5 rounded text-[9px] bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
												HttpOnly
											</span>
										)}
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Body Section */}
				{body && (
					<div className="rounded-lg border border-border/50 bg-muted/20 p-3">
						<div className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-bold mb-2">
							Body
						</div>
						<div className="rounded-md border border-border/50 bg-background/50 overflow-hidden">
							<CodeEditor
								writing={false}
								header={false}
								lang="json"
								className="!border-none !text-[10px] !bg-transparent"
								contentClassName="!p-2"
								copyButton
								style={{
									minHeight: '2rem',
									fontFamily:
										'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
								}}
							>
								{formattedBody}
							</CodeEditor>
						</div>
					</div>
				)}
			</div>
		);
	};

	// Loading state
	const renderLoading = () => (
		<div className="flex flex-col items-center justify-center h-full gap-3">
			<div className="relative">
				<div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
					<Loader2 className="size-6 animate-spin text-primary" />
				</div>
			</div>
			<span className="text-sm text-muted-foreground">
				Fetching response...
			</span>
		</div>
	);

	// Error state
	if (response?.error && !isLoading) {
		return (
			<section className="flex h-full w-full flex-1 flex-col p-3">
				<div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 flex items-start gap-3">
					<div className="size-8 rounded-lg bg-rose-500/20 flex items-center justify-center shrink-0">
						<AlertCircle className="size-4 text-rose-500" />
					</div>
					<div>
						<p className="font-semibold text-rose-600 dark:text-rose-400 text-sm">
							Request Failed
						</p>
						<p className="mt-1 text-xs text-rose-600/80 dark:text-rose-400/80">
							{response.error}
						</p>
					</div>
				</div>
			</section>
		);
	}

	// Empty state
	if (!response && !isLoading) {
		return (
			<section className="flex h-full w-full flex-1 flex-col">
				<ResponseBodyTabContent responseData="" contentType="" />
			</section>
		);
	}

	// Calculate counts
	const headersCount = response?.headers
		? Object.keys(response.headers).length
		: 0;
	// Use raw setCookie array if available, otherwise fall back to header
	const setCookieData =
		response?.setCookie || response?.headers?.['set-cookie'];
	const cookiesCount = setCookieData
		? Array.isArray(setCookieData)
			? setCookieData.length
			: 1
		: 0;

	return (
		<section className="flex h-full w-full flex-1 flex-col overflow-hidden">
			{/* Status Header */}
			{response && !isLoading && response.status > 0 && (
				<div className="flex items-center gap-3 px-3 py-2 border-b border-border/50 shrink-0">
					{/* Status Badge */}
					<div
						className={cn(
							'px-2.5 py-1 rounded-md text-xs font-bold border',
							getStatusConfig(response.status).bg,
							getStatusConfig(response.status).color,
						)}
					>
						{response.status} {response.statusText}
					</div>

					{/* Time */}
					<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
						<Clock className="size-3" />
						<span className="text-foreground font-medium">
							{response.time}ms
						</span>
					</div>

					{/* Size */}
					<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
						<HardDrive className="size-3" />
						<span className="text-foreground font-medium">
							{formatSize(response.size)}
						</span>
					</div>
				</div>
			)}

			{/* Tabs */}
			<Tabs
				value={activeTab}
				onValueChange={setActiveTab}
				className="flex flex-1 min-h-0 flex-col overflow-hidden"
			>
				{/* Tab List */}
				<TabsList className="bg-transparent relative shrink-0 rounded-none border-b border-border/50 p-0 h-9">
					{tabs.map((tab, index) => {
						const Icon = tab.icon;
						let count = undefined;
						if (tab.value === 'headers') {
							count = headersCount;
						}
						if (tab.value === 'cookies') {
							count = cookiesCount;
						}

						return (
							<TabsTrigger
								value={tab.value}
								key={tab.value}
								ref={(el) => {
									tabRefs.current[index] = el;
								}}
								className={cn(
									'relative z-10 h-full px-3 gap-1.5 rounded-none border-0 text-xs font-medium',
									'data-[state=active]:bg-transparent data-[state=active]:shadow-none',
									'data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground',
								)}
							>
								<Icon className="size-3.5" />
								<span>{tab.name}</span>
								{count !== undefined && count > 0 && (
									<span className="ml-0.5 px-1.5 py-0.5 text-[9px] rounded-full bg-muted border border-border/50 text-foreground font-mono">
										{count}
									</span>
								)}
							</TabsTrigger>
						);
					})}
					<motion.div
						className="bg-primary absolute bottom-0 z-20 h-0.5 rounded-full"
						layoutId="response-underline"
						style={{
							left: underlineStyle.left,
							width: underlineStyle.width,
						}}
						transition={{
							type: 'spring',
							stiffness: 400,
							damping: 40,
						}}
					/>
				</TabsList>

				{/* Tab Contents */}
				<TabsContent
					value="body"
					className="mt-0 flex-1 min-h-0 flex flex-col overflow-hidden"
				>
					{isLoading ? (
						renderLoading()
					) : (
						<ResponseBodyTabContent
							responseData={response?.body || ''}
							contentType={
								response?.headers?.['content-type'] || ''
							}
						/>
					)}
				</TabsContent>

				<TabsContent
					value="headers"
					className="mt-0 flex-1 overflow-auto"
				>
					{isLoading ? renderLoading() : renderHeaders()}
				</TabsContent>

				<TabsContent
					value="cookies"
					className="mt-0 flex-1 overflow-auto"
				>
					{isLoading ? renderLoading() : renderCookies()}
				</TabsContent>

				<TabsContent
					value="actual-request"
					className="mt-0 flex-1 overflow-auto"
				>
					{renderActualRequest()}
				</TabsContent>
			</Tabs>
		</section>
	);
};

export default ApiResponse;
