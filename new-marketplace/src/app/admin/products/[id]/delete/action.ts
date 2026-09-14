"use server";

import { deleteProductById } from "@/lib/products";
import { del } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function deleteProduct(productId: string) {
  try {
    // 1. Ürünü MongoDB'den sildik ve silinen ürünün verilerini aldık
    const deletedProduct = await deleteProductById(productId);

    // 2. Eğer ürünün fotoğrafları varsa, Vercel Blob'dan da temizliyoruz!
    if (deletedProduct.imageUrls && deletedProduct.imageUrls.length > 0) {
      await del(deletedProduct.imageUrls);
    }
   
  } catch (error) {
    console.error("An error occurred during the deletion process", error);

    // Hata olursa sayfaya geri döndürebiliriz ama şimdilik logluyoruz
  }

  // 3. İşlem bitince vitrini yenile ve ürünler sayfasına dön
  revalidatePath("/admin/products");
  revalidatePath("/");
  redirect("/admin/products");
}
