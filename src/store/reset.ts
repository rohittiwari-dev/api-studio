import { useAuthStore } from "@/modules/authentication/store";
import useRequestSyncStoreState from "@/modules/apis/requests/hooks/requestSyncStore";
import useCookieStore from "@/modules/apis/requests/store/cookie.store";
import useWorkspaceState from "@/modules/workspace/store";

const useResetStore = () => {
  const { reset: resetAuth } = useAuthStore();
  const { reset: resetWorkspace } = useWorkspaceState();
  const { reset: resetCookie } = useCookieStore();
  const { reset: resetRequest } = useRequestSyncStoreState();

  const resetStores = () => {
    resetAuth();
    resetWorkspace();
    resetCookie();
    resetRequest();
  };

  const resetCollectionsRequestsAndCookies = () => {
    resetRequest();
    resetCookie();
  };

  return {
    resetStores,
    resetAuth,
    resetWorkspace,
    resetCookie,
    resetRequest,
    resetCollectionsRequestsAndCookies,
  };
};

export default useResetStore;
