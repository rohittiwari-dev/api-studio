import type {
  CollectionWithRelations,
  NestedCollection,
} from "./types/sidebar.types";

export function buildNestedCollections(
  collections: CollectionWithRelations[],
  parentId: string | null = null,
): NestedCollection[] {
  return collections
    .filter((collection) => collection.parentId === parentId)
    .map((collection) => ({
      ...collection,
      children: buildNestedCollections(collections, collection.id),
    }));
}
