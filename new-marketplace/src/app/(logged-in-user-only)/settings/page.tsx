import { requireUser } from "@/lib/auth0";
import { prisma } from "@/lib/prisma"; 
import { SettingsForm } from "./SettingsForm";

export default async function SettingsPage() {
  
  const sessionUser = await requireUser();

  
  const dbUser = await prisma.user.findUnique({
    where: { email: sessionUser.email },
  });

  return (
    <div className="max-w-2xl mx-auto p-4 mt-10">
      {}
      <SettingsForm dbUser={dbUser} email={sessionUser.email as string} />
    </div>
  );
}