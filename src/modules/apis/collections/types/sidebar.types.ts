import type {
  Environment,
  HttpMethod,
  Organization,
} from "@/generated/prisma/browser";
import type {
  RequestType,
  RequestWithRelations,
} from "@/modules/apis/requests/types/store.types";

// types/collection.ts
export interface CollectionWithRelations {
  id: string;
  name: string;
  description: string | null;
  parentId: string | null;
  workspaceId: string;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  requests: RequestWithRelations[];
  environments: Environment[];
  children: CollectionWithRelations[];
  parent?: CollectionWithRelations | null;
  workspace: Organization;
}

export interface NestedCollection {
  id: string;
  name: string;
  description: string | null;
  parentId: string | null;
  workspaceId: string;
  createdAt: Date;
  updatedAt: Date;

  requests: RequestWithRelations[];
  environments: Environment[];
  children: NestedCollection[];
}

export interface SidebarCollectionItemInterface {
  name: string;
  type: "COLLECTION";
  id: string;
  children: SidebarItemInterface[];
  workspaceId: string;
  parentId: string | null;
  sortOrder?: number;
}

export interface RequestSidebarItemInterface {
  name: string;
  type: RequestType | "NEW";
  id: string;
  method: HttpMethod | null;
  path: string;
  workspaceId: string;
  collectionId: string | null;
  sortOrder?: number;
}

export type SidebarItemInterface =
  | SidebarCollectionItemInterface
  | RequestSidebarItemInterface;
