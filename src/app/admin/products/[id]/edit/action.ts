'use server';

import { createProductDataSchema } from '@/lib/validation';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
// 🚀 YENİ: Vercel'den silme işlemi için 'del' komutunu da import ediyoruz
import { put, del } from '@vercel/blob'; 
import { prisma } from '@/lib/prisma';
import { Currency } from '@/types/currency';
import { ProductCategory } from '@/types/product';

export type EditProductFormValues = {
  name: string;
  description: string;
  price: string;
  currency: Currency;
  category: ProductCategory;
  stock: string;
  isActive: boolean;
};

export type EditProductState = {
  success?: boolean;
  message: string;
  values?: EditProductFormValues;
  fieldErrors?: any;
};

export async function editProduct(
  productId: string,
  _prevState: EditProductState | null,
  formData: FormData,
): Promise<EditProductState | null> {
  
  const values = {
    name: String(formData.get('name') ?? ''),
    description: String(formData.get('description') ?? ''),
    price: String(formData.get('price') ?? ''),
    currency: String(formData.get('currency') ?? '') as Currency,
    category: String(formData.get('category') ?? '') as ProductCategory,
    stock: String(formData.get('stock') ?? ''),
    isActive: formData.get('isActive') === 'on',
  };

  const parsed = createProductDataSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      message: 'Lütfen formdaki hataları düzeltin.',
      values,
    };
  }

  // 🚀 1. Formdan gelen (kullanıcının silmediği) "kalan eski resimleri" al
  const existingImages = formData.getAll('existingImages') as string[];

  // 🚀 2. Veritabanındaki ürünün orijinal halini çek
  const oldProduct = await prisma.product.findUnique({
    where: { id: productId }
  });

  // 🚀 3. Temizlik Vakti! Kullanıcının X'e basıp sildiği resimleri bul
  // (Eskiden var olan ama şu an formdan gelmeyen resimler)
  const deletedImages = oldProduct?.imageUrls.filter(
    (oldUrl) => !existingImages.includes(oldUrl)
  );

  // Eğer silinen resim varsa, Vercel Blob'dan yer kaplamaması için temelli sil (Pro Özellik!)
  if (deletedImages && deletedImages.length > 0) {
    try {
      await del(deletedImages);
    } catch (error) {
      console.error("Vercel'den resim silinirken hata oluştu:", error);
      // Vercel'den silinemese bile devam et, MongoDB'den çıkaracağız zaten
    }
  }

  // 4. Yeni Fotoğrafları Yükle
  const images = formData
    .getAll('images')
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  let newImageUrls: string[] = [];

  if (images.length > 0) {
    newImageUrls = await Promise.all(
      images.map(async (imageFile) => {
        const blob = await put(imageFile.name, imageFile, {
          access: 'public',
          addRandomSuffix: true,
        });
        return blob.url;
      }),
    );
  }

  // 🚀 5. Geriye kalan eski resimlerle, yeni yüklenen resimleri BİRLEŞTİR!
  const finalImageUrls = [...existingImages, ...newImageUrls];

  // 6. Veritabanını Güncelle
  try {
    await prisma.product.update({
      where: { id: productId },
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        priceCents: parsed.data.priceCents,
        currency: parsed.data.currency,
        category: parsed.data.category,
        stock: parsed.data.stock,
        isActive: parsed.data.isActive,
        imageUrls: finalImageUrls, // Birleşmiş tam liste
      },
    });

  } catch (error) {
    console.error("GÜNCELLEME HATASI:", error);
    return {
      success: false,
      message: 'Ürün güncellenemedi. Lütfen tekrar deneyin.',
      values,
    };
  }

  revalidatePath('/admin/products');
  revalidatePath('/');
  redirect('/admin/products');
}