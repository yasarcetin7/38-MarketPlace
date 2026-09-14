import { requireUser } from "@/lib/auth0-utils";
export default async function LoggedInLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
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
