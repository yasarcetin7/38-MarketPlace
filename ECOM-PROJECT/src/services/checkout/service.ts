import { stripe } from '../../common/stripe'

async function handleSuccessfullCheckout(checkoutSessionId: string) {
  const checkoutSessionWithLineItems = await stripe.checkout.sessions.retrieve(checkoutSessionId, {
    expand: ['line_items'],
  })

  console.log('Checkout Session with line items:')
  const lineItems = checkoutSessionWithLineItems?.line_items?.data
  console.log(lineItems)

  if (!lineItems) {
    console.log('Sepet detayı bulunamadı, işlem durduruldu.')
    return
  }

  console.log('Stok güncelleme işlemi başlıyor...')

  // Update stock on the product once a checkout session is successful
  for (const item of lineItems) {
    // Stripe'daki Ürün ID'si (MongoDB'deki stripeProductId alanına denk gelir)
    const stripeProductId = item.price?.product as string

    // Müşterinin bu üründen kaç adet aldığı
    const quantitySold = item.quantity || 1

    console.log(`Satılan Ürün Stripe ID: ${stripeProductId} | Satılan Adet: ${quantitySold}`)
  }
}
async function handleRefund(chargeObject: any) {
  const paymentIntentId = chargeObject.payment_intent

  console.log(`İade edilen işlemin Payment Intent ID'si: ${paymentIntentId}`)
}

export default {
  handleSuccessfullCheckout,
  handleRefund,
}
