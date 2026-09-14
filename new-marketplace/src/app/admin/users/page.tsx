import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth0-utils";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Admin Users",
};

export default async function AdminUsersPage() {
  await requireAdmin();

  
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  
  const allOrders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          User Management
        </h1>
        <p className="text-sm text-muted-foreground">
          View registered users and their order history.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Order History</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
             
                const userOrders = allOrders.filter((o) => o.userEmail === user.email);
                
               
                const displayName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username || "Unknown";

                return (
                  <TableRow key={user.id}>
                    {/* 1. USER ID */}
                    <TableCell className="font-medium">
                      <div className="text-xs text-muted-foreground truncate w-24" title={user.id}>
                        {user.id}
                      </div>
                    </TableCell>

                    {/* 2. NAME */}
                    <TableCell>{displayName}</TableCell>

                    {/* 3. EMAIL */}
                    <TableCell>{user.email}</TableCell>

                    {/* 4. ADDRESS  */}
                    <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate" title={user.address || "N/A"}>
                      {user.address || "N/A"}
                    </TableCell>

                    {/* 5. ORDER HISTORY  */}
                    <TableCell>
                      {userOrders.length === 0 ? (
                        <span className="text-xs text-muted-foreground italic">No orders</span>
                      ) : (
                        <div className="max-h-32 overflow-y-auto space-y-2 pr-2">
                          {userOrders.map((order) => {
                            const items = order.items ? JSON.parse(order.items as string) : [];
                            const currencySymbol = order.currency === "EUR" ? "€" : order.currency;
                            
                            return (
                              <div key={order.id} className="text-xs border-b border-border/50 pb-2 mb-2 last:border-0 last:pb-0 last:mb-0">
                                <div className="font-semibold text-foreground flex justify-between mb-1">
                                  <span>
                                    <Badge variant="outline" className="text-[10px] px-1 py-0 mr-1">
                                      {order.status}
                                    </Badge>
                                    {(order.totalAmount / 100).toFixed(2)}{currencySymbol}
                                  </span>
                                  <span className="text-muted-foreground ml-4">
                                    {order.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                  </span>
                                </div>
                                <ul className="text-muted-foreground">
                                  {items.map((item: any) => (
                                    <li key={item.id} className="truncate w-48" title={item.description}>
                                      <span className="font-medium text-foreground">{item.quantity}x</span> {item.description}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}