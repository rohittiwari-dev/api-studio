"use client";

import {
  FileKey,
  Fingerprint,
  Globe,
  HelpCircle,
  Key,
  KeyRound,
  Loader2,
  Lock,
  Save,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { EnvironmentVariableInput } from "@/components/ui/environment-variable-input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  getWorkspaceWithGlobalAuth,
  updateWorkspaceGlobalAuth,
} from "@/modules/workspace/server/workspace.actions";
import useWorkspaceState, {
  type GlobalAuthState,
} from "@/modules/workspace/store";

type AuthType =
  | "NONE"
  | "BASIC"
  | "BEARER"
  | "API_KEY"
  | "OAUTH1"
  | "OAUTH2"
  | "DIGEST";

type TBasicAuth = { username: string; password: string };
type TBearerAuth = { token: string };
type TApiKeyAuth = { key: string; value: string; addTo: "header" | "query" };
type TDigestAuth = {
  username: string;
  password: string;
  realm: string;
  nonce: string;
  algorithm:
    | "MD5"
    | "MD5-sess"
    | "SHA-256"
    | "SHA-256-sess"
    | "SHA-512"
    | "SHA-512-sess";
  qop: "auth" | "auth-int" | string;
  nc: string;
  cnonce: string;
  opaque: string;
  disableRetryRequest?: boolean;
};
type TOauth1Auth = {
  consumerKey: string;
  consumerSecret: string;
  token: string;
  tokenSecret: string;
  signatureMethod:
    | "HMAC-SHA1"
    | "RSA-SHA1"
    | "PLAINTEXT"
    | "HMAC-SHA256"
    | "HMAC-SHA512"
    | "PLAINTEXT-SHA1"
    | "RSA-SHA256"
    | "RSA-SHA512"
    | "NONE";
  timestamp: string;
  verifier: string;
  nonce: string;
  version: string;
  callback: string;
  realm: string;
  requestType: "AUTHORIZATION_HEADER" | "BODY";
  includeBodyHash: boolean;
  addEmptyParamsToSignature: boolean;
};
type TOauth2Auth = {
  accessToken: string;
  accessTokenUrl: string;
  authorizationUrl: string;
  clientId: string;
  clientSecret: string;
  scope: string;
  state: string;
  grantType:
    | "authorization_code"
    | "implicit"
    | "password"
    | "authorization_code_pkce"
    | "client_credentials";
  clientAuthentication: "header" | "body";
  refreshTokenUrl: string;
  redirectUrl: string;
};

type AuthData =
  | TBasicAuth
  | TBearerAuth
  | TApiKeyAuth
  | TOauth1Auth
  | TOauth2Auth
  | TDigestAuth
  | null
  | undefined;

const authTypes: {
  value: AuthType;
  label: string;
  icon: React.ReactNode;
  description: string;
}[] = [
  {
    value: "NONE",
    label: "No Auth",
    icon: <ShieldOff className="size-3.5" />,
    description: "No authentication",
  },
  {
    value: "BASIC",
    label: "Basic Auth",
    icon: <Lock className="size-3.5" />,
    description: "Username & Password",
  },
  {
    value: "BEARER",
    label: "Bearer",
    icon: <KeyRound className="size-3.5" />,
    description: "Bearer Token",
  },
  {
    value: "API_KEY",
    label: "API Key",
    icon: <Key className="size-3.5" />,
    description: "Key-Value pair",
  },
  {
    value: "DIGEST",
    label: "Digest Auth",
    icon: <Fingerprint className="size-3.5" />,
    description: "Digest Authentication",
  },
  {
    value: "OAUTH1",
    label: "OAuth 1.0",
    icon: <FileKey className="size-3.5" />,
    description: "OAuth 1.0a",
  },
  {
    value: "OAUTH2",
    label: "OAuth 2.0",
    icon: <ShieldCheck className="size-3.5" />,
    description: "OAuth 2.0",
  },
];

// Helper component for field labels with required indicator and tooltip
const FieldLabel = ({
  children,
  required,
  tooltip,
  htmlFor,
}: {
  children: React.ReactNode;
  required?: boolean;
  tooltip?: string;
  htmlFor?: string;
}) => (
  <div className="flex items-center gap-1 mb-0.5">
    <Label
      htmlFor={htmlFor}
      className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider"
    >
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </Label>
    {tooltip && (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <HelpCircle className="size-3 text-muted-foreground/50 cursor-help" />
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs text-xs">
            {tooltip}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )}
  </div>
);

// Helper component for field description
const FieldDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[9px] text-muted-foreground/70 mt-0.5">{children}</p>
);

const GlobalAuthPanel = () => {
  const {
    activeWorkspace,
    updateWorkspaceGlobalAuth: updateStoreGlobalAuth,
    setActiveWorkspace,
  } = useWorkspaceState();
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Local state initialized from workspace
  const [authType, setAuthType] = useState<AuthType>("NONE");
  const [authData, setAuthData] = useState<AuthData>(null);

  // Fetch globalAuth from database when workspace changes
  useEffect(() => {
    const fetchGlobalAuth = async () => {
      if (!activeWorkspace?.id) {
        setIsLoading(false);
        return;
      }

      // First check if store already has globalAuth
      if (activeWorkspace?.globalAuth) {
        const globalAuth = activeWorkspace.globalAuth as GlobalAuthState;
        if (globalAuth) {
          setAuthType((globalAuth.type as AuthType) || "NONE");
          setAuthData((globalAuth.data as AuthData) || null);
        }
        setIsLoading(false);
        setHasUnsavedChanges(false);
        return;
      }

      // Fetch from database
      setIsLoading(true);
      const result = await getWorkspaceWithGlobalAuth(activeWorkspace.id);
      setIsLoading(false);

      setActiveWorkspace({
        ...activeWorkspace,
        ...result,
      });

      if (result?.globalAuth) {
        const globalAuth = result.globalAuth as GlobalAuthState;
        if (globalAuth) {
          setAuthType((globalAuth.type as AuthType) || "NONE");
          setAuthData((globalAuth.data as AuthData) || null);
          updateStoreGlobalAuth(globalAuth);
        }
      } else {
        setAuthType("NONE");
        setAuthData(null);
      }
      setHasUnsavedChanges(false);
    };

    fetchGlobalAuth();
  }, [
    activeWorkspace,
    activeWorkspace?.id,
    setActiveWorkspace,
    updateStoreGlobalAuth,
  ]);

  const handleSave = useCallback(async () => {
    if (!activeWorkspace?.id) {
      return;
    }

    setIsSaving(true);
    const globalAuth: GlobalAuthState =
      authType === "NONE" ? null : { type: authType, data: authData };
    updateStoreGlobalAuth(globalAuth);

    const result = await updateWorkspaceGlobalAuth(
      activeWorkspace.id,
      globalAuth,
    );
    setIsSaving(false);

    if (result.success) {
      setHasUnsavedChanges(false);
      toast.success("Global auth saved");
    } else {
      toast.error("Failed to save global auth");
    }
  }, [activeWorkspace, authType, authData, updateStoreGlobalAuth]);

  const handleAuthTypeChange = useCallback((type: AuthType) => {
    setAuthType(type);
    if (type === "NONE") {
      setAuthData(null);
    }
    setHasUnsavedChanges(true);
  }, []);

  const handleAuthDataChange = useCallback((data: AuthData) => {
    setAuthData(data);
    setHasUnsavedChanges(true);
  }, []);

  const currentAuthType = authTypes.find((t) => t.value === authType);

  const renderBasicAuth = () => {
    const data = (authData as TBasicAuth) || { username: "", password: "" };
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <FieldLabel
            required
            tooltip="The username for HTTP Basic authentication"
          >
            Username
          </FieldLabel>
          <EnvironmentVariableInput
            id="global-username"
            placeholder="Enter username"
            value={data.username || ""}
            onChange={(val) => handleAuthDataChange({ ...data, username: val })}
            className="bg-muted/30 h-7 text-xs font-mono px-2"
          />
          <FieldDescription>Your account username or email</FieldDescription>
        </div>
        <div>
          <FieldLabel
            required
            tooltip="The password for HTTP Basic authentication"
          >
            Password
          </FieldLabel>
          <EnvironmentVariableInput
            id="global-password"
            placeholder="Enter password"
            value={data.password || ""}
            onChange={(val) => handleAuthDataChange({ ...data, password: val })}
            className="bg-muted/30 h-7 text-xs font-mono px-2"
          />
          <FieldDescription>Your account password</FieldDescription>
        </div>
      </div>
    );
  };

  const renderBearerAuth = () => {
    const data = (authData as TBearerAuth) || { token: "" };
    return (
      <div className="space-y-3">
        <div>
          <FieldLabel
            required
            tooltip="The bearer token to include in the Authorization header"
          >
            Token
          </FieldLabel>
          <EnvironmentVariableInput
            id="global-token"
            placeholder="Enter bearer token"
            value={data.token || ""}
            onChange={(val) => handleAuthDataChange({ token: val })}
            className="bg-muted/30 h-7 text-xs font-mono px-2"
          />
          <FieldDescription>
            JWT token, API token, or access token
          </FieldDescription>
        </div>
        <div className="bg-muted/30 rounded p-2 border border-border/50">
          <p className="text-[10px] text-muted-foreground font-mono">
            <span className="text-foreground/70">Header:</span> Authorization:
            Bearer &lt;token&gt;
          </p>
        </div>
      </div>
    );
  };

  const renderApiKeyAuth = () => {
    const data = (authData as TApiKeyAuth) || {
      key: "",
      value: "",
      addTo: "header",
    };
    return (
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <FieldLabel required tooltip="The header or query parameter name">
              Key
            </FieldLabel>
            <EnvironmentVariableInput
              id="global-apiKey"
              placeholder="e.g., X-API-Key"
              value={data.key || ""}
              onChange={(val) => handleAuthDataChange({ ...data, key: val })}
              className="bg-muted/30 h-7 text-xs font-mono px-2"
            />
            <FieldDescription>Header name or query param key</FieldDescription>
          </div>
          <div>
            <FieldLabel required tooltip="Your API key value">
              Value
            </FieldLabel>
            <EnvironmentVariableInput
              id="global-apiValue"
              placeholder="Your API key"
              value={data.value || ""}
              onChange={(val) => handleAuthDataChange({ ...data, value: val })}
              className="bg-muted/30 h-7 text-xs font-mono px-2"
            />
            <FieldDescription>The secret API key value</FieldDescription>
          </div>
        </div>
        <div>
          <FieldLabel tooltip="Where to send the API key">Add to</FieldLabel>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                handleAuthDataChange({
                  ...data,
                  addTo: "header",
                })
              }
              className={cn(
                "flex-1 rounded border px-3 py-1.5 text-[10px] transition-colors",
                data.addTo === "header"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background hover:bg-muted text-foreground",
              )}
            >
              Header
            </button>
            <button
              type="button"
              onClick={() =>
                handleAuthDataChange({
                  ...data,
                  addTo: "query",
                })
              }
              className={cn(
                "flex-1 rounded border px-3 py-1.5 text-[10px] transition-colors",
                data.addTo === "query"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background hover:bg-muted text-foreground",
              )}
            >
              Query Params
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderDigestAuth = () => {
    const data = (authData as TDigestAuth) || {
      username: "",
      password: "",
      realm: "",
      nonce: "",
      algorithm: "MD5",
      qop: "",
      nc: "",
      cnonce: "",
      opaque: "",
      disableRetryRequest: false,
    };

    return (
      <div className="space-y-4">
        {/* Required fields */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <FieldLabel required tooltip="Username for Digest authentication">
              Username
            </FieldLabel>
            <EnvironmentVariableInput
              value={data.username || ""}
              onChange={(val) =>
                handleAuthDataChange({ ...data, username: val })
              }
              className="bg-muted/30 h-7 text-xs font-mono px-2"
              placeholder="Enter username"
            />
          </div>
          <div>
            <FieldLabel required tooltip="Password for Digest authentication">
              Password
            </FieldLabel>
            <EnvironmentVariableInput
              value={data.password || ""}
              onChange={(val) =>
                handleAuthDataChange({ ...data, password: val })
              }
              className="bg-muted/30 h-7 text-xs font-mono px-2"
              placeholder="Enter password"
            />
          </div>
        </div>

        {/* Server-provided fields */}
        <div className="border-t border-border/40 pt-3">
          <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wider font-medium">
            Server Challenge (from 401 response)
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <FieldLabel tooltip="Protection realm from server's WWW-Authenticate header">
                Realm
              </FieldLabel>
              <EnvironmentVariableInput
                value={data.realm || ""}
                onChange={(val) =>
                  handleAuthDataChange({
                    ...data,
                    realm: val,
                  })
                }
                className="bg-muted/30 h-7 text-xs font-mono px-2"
                placeholder="From server response"
              />
              <FieldDescription>
                Copy from 401 WWW-Authenticate header
              </FieldDescription>
            </div>
            <div>
              <FieldLabel tooltip="Server-generated unique nonce value">
                Nonce
              </FieldLabel>
              <EnvironmentVariableInput
                value={data.nonce || ""}
                onChange={(val) =>
                  handleAuthDataChange({
                    ...data,
                    nonce: val,
                  })
                }
                className="bg-muted/30 h-7 text-xs font-mono px-2"
                placeholder="From server response"
              />
              <FieldDescription>One-time value from server</FieldDescription>
            </div>
            <div>
              <FieldLabel tooltip="Hash algorithm to use for response calculation">
                Algorithm
              </FieldLabel>
              <Select
                value={data.algorithm || "MD5"}
                onValueChange={(val) =>
                  handleAuthDataChange({
                    ...data,
                    algorithm: val as TDigestAuth["algorithm"],
                  })
                }
              >
                <SelectTrigger className="h-7 text-xs font-mono bg-muted/30">
                  <SelectValue placeholder="Algorithm" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "MD5",
                    "MD5-sess",
                    "SHA-256",
                    "SHA-256-sess",
                    "SHA-512",
                    "SHA-512-sess",
                  ].map((algo) => (
                    <SelectItem
                      key={algo}
                      value={algo}
                      className="text-xs font-mono"
                    >
                      {algo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldDescription>Default: MD5 (most common)</FieldDescription>
            </div>
            <div>
              <FieldLabel tooltip="Quality of protection - 'auth' for authentication only">
                QOP
              </FieldLabel>
              <EnvironmentVariableInput
                value={data.qop || ""}
                onChange={(val) => handleAuthDataChange({ ...data, qop: val })}
                className="bg-muted/30 h-7 text-xs font-mono px-2"
                placeholder="auth or auth-int"
              />
              <FieldDescription>
                Usually &apos;auth&apos; - from server
              </FieldDescription>
            </div>
            <div>
              <FieldLabel tooltip="Opaque string from server (pass back unchanged)">
                Opaque
              </FieldLabel>
              <EnvironmentVariableInput
                value={data.opaque || ""}
                onChange={(val) =>
                  handleAuthDataChange({
                    ...data,
                    opaque: val,
                  })
                }
                className="bg-muted/30 h-7 text-xs font-mono px-2"
                placeholder="From server response"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 pt-2 border-t border-border/40">
          <Switch
            id="global-disable-retry"
            checked={data.disableRetryRequest || false}
            onCheckedChange={(checked) =>
              handleAuthDataChange({
                ...data,
                disableRetryRequest: checked,
              })
            }
          />
          <Label htmlFor="global-disable-retry" className="text-xs font-medium">
            Disable automatic retry on 401
          </Label>
        </div>
      </div>
    );
  };

  const renderOAuth1 = () => {
    const data = (authData as TOauth1Auth) || {
      consumerKey: "",
      consumerSecret: "",
      token: "",
      tokenSecret: "",
      signatureMethod: "HMAC-SHA1",
      timestamp: "",
      verifier: "",
      nonce: "",
      version: "1.0",
      callback: "",
      realm: "",
      requestType: "AUTHORIZATION_HEADER",
      includeBodyHash: false,
      addEmptyParamsToSignature: false,
    };

    return (
      <div className="space-y-4">
        {/* Required credentials */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <FieldLabel
              required
              tooltip="Application's consumer key from OAuth provider"
            >
              Consumer Key
            </FieldLabel>
            <EnvironmentVariableInput
              value={data.consumerKey || ""}
              onChange={(val) =>
                handleAuthDataChange({
                  ...data,
                  consumerKey: val,
                })
              }
              className="bg-muted/30 h-7 text-xs font-mono px-2"
              placeholder="Your app's consumer key"
            />
            <FieldDescription>
              From OAuth 1.0 provider settings
            </FieldDescription>
          </div>
          <div>
            <FieldLabel
              required
              tooltip="Application's consumer secret from OAuth provider"
            >
              Consumer Secret
            </FieldLabel>
            <EnvironmentVariableInput
              value={data.consumerSecret || ""}
              onChange={(val) =>
                handleAuthDataChange({
                  ...data,
                  consumerSecret: val,
                })
              }
              className="bg-muted/30 h-7 text-xs font-mono px-2"
              placeholder="Your app's consumer secret"
            />
            <FieldDescription>Keep this secret!</FieldDescription>
          </div>
          <div>
            <FieldLabel tooltip="User's access token (after authorization)">
              Access Token
            </FieldLabel>
            <EnvironmentVariableInput
              value={data.token || ""}
              onChange={(val) => handleAuthDataChange({ ...data, token: val })}
              className="bg-muted/30 h-7 text-xs font-mono px-2"
              placeholder="User access token"
            />
            <FieldDescription>From OAuth authorization flow</FieldDescription>
          </div>
          <div>
            <FieldLabel tooltip="User's token secret (after authorization)">
              Token Secret
            </FieldLabel>
            <EnvironmentVariableInput
              value={data.tokenSecret || ""}
              onChange={(val) =>
                handleAuthDataChange({
                  ...data,
                  tokenSecret: val,
                })
              }
              className="bg-muted/30 h-7 text-xs font-mono px-2"
              placeholder="Token secret"
            />
          </div>
        </div>

        {/* Signature settings */}
        <div className="border-t border-border/40 pt-3">
          <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wider font-medium">
            Signature Settings
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <FieldLabel required tooltip="Method used to sign the request">
                Signature Method
              </FieldLabel>
              <Select
                value={data.signatureMethod || "HMAC-SHA1"}
                onValueChange={(val) =>
                  handleAuthDataChange({
                    ...data,
                    signatureMethod: val as TOauth1Auth["signatureMethod"],
                  })
                }
              >
                <SelectTrigger className="h-7 text-xs font-mono bg-muted/30">
                  <SelectValue placeholder="Method" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "HMAC-SHA1",
                    "HMAC-SHA256",
                    "HMAC-SHA512",
                    "RSA-SHA1",
                    "RSA-SHA256",
                    "RSA-SHA512",
                    "PLAINTEXT",
                    "PLAINTEXT-SHA1",
                    "NONE",
                  ].map((method) => (
                    <SelectItem
                      key={method}
                      value={method}
                      className="text-xs font-mono"
                    >
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldDescription>HMAC-SHA1 is most common</FieldDescription>
            </div>
            <div>
              <FieldLabel tooltip="OAuth version (usually 1.0)">
                Version
              </FieldLabel>
              <EnvironmentVariableInput
                value={data.version || "1.0"}
                onChange={(val) =>
                  handleAuthDataChange({
                    ...data,
                    version: val,
                  })
                }
                className="bg-muted/30 h-7 text-xs font-mono px-2"
                placeholder="1.0"
              />
            </div>
            <div>
              <FieldLabel tooltip="Optional realm parameter for Authorization header">
                Realm
              </FieldLabel>
              <EnvironmentVariableInput
                value={data.realm || ""}
                onChange={(val) =>
                  handleAuthDataChange({
                    ...data,
                    realm: val,
                  })
                }
                className="bg-muted/30 h-7 text-xs font-mono px-2"
                placeholder="Optional realm"
              />
            </div>
            <div>
              <FieldLabel tooltip="Verification code from authorization step">
                Verifier
              </FieldLabel>
              <EnvironmentVariableInput
                value={data.verifier || ""}
                onChange={(val) =>
                  handleAuthDataChange({
                    ...data,
                    verifier: val,
                  })
                }
                className="bg-muted/30 h-7 text-xs font-mono px-2"
                placeholder="Verification code"
              />
            </div>
            <div>
              <FieldLabel tooltip="Callback URL for OAuth flow">
                Callback URL
              </FieldLabel>
              <EnvironmentVariableInput
                value={data.callback || ""}
                onChange={(val) =>
                  handleAuthDataChange({
                    ...data,
                    callback: val,
                  })
                }
                className="bg-muted/30 h-7 text-xs font-mono px-2"
                placeholder="https://your-app.com/callback"
              />
            </div>
          </div>
        </div>

        {/* Request Type */}
        <div className="border-t border-border/40 pt-3">
          <FieldLabel tooltip="How to send OAuth parameters">
            Request Type
          </FieldLabel>
          <div className="flex gap-2 mt-1">
            <button
              type="button"
              onClick={() =>
                handleAuthDataChange({
                  ...data,
                  requestType: "AUTHORIZATION_HEADER",
                })
              }
              className={cn(
                "flex-1 rounded border px-3 py-1.5 text-[10px] transition-colors",
                data.requestType === "AUTHORIZATION_HEADER"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background hover:bg-muted text-foreground",
              )}
            >
              Authorization Header
            </button>
            <button
              type="button"
              onClick={() =>
                handleAuthDataChange({
                  ...data,
                  requestType: "BODY",
                })
              }
              className={cn(
                "flex-1 rounded border px-3 py-1.5 text-[10px] transition-colors",
                data.requestType === "BODY"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background hover:bg-muted text-foreground",
              )}
            >
              Request Body
            </button>
          </div>
        </div>

        {/* Advanced options */}
        <div className="flex flex-col gap-2 pt-2 border-t border-border/40">
          <div className="flex items-center space-x-2">
            <Switch
              id="global-include-body-hash"
              checked={data.includeBodyHash || false}
              onCheckedChange={(checked) =>
                handleAuthDataChange({
                  ...data,
                  includeBodyHash: checked,
                })
              }
            />
            <Label
              htmlFor="global-include-body-hash"
              className="text-xs font-medium"
            >
              Include Body Hash
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="global-empty-params"
              checked={data.addEmptyParamsToSignature || false}
              onCheckedChange={(checked) =>
                handleAuthDataChange({
                  ...data,
                  addEmptyParamsToSignature: checked,
                })
              }
            />
            <Label
              htmlFor="global-empty-params"
              className="text-xs font-medium"
            >
              Add Empty Params to Signature
            </Label>
          </div>
        </div>
      </div>
    );
  };

  const renderOAuth2 = () => {
    const data = (authData as TOauth2Auth) || {
      accessToken: "",
      accessTokenUrl: "",
      authorizationUrl: "",
      clientId: "",
      clientSecret: "",
      scope: "",
      state: "",
      grantType: "authorization_code",
      clientAuthentication: "header",
      refreshTokenUrl: "",
      redirectUrl: "",
    };

    return (
      <div className="space-y-4">
        {/* Current Access Token - Primary field */}
        <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
          <FieldLabel
            required
            tooltip="The access token to use for API requests"
          >
            Access Token
          </FieldLabel>
          <EnvironmentVariableInput
            value={data.accessToken || ""}
            onChange={(val) =>
              handleAuthDataChange({ ...data, accessToken: val })
            }
            className="bg-background h-8 text-xs font-mono px-2"
            placeholder="Paste your access token here"
          />
          <p className="text-[10px] text-muted-foreground mt-1.5">
            This token will be sent as:{" "}
            <code className="bg-muted px-1 rounded">
              Authorization: Bearer &lt;token&gt;
            </code>
          </p>
        </div>

        {/* OAuth Configuration for token refresh */}
        <div className="border-t border-border/40 pt-3">
          <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wider font-medium">
            Token Configuration (for refresh/new tokens)
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <FieldLabel tooltip="The OAuth grant type to use">
                Grant Type
              </FieldLabel>
              <Select
                value={data.grantType || "authorization_code"}
                onValueChange={(val) =>
                  handleAuthDataChange({
                    ...data,
                    grantType: val as TOauth2Auth["grantType"],
                  })
                }
              >
                <SelectTrigger className="h-7 text-xs font-mono bg-muted/30">
                  <SelectValue placeholder="Grant Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="authorization_code">
                    Authorization Code
                  </SelectItem>
                  <SelectItem value="client_credentials">
                    Client Credentials
                  </SelectItem>
                  <SelectItem value="password">Password</SelectItem>
                  <SelectItem value="implicit">Implicit</SelectItem>
                  <SelectItem value="authorization_code_pkce">
                    Authorization Code (PKCE)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <FieldLabel tooltip="URL where users are redirected after authorization">
                Callback URL
              </FieldLabel>
              <EnvironmentVariableInput
                value={data.redirectUrl || ""}
                onChange={(val) =>
                  handleAuthDataChange({
                    ...data,
                    redirectUrl: val,
                  })
                }
                className="bg-muted/30 h-7 text-xs font-mono px-2"
                placeholder="https://your-app.com/callback"
              />
            </div>
            <div>
              <FieldLabel tooltip="Authorization endpoint URL">
                Auth URL
              </FieldLabel>
              <EnvironmentVariableInput
                value={data.authorizationUrl || ""}
                onChange={(val) =>
                  handleAuthDataChange({
                    ...data,
                    authorizationUrl: val,
                  })
                }
                className="bg-muted/30 h-7 text-xs font-mono px-2"
                placeholder="https://provider.com/oauth/authorize"
              />
            </div>
            <div>
              <FieldLabel tooltip="Token endpoint URL">
                Access Token URL
              </FieldLabel>
              <EnvironmentVariableInput
                value={data.accessTokenUrl || ""}
                onChange={(val) =>
                  handleAuthDataChange({
                    ...data,
                    accessTokenUrl: val,
                  })
                }
                className="bg-muted/30 h-7 text-xs font-mono px-2"
                placeholder="https://provider.com/oauth/token"
              />
            </div>
            <div>
              <FieldLabel tooltip="Your application's client ID">
                Client ID
              </FieldLabel>
              <EnvironmentVariableInput
                value={data.clientId || ""}
                onChange={(val) =>
                  handleAuthDataChange({
                    ...data,
                    clientId: val,
                  })
                }
                className="bg-muted/30 h-7 text-xs font-mono px-2"
                placeholder="Your client ID"
              />
            </div>
            <div>
              <FieldLabel tooltip="Your application's client secret">
                Client Secret
              </FieldLabel>
              <EnvironmentVariableInput
                value={data.clientSecret || ""}
                onChange={(val) =>
                  handleAuthDataChange({
                    ...data,
                    clientSecret: val,
                  })
                }
                className="bg-muted/30 h-7 text-xs font-mono px-2"
                placeholder="Your client secret"
              />
            </div>
            <div>
              <FieldLabel tooltip="Permissions your app is requesting">
                Scope
              </FieldLabel>
              <EnvironmentVariableInput
                value={data.scope || ""}
                onChange={(val) =>
                  handleAuthDataChange({
                    ...data,
                    scope: val,
                  })
                }
                className="bg-muted/30 h-7 text-xs font-mono px-2"
                placeholder="read write profile"
              />
            </div>
            <div>
              <FieldLabel tooltip="Random state parameter for CSRF protection">
                State
              </FieldLabel>
              <EnvironmentVariableInput
                value={data.state || ""}
                onChange={(val) =>
                  handleAuthDataChange({
                    ...data,
                    state: val,
                  })
                }
                className="bg-muted/30 h-7 text-xs font-mono px-2"
                placeholder="Random state string"
              />
            </div>
          </div>
        </div>

        {/* Client authentication method */}
        <div className="border-t border-border/40 pt-3">
          <FieldLabel tooltip="How to send client credentials when requesting tokens">
            Client Authentication
          </FieldLabel>
          <div className="flex gap-2 mt-1">
            <button
              type="button"
              onClick={() =>
                handleAuthDataChange({
                  ...data,
                  clientAuthentication: "header",
                })
              }
              className={cn(
                "flex-1 rounded border px-3 py-1.5 text-[10px] transition-colors",
                data.clientAuthentication === "header"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background hover:bg-muted text-foreground",
              )}
            >
              Send as Basic Auth Header
            </button>
            <button
              type="button"
              onClick={() =>
                handleAuthDataChange({
                  ...data,
                  clientAuthentication: "body",
                })
              }
              className={cn(
                "flex-1 rounded border px-3 py-1.5 text-[10px] transition-colors",
                data.clientAuthentication === "body"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background hover:bg-muted text-foreground",
              )}
            >
              Send in Request Body
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderAuthContent = () => {
    switch (authType) {
      case "BASIC":
        return renderBasicAuth();
      case "BEARER":
        return renderBearerAuth();
      case "API_KEY":
        return renderApiKeyAuth();
      case "DIGEST":
        return renderDigestAuth();
      case "OAUTH1":
        return renderOAuth1();
      case "OAUTH2":
        return renderOAuth2();
      default:
        return (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="size-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
              <ShieldOff className="size-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              No global authentication configured
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Select an authentication type above to get started
            </p>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header info */}
      <div className="px-4 py-3 border-b border-border/40 bg-linear-to-r from-amber-500/5 to-orange-500/5">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <Globe className="size-4 text-amber-500" />
          </div>
          <div>
            <h3 className="text-sm font-medium">Global Authentication</h3>
            <p className="text-[10px] text-muted-foreground">
              Apply authentication to all requests in this workspace
            </p>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Auth type selector */}
          <div className="px-4 py-3 border-b border-border/40">
            <div className="flex items-center gap-2 mb-2">
              {currentAuthType?.icon}
              <span className="text-xs font-medium">
                {currentAuthType?.label}
              </span>
              {currentAuthType?.value !== "NONE" && (
                <span className="text-[10px] text-muted-foreground">
                  • {currentAuthType?.description}
                </span>
              )}
            </div>
            <Select
              value={authType}
              onValueChange={(val) => handleAuthTypeChange(val as AuthType)}
            >
              <SelectTrigger className="h-8 text-xs bg-muted/30">
                <SelectValue placeholder="Select auth type" />
              </SelectTrigger>
              <SelectContent>
                {authTypes.map((type) => (
                  <SelectItem
                    key={type.value}
                    value={type.value}
                    className="text-xs"
                  >
                    <div className="flex items-center gap-2">
                      {type.icon}
                      <div className="flex flex-col">
                        <span>{type.label}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {type.description}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Auth content */}
          <div className="flex-1 overflow-auto px-4 py-4">
            {renderAuthContent()}
          </div>

          {/* Footer with save button */}
          <div className="px-4 py-3 border-t border-border/40 bg-muted/20">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] text-muted-foreground flex-1">
                {authType !== "NONE" ? (
                  <>
                    <span className="text-amber-500 font-medium">Note:</span>{" "}
                    Global auth will be applied to requests using &quot;Inherit
                    from Workspace&quot;
                  </>
                ) : (
                  "No global authentication configured"
                )}
              </p>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || !hasUnsavedChanges}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                  hasUnsavedChanges
                    ? "bg-amber-500 text-white hover:bg-amber-600"
                    : "bg-muted text-muted-foreground cursor-not-allowed",
                )}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="size-3 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="size-3" />
                    Save
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GlobalAuthPanel;
