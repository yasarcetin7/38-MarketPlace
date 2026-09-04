import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// DİKKAT: Henüz domain bağlamadığın için gönderici adresi bu olmak ZORUNDA.
// Domain bağladıktan sonra burayı "info@seninsiten.com" gibi değiştirebilirsin.
const fromEmail = "onboarding@resend.dev";

export async function sendOrderReceivedEmail(
  toEmail: string,
  orderId: string,
  totalAmount: number,
  currency: string,
) {
  try {
    await resend.emails.send({
      from: `Marketplace <${fromEmail}>`,
      to: toEmail,
      subject: "Siparişiniz Başarıyla Alındı!",
      html: `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto;">
          <h2>Merhaba!</h2>
          <p>Siparişinizi başarıyla aldık ve hazırlamaya başladık. :) </p>
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px;">
            <p><strong>Sipariş Numarası:</strong> ${orderId}</p>
            <p><strong>Toplam Tutar:</strong> ${(totalAmount / 100).toFixed(2)} ${currency === "EUR" ? "€" : currency}</p>
          </div>
          <p>Siparişiniz kargoya verildiğinde size tekrar haber vereceğiz.</p>
          <br/>
          <p>Bizi tercih ettiğiniz için teşekkürler!</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Sipariş maili gönderilemedi:", error);
  }
}

export async function sendOrderShippedEmail(toEmail: string, orderId: string) {
  try {
    await resend.emails.send({
      from: `Marketplace <${fromEmail}>`,
      to: toEmail,
      subject: "Siparişiniz Kargoya Verildi",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Harika haber!</h2>
          <p><strong>${orderId}</strong> numaralı siparişiniz kargoya teslim edildi ve yola çıktı.</p>
          <p>Siparişinizin detaylarını web sitemizdeki "My Orders" sayfasından takip edebilirsiniz.</p>
          <br/>
          <p>İyi günlerde kullanmanız dileğiyle!</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Kargo maili gönderilemedi:", error);
  }
}


export async function sendOrderCancelledEmail(
  toEmail: string,
  orderId: string,
) {
  try {
    await resend.emails.send({
      from: `Marketplace <${fromEmail}>`,
      to: toEmail,
      subject: "Siparişiniz İptal Edildi :( ",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Sipariş İptali Bilgilendirmesi</h2>
          <p>Merhaba,</p>
          <p><strong>${orderId}</strong> numaralı siparişiniz maalesef iptal edilmiştir.</p>
          <p>Eğer bu sipariş için bir ödeme yaptıysanız, iade süreciniz otomatik olarak başlatılacaktır ve tutarın kartınıza yansıması bankanıza bağlı olarak birkaç gün sürebilir.</p>
          <br/>
          <p>Herhangi bir sorunuz varsa veya yardıma ihtiyacınız olursa bizimle her zaman iletişime geçebilirsiniz.</p>
          <p>İyi günler dileriz.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("İptal maili gönderilemedi:", error);
  }
}
