"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth0-utils";
import { revalidatePath } from "next/cache";
import { stripe } from "@/lib/stripe"; 

export async function deleteOrder(orderId: string) {
  const user = await getSessionUser();

  if (!user || !user.email) {
    throw new Error("Yetkisiz işlem.");
  }

  
  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
      userEmail: user.email, 
    },
  });

  if (!order) {
    throw new Error("Sipariş bulunamadı.");
  }

  try {
    
    const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId);

    
    if (session.payment_intent) {
      await stripe.refunds.create({
        payment_intent: session.payment_intent as string,
      });
    }
  } catch (error) {
    console.error("Stripe İade Hatası:", error);
    throw new Error("Stripe üzerinde iade işlemi gerçekleştirilemedi.");
  }

 
  await prisma.order.delete({
    where: {
      id: orderId,
    },
  });

  revalidatePath("/my-orders");
}