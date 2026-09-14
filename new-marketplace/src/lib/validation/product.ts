import { z } from "zod";

import { currencySchema } from "@/lib/validation/currency";
import {
  ACCEPTED_IMAGE_TYPES_SET,
  MAX_IMAGE_BYTES,
  MAX_IMAGE_MB,
} from "@/lib/product-images";
import { ProductCategory } from "@/types/product";
import { priceStringToCents } from "@/types/currency";

// Fiyatın sadece sayılardan ve en fazla 2 ondalık basamaktan oluşmasını sağlayan kural (Örn: 19.99)
const PRICE_PATTERN = /^\d+(\.\d{1,2})?$/;

// Ürün kategorilerini (Elektronik, Giyim vb.) kısıtlıyoruz. Sadece senin tanımladığın kategoriler seçilebilir.
export const productCategorySchema = z.enum(ProductCategory);

// 1. KULLANICI ARAYÜZÜ (FORM) KONTROLÜ
// Kullanıcının ekrandaki formda girdiği ham (metin) veriyi denetler.
export const createProductFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"), // İsim boş olamaz, baştaki/sondaki boşlukları sil
  description: z.string().trim().min(1, "Description is required"),

  // DİKKAT: Fiyat ve Stok bilerek "string" (metin) olarak alınıyor.
  // Çünkü kullanıcı sayı yerine yanlışlıkla harf girerse form çökmesin,
  // hatalı kelime ekranda kalsın ve altına hata mesajını basabilelim (Harika UX tasarımı!).
  price: z
    .string()
    .trim()
    .min(1, "Price is required")
    .regex(PRICE_PATTERN, "Enter a valid price (e.g. 19.99)"), // Regex ile saçma fiyat girilmesini engelle

  currency: currencySchema,
  category: productCategorySchema,

  stock: z
    .string()
    .trim()
    .min(1, "Stock is required")
    .refine((value) => /^\d+$/.test(value), "Stock must be a whole number") // Sadece tam sayı (1.5 adet ürün olamaz)
    .refine((value) => Number(value) >= 0, "Stock cannot be negative"), // Eksi (-5) stok olamaz

  isActive: z.boolean(), // Ürün yayında mı? (True/False)
});

export type CreateProductFormInput = z.infer<typeof createProductFormSchema>;

// 2. VERİTABANINA (PRISMA/MONGODB) KAYIT ÖNCESİ DÖNÜŞÜM
// Formdan gelen metin verilerini, veritabanımızın beklediği formatlara (kuruş ve sayı) çevirir.
export const createProductDataSchema = createProductFormSchema.transform(
  (values) => ({
    name: values.name,
    description: values.description,

    // Formdaki "19.99" metnini alıp veritabanı için 1999 (kuruş) tam sayısına çevirir.
    // (Virgül kayma hatalarını önlemek için)
    priceCents: priceStringToCents(values.price),

    currency: values.currency,
    category: values.category,

    // Metin olan stoğu gerçek bir Matematiksel sayıya (Number) dönüştürür
    stock: Number(values.stock),
    isActive: values.isActive,
  }),
);

export type CreateProductData = z.infer<typeof createProductDataSchema>;

// 3. FOTOĞRAF (VERCEL BLOB) YÜKLEME KURALLARI
// Fotoğraflar metin değil, birer "Dosya"dır (File). Blob deposuna gitmeden önce
// virüs, boyut ve format kontrollerinden geçmeleri gerekir.

export const productImageFileSchema = z
  .instanceof(File) // Gelen şeyin gerçekten bir sistem dosyası olduğundan emin ol
  .refine((file) => file.size > 0, "Image file is empty") // Boş/bozuk dosya yüklenmesin
  .refine(
    (file) => file.size <= MAX_IMAGE_BYTES,
    `Each image must be ${MAX_IMAGE_MB} MB or smaller`, // Sunucuyu ve siteyi yavaşlatmamak için MB sınırı
  )
  .refine(
    (file) => ACCEPTED_IMAGE_TYPES_SET.has(file.type),
    "Only JPEG, PNG, WebP, and GIF images are allowed", // Sadece izin verilen resim formatları (Örn: .exe yüklenemez)
  );

// Bir ürünün en az 1 tane fotoğrafı olmasını zorunlu kılan dizi (array) kontrolü
export const createProductImagesSchema = z
  .array(productImageFileSchema)
  .min(1, "At least one product image is required");
