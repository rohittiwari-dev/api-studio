import type {
  BodyType,
  Environment,
  HttpMethod,
  MessageType,
  Prisma,
} from "@/generated/prisma/browser";

export interface RequestWithRelations {
  id: string;
  name: string;
  description: string | null;
  method: HttpMethod | null;
  url: string | null;
  type: RequestType;
  headers: Prisma.InputJsonValue[];
  parameters: Prisma.InputJsonValue[];
  body: Prisma.InputJsonValue[];
  bodyType: BodyType | null;
  auth: Prisma.InputJsonValue | null;
  messageType: MessageType | null;
  createdAt: Date;
  updatedAt: Date;
  workspaceId: string;
  collectionId: string | null;

  environments: Environment[];
}

export type RequestType = "API" | "WEBSOCKET" | "SOCKET_IO";
