"use server";

import { requireUser } from "@/lib/auth0";
import { prisma } from "@/lib/prisma"; 
import { revalidatePath } from "next/cache";

export async function updateUserSettings(formData: FormData) {
  // 1. Auth0'dan giriş yapmış kullanıcıyı doğrula
  const sessionUser = await requireUser();

  // 🚀 DÜZELTME BURADA: TypeScript'e email'in %100 var olduğunu kanıtlıyoruz.
  if (!sessionUser.email) {
    throw new Error("User email is required to update settings.");
  }
  
  // Artık TypeScript bu 'email' değişkeninin kesinlikle bir string olduğunu biliyor.
  const email = sessionUser.email;

  // 2. Formdan gelen verileri al
  const username = formData.get("username") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const address = formData.get("address") as string;

  // 3. Veritabanında (MongoDB) bu kullanıcıyı bul ve güncelle (Yoksa yeni oluştur)
  await prisma.user.upsert({
    where: { email: email },
    update: {
      username,
      firstName,
      lastName,
      address,
    },
    create: {
      email: email, // TypeScript artık burada hata vermeyecek!
      username,
      firstName,
      lastName,
      address,
    },
  });

  // 4. Sayfayı yenile ki yeni veriler anında ekranda görünsün
  revalidatePath("/settings");
}