import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Webhook, WebhookEvent } from '../types/webhook.types';

export interface WebhookStoreState {
	webhooks: Webhook[];
	activeWebhook: Webhook | null;
	events: WebhookEvent[];
	isLoading: boolean;
	isConnected: boolean;
}

interface WebhookStoreActions {
	// Webhook actions
	setWebhooks: (webhooks: Webhook[]) => void;
	addWebhook: (webhook: Webhook) => void;
	updateWebhook: (id: string, data: Partial<Webhook>) => void;
	removeWebhook: (id: string) => void;
	setActiveWebhook: (webhook: Webhook | null) => void;
	getWebhookById: (id: string) => Webhook | undefined;

	// Event actions
	setEvents: (events: WebhookEvent[]) => void;
	addEvent: (event: WebhookEvent) => void;
	clearEvents: () => void;

	// State actions
	setLoading: (isLoading: boolean) => void;
	setConnected: (isConnected: boolean) => void;
	reset: () => void;
}

const initialState: WebhookStoreState = {
	webhooks: [],
	activeWebhook: null,
	events: [],
	isLoading: false,
	isConnected: false,
};

const useWebhookStore = create<WebhookStoreState & WebhookStoreActions>()(
	devtools(
		persist(
			(set, get) => ({
				...initialState,

				// Webhook actions
				setWebhooks: (webhooks) => set({ webhooks }),

				addWebhook: (webhook) =>
					set((state) => ({
						webhooks: [webhook, ...state.webhooks],
					})),

				updateWebhook: (id, data) =>
					set((state) => ({
						webhooks: state.webhooks.map((w) =>
							w.id === id ? { ...w, ...data } : w,
						),
						activeWebhook:
							state.activeWebhook?.id === id
								? { ...state.activeWebhook, ...data }
								: state.activeWebhook,
					})),

				removeWebhook: (id) =>
					set((state) => ({
						webhooks: state.webhooks.filter((w) => w.id !== id),
						activeWebhook:
							state.activeWebhook?.id === id
								? null
								: state.activeWebhook,
						events:
							state.activeWebhook?.id === id ? [] : state.events,
					})),

				setActiveWebhook: (webhook) =>
					set({
						activeWebhook: webhook,
						events: [], // Clear events when switching webhooks
					}),

				getWebhookById: (id) => get().webhooks.find((w) => w.id === id),

				// Event actions
				setEvents: (events) => set({ events }),

				addEvent: (event) =>
					set((state) => {
						// Only add if it's for the active webhook
						if (state.activeWebhook?.id !== event.webhookId) {
							return state;
						}
						// Prepend new event (newest first), limit to 100
						const newEvents = [event, ...state.events].slice(
							0,
							100,
						);
						return { events: newEvents };
					}),

				clearEvents: () => set({ events: [] }),

				// State actions
				setLoading: (isLoading) => set({ isLoading }),
				setConnected: (isConnected) => set({ isConnected }),

				reset: () => set(initialState),
			}),
			{
				name: 'webhook-storage',
				partialize: (state) => ({
					// Only persist activeWebhook id, not full data
					activeWebhookId: state.activeWebhook?.id,
				}),
			},
		),
	),
);

export default useWebhookStore;
