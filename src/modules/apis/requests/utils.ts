import type { Request } from "@/generated/prisma/browser";
import type { NestedCollection } from "../collections/types/sidebar.types";

export const extractRequestFromNestedCollection = (
  requestId: string,
  collections: NestedCollection[],
) => {
  for (const collection of collections) {
    const request = collection.requests.find((req) => req.id === requestId);
    if (request) {
      return request as unknown as Request | null | undefined;
    }
    const nestedRequest = extractRequestFromNestedCollection(
      requestId,
      collection.children,
    ) as Request | null | undefined;
    if (nestedRequest) {
      return nestedRequest;
    }
  }
  return null;
};
