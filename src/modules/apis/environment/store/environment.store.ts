import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export interface EnvironmentVariable {
  key: string;
  value: string;
  type: "default" | "secret";
  enabled: boolean;
}

export interface EnvironmentState {
  id: string;
  name: string;
  description?: string | null;
  variables: EnvironmentVariable[];
  isGlobal: boolean;
  workspaceId: string | null;
}

interface EnvironmentStoreState {
  environments: EnvironmentState[];
  activeEnvironmentId: string | null;
  loading: boolean;
  revealedSecretKeys: string[]; // Track which secret variable keys are currently revealed (session-only)
}

interface EnvironmentStoreActions {
  setEnvironments: (environments: EnvironmentState[]) => void;
  setActiveEnvironment: (id: string | null) => void;
  addEnvironment: (environment: EnvironmentState) => void;
  updateEnvironment: (id: string, data: Partial<EnvironmentState>) => void;
  removeEnvironment: (id: string) => void;
  getActiveEnvironment: () => EnvironmentState | null;
  getVariablesAsRecord: () => Record<string, string>;
  getVariableWithMeta: (key: string) => {
    value: string;
    type: "default" | "secret";
    isRevealed: boolean;
  } | null;
  toggleSecretVisibility: (key: string) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

const useEnvironmentStore = create<
  EnvironmentStoreState & EnvironmentStoreActions
>()(
  devtools(
    persist(
      (set, get) => ({
        environments: [],
        activeEnvironmentId: null,
        loading: false,
        revealedSecretKeys: [],

        setEnvironments: (environments) => set({ environments }),

        setActiveEnvironment: (id) => set({ activeEnvironmentId: id }),

        addEnvironment: (environment) =>
          set((state) => ({
            environments: [...state.environments, environment],
          })),

        updateEnvironment: (id, data) =>
          set((state) => ({
            environments: state.environments.map((env) =>
              env.id === id ? { ...env, ...data } : env,
            ),
          })),

        removeEnvironment: (id) =>
          set((state) => ({
            environments: state.environments.filter((env) => env.id !== id),
            activeEnvironmentId:
              state.activeEnvironmentId === id
                ? null
                : state.activeEnvironmentId,
          })),

        getActiveEnvironment: () => {
          const { environments, activeEnvironmentId } = get();
          if (!activeEnvironmentId) {
            return null;
          }
          return (
            environments.find((env) => env.id === activeEnvironmentId) || null
          );
        },

        getVariablesAsRecord: () => {
          const activeEnv = get().getActiveEnvironment();
          if (!activeEnv) {
            return {};
          }

          const record: Record<string, string> = {};
          const vars = activeEnv.variables || [];

          // Handle both array of {key, value, enabled} and possibly other formats
          if (Array.isArray(vars)) {
            vars.forEach((v: any) => {
              // Check if variable is enabled (default true if not specified)
              const isEnabled = v.enabled !== false;
              if (isEnabled && v.key && typeof v.key === "string") {
                record[v.key] = v.value || "";
              }
            });
          }

          return record;
        },

        getVariableWithMeta: (key: string) => {
          const activeEnv = get().getActiveEnvironment();
          if (!activeEnv) {
            return null;
          }

          const vars = activeEnv.variables || [];
          const variable = vars.find(
            (v: any) => v.key === key && v.enabled !== false,
          );

          if (!variable) {
            return null;
          }

          const revealedSecretKeys = get().revealedSecretKeys;
          return {
            value: variable.value || "",
            type: variable.type || "default",
            isRevealed:
              variable.type !== "secret" || revealedSecretKeys.includes(key),
          };
        },

        toggleSecretVisibility: (key: string) =>
          set((state) => {
            const isRevealed = state.revealedSecretKeys.includes(key);
            return {
              revealedSecretKeys: isRevealed
                ? state.revealedSecretKeys.filter((k) => k !== key)
                : [...state.revealedSecretKeys, key],
            };
          }),

        setLoading: (loading) => set({ loading }),

        reset: () =>
          set({
            environments: [],
            activeEnvironmentId: null,
            loading: false,
            revealedSecretKeys: [],
          }),
      }),
      {
        name: "environment-store",
        // Don't persist revealedSecretKeys - for security, secrets should be hidden on page reload
        partialize: (state) => ({
          environments: state.environments,
          activeEnvironmentId: state.activeEnvironmentId,
          loading: state.loading,
        }),
      },
    ),
  ),
);

export default useEnvironmentStore;
