import { useAuthStore } from '@/modules/authentication/store';
import useRequestSyncStoreState from '@/modules/apis/requests/hooks/requestSyncStore';
import useCookieStore from '@/modules/apis/requests/store/cookie.store';
import useWorkspaceState from '@/modules/workspace/store';
import useCollectionStore from '@/modules/apis/collections/store/collection.store';
import useEnvironmentStore from '@/modules/apis/environment/store/environment.store';

const useResetStore = () => {
	const { reset: resetAuth } = useAuthStore();
	const { reset: resetWorkspace } = useWorkspaceState();
	const { reset: resetCookie } = useCookieStore();
	const { reset: resetRequest } = useRequestSyncStoreState();
	const { reset: resetCollection } = useCollectionStore();
	const { reset: resetEnvironment } = useEnvironmentStore();

	const resetStores = () => {
		resetAuth();
		resetWorkspace();
		resetCookie();
		resetRequest();
		resetCollection();
		resetEnvironment();
	};

	const resetCollectionsRequestsAndCookies = () => {
		resetRequest();
		resetCookie();
		resetCollection();
		resetEnvironment();
	};

	return {
		resetStores,
		resetAuth,
		resetWorkspace,
		resetCookie,
		resetRequest,
		resetCollection,
		resetEnvironment,
		resetCollectionsRequestsAndCookies,
	};
};

export default useResetStore;
