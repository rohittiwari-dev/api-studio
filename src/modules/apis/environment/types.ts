export interface Environment {
  id: string;
  name: string;
  workspaceId: string;
  variables: EnvironmentVariable[];
  isActive: boolean;
}

export interface EnvironmentVariable {
  id: string;
  key: string;
  value: string;
  type: "default" | "secret";
  enabled: boolean;
}
