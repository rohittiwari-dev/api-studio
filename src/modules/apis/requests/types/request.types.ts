import { Request } from "@/generated/prisma/browser";

export type AuthType =
  | "NONE"
  | "INHERIT"
  | "BASIC"
  | "BEARER"
  | "API_KEY"
  | "OAUTH1"
  | "OAUTH2"
  | "DIGEST";
export type TBasicAuth = {
  username: string;
  password: string;
};
export type TBearerAuth = {
  token: string;
};
export type TDigestAuth = {
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
  opaque: string;
  qop: "auth" | "auth-int" | string;
  nc: string;
  cnonce: string;
  disableRetryRequest?: boolean;
};
export type TOauth1Auth = {
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

export type TOauth2Auth = {
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

export type TApiKeyAuth = {
  key: string;
  value: string;
  addTo: "header" | "query";
};

export interface RequestStateInterface extends Omit<Request, "type"> {
  type: Request["type"] | "NEW";
  unsaved: boolean;
  body: {
    raw: string;
    formData: Array<{
      key: string;
      value: string;
      isActive: boolean;
      description: string;
      type: "TEXT" | "FILE" | "BOOLEAN" | "NUMBER";
      file?: any;
    }>;
    urlEncoded: Array<{
      key: string;
      value: string;
      isActive: boolean;
      description: string;
      type: "TEXT" | "FILE" | "BOOLEAN" | "NUMBER";
      file?: any;
    }>;
    file: null | { src: string };
    json: object | null;
  };
  headers: {
    key: string;
    value: string;
    isActive: boolean;
    description: string;
  }[];
  parameters: {
    key: string;
    value: string;
    isActive: boolean;
    description: string;
  }[];
  auth: {
    type:
      | "NONE"
      | "INHERIT"
      | "BASIC"
      | "BEARER"
      | "API_KEY"
      | "OAUTH1"
      | "OAUTH2"
      | "DIGEST";
    data?:
      | TBasicAuth
      | TBearerAuth
      | TApiKeyAuth
      | TOauth1Auth
      | TOauth2Auth
      | TDigestAuth
      | null
      | undefined;
  };
  collectionId: string | null;
  workspaceId: string;
  savedMessages:
    | {
        id: string;
        content: string;
        eventName?: string; // For Socket.IO
        args?: string; // For Socket.IO
        ack?: boolean; // For Socket.IO
      }[]
    | null;
}
export interface RequestsStoreState {
  requests: RequestStateInterface[];
  tabIds: string[];
  activeRequest: RequestStateInterface | null;
}
