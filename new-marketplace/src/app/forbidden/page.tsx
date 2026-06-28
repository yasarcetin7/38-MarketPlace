import { getSessionUser, isAdmin } from "@/lib/auth0";
import { redirect } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
export default async function Home() {
  // Kullanıcı bilgilerini çekiyoruz
  const user = await getSessionUser();

  // 1. DURUM: Kullanıcı giriş YAPMAMIŞSA
  // Ekranda sadece hoş geldin yazısı ve Giriş Yap butonu görünsün.
  if (!user) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans min-h-[80vh] dark:bg-black dark:text-white">
        <h1 className="text-2xl font-bold mb-4">"You don't have Admin privileges to view this page."</h1>
        <p className="mb-6 text-gray-500">Please log in to continue.</p>
       <a
                     href="/auth/login"
                     className={cn(buttonVariants({ variant: "success" }))}
                   >
                     SİGN İN
                   </a>
      </div>
    );
  }

  // 2. DURUM: Kullanıcı giriş yapmış ve bir ADMIN ise
  // Hiçbir şey göstermeden saniyesinde admin paneline fırlat!
  if (isAdmin(user)) {
    redirect("/admin");
  }

  // 3. DURUM: Kullanıcı giriş yapmış ve NORMAL ÜYE ise
  // Saniyesinde normal üye paneline (dashboard) fırlat!
  redirect("/dashboard");
}