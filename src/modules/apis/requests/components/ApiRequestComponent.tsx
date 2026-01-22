import React, { useCallback } from 'react';
import { IconSend } from '@tabler/icons-react';
import { Loader2, SaveIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { InputGroup } from '@/components/ui/input-group';
import { EnvironmentVariableInput } from '@/components/ui/environment-variable-input';
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from '@/components/ui/resizable';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { cn, requestTextColorMap } from '@/lib/utils';
import {
	substituteVariables,
	substituteVariablesInObject,
} from '@/lib/utils/substituteVariables';
import ApiResponse from '@/modules/apis/response/components/api-response';
import useResponseStore from '@/modules/apis/response/store/response.store';
import useCookieStore from '@/modules/apis/cookies/store/cookie.store';
import useEnvironmentStore from '@/modules/apis/environment/store/environment.store';
import BodyComponent from './api-request-components/body-component';
import HeaderComponent from './api-request-components/header-component';
import ParameterComponent from './api-request-components/parameter-component';
import AuthComponent from './api-request-components/auth-component';
import { useUpsertRequest } from '../hooks/queries';
import { BodyType, HttpMethod } from '@/generated/prisma/browser';
import useRequestSyncStoreState from '../hooks/requestSyncStore';

/**
 * Parse Set-Cookie header string into cookie object
 */
function parseSetCookie(setCookieStr: string, defaultDomain: string) {
	const parts = setCookieStr.split(';').map((p) => p?.trim());
	const [keyVal, ...attributes] = parts;
	const [key, ...valueParts] = keyVal.split('=');
	const value = valueParts.join('='); // Handle values with = in them

	const cookie: {
		key: string;
		value: string;
		domain: string;
		path: string;
		expires?: string;
		secure?: boolean;
		httpOnly?: boolean;
	} = {
		key: key?.trim(),
		value: value?.trim(),
		domain: defaultDomain,
		path: '/',
	};

	// Parse attributes
	for (const attr of attributes) {
		const [attrKey, attrVal] = attr.split('=');
		const attrKeyLower = attrKey.toLowerCase()?.trim();

		if (attrKeyLower === 'path' && attrVal) {
			cookie.path = attrVal?.trim();
		} else if (attrKeyLower === 'domain' && attrVal) {
			cookie.domain = attrVal?.trim().replace(/^\./, '');
		} else if (attrKeyLower === 'expires' && attrVal) {
			cookie.expires = attrVal?.trim();
		} else if (attrKeyLower === 'secure') {
			cookie.secure = true;
		} else if (attrKeyLower === 'httponly') {
			cookie.httpOnly = true;
		}
	}

	return cookie;
}

// Method color mapping for premium styling
const methodGradientMap: Record<string, string> = {
	GET: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
	POST: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-600 dark:text-blue-400',
	PUT: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-600 dark:text-amber-400',
	DELETE: 'from-rose-500/20 to-pink-500/20 border-rose-500/30 text-rose-600 dark:text-rose-400',
	PATCH: 'from-violet-500/20 to-purple-500/20 border-violet-500/30 text-violet-600 dark:text-violet-400',
	HEAD: 'from-slate-500/20 to-gray-500/20 border-slate-500/30 text-slate-600 dark:text-slate-400',
	OPTIONS:
		'from-cyan-500/20 to-sky-500/20 border-cyan-500/30 text-cyan-600 dark:text-cyan-400',
};

const ApiRequestComponent = () => {
	const { updateRequest, activeRequest, activeWorkspace } =
		useRequestSyncStoreState();
	const { setResponse, setLoading, setError, setActualRequest } =
		useResponseStore();
	const { getCookiesForDomain, addCookie } = useCookieStore();
	const { getVariablesAsRecord } = useEnvironmentStore();
	const [requestInfoTab, setRequestInfoTab] = useLocalStorage(
		'api-client-request-active-data-tab',
		'parameters',
	);
	const [isSaving, setIsSaving] = React.useState(false);
	const [isSending, setIsSending] = React.useState(false);

	// Upsert mutation with query invalidation
	const upsertMutation = useUpsertRequest(activeWorkspace?.id || '', {
		onSuccess: () => {
			if (activeRequest?.id) {
				updateRequest(activeRequest.id, { unsaved: false });
			}
			toast.success('Request saved successfully');
			setIsSaving(false);
		},
		onError: (error) => {
			console.error('Failed to save request', error);
			toast.error('Failed to save request');
			// Revert optimistic update on error
			if (activeRequest?.id) {
				updateRequest(activeRequest.id, { unsaved: true });
			}
			setIsSaving(false);
		},
	});

	const handleSave = useCallback(() => {
		if (!activeRequest?.id || isSaving || upsertMutation.isPending) {
			return;
		}
		setIsSaving(true);

		// Optimistically update store immediately
		updateRequest(activeRequest.id, {
			unsaved: false,
			type: 'API' as any, // Ensure type is set correctly for saved requests
		});

		upsertMutation.mutate({
			requestId: activeRequest.id,
			name: activeRequest.name,
			url: activeRequest.url || '',
			workspaceId: activeRequest.workspaceId,
			collectionId: activeRequest.collectionId,
			type: 'API',
			method: activeRequest.method,
			headers: activeRequest.headers,
			parameters: activeRequest.parameters,
			body: activeRequest.body,
			bodyType: activeRequest.bodyType,
			auth: activeRequest.auth,
			savedMessages: activeRequest.savedMessages ?? [],
		});
	}, [
		activeRequest?.auth,
		activeRequest?.body,
		activeRequest?.bodyType,
		activeRequest?.collectionId,
		activeRequest?.headers,
		activeRequest?.id,
		activeRequest?.method,
		activeRequest?.name,
		activeRequest?.parameters,
		activeRequest?.savedMessages,
		activeRequest?.url,
		activeRequest?.workspaceId,
		isSaving,
		updateRequest,
		upsertMutation,
	]);

	// Ctrl+S handler for saving
	React.useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && e.key === 's') {
				e.preventDefault();
				handleSave();
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [activeRequest, handleSave]);

	const handleSend = async () => {
		if (!activeRequest?.url || !activeRequest.id || isSending) {
			return;
		}

		setIsSending(true);
		setLoading(activeRequest.id, true);
		setError(activeRequest.id, '');

		try {
			const envVariables = getVariablesAsRecord();
			let finalUrl = substituteVariables(activeRequest.url, envVariables);
			try {
				const url = new URL(finalUrl);
				const activeParams =
					activeRequest.parameters?.filter(
						(p) => p.isActive && p.key,
					) || [];

				activeParams.forEach((p) => {
					const key = substituteVariables(p.key, envVariables);
					const value = substituteVariables(p.value, envVariables);
					url.searchParams.append(key, value);
				});

				finalUrl = url.toString();
			} catch (e) {}

			const defaultHeaders: Record<string, string> = {
				'User-Agent': 'API-Client/1.0',
				Accept: '*/*',
				'Accept-Encoding': 'gzip, deflate, br',
				Connection: 'keep-alive',
			};

			try {
				const urlObj = new URL(finalUrl);
				defaultHeaders['Host'] = urlObj.host;
			} catch (e) {}

			defaultHeaders['API-Client-Token'] = crypto.randomUUID();

			const headers: Record<string, string> = { ...defaultHeaders };

			activeRequest.headers?.forEach((h) => {
				if (h.isActive && h.key) {
					const key = substituteVariables(h.key, envVariables);
					const value = substituteVariables(h.value, envVariables);
					headers[key] = value;
				}
			});

			let authConfig: {
				type: string;
				data: Record<string, unknown>;
			} | null = null;

			if (
				activeRequest.auth?.type &&
				activeRequest.auth.type !== 'NONE' &&
				activeRequest.auth.type !== 'INHERIT' &&
				activeRequest.auth.data
			) {
				// Substitute variables in auth data
				const authData: Record<string, unknown> = {
					...(activeRequest.auth.data as Record<string, unknown>),
				};
				for (const key of Object.keys(authData)) {
					if (typeof authData[key] === 'string') {
						authData[key] = substituteVariables(
							authData[key] as string,
							envVariables,
						);
					}
				}
				authConfig = {
					type: activeRequest.auth.type,
					data: authData,
				};
			} else if (activeRequest.auth?.type === 'INHERIT') {
				authConfig = {
					type:
						activeWorkspace?.globalAuth?.type ||
						activeRequest.auth.type,
					data: activeWorkspace?.globalAuth?.data as Record<
						string,
						unknown
					>,
				};
			}

			// Prepare body based on bodyType
			let body: any = undefined;
			const method = activeRequest.method || 'GET';

			// Prepare body based on bodyType
			const bodyType = activeRequest.bodyType;

			switch (bodyType) {
				case BodyType.JSON:
					if (activeRequest.body?.json) {
						const jsonBody = substituteVariablesInObject(
							activeRequest.body.json,
							envVariables,
						);
						body = JSON.stringify(jsonBody);
						if (!headers['Content-Type']) {
							headers['Content-Type'] = 'application/json';
						}
					}
					break;

				case BodyType.RAW:
					if (activeRequest.body?.raw) {
						body = substituteVariables(
							activeRequest.body.raw,
							envVariables,
						);
					}
					break;

				case BodyType.FORM_DATA:
					if (activeRequest.body?.formData) {
						const formData: Array<{
							key: string;
							value: string;
							type: string;
							fileName?: string;
						}> = [];

						const readFileAsBase64 = (
							file: File,
						): Promise<string> => {
							return new Promise((resolve, reject) => {
								const reader = new FileReader();
								reader.onload = () =>
									resolve(reader.result as string);
								reader.onerror = reject;
								reader.readAsDataURL(file);
							});
						};

						const processFormData = async () => {
							for (const f of activeRequest.body.formData) {
								if (f.isActive && f.key) {
									const key = substituteVariables(
										f.key,
										envVariables,
									);

									if (f.type === 'FILE' && f.file) {
										try {
											const base64Details =
												await readFileAsBase64(f.file);
											formData.push({
												key,
												value: base64Details,
												type: 'FILE',
												fileName: f.value, // Filename stored in value
											});
										} catch (e) {
											console.error(
												'Failed to read file',
												e,
											);
										}
									} else {
										const value = substituteVariables(
											f.value,
											envVariables,
										);
										formData.push({
											key,
											value,
											type: 'TEXT',
										});
									}
								}
							}
						};

						await processFormData();

						body = JSON.stringify({ formData });
						if (!headers['Content-Type']) {
							headers['Content-Type'] = 'multipart/form-data';
						}
					}
					break;

				case BodyType.X_WWW_FORM_URLENCODED:
					if (activeRequest.body?.urlEncoded) {
						const params = new URLSearchParams();
						activeRequest.body.urlEncoded
							.filter((f) => f.isActive && f.key)
							.forEach((f) => {
								const key = substituteVariables(
									f.key,
									envVariables,
								);
								const value = substituteVariables(
									f.value,
									envVariables,
								);
								params.append(key, value);
							});
						body = params.toString();
						if (!headers['Content-Type']) {
							headers['Content-Type'] =
								'application/x-www-form-urlencoded';
						}
					}
					break;
			}

			if (body && !headers['Content-Length']) {
				try {
					const textEncoder = new TextEncoder();
					const length =
						typeof body === 'string'
							? textEncoder.encode(body).length
							: 0; // Approximate for string
					if (activeRequest.bodyType !== BodyType.FORM_DATA) {
						headers['Content-Length'] = length.toString();
					}
				} catch (e) {}
			}

			let domain = '';
			try {
				domain = new URL(finalUrl).hostname;
			} catch {
				throw new Error('Invalid URL');
			}
			const requestCookies = getCookiesForDomain(domain);

			const actualRequest = {
				url: finalUrl,
				method: method,
				headers,
				body,
				cookies: requestCookies,
				auth: authConfig,
			};
			setActualRequest(activeRequest.id, actualRequest);

			const res = await fetch('/api/proxy', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(actualRequest),
			});

			const data = (await res.json()) as any;

			if (data.error) {
				setError(activeRequest.id, data.error);
			} else {
				setResponse(activeRequest.id, {
					status: data.status,
					statusText: data.statusText,
					headers: data.headers,
					body: data.body,
					time: data.time,
					size: data.size,
					setCookie: data.setCookie,
					loading: false,
					error: null,
				});

				const setCookieData =
					data.setCookie || data.headers?.['set-cookie'];

				if (setCookieData) {
					const cookieStrings = Array.isArray(setCookieData)
						? setCookieData
						: [setCookieData];

					for (const cookieStr of cookieStrings) {
						try {
							const cookie = parseSetCookie(cookieStr, domain);
							if (cookie.key && cookie.value) {
								addCookie(cookie);
							}
						} catch (e) {
							console.warn(
								'Failed to parse Set-Cookie:',
								cookieStr,
							);
						}
					}
				}

				// Update Actual Request with real headers sent by Proxy (if available)
				if (data.requestHeaders) {
					const updatedActualRequest = {
						...actualRequest,
						headers: data.requestHeaders as Record<string, string>,
					};
					setActualRequest(activeRequest.id, updatedActualRequest);
				}
			}
		} catch (err: any) {
			setError(activeRequest.id, err.message || 'Failed to send request');
		} finally {
			setLoading(activeRequest.id, false);
			setIsSending(false);
		}
	};

	const isUnsaved = activeRequest?.unsaved ?? false;
	const currentMethod = (activeRequest?.method || 'GET') as string;

	const { responses } = useResponseStore();
	const currentResponse = activeRequest?.id
		? responses[activeRequest.id]
		: null;
	const isLoading = currentResponse?.loading || false;

	return (
		<div className="flex h-full w-full flex-col backdrop-blur-md">
			{/* Premium URL Bar */}
			<div className="flex w-full items-center gap-3 px-4 py-3 border-b border-indigo-500/15 glass-subtle">
				{/* Method Selector */}
				<Select
					value={activeRequest?.method || 'GET'}
					onValueChange={(value) => {
						const updatedRequest = {
							...activeRequest,
							method: value as HttpMethod,
							unsaved: true,
						};
						if (activeRequest?.id) {
							updateRequest(activeRequest?.id, updatedRequest);
						}
					}}
				>
					<SelectTrigger
						className={cn(
							'w-24 h-9',
							'cursor-pointer rounded-lg',
							'bg-linear-to-br',
							methodGradientMap[currentMethod] ||
								methodGradientMap.GET,
							'font-bold text-xs',
							'hover:shadow-md',
							'focus:ring-2 focus:ring-indigo-500/40',
							'transition-all duration-200',
							'shadow-sm border',
						)}
					>
						<SelectValue placeholder="Method" />
					</SelectTrigger>
					<SelectContent className="rounded-lg p-1.5 shadow-2xl shadow-indigo-500/20 bg-popover/98 backdrop-blur-xl border border-indigo-500/20">
						{[
							'GET',
							'POST',
							'PUT',
							'DELETE',
							'PATCH',
							'HEAD',
							'OPTIONS',
						].map((method) => {
							const textColor =
								requestTextColorMap[method as HttpMethod] ||
								'text-foreground';
							return (
								<SelectItem
									key={method}
									value={method}
									className={cn(
										'cursor-pointer rounded-md text-xs font-bold px-3 py-2.5',
										'focus:bg-indigo-500/15 transition-colors',
										textColor,
									)}
								>
									{method}
								</SelectItem>
							);
						})}
					</SelectContent>
				</Select>

				{/* URL Input */}
				<InputGroup className="flex-1">
					<EnvironmentVariableInput
						id="url"
						placeholder="Enter request URL (use {{variable}} for env vars)"
						value={activeRequest?.url || ''}
						onChange={(value) => {
							const updatedRequest = {
								...activeRequest,
								url: value,
								unsaved: true,
							};
							if (activeRequest?.id) {
								updateRequest(
									activeRequest?.id,
									updatedRequest,
								);
							}
						}}
						onKeyDown={(e) => {
							if (e.key === 'Enter') {
								handleSend();
							}
						}}
						className="flex-1 h-9 rounded-lg border-indigo-500/20 focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:border-indigo-500/40 transition-all duration-200"
					/>
				</InputGroup>

				{/* Loading Indicator */}
				{isLoading && (
					<div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-linear-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/30 shadow-md shadow-amber-500/10">
						<div className="size-2.5 rounded-full bg-linear-to-br from-amber-400 to-orange-500 animate-pulse shadow-lg shadow-amber-500/50" />
						<span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
							Sending
						</span>
					</div>
				)}

				{/* Send Button */}
				<Button
					className={cn(
						'h-9 px-5 rounded-lg font-bold text-sm',
						'bg-linear-to-r from-indigo-500 via-violet-500 to-indigo-600',
						'text-white hover:from-indigo-600 hover:via-violet-600 hover:to-indigo-700',
						'transition-all duration-200 active:scale-[0.97]',
						'shadow-lg shadow-indigo-500/30',
					)}
					onClick={handleSend}
					disabled={isSending || !activeRequest?.url}
				>
					{isSending ? (
						<Loader2 className="size-4 mr-2 animate-spin" />
					) : (
						<IconSend className="size-4 mr-2" />
					)}
					{isSending ? 'Sending...' : 'Send'}
				</Button>

				{/* Save Button */}
				<Button
					variant="outline"
					className={cn(
						'h-9 px-4 rounded-lg font-medium text-sm',
						'border-border/60 hover:bg-muted/50 hover:border-border',
						'transition-all duration-200 active:scale-[0.98]',
						isUnsaved &&
							'border-orange-500/40 bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20',
					)}
					onClick={handleSave}
					disabled={isSaving}
					title={isUnsaved ? 'Unsaved changes' : 'Save request'}
				>
					{isSaving ? (
						<Loader2 className="size-4 mr-2 animate-spin" />
					) : (
						<SaveIcon className="size-4 mr-2" />
					)}
					{isSaving ? 'Saving...' : 'Save'}
				</Button>
			</div>

			{/* Tabs */}
			<Tabs
				value={requestInfoTab}
				className="flex flex-1 p-0! min-h-0 flex-col w-full overflow-hidden"
				onValueChange={(val) => {
					setRequestInfoTab(val);
				}}
			>
				<div className="px-4 py-2 pt-0! border-b border-border">
					<TabsList className="h-9 gap-1 p-1 rounded-lg bg-muted">
						{[
							{
								value: 'parameters',
								label: 'Params',
								count: activeRequest?.parameters?.filter(
									(p) => p.isActive,
								)?.length,
							},
							{
								value: 'headers',
								label: 'Headers',
								count: activeRequest?.headers?.filter(
									(h) => h.isActive,
								)?.length,
							},
							{ value: 'body', label: 'Body' },
							{ value: 'auth', label: 'Auth' },
						].map((tab) => (
							<TabsTrigger
								key={tab.value}
								value={tab.value}
								className={cn(
									'h-7 px-4 rounded-md text-xs font-medium cursor-pointer',
									'transition-all',
									'data-[state=active]:bg-indigo-500/20 dark:data-[state=active]:bg-indigo-500/25 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-300 data-[state=active]:border data-[state=active]:border-indigo-500/40',
									'data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-accent',
								)}
							>
								{tab.label}
								{tab.count !== undefined && tab.count > 0 && (
									<span
										className={cn(
											'ml-1.5 min-w-[16px] h-4 flex items-center justify-center text-[9px] rounded-full font-bold',
											'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20',
										)}
									>
										{tab.count}
									</span>
								)}
							</TabsTrigger>
						))}
					</TabsList>
				</div>

				<ResizablePanelGroup
					orientation="vertical"
					className="flex-1 min-h-0 w-full"
				>
					<ResizablePanel
						defaultSize={'70%'}
						minSize={'10%'}
						maxSize={'90%'}
						className="flex flex-col min-h-0 relative z-0 overflow-hidden! bg-background/30"
					>
						<TabsContent
							value="parameters"
							className="w-full flex-1 min-h-0 overflow-y-auto data-[state=active]:flex data-[state=active]:flex-col"
						>
							<div className="flex-1 h-full min-h-0 p-4">
								<ParameterComponent />
							</div>
						</TabsContent>
						<TabsContent
							value="headers"
							className="w-full flex-1 min-h-0 overflow-y-auto data-[state=active]:flex data-[state=active]:flex-col"
						>
							<div className="flex-1 h-full min-h-0 p-4">
								<HeaderComponent />
							</div>
						</TabsContent>
						<TabsContent
							value="body"
							className="w-full flex-1 min-h-0 overflow-y-auto data-[state=active]:flex data-[state=active]:flex-col"
						>
							<div className="flex-1 h-full min-h-0 p-2 px-4 pt-1 flex flex-col">
								<BodyComponent />
							</div>
						</TabsContent>
						<TabsContent
							value="auth"
							className="w-full flex-1 min-h-0 overflow-y-auto data-[state=active]:flex data-[state=active]:flex-col"
						>
							<div className="flex-1 h-full min-h-0 p-2 px-4 pt-1">
								<AuthComponent />
							</div>
						</TabsContent>
					</ResizablePanel>

					<ResizableHandle
						withHandle
						className="bg-border/30 hover:bg-primary/20 transition-colors"
					/>

					<ResizablePanel
						defaultSize={'30%'}
						minSize={'4%'}
						maxSize={'90%'}
						className="flex flex-col overflow-y-auto! bg-muted/5 border-t border-border/10"
					>
						<div className="h-full w-full p-4">
							<ApiResponse />
						</div>
					</ResizablePanel>
				</ResizablePanelGroup>
			</Tabs>
		</div>
	);
};

export default ApiRequestComponent;
