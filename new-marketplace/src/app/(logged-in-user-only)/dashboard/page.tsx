import { requireUser } from "@/lib/auth0";

export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <div className="bg-card text-card-foreground p-8 rounded-lg shadow-sm border mt-10 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">User Panel</h1>
      <p>Welcome, {user.name}!</p>
    </div>
  );
}