"use server";

import { deleteProductById } from "@/lib/products";
import { del } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function deleteProduct(productId: string) {
  try {
    const deletedProduct = await deleteProductById(productId);

    
    if (deletedProduct.imageUrls && deletedProduct.imageUrls.length > 0) {
      await del(deletedProduct.imageUrls);
    }
   
  } catch (error) {
    console.error("An error occurred during the deletion process", error);

  }

  revalidatePath("/admin/products");
  revalidatePath("/");
  redirect("/admin/products");
}
