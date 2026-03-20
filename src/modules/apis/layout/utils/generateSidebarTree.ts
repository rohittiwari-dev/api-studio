import type { HttpMethod } from "@/generated/prisma/browser";
import type { CollectionInterface } from "@/modules/apis/collections/store/collection.store";
import type {
  SidebarCollectionItemInterface,
  SidebarItemInterface,
} from "@/modules/apis/collections/types/sidebar.types";
import type { RequestStateInterface } from "@/modules/apis/requests/types/request.types";

/**
 * Generate sidebar tree structure from flat requests and collections
 * Pure function - no side effects
 *
 * @param requests - All requests for the workspace
 * @param collections - All collections for the workspace
 * @returns Sidebar tree structure
 */
export function generateSidebarTree(
  requests: RequestStateInterface[],
  collections: CollectionInterface[],
  workspaceId?: string,
): SidebarItemInterface[] {
  // Create a map of collections by ID for O(1) lookup
  const collectionMap = new Map<string, SidebarCollectionItemInterface>();

  // Initialize all collections as sidebar items
  collections
    .filter((col) => col.workspaceId === workspaceId)
    .forEach((col) => {
      collectionMap.set(col.id, {
        id: col.id,
        name: col.name,
        type: "COLLECTION",
        workspaceId: col.workspaceId,
        parentId: col.parentId,
        sortOrder: col.sortOrder,
        children: [],
      });
    });

  // Add requests to their parent collections or root
  const rootRequests: SidebarItemInterface[] = [];

  requests
    .filter((req) => req.workspaceId === workspaceId)
    .forEach((req) => {
      // Handle null type by defaulting to "API"
      const reqType = req.type === "NEW" ? "NEW" : req.type || "API";

      // Safety check for sortOrder access, defaulting to 0 if undefined
      const sortOrder = (req as any).sortOrder || 0;

      const requestItem: SidebarItemInterface = {
        id: req.id,
        name: req.name,
        type: reqType,
        method: req.method as HttpMethod | null,
        path: req.url || "",
        workspaceId: req.workspaceId,
        collectionId: req.collectionId,
        sortOrder: sortOrder,
      };

      if (req.collectionId && collectionMap.has(req.collectionId)) {
        // Add to parent collection
        collectionMap.get(req.collectionId)?.children.push(requestItem);
      } else {
        // Add to root level
        rootRequests.push(requestItem);
      }
    });

  // Build nested collection structure
  const rootCollections: SidebarCollectionItemInterface[] = [];

  collectionMap.forEach((col) => {
    if (col.parentId && collectionMap.has(col.parentId)) {
      // Add to parent collection
      collectionMap.get(col.parentId)?.children.push(col);
    } else if (!col.parentId) {
      // Root level collection
      rootCollections.push(col);
    }
  });

  // Helper sort function
  const sortItems = (a: SidebarItemInterface, b: SidebarItemInterface) => {
    const orderA = a.sortOrder ?? 0;
    const orderB = b.sortOrder ?? 0;
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    return a.name.localeCompare(b.name);
  };

  // Sort collections first, then requests
  const sortedRootCollections = rootCollections.sort(sortItems);

  // Recursively sort children
  const sortChildren = (
    items: SidebarItemInterface[],
  ): SidebarItemInterface[] => {
    const collections = items.filter(
      (i) => i.type === "COLLECTION",
    ) as SidebarCollectionItemInterface[];
    const requests = items.filter((i) => i.type !== "COLLECTION");

    // Sort and recurse into collections
    collections.forEach((col) => {
      col.children = sortChildren(col.children);
    });

    return [...collections.sort(sortItems), ...requests.sort(sortItems)];
  };

  // Sort children of root collections
  sortedRootCollections.forEach((col) => {
    col.children = sortChildren(col.children);
  });

  // Return collections first, then root requests
  return [...sortedRootCollections, ...rootRequests.sort(sortItems)];
}

/**
 * Find an item in the sidebar tree by ID
 */
export function findInSidebarTree(
  items: SidebarItemInterface[],
  id: string,
): SidebarItemInterface | null {
  for (const item of items) {
    if (item.id === id) {
      return item;
    }
    if (item.type === "COLLECTION") {
      const found = findInSidebarTree(item.children, id);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

/**
 * Get the path to an item in the tree (for breadcrumbs)
 */
export function getItemPath(
  items: SidebarItemInterface[],
  id: string,
  path: string[] = [],
): string[] | null {
  for (const item of items) {
    if (item.id === id) {
      return [...path, item.name];
    }
    if (item.type === "COLLECTION") {
      const result = getItemPath(item.children, id, [...path, item.name]);
      if (result) {
        return result;
      }
    }
  }
  return null;
}
