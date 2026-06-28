import { getSessionUser, isAdmin } from "@/lib/auth0";
import { redirect } from "next/navigation";

export default async function Home() {
  // Kullanıcı bilgilerini çekiyoruz
  const user = await getSessionUser();

  // 1. DURUM: Kullanıcı giriş YAPMAMIŞSA

  if (!user) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans min-h-[80vh] dark:bg-black dark:text-white">
        <h1 className="text-3xl font-bold mb-4">Welcome Marketplace</h1>
      </div>
    );
  }

  //  Kullanıcı giriş yapmış ve bir ADMIN ise;
  if (isAdmin(user)) {
    redirect("/admin");
  }

  // Kullanıcı giriş yapmış ve NORMAL ÜYE ise
  redirect("/dashboard");
}
