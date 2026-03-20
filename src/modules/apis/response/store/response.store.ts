import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface ActualRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: any;
  cookies: any[];
  params?: { key: string; value: string }[];
}

export interface ApiResponseState {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: any;
  time: number;
  size: number;
  requestHeaders?: Record<string, string>;
  setCookie?: string[] | string;
  loading: boolean;
  error: string | null;
  actualRequest?: ActualRequest;
}

interface ResponseStoreState {
  responses: Record<string, ApiResponseState>; // requestId -> response
  setResponse: (requestId: string, response: ApiResponseState) => void;
  setLoading: (requestId: string, loading: boolean) => void;
  setError: (requestId: string, error: string) => void;
  setActualRequest: (requestId: string, actualRequest: ActualRequest) => void;
  clearResponse: (requestId: string) => void;
  getResponse: (requestId: string) => ApiResponseState | null;
}

const useResponseStore = create<ResponseStoreState>()(
  devtools(
    (set, get) => ({
      responses: {},
      setResponse: (requestId, response) =>
        set((state) => ({
          responses: {
            ...state.responses,
            [requestId]: {
              ...response,
              actualRequest: state.responses[requestId]?.actualRequest,
            },
          },
        })),
      setLoading: (requestId, loading) =>
        set((state) => ({
          responses: {
            ...state.responses,
            [requestId]: {
              ...(state.responses[requestId] || {
                status: 0,
                statusText: "",
                headers: {},
                body: null,
                time: 0,
                size: 0,
                error: null,
              }),
              loading,
            },
          },
        })),
      setError: (requestId, error) =>
        set((state) => ({
          responses: {
            ...state.responses,
            [requestId]: {
              ...(state.responses[requestId] || {
                status: 0,
                statusText: "",
                headers: {},
                body: null,
                time: 0,
                size: 0,
                loading: false,
              }),
              error,
              loading: false,
            },
          },
        })),
      setActualRequest: (requestId, actualRequest) =>
        set((state) => ({
          responses: {
            ...state.responses,
            [requestId]: {
              ...(state.responses[requestId] || {
                status: 0,
                statusText: "",
                headers: {},
                body: null,
                time: 0,
                size: 0,
                loading: true,
                error: null,
              }),
              actualRequest,
            },
          },
        })),
      clearResponse: (requestId) =>
        set((state) => {
          const newResponses = { ...state.responses };
          delete newResponses[requestId];
          return { responses: newResponses };
        }),
      getResponse: (requestId) => get().responses[requestId] || null,
    }),
    { name: "response-store" },
  ),
);

export default useResponseStore;
