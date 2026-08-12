import { PrismaClient } from "@/generated/prisma";

// 1. KÜRESEL BİR KASA OLUŞTURMAK (Global Storage)
// Node.js ortamında her yerden ulaşılabilen 'globalThis' (küresel hafıza) içine 'prisma' adında bir alan tanımlıyoruz.
// Bu alan ya boştur (undefined) ya da içinde daha önceden oluşturulmuş bir Prisma bağlantısı vardır.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 2. SINGLETON MANTIĞININ KALBİ (Kontrol ve Üretim)
// "??" (Nullish Coalescing) operatörü: Önce sol tarafa (küresel hafızaya) bakar.
// Eğer orada hazır bir Prisma bağlantısı varsa yenisini açmaz, onu kullanır.
// Eğer boşsa sağ tarafa geçer ve yepyeni bir Prisma bağlantısı (new PrismaClient) oluşturur.
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Geliştirme aşamasındayken hataları ve uyarıları terminale bas, canlı sitede (production) sadece hataları göster.
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

// 3. NEXT.JS HOT-RELOAD KORUMASI (Bağlantı Çökmelerini Önleme)
// Next.js'te kod yazarken her dosyayı kaydettiğinde (Ctrl+S) arka planda dosyalar baştan yüklenir.
// Eğer geliştirme ortamındaysak, oluşturulan bağlantıyı bir daha silinmemek üzere küresel hafızaya kaydediyoruz.
// Böylece Next.js sayfayı her yenilediğinde veritabanına yeni bağlantılar açıp MongoDB'yi çökertmez, var olanı kullanır.
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
