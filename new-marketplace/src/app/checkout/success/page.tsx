import { redirect } from "next/navigation";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth0-utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { sendOrderReceivedEmail } from "@/lib/mail";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const params = await searchParams;
  const sessionId = params.session_id;

  if (!sessionId) {
    redirect("/");
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });

    if (session.payment_status !== "paid") {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-3xl font-bold text-red-600">Don't payment</h1>
          <p className="mt-2 text-gray-600">Please try again.</p>
        </div>
      );
    }

    const user = await getSessionUser();
    const userEmail =
      user?.email || session.customer_details?.email || "Bilinmiyor";

    // Check if the order already exists in the database
    const existingOrder = await prisma.order.findUnique({
      where: { stripeSessionId: sessionId },
    });

    const orderCurrency = session.currency ? session.currency.toUpperCase() : "TRY";

    // Order saving MongoDB
    if (!existingOrder) {
      const newOrder = await prisma.order.create({
        data: {
          userEmail: userEmail,
          totalAmount: session.amount_total || 0,
          currency: orderCurrency,
          stripeSessionId: sessionId,
          status: "COMPLETED",
          items: session.line_items?.data
            ? JSON.stringify(session.line_items.data)
            : null,
        },
      });

      await sendOrderReceivedEmail(
        userEmail,
        newOrder.id,
        session.amount_total || 0,
        orderCurrency
      );
    }

    const purchasedItems = session.line_items?.data || [];
    
    const getCurrencySymbol = (currencyCode: string | undefined | null) => {
      if (!currencyCode) return "₺"; 
      
      const code = currencyCode.toUpperCase();
      if (code === "TRY") return "₺";
      if (code === "EUR") return "€";
      if (code === "USD") return "$";
      if (code === "GBP") return "£";
      
      return code;
    };

    const currencySymbol = getCurrencySymbol(session.currency);

    return (
      <div className="max-w-2xl mx-auto p-4 mt-10 space-y-8 flex flex-col items-center mb-20">
        
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>
          <h1 className="text-4xl font-bold">Checkout Success</h1>
          <p className="text-lg text-gray-600">
            Thank you for your purchase! Your order has been successfully
            processed.
          </p>
          <p className="text-gray-500">
            A confirmation email will be sent to{" "}
            <strong className="text-black">
              {session.customer_details?.email}
            </strong>
            .
          </p>
        </div>

        {/* 2. ORDER SUMMARY */}
        <div className="w-full">
          <h3 className="text-xl font-semibold mb-4 border-b pb-2">
            Order Summary
          </h3>
          <Card>
            <CardContent className="p-0">
              <ul className="divide-y">
                {purchasedItems.map((item) => (
                  <li
                    key={item.id}
                    className="flex justify-between items-center p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span className="flex items-center justify-center w-8 h-8 rounded bg-muted text-sm font-medium">
                        {item.quantity}x
                      </span>
                      <span className="font-medium">{item.description}</span>
                    </div>
                    <div className="font-semibold">
                      {((item.amount_total || 0) / 100).toFixed(2)}{" "}
                      {currencySymbol}
                    </div>
                  </li>
                ))}
              </ul>
              <div className="p-4 border-t bg-muted/20 flex justify-between items-center">
                <span className="font-bold text-lg">Total Amount:</span>
                <span className="font-bold text-lg text-primary">
                  {((session.amount_total || 0) / 100).toFixed(2)}{" "}
                  {currencySymbol}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 3. Success message buttons  */}
        <div className="flex gap-4 w-full justify-center pt-4">
          <Link href="/">
            <Button variant="outline" size="lg">
              Home Page
            </Button>
          </Link>
          <Link href="/my-orders">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Go To My Orders Details
            </Button>
          </Link>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Stripe Session Retrieving Error:", error);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-3xl font-bold text-red-600">Session Expired or Invalid</h1>
        <p className="mt-2 text-gray-600">We couldn't find a valid checkout session.</p>
        <Link href="/">
          <Button className="mt-6" variant="outline">Return Home</Button>
        </Link>
      </div>
    );
  }
}