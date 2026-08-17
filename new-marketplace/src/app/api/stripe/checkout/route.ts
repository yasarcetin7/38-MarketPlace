import { NextResponse, NextRequest } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { getSessionUser } from "@/lib/auth0-utils";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized: Please log in before making a payment." },
        { status: 401 },
      );
    }

    const headersList = await headers();
    const origin = headersList.get("origin") || "http://localhost:3000";
    const formData = await req.formData();
    const cartItemsString = formData.get("cartItems") as string;

    if (!cartItemsString) {
      throw new Error("Sepet verisi bulunamadı.");
    }

    const cartItems = JSON.parse(cartItemsString);

    if (cartItems.length === 0) {
      throw new Error("Sepetinizde ürün bulunmamaktadır.");
    }

    const productIds = cartItems.map((item: any) => item.id);

    const dbProducts = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
    });

    const lineItems = cartItems.map((item: any) => {
      const dbProduct = dbProducts.find((p) => p.id === item.id);

      if (!dbProduct) {
        throw new Error(
          `Ürün bulunamadı veya yayından kaldırıldı: ${item.name}`,
        );
      }

      return {
        price: dbProduct.stripePriceId,
        quantity: item.quantity,
      };
    });

    const checkoutSession = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
    });

    if (!checkoutSession.url) {
      throw new Error("Stripe ödeme linki oluşturamadı.");
    }

    return NextResponse.redirect(checkoutSession.url, 303);
  } catch (err: any) {
    console.error("Stripe Checkout Hatası:", err);
    return NextResponse.json(
      { error: err.message },
      { status: err.statusCode || 500 },
    );
  }
}
