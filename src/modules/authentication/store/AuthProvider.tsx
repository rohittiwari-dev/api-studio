'use client';

import React, { useEffect } from 'react';
import type { AuthStoreState } from '@/modules/authentication/store/index';
import authClient from '@/lib/authClient';
import { useAuthStore } from '@/modules/authentication/store/index';

const AuthProvider = ({
	state,
	children,
}: {
	state?: AuthStoreState;
	children: React.ReactNode;
}) => {
	const {
		setAuthStoreState,
		setError,
		setAuthSession,
		setIsLoading,
		triggerRefetch,
		setTriggerRefetch,
	} = useAuthStore();
	const { error, data, isPending, refetch } = authClient.useSession();

	useEffect(() => {
		if (state) {
			setAuthStoreState(state);
		}
	}, [setAuthStoreState, state]);

	useEffect(() => {
		if (error) {
			setError(error);
		}
	}, [error, setError]);

	useEffect(() => {
		if (data) {
			setAuthSession(data);
		}
	}, [data, setAuthSession]);

	useEffect(() => {
		setIsLoading(isPending);
	}, [isPending, setIsLoading]);

	useEffect(() => {
		if (triggerRefetch) {
			refetch();
			setTriggerRefetch(false);
		}
	}, [triggerRefetch, refetch, setTriggerRefetch]);

	return children;
};

export default AuthProvider;
