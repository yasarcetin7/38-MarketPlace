"use server";
import { sendOrderShippedEmail } from "@/lib/mail";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth0-utils";
import { revalidatePath } from "next/cache";
import { stripe } from "@/lib/stripe";

export async function markOrderAsShipped(orderId: string) {
  try {
    await requireAdmin();

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: "SHIPPED" },
    });

    if (updatedOrder.userEmail) {
      await sendOrderShippedEmail(updatedOrder.userEmail, orderId);
    }

    revalidatePath("/admin/orders");
    revalidatePath("/my-orders");
  } catch (error) {
    console.error("Shipping process failed., error");
    throw new Error("The order could not be updated.");
  }
}

export async function cancelOrderAsAdmin(orderId: string) {
  await requireAdmin();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) throw new Error("Sipariş bulunamadı.");

  try {
    const session = await stripe.checkout.sessions.retrieve(
      order.stripeSessionId,
    );
    if (session.payment_intent) {
      await stripe.refunds.create({
        payment_intent: session.payment_intent as string,
      });
    }
  } catch (error) {
    console.error("Stripe İade Hatası:", error);
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "CANCELLED" },
  });

  revalidatePath("/admin/orders");
  revalidatePath("/my-orders");
}
