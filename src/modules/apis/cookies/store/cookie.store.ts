import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface Cookie {
	key: string;
	value: string;
	domain: string;
	path: string;
	expires?: string;
	secure?: boolean;
	httpOnly?: boolean;
	workspaceId: string; // Added workspace association
}

interface CookieStoreState {
	cookies: Cookie[];
	currentWorkspaceId: string | null;
	setCurrentWorkspaceId: (workspaceId: string | null) => void;
	addCookie: (cookie: Omit<Cookie, 'workspaceId'>) => void;
	updateCookie: (
		oldCookie: Cookie,
		newCookie: Omit<Cookie, 'workspaceId'>,
	) => void;
	removeCookie: (domain: string, key: string) => void;
	getCookiesForDomain: (domain: string) => Cookie[];
	getAllCookiesForCurrentWorkspace: () => Cookie[];
	clearCookies: () => void;
	clearCookiesForWorkspace: (workspaceId: string) => void;
	clearExpiredCookies: () => number;
}

const useCookieStore = create<CookieStoreState>()(
	devtools(
		persist(
			(set, get) => ({
				cookies: [],
				currentWorkspaceId: null,

				setCurrentWorkspaceId: (workspaceId) =>
					set({ currentWorkspaceId: workspaceId }),

				addCookie: (cookie) =>
					set((state) => {
						const workspaceId = state.currentWorkspaceId;
						if (!workspaceId) {
							return state;
						} // Don't add if no workspace

						// Remove existing cookie with same key, domain, and workspace
						const filteredCookies = state.cookies.filter(
							(c) =>
								!(
									c.key === cookie.key &&
									c.domain === cookie.domain &&
									c.workspaceId === workspaceId
								),
						);
						return {
							cookies: [
								...filteredCookies,
								{ ...cookie, workspaceId },
							],
						};
					}),

				removeCookie: (domain, key) =>
					set((state) => {
						const workspaceId = state.currentWorkspaceId;
						if (!workspaceId) {
							return state;
						}

						return {
							cookies: state.cookies.filter(
								(c) =>
									!(
										c.key === key &&
										c.domain === domain &&
										c.workspaceId === workspaceId
									),
							),
						};
					}),

				getCookiesForDomain: (domain) => {
					const state = get();
					const workspaceId = state.currentWorkspaceId;
					if (!workspaceId) {
						return [];
					}

					const targetDomain = domain.toLowerCase();
					return state.cookies.filter((c) => {
						// Must match workspace
						if (c.workspaceId !== workspaceId) {
							return false;
						}

						const cookieDomain = c.domain.toLowerCase();
						// Exact match
						if (cookieDomain === targetDomain) {
							return true;
						}
						// Subdomain match
						if (targetDomain.endsWith('.' + cookieDomain)) {
							return true;
						}

						return false;
					});
				},

				getAllCookiesForCurrentWorkspace: () => {
					const state = get();
					const workspaceId = state.currentWorkspaceId;
					if (!workspaceId) {
						return [];
					}

					return state.cookies.filter(
						(c) => c.workspaceId === workspaceId,
					);
				},

				updateCookie: (oldCookie, newCookie) =>
					set((state) => {
						const workspaceId = state.currentWorkspaceId;
						if (!workspaceId) {
							return state;
						}

						// Remove old cookie
						const withoutOld = state.cookies.filter(
							(c) =>
								!(
									c.key === oldCookie.key &&
									c.domain === oldCookie.domain &&
									c.workspaceId === workspaceId
								),
						);
						// Remove any existing cookie that conflicts with the new one
						const withoutConflict = withoutOld.filter(
							(c) =>
								!(
									c.key === newCookie.key &&
									c.domain === newCookie.domain &&
									c.workspaceId === workspaceId
								),
						);
						return {
							cookies: [
								...withoutConflict,
								{ ...newCookie, workspaceId },
							],
						};
					}),

				clearCookies: () =>
					set((state) => {
						const workspaceId = state.currentWorkspaceId;
						if (!workspaceId) {
							return { cookies: [] };
						}

						// Only clear cookies for current workspace
						return {
							cookies: state.cookies.filter(
								(c) => c.workspaceId !== workspaceId,
							),
						};
					}),

				clearCookiesForWorkspace: (workspaceId) =>
					set((state) => ({
						cookies: state.cookies.filter(
							(c) => c.workspaceId !== workspaceId,
						),
					})),

				clearExpiredCookies: () => {
					const now = new Date();
					const state = get();
					const workspaceId = state.currentWorkspaceId;

					const currentCookies = workspaceId
						? state.cookies.filter(
								(c) => c.workspaceId === workspaceId,
							)
						: state.cookies;

					const validCookies = state.cookies.filter((cookie) => {
						// Keep cookies from other workspaces
						if (workspaceId && cookie.workspaceId !== workspaceId) {
							return true;
						}
						if (!cookie.expires) {
							return true;
						}
						const expiryDate = new Date(cookie.expires);
						return expiryDate > now;
					});

					const clearedCount =
						currentCookies.length -
						validCookies.filter(
							(c) =>
								!workspaceId || c.workspaceId === workspaceId,
						).length;

					if (clearedCount > 0) {
						set({ cookies: validCookies });
					}
					return clearedCount;
				},
			}),
			{ name: 'cookie-store' },
		),
	),
);

export default useCookieStore;
