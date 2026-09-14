import { getSessionUser, isAdmin } from "@/lib/auth0-utils";
import { redirect } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
export default async function Home() {
  const user = await getSessionUser();

  if (!user) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans min-h-[80vh] dark:bg-black dark:text-white">
        <h1 className="text-2xl font-bold mb-4">
          "You don't have Admin privileges to view this page."
        </h1>
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

  if (isAdmin(user)) {
    redirect("/admin");
  }

  redirect("/dashboard");
}
