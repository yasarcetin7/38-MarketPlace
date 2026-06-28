import { requireUser } from "@/lib/auth0";
export default async function LoggedInLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Güvenlik görevlisini kapıya diktik! Giriş yapmayanı anında /auth/login'e atacak.
  await requireUser();

  return (
    <div
      className="p-6 bg-slate-50 dark:bg-background
     min-h-screen"
    >
      {children}
    </div>
  );
}
