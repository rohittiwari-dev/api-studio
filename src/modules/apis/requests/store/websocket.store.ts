import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type MessageFormat = 'text' | 'json' | 'binary';

export type LogMessage = {
	id: string;
	timestamp: number;
	direction: 'sent' | 'received' | 'error' | 'system';
	content: string;
	format?: MessageFormat;
};

export interface WebSocketConnectionOptions {
	url: string;
	parameters?: Array<{ key: string; value: string; isActive?: boolean }>;
	headers?: Array<{ key: string; value: string; isActive?: boolean }>;
	messageFormat?: MessageFormat;
}

interface WebsocketState {
	connections: Record<string, WebSocket>;
	messages: Record<string, LogMessage[]>;
	connectionStatus: Record<
		string,
		'connected' | 'disconnected' | 'connecting' | 'error'
	>;
	connectionOptions: Record<string, WebSocketConnectionOptions>;

	connect: (requestId: string, options: WebSocketConnectionOptions) => void;
	disconnect: (requestId: string) => void;
	sendMessage: (
		requestId: string,
		message: string,
		format?: MessageFormat,
	) => void;
	clearMessages: (requestId: string) => void;
}

/**
 * Normalize WebSocket URL - ensure it has ws:// or wss:// protocol
 */
function normalizeWebSocketUrl(url: string): string {
	if (!url) {
		return url;
	}

	let normalized = url?.trim();

	// If URL starts with http:// or https://, convert to ws:// or wss://
	if (normalized.startsWith('https://')) {
		normalized = 'wss://' + normalized.slice(8);
	} else if (normalized.startsWith('http://')) {
		normalized = 'ws://' + normalized.slice(7);
	}
	// If URL doesn't have a protocol, add ws://
	else if (
		!normalized.startsWith('ws://') &&
		!normalized.startsWith('wss://')
	) {
		// Default to ws:// for non-protocol URLs
		normalized = 'ws://' + normalized;
	}

	return normalized;
}

/**
 * Build URL with query parameters
 */
function buildWebSocketUrl(options: WebSocketConnectionOptions): string {
	// First normalize the URL to ensure proper ws:// or wss:// protocol
	let url = normalizeWebSocketUrl(options.url);

	// Add parameters to URL
	const activeParams = options.parameters?.filter(
		(p) => p.isActive !== false && p.key,
	);
	if (activeParams && activeParams.length > 0) {
		const separator = url.includes('?') ? '&' : '?';
		const paramString = activeParams
			.map(
				(p) =>
					`${encodeURIComponent(p.key)}=${encodeURIComponent(p.value || '')}`,
			)
			.join('&');
		url = `${url}${separator}${paramString}`;
	}

	// Note: Browser WebSocket API doesn't support custom headers
	// Headers can be passed as query parameters if server supports it
	const activeHeaders = options.headers?.filter(
		(h) => h.isActive !== false && h.key,
	);
	if (activeHeaders && activeHeaders.length > 0) {
		// Add headers as query params (server must support this pattern)
		const separator = url.includes('?') ? '&' : '?';
		const headerParams = activeHeaders
			.map(
				(h) =>
					`_header_${encodeURIComponent(h.key)}=${encodeURIComponent(
						h.value || '',
					)}`,
			)
			.join('&');
		url = `${url}${separator}${headerParams}`;
	}

	return url;
}

/**
 * Format message based on type
 */
function formatMessage(message: string, format: MessageFormat): string {
	if (format === 'json') {
		try {
			// Pretty print JSON if it's valid
			const parsed = JSON.parse(message);
			return JSON.stringify(parsed);
		} catch {
			// Return as-is if not valid JSON
			return message;
		}
	}
	return message;
}

/**
 * Try to detect and pretty-print JSON in received messages
 */
function formatReceivedMessage(content: string): {
	content: string;
	format: MessageFormat;
} {
	try {
		const parsed = JSON.parse(content);
		return {
			content: JSON.stringify(parsed, null, 2),
			format: 'json',
		};
	} catch {
		return {
			content,
			format: 'text',
		};
	}
}

const useWebsocketStore = create<WebsocketState>()(
	devtools((set, get) => ({
		connections: {},
		messages: {},
		connectionStatus: {},
		connectionOptions: {},

		connect: (requestId, options) => {
			const { connections } = get();
			if (connections[requestId]) {
				connections[requestId].close();
			}

			try {
				set((state) => ({
					connectionStatus: {
						...state.connectionStatus,
						[requestId]: 'connecting',
					},
					connectionOptions: {
						...state.connectionOptions,
						[requestId]: options,
					},
				}));

				const url = buildWebSocketUrl(options);

				const ws = new WebSocket(url);

				ws.onopen = () => {
					set((state) => ({
						connectionStatus: {
							...state.connectionStatus,
							[requestId]: 'connected',
						},
						messages: {
							...state.messages,
							[requestId]: [
								...(state.messages[requestId] || []),
								{
									id: crypto.randomUUID(),
									timestamp: Date.now(),
									direction: 'system',
									content: 'Connected to ' + url,
								},
							],
						},
					}));
				};

				ws.onmessage = (event) => {
					const { content, format } = formatReceivedMessage(
						typeof event.data === 'string'
							? event.data
							: 'Binary data received',
					);

					set((state) => ({
						messages: {
							...state.messages,
							[requestId]: [
								...(state.messages[requestId] || []),
								{
									id: crypto.randomUUID(),
									timestamp: Date.now(),
									direction: 'received',
									content,
									format,
								},
							],
						},
					}));
				};

				ws.onerror = (error) => {
					set((state) => ({
						connectionStatus: {
							...state.connectionStatus,
							[requestId]: 'error',
						},
						messages: {
							...state.messages,
							[requestId]: [
								...(state.messages[requestId] || []),
								{
									id: crypto.randomUUID(),
									timestamp: Date.now(),
									direction: 'error',
									content: 'WebSocket error occurred',
								},
							],
						},
					}));
				};

				ws.onclose = (event) => {
					set((state) => ({
						connectionStatus: {
							...state.connectionStatus,
							[requestId]: 'disconnected',
						},
						messages: {
							...state.messages,
							[requestId]: [
								...(state.messages[requestId] || []),
								{
									id: crypto.randomUUID(),
									timestamp: Date.now(),
									direction: 'system',
									content: `Disconnected (code: ${event.code}${
										event.reason
											? ', reason: ' + event.reason
											: ''
									})`,
								},
							],
						},
					}));
				};

				set((state) => ({
					connections: { ...state.connections, [requestId]: ws },
				}));
			} catch (error) {
				set((state) => ({
					connectionStatus: {
						...state.connectionStatus,
						[requestId]: 'error',
					},
					messages: {
						...state.messages,
						[requestId]: [
							...(state.messages[requestId] || []),
							{
								id: crypto.randomUUID(),
								timestamp: Date.now(),
								direction: 'error',
								content:
									error instanceof Error
										? error.message
										: 'Failed to connect',
							},
						],
					},
				}));
			}
		},

		disconnect: (requestId) => {
			const { connections } = get();
			if (connections[requestId]) {
				connections[requestId].close();
				// State update handled in onclose
			}
		},

		sendMessage: (requestId, message, format = 'text') => {
			const { connections } = get();
			const ws = connections[requestId];

			if (ws && ws.readyState === WebSocket.OPEN) {
				const formattedMessage = formatMessage(message, format);
				ws.send(formattedMessage);

				// Format for display
				const displayContent =
					format === 'json'
						? (() => {
								try {
									return JSON.stringify(
										JSON.parse(formattedMessage),
										null,
										2,
									);
								} catch {
									return formattedMessage;
								}
							})()
						: formattedMessage;

				set((state) => ({
					messages: {
						...state.messages,
						[requestId]: [
							...(state.messages[requestId] || []),
							{
								id: crypto.randomUUID(),
								timestamp: Date.now(),
								direction: 'sent',
								content: displayContent,
								format,
							},
						],
					},
				}));
			} else {
				set((state) => ({
					messages: {
						...state.messages,
						[requestId]: [
							...(state.messages[requestId] || []),
							{
								id: crypto.randomUUID(),
								timestamp: Date.now(),
								direction: 'error',
								content:
									'Cannot send message: WebSocket is not connected',
							},
						],
					},
				}));
			}
		},

		clearMessages: (requestId) => {
			set((state) => ({
				messages: { ...state.messages, [requestId]: [] },
			}));
		},
	})),
);

export default useWebsocketStore;
