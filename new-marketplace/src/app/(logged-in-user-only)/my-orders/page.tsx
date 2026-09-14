import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth0-utils";
import { deleteOrder } from "./actions";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function MyOrdersPage() {
  const user = await getSessionUser();

  if (!user || !user.email) {
    return <div>Please log in.</div>;
  }

  const orders = await prisma.order.findMany({
    where: { userEmail: user.email },
    orderBy: { createdAt: "desc" },
  });

  if (orders.length === 0) {
    return (
      <div className="max-w-5xl mx-auto p-4 mt-10">
        <h1 className="text-3xl font-bold tracking-tight mb-6">My Orders</h1>
        <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center">
          <p className="text-sm font-medium text-foreground">No orders yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Visit our store and make your first purchase.
          </p>
          <Button asChild className="mt-4 bg-blue-600 hover:bg-blue-700">
            <Link href="/">Start Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 mt-10 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
        <p className="text-muted-foreground mt-2">
          View and manage your past orders and details here.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Order Details</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const items = order.items ? JSON.parse(order.items as string) : [];
              const currencySymbol = order.currency === "EUR" ? "€" : order.currency;

              return (
                <TableRow key={order.id}>
                  {/* 1. DATE */}
                  <TableCell className="font-medium">
                    {order.createdAt.toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  
                  {/* 2. ORDER DETAILS */}
                  <TableCell>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {items.map((item: any) => (
                        <li key={item.id}>
                          <span className="font-semibold text-foreground">{item.quantity}x</span> {item.description}
                        </li>
                      ))}
                    </ul>
                  </TableCell>

                  {/* 3. TOTAL AMOUNT */}
                  <TableCell className="font-medium">
                    {(order.totalAmount / 100).toFixed(2)} {currencySymbol}
                  </TableCell>

                  {/* 4. STATUS BADGE */}
                  <TableCell>
                    <Badge 
                      variant={order.status === "COMPLETED" ? "default" : order.status === "SHIPPED" ? "secondary" : "destructive"}
                      className={
                        order.status === "SHIPPED" 
                          ? "bg-blue-600 text-white hover:bg-blue-700" 
                          : order.status === "COMPLETED" 
                          ? "bg-green-600 hover:bg-green-700" 
                          : ""
                      }
                    >
                      {order.status === "COMPLETED" ? "Order Received" : order.status === "SHIPPED" ? "Shipped" : "Cancelled"}
                    </Badge>
                  </TableCell>

                  {/* 5. ACTIONS */}
                  <TableCell className="text-right">
                    {order.status === "COMPLETED" && (
                      <form action={async () => {
                        "use server";
                        await deleteOrder(order.id);
                      }}>
                        <Button variant="destructive" size="sm">
                          Cancel
                        </Button>
                      </form>
                    )}

                    {order.status === "SHIPPED" && (
                      <div title="Shipped items cannot be cancelled">
                        <Button variant="destructive" size="sm" disabled>
                          Cancel
                        </Button>
                      </div>
                    )}

                    {order.status === "CANCELLED" && (
                      <span className="text-xs text-muted-foreground italic">
                        Cancelled
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}