"use server";

import { requireUser } from "@/lib/auth0-utils";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateUserSettings(formData: FormData) {
  const sessionUser = await requireUser();

  if (!sessionUser.email) {
    throw new Error("User email is required to update settings.");
  }

  const email = sessionUser.email;

  const username = formData.get("username") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const address = formData.get("address") as string;

  await prisma.user.upsert({
    where: { email: email },
    update: {
      username,
      firstName,
      lastName,
      address,
    },
    create: {
      email: email,
      username,
      firstName,
      lastName,
      address,
    },
  });

  revalidatePath("/settings");
}
