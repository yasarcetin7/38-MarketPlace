import { requireAdmin } from "@/lib/auth0";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAdmin(); 

  return (
    <div className="p-10  bg-slate-50 min-h-screen dark:bg-background">
      {/* Admin Navbarı vs. buraya gelebilir */}
      {children}
    </div>
  );
}