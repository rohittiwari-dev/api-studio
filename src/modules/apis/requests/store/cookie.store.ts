import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type CookieStoreState = {
	cookies: Record<string, string>;
};

type CookieStoreStateActions = {
	setCookies: (cookies: Record<string, string>) => void;
	getCookies: () => Record<string, string>;
	getCookieValue: (key: string) => string | undefined;
	deleteCookie: (key: string) => void;
	clearCookies: () => void;
	updateCookie: (key: string, value: string) => void;
	reset: () => void;
};

const useCookieStore = create<CookieStoreState & CookieStoreStateActions>()(
	devtools(
		persist(
			(set, get) => ({
				cookies: {},
				setCookies: (cookies) => set({ cookies }),
				getCookies: () => {
					return get().cookies;
				},
				getCookieValue: (key) => {
					return get().cookies[key];
				},
				deleteCookie: (key) => {
					const cookies = { ...get().cookies };
					delete cookies[key];
					set({ cookies });
				},
				clearCookies: () => set({ cookies: {} }),
				updateCookie: (key, value) => {
					const cookies = { ...get().cookies, [key]: value };
					set({ cookies });
				},
				reset: () => set({ cookies: {} }),
			}),
			{
				name: 'cookie-storage', // unique name
			},
		),
	),
);

export default useCookieStore;
