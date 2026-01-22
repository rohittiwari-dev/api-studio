import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { RequestStateInterface } from '../types/request.types';
import { deepEqual } from '@/lib/utils/deepEqual';

interface RequestStoreState {
	requests: Record<string, RequestStateInterface>;
	snapshots: Record<string, RequestStateInterface>;
}

interface RequestStoreActions {
	setRequests: (requests: RequestStateInterface[]) => void;
	upsertRequest: (request: RequestStateInterface) => void;
	updateRequest: (
		id: string,
		updates: Partial<RequestStateInterface>,
	) => void;
	removeRequest: (id: string) => void;
	getRequestById: (id: string) => RequestStateInterface | undefined;
	getAllRequests: () => RequestStateInterface[];
	setSnapshot: (id: string, request: RequestStateInterface) => void;
	getSnapshot: (id: string) => RequestStateInterface | undefined;
	resetToSnapshot: (id: string) => void;
	hasChanges: (id: string) => boolean;
	reset: () => void;
}

const initialState: RequestStoreState = {
	requests: {},
	snapshots: {},
};

// Helper to extract comparable fields for diffing
const getComparableFields = (req: RequestStateInterface) => ({
	name: req.name,
	url: req.url,
	method: req.method,
	headers: req.headers,
	parameters: req.parameters,
	body: req.body,
	auth: req.auth,
	bodyType: req.bodyType,
});

const useRequestStore = create<RequestStoreState & RequestStoreActions>()(
	devtools(
		persist(
			(set, get) => ({
				...initialState,

				setRequests: (requests) => {
					const requestsMap: Record<string, RequestStateInterface> =
						{};
					const snapshotsMap: Record<string, RequestStateInterface> =
						{};

					requests.forEach((req) => {
						requestsMap[req.id] = req;
						if (!req.unsaved) {
							snapshotsMap[req.id] = JSON.parse(
								JSON.stringify(req),
							) as RequestStateInterface;
						}
					});

					set({ requests: requestsMap, snapshots: snapshotsMap });
				},

				upsertRequest: (request) => {
					set((state) => ({
						requests: { ...state.requests, [request.id]: request },
					}));
				},

				updateRequest: (id, updates) => {
					set((state) => {
						const existing = state.requests[id];
						if (!existing) {
							return state;
						}

						const isSaveAction = updates.unsaved === false;

						const newState = { ...existing, ...updates };

						let finalSnapshot = state.snapshots[id];
						let finalUnsaved = true;

						if (isSaveAction) {
							finalUnsaved = false;
							finalSnapshot = JSON.parse(
								JSON.stringify(newState),
							) as RequestStateInterface;
						} else {
							if (!finalSnapshot) {
								finalUnsaved = true;
							} else {
								const hasChanges = !deepEqual(
									getComparableFields(newState),
									getComparableFields(finalSnapshot),
								);
								finalUnsaved = hasChanges;
							}
						}

						newState.unsaved = finalUnsaved;

						const nextSnapshots = isSaveAction
							? { ...state.snapshots, [id]: finalSnapshot }
							: state.snapshots;

						return {
							requests: {
								...state.requests,
								[id]: newState,
							},
							snapshots: nextSnapshots,
						};
					});
				},

				removeRequest: (id) => {
					set((state) => {
						const { [id]: _, ...requests } = state.requests;
						const { [id]: __, ...snapshots } = state.snapshots;
						return { requests, snapshots };
					});
				},

				getRequestById: (id) => get().requests[id],

				getAllRequests: () => Object.values(get().requests),

				setSnapshot: (id, request) => {
					set((state) => ({
						snapshots: {
							...state.snapshots,
							[id]: JSON.parse(
								JSON.stringify(request),
							) as RequestStateInterface,
						},
					}));
				},

				getSnapshot: (id) => get().snapshots[id],

				resetToSnapshot: (id) => {
					const snapshot = get().snapshots[id];
					if (snapshot) {
						set((state) => ({
							requests: {
								...state.requests,
								[id]: JSON.parse(
									JSON.stringify(snapshot),
								) as RequestStateInterface,
							},
						}));
					}
				},

				hasChanges: (id) => {
					const current = get().requests[id];
					const snapshot = get().snapshots[id];
					if (!current) {
						return false;
					}
					if (!snapshot) {
						return true;
					}

					return !deepEqual(
						getComparableFields(current),
						getComparableFields(snapshot),
					);
				},

				reset: () => set(initialState),
			}),
			{ name: 'request-store-v2' },
		),
	),
);

export default useRequestStore;
