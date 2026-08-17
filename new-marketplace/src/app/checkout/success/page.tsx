import { redirect } from 'next/navigation';
import { stripe } from '@/lib/stripe';


type CheckoutSuccessPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};


export default async function CheckoutSuccessPage({ searchParams }: CheckoutSuccessPageProps) {
  
  
  const resolvedSearchParams = await searchParams;
  const session_id = resolvedSearchParams.session_id;

  
  if (!session_id || typeof session_id !== 'string') {
    throw new Error('Please provide a valid session_id (`cs_test_...`)');
  }

  
  const session = await stripe.checkout.sessions.retrieve(session_id, {
    expand: ['line_items', 'payment_intent']
  });

  const status = session.status;

  
  if (status === 'open') {
    return redirect('/');
  }

  
  if (status === 'complete') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <h1 className="mb-4 text-4xl font-bold">Checkout Success</h1>
        <div className="flex flex-col gap-4 text-center text-lg text-gray-600 max-w-md">
        <p className="text-center text-lg text-gray-600 max-w-md">
          Thank you for your purchase! Your order has been successfully processed.
          </p>
          <p>
          A confirmation email will be sent to <strong className="text-black">{session.customer_details?.email}</strong>.
        </p>
        </div>
      </div>
    );
  }
}