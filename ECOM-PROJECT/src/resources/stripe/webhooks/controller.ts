import { Request, Response } from 'express'
import { endpointSecret, stripe } from '../../../common/stripe';
import checkoutService from '../../../services/checkout/service';

async function receiveUpdates(req: Request, res: Response) {
  console.log('Reached Stripe Webhoooks receive updates function')

  let event = req.body

  // Only verify the event if you have an endpoint secret defined.
  // Otherwise use the basic event deserialized with JSON.parse
  if (endpointSecret) {
    // Get the signature sent by Stripe
    const signature = req.headers['stripe-signature']

    try {
      event = stripe.webhooks.constructEvent(req.body, signature, endpointSecret)
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`, err.message)
      return res.sendStatus(400)
    }
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const checkoutSessionObject = event.data.object
      console.log(`Checkout Session ${checkoutSessionObject.id} WAS SUCCESFUL!`)
      console.log(checkoutSessionObject)
      // Call Checkout Service to handle success case
      checkoutService.handleSuccessfullCheckout(checkoutSessionObject.id);

      break
    case 'checkout.session.expired':
      const checkoutSessionExpriedObject = event.data.object
      console.log(`Checkout Session ${checkoutSessionExpriedObject.id} EXPIRED!`)
      console.log(checkoutSessionExpriedObject)
      // Call Checkout Service to handle expired case
      break

    case 'checkout.session.async_payment_failed':
      const checkoutSessionPaymentFailedObject = event.data.object
      console.log(`Checkout Session ${checkoutSessionPaymentFailedObject.id} was successful!`)
      console.log(checkoutSessionPaymentFailedObject)
      // Call Checkout Service to handle expired case
      break

      case 'charge.refunded':
      const chargeObject = event.data.object;
      console.log(`Charge ${chargeObject.id} was refunded!`);
      
      
      checkoutService.handleRefund(chargeObject);
      break;

    case 'checkout.session.async_payment_succeeded':
      const checkoutSessionPaymentSucceededObject = event.data.object
      console.log(`Checkout Session ${checkoutSessionPaymentSucceededObject.id} was successful!`)
      console.log(checkoutSessionPaymentSucceededObject)
      // Call Checkout Service to handle expired case
      break
    default:
      // Unexpected event type
      console.log(`Unhandled event type ${event.type}.`)
  }

  // Return a 200 response to acknowledge receipt of the event
  res.send()
}

export default {
  receiveUpdates,
}

// https://checkout.stripe.com/c/pay/cs_test_a184Ti1CwevG1eiXtPsJx3fkv2jWQ6cC90OITMLuQrMLfQJ5fGMMfX0uJe#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdicGRmZGhqaWBTZHdsZGtxJz8nZmprcXdqaScpJ2R1bE5gfCc%2FJ3VuWnFgdnFaMDRXaWZRNVRscU1xZnFTUFF%2FcmlRbjNHTk5dZ1RVNFRyT11qR0FEaDE2NTFyXVxJYndjaW1WXU5XclRycjVOTnRvTTd8ME9pT3JjVGloUkZIbGZzMGNONzU1NURXb0FAZmpCJyknY3dqaFZgd3Ngdyc%2FcXdwYCknZ2RmbmJ3anBrYUZqaWp3Jz8nJmNjY2NjYycpJ2lkfGpwcVF8dWAnPyd2bGtiaWBabHFgaCcpJ2BrZGdpYFVpZGZgbWppYWB3dic%2FcXdwYHgl