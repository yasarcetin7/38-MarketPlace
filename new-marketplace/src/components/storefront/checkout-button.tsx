"use client";

import { Button } from "../ui/button";
import type { CartItem } from "@/components/storefront/card-provider";
import { useRouter } from "next/navigation";

export function CheckoutButton({
  items,
  isLoggedIn,
}: {
  items: CartItem[];
  isLoggedIn: boolean;
}) {
  const router = useRouter();

  if (items.length === 0) return null;

  if (!isLoggedIn) {
    return <Button onClick={() => router.push("/auth/login")}>Checkout</Button>;
  }

  return (
    <form action="/api/stripe/checkout" method="POST">
      <input type="hidden" name="cartItems" value={JSON.stringify(items)} />

      <Button variant="cart" type="submit" role="link">
        Checkout
      </Button>
    </form>
  );
}