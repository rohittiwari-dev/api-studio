import z from "zod";

export const CreateWorkspaceSchema = z.object({
  name: z
    .string()
    .nonempty({ message: "Name is required" })
    .min(3, { message: "Name must be at least 3 characters long" }),
  slug: z
    .string()
    .nonempty({ message: "Slug is required" })
    .min(3, { message: "Slug must be at least 3 characters long" })
    .regex(/^[a-zA-Z0-9-_]+$/, {
      message:
        "Slug can only contain letters, numbers, hyphens, and underscores",
    }),
});
