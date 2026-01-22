import { NextRequest } from 'next/server';
import { subscriber, WEBHOOK_CHANNEL_PREFIX } from '@/lib/redis';
import { currentUser } from '@/modules/authentication/server/auth.actions';

/**
 * SSE endpoint for realtime webhook events
 * Clients connect with ?workspaceId=xxx to subscribe to workspace events
 */
export async function GET(req: NextRequest) {
	const workspaceId = req.nextUrl.searchParams.get('workspaceId');

	if (!workspaceId) {
		return new Response(
			JSON.stringify({ error: 'workspaceId is required' }),
			{
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			},
		);
	}

	// Verify authentication
	const user = await currentUser();
	if (!user?.user?.id) {
		return new Response(JSON.stringify({ error: 'Unauthorized' }), {
			status: 401,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	const encoder = new TextEncoder();
	const channel = `${WEBHOOK_CHANNEL_PREFIX}${workspaceId}`;

	const stream = new ReadableStream({
		async start(controller) {
			// Send initial connection message
			const connectionMessage = `data: ${JSON.stringify({
				type: 'connected',
				workspaceId,
				timestamp: new Date().toISOString(),
			})}\n\n`;
			controller.enqueue(encoder.encode(connectionMessage));

			// Create a message handler
			const messageHandler = (
				receivedChannel: string,
				message: string,
			) => {
				if (receivedChannel === channel) {
					try {
						const event = JSON.parse(message);
						const sseMessage = `data: ${JSON.stringify(event)}\n\n`;
						controller.enqueue(encoder.encode(sseMessage));
					} catch (error) {
						console.error('Failed to parse webhook event:', error);
					}
				}
			};

			// Subscribe to the workspace channel
			subscriber.subscribe(channel, (err) => {
				if (err) {
					console.error('Redis subscription error:', err);
					controller.error(err);
				}
			});

			subscriber.on('message', messageHandler);

			// Send heartbeat every 30 seconds to keep connection alive
			const heartbeatInterval = setInterval(() => {
				try {
					const heartbeat = `data: ${JSON.stringify({
						type: 'heartbeat',
						timestamp: new Date().toISOString(),
					})}\n\n`;
					controller.enqueue(encoder.encode(heartbeat));
				} catch {
					clearInterval(heartbeatInterval);
				}
			}, 30000);

			// Cleanup on stream close
			req.signal.addEventListener('abort', () => {
				clearInterval(heartbeatInterval);
				subscriber.unsubscribe(channel);
				subscriber.removeListener('message', messageHandler);
				controller.close();
			});
		},
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache, no-transform',
			Connection: 'keep-alive',
			'Access-Control-Allow-Origin': '*',
			'X-Accel-Buffering': 'no', // Disable nginx buffering
		},
	});
}
