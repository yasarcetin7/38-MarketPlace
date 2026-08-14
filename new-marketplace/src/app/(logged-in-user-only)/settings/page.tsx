import { requireUser } from "@/lib/auth0";
import { prisma } from "@/lib/prisma"; 
import { SettingsForm } from "./SettingsForm";

export default async function SettingsPage() {
  // 1. Kullanıcının kim olduğunu Auth0'dan alıyoruz (Server tarafında)
  const sessionUser = await requireUser();

  // 2. MongoDB'den kullanıcının verilerini çekiyoruz
  const dbUser = await prisma.user.findUnique({
    where: { email: sessionUser.email },
  });

  return (
    <div className="max-w-2xl mx-auto p-4 mt-10">
      {/* 3. Çektiğimiz verileri Client formumuza yolluyoruz */}
      <SettingsForm dbUser={dbUser} email={sessionUser.email as string} />
    </div>
  );
}