import { redirect } from 'next/navigation';
import { stripe } from '@/lib/stripe';

// 🚀 1. DEĞİŞİKLİK: TypeScript için searchParams'ın neye benzediğini tanımlıyoruz
type CheckoutSuccessPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// 🚀 2. DEĞİŞİKLİK: Tanımladığımız bu kuralı fonksiyona ekliyoruz
export default async function CheckoutSuccessPage({ searchParams }: CheckoutSuccessPageProps) {
  
  // 1. Bilet numarasını URL'den güvenli bir şekilde al
  const resolvedSearchParams = await searchParams;
  const session_id = resolvedSearchParams.session_id;

  // 2. Eğer bilet numarası yoksa veya hatalıysa işlemi durdur
  if (!session_id || typeof session_id !== 'string') {
    throw new Error('Please provide a valid session_id (`cs_test_...`)');
  }

  // 3. Stripe'ın kapısını çalıp sipariş detaylarını ve e-postayı iste
  const session = await stripe.checkout.sessions.retrieve(session_id, {
    expand: ['line_items', 'payment_intent']
  });

  // 🚀 3. GİZLİ HATA ÇÖZÜMÜ: Durumu (status) session'ın içinden alıyoruz
  const status = session.status;

  // 4. Müşteri henüz ödeme yapmamışsa (işlem açıksa) ana sayfaya postala
  if (status === 'open') {
    return redirect('/');
  }

  // 5. Ödeme başarılıysa senin o güzel tasarımını ekrana bas!
  if (status === 'complete') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <h1 className="mb-4 text-4xl font-bold">Checkout Success</h1>
        <p className="text-center text-lg text-gray-600 max-w-md">
          Thank you for your purchase! Your order has been successfully processed.
          <br />
          <br />
          A confirmation email will be sent to <strong className="text-black">{session.customer_details?.email}</strong>.
        </p>
      </div>
    );
  }
}