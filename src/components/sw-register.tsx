'use client';

import {
	useEffect,
	useState,
	createContext,
	useContext,
	useCallback,
	useRef,
} from 'react';

interface BeforeInstallPromptEvent extends Event {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Excluded routes that should not be accessible in PWA
const PWA_EXCLUDED_ROUTES = ['/', '/docs'];

// Check if a path is an excluded route
function isExcludedRoute(pathname: string): boolean {
	return pathname === '/' || pathname.startsWith('/docs');
}

// Check if running in standalone PWA mode
function checkIsStandalone(): boolean {
	if (typeof window === 'undefined') {
		return false;
	}
	return (
		window.matchMedia('(display-mode: standalone)').matches ||
		(window.navigator as Navigator & { standalone?: boolean })
			.standalone === true
	);
}

// PWA Context
interface PWAContextType {
	isPWA: boolean;
	isExcludedRoute: (path: string) => boolean;
	deferredPrompt: BeforeInstallPromptEvent | null;
	promptToInstall: () => Promise<void>;
}

const PWAContext = createContext<PWAContextType>({
	isPWA: false,
	isExcludedRoute: () => false,
	deferredPrompt: null,
	promptToInstall: async () => {},
});

export const usePWA = () => useContext(PWAContext);

export function ServiceWorkerRegistration({
	children,
}: {
	children?: React.ReactNode;
}) {
	// Use state because we need to react to display-mode changes
	const [isPWA, setIsPWA] = useState(() => checkIsStandalone());
	const [deferredPrompt, setDeferredPrompt] =
		useState<BeforeInstallPromptEvent | null>(null);
	const hasRedirected = useRef(false);

	// Get redirect URL based on auth state
	const getRedirectUrl = useCallback(() => {
		const hasSession = document.cookie.includes(
			'better-auth.session_token',
		);
		return hasSession ? '/workspace' : '/sign-in';
	}, []);

	// Listen for display-mode changes (handles install transition)
	useEffect(() => {
		if (typeof window === 'undefined') {
			return;
		}

		const mediaQuery = window.matchMedia('(display-mode: standalone)');

		const handleDisplayModeChange = (e: MediaQueryListEvent) => {
			const isNowStandalone = e.matches;
			setIsPWA(isNowStandalone);

			// If just transitioned to standalone and on excluded route, redirect immediately
			if (isNowStandalone && isExcludedRoute(window.location.pathname)) {
				window.location.replace(getRedirectUrl());
			}
		};

		// Add listener for display mode changes
		mediaQuery.addEventListener('change', handleDisplayModeChange);

		// Handle install prompt (must be captured early)
		const handleInstallPrompt = (e: Event) => {
			// Prevent the mini-infobar from appearing on mobile
			e.preventDefault();
			// Stash the event so it can be triggered later.
			setDeferredPrompt(e as BeforeInstallPromptEvent);
			console.log('Captured beforeinstallprompt event');
		};

		window.addEventListener('beforeinstallprompt', handleInstallPrompt);

		return () => {
			mediaQuery.removeEventListener('change', handleDisplayModeChange);
			window.removeEventListener(
				'beforeinstallprompt',
				handleInstallPrompt,
			);
		};
	}, [getRedirectUrl]);

	const promptToInstall = useCallback(async () => {
		if (!deferredPrompt) {
			console.log('No deferred prompt available');
			return;
		}
		deferredPrompt.prompt();
		const { outcome } = await deferredPrompt.userChoice;
		if (outcome === 'accepted') {
			setDeferredPrompt(null);
		}
	}, [deferredPrompt]);

	// Handle PWA mode setup and route protection
	useEffect(() => {
		if (typeof window === 'undefined') {
			return;
		}

		if (isPWA) {
			// Store PWA mode
			document.cookie =
				'pwa-display-mode=standalone; path=/; max-age=31536000';
			sessionStorage.setItem('pwa-mode', 'true');

			// If on excluded page, redirect immediately (only once)
			if (
				isExcludedRoute(window.location.pathname) &&
				!hasRedirected.current
			) {
				hasRedirected.current = true;
				window.location.replace(getRedirectUrl());
				return;
			}

			// Intercept all click events on links
			const handleClick = (e: MouseEvent) => {
				const target = e.target as HTMLElement;
				const link = target.closest('a');

				if (link) {
					const href = link.getAttribute('href');
					if (href && isExcludedRoute(href)) {
						e.preventDefault();
						e.stopPropagation();
						console.log(
							'[PWA] Blocked navigation to excluded route:',
							href,
						);
					}
				}
			};

			// Intercept popstate (browser back/forward)
			const handlePopState = () => {
				if (isExcludedRoute(window.location.pathname)) {
					window.history.pushState(null, '', getRedirectUrl());
					window.location.replace(getRedirectUrl());
				}
			};

			document.addEventListener('click', handleClick, true);
			window.addEventListener('popstate', handlePopState);

			return () => {
				document.removeEventListener('click', handleClick, true);
				window.removeEventListener('popstate', handlePopState);
			};
		} else {
			document.cookie =
				'pwa-display-mode=browser; path=/; max-age=31536000';
			sessionStorage.removeItem('pwa-mode');
		}
	}, [isPWA, getRedirectUrl]);

	// Register service worker
	useEffect(() => {
		if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
			navigator.serviceWorker
				.register('/sw.js')
				.then((registration) => {
					console.log('SW registered:', registration.scope);
				})
				.catch((error) => {
					console.log('SW registration failed:', error);
				});
		}
	}, []);

	// If PWA and on excluded route, show nothing while redirecting
	if (
		isPWA &&
		typeof window !== 'undefined' &&
		isExcludedRoute(window.location.pathname)
	) {
		return null;
	}

	return (
		<PWAContext.Provider
			value={{ isPWA, isExcludedRoute, deferredPrompt, promptToInstall }}
		>
			{children}
		</PWAContext.Provider>
	);
}
