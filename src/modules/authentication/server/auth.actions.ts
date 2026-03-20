"use server";

import { headers } from "next/headers";
import auth from "@/lib/auth";
import db from "@/lib/db";

export const currentUser = async () => {
  try {
    const requestHeaders = await headers();

    const session = await auth.api.getSession({
      headers: requestHeaders,
    });

    if (!session?.user?.id) {
      return null;
    }

    const user = await db.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        emailVerified: true,
      },
    });
    return { user, session: session.session };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("Dynamic server usage")
    ) {
      return null;
    }
    return null;
  }
};

export const addCredentialsAccount = async (password: string) => {
  try {
    const result = await auth.api.setPassword({
      body: {
        newPassword: password,
      },
      headers: await headers(),
    });

    return {
      data: result,
      message: "Password added successfully",
      error: null,
    };
  } catch (error) {
    console.error("Error adding credentials account:", error);
    return { data: null, message: "Failed to add password", error: error };
  }
};
