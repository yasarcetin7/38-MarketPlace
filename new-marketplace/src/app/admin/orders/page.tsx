import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth0-utils";
import { cancelOrderAsAdmin, markOrderAsShipped } from "./actions";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Admin Orders",
};

export default async function AdminOrdersPage() {
  await requireAdmin();

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="space-y-4 p-3 sm:p-5">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Order Management
        </h1>
        <p className="text-sm text-muted-foreground">
          View, cancel, or mark customer orders as shipped.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">
                Order ID & Date
              </TableHead>
              <TableHead className="whitespace-nowrap">
                Customer Email
              </TableHead>
              <TableHead className="min-w-[200px]">Products</TableHead>
              <TableHead className="whitespace-nowrap">Amount</TableHead>
              <TableHead className="whitespace-nowrap">Status</TableHead>
              <TableHead className="text-right whitespace-nowrap">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  No orders yet.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => {
                const items = order.items
                  ? JSON.parse(order.items as string)
                  : [];
                const currencySymbol =
                  order.currency === "EUR" ? "€" : order.currency;

                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium whitespace-nowrap">
                      <div className="text-xs text-foreground/70">
                        {order.id}
                      </div>
                      <div>
                        {order.createdAt.toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </TableCell>

                    {/* CUSTOMER INFO */}
                    <TableCell>{order.userEmail}</TableCell>

                    {/* PRODUCTS */}
                    <TableCell>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {items.map((item: any) => (
                          <li key={item.id}>
                            <span className="font-semibold text-foreground">
                              {item.quantity}x
                            </span>{" "}
                            {item.description}
                          </li>
                        ))}
                      </ul>
                    </TableCell>

                    {/* PRICE */}
                    <TableCell className="font-medium">
                      {(order.totalAmount / 100).toFixed(2)} {currencySymbol}
                    </TableCell>

                    {/* STATUS */}
                    <TableCell>
                      <Badge
                        variant={
                          order.status === "COMPLETED"
                            ? "default"
                            : order.status === "SHIPPED"
                              ? "secondary"
                              : "destructive"
                        }
                        className={
                          order.status === "SHIPPED"
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : order.status === "COMPLETED"
                              ? "bg-green-600 hover:bg-green-700"
                              : ""
                        }
                      >
                        {order.status === "COMPLETED"
                          ? "New"
                          : order.status === "SHIPPED"
                            ? "Shipped"
                            : "Cancelled"}
                      </Badge>
                    </TableCell>

                    {/* BUTTONS: Hide if shipped or cancelled */}
                    <TableCell className="text-right">
                      {order.status === "COMPLETED" && (
                        <div className="flex justify-end gap-2 flex-wrap sm:flex-nowrap">
                          <form
                            action={async () => {
                              "use server";
                              await markOrderAsShipped(order.id);
                            }}
                          >
                            <Button variant="secondary" size="sm">
                              Mark as Shipped
                            </Button>
                          </form>

                          <form
                            action={async () => {
                              "use server";
                              await cancelOrderAsAdmin(order.id);
                            }}
                          >
                            <Button variant="destructive" size="sm">
                              Cancel
                            </Button>
                          </form>
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
