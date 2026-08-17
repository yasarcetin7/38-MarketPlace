import { NextResponse, NextRequest } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const headersList = await headers();
    // origin bulunamazsa diye güvenlik olarak localhost yedeği ekledik
    const origin = headersList.get("origin") || "http://localhost:3000"; 
    
    const formData = await req.formData();
    // 1. Artık price_id değil, formdan gönderdiğimiz cartItems paketini alıyoruz
    const cartItemsString = formData.get("cartItems") as string;

    if (!cartItemsString) {
      throw new Error("Sepet verisi bulunamadı.");
    }

    // 2. Metin halindeki bu paketi gerçek bir JavaScript Listesine çeviriyoruz
    const cartItems = JSON.parse(cartItemsString);

    if (cartItems.length === 0) {
      throw new Error("Sepetinizde ürün bulunmamaktadır.");
    }

    // 🚀 3. İŞTE SİHİR BURADA: Sepetteki ürünleri Stripe formatına çeviriyoruz
    const lineItems = cartItems.map((item: { stripePriceId: string; quantity: number }) => {
      return {
        price: item.stripePriceId,
        quantity: item.quantity,
      };
    });

    // Create Checkout Sessions from body params.
    const session = await stripe.checkout.sessions.create({
      line_items: lineItems, // 🚀 Tüm sepet listesini buraya verdik!
      mode: "payment",
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`, // Müşteri ödemeden vazgeçerse ana sayfaya dönsün
    });

    if (!session.url) {
      throw new Error("Stripe ödeme linki oluşturamadı.");
    }

    return NextResponse.redirect(session.url, 303);
  } catch (err: any) {
    console.error("Stripe Checkout Hatası:", err);
    return NextResponse.json(
      { error: err.message },
      { status: err.statusCode || 500 },
    );
  }
}