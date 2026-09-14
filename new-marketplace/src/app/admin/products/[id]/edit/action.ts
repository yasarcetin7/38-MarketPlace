"use server";

import { createProductDataSchema } from "@/lib/validation";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { put, del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { Currency } from "@/types/currency";
import { ProductCategory } from "@/types/product";
import { stripe } from "@/lib/stripe";

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
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
    price: String(formData.get("price") ?? ""),
    currency: String(formData.get("currency") ?? "") as Currency,
    category: String(formData.get("category") ?? "") as ProductCategory,
    stock: String(formData.get("stock") ?? ""),
    isActive: formData.get("isActive") === "on",
  };

  const parsed = createProductDataSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      message: "Lütfen formdaki hataları düzeltin.",
      values,
    };
  }

  
  const existingImages = formData.getAll("existingImages") as string[];

 
const oldProduct = await prisma.product.findUnique({
    where: { id: productId }
  });
  if (!oldProduct) {
    return {
      success: false,
      message: 'Güncellenecek ürün bulunamadı.',
      values,
    };
  }

 
  const deletedImages = oldProduct?.imageUrls.filter(
    (oldUrl) => !existingImages.includes(oldUrl),
  );

 
  if (deletedImages && deletedImages.length > 0) {
    try {
      await del(deletedImages);
    } catch (error) {
      console.error("Vercel'den resim silinirken hata oluştu:", error);
      
    }
  }

  const images = formData
    .getAll("images")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  let newImageUrls: string[] = [];

  if (images.length > 0) {
    newImageUrls = await Promise.all(
      images.map(async (imageFile) => {
        const blob = await put(imageFile.name, imageFile, {
          access: "public",
          addRandomSuffix: true,
        });
        return blob.url;
      }),
    );
  }

  
  const finalImageUrls = [...existingImages, ...newImageUrls];

  try {
   
    let finalStripePriceId = oldProduct.stripePriceId; 

    if (oldProduct.stripeProductId) {
      
    
      if (parsed.data.priceCents !== oldProduct.priceCents) {
        const newPrice = await stripe.prices.create({
          product: oldProduct.stripeProductId,
          unit_amount: parsed.data.priceCents,
          currency: parsed.data.currency.toLowerCase(),
        });
        
        finalStripePriceId = newPrice.id; 

        await stripe.products.update(oldProduct.stripeProductId, {
          default_price: newPrice.id,
          name: parsed.data.name,
          description: parsed.data.description,
          active: parsed.data.isActive,
          images: finalImageUrls.length > 0 ? finalImageUrls : undefined,
        });
      } else {
       
        await stripe.products.update(oldProduct.stripeProductId, {
          name: parsed.data.name,
          description: parsed.data.description,
          active: parsed.data.isActive,
          images: finalImageUrls.length > 0 ? finalImageUrls : undefined,
        });
      }
    }

   
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
        imageUrls: finalImageUrls,
        stripePriceId: finalStripePriceId,
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
  revalidatePath("/admin/products");
  revalidatePath("/");
  redirect("/admin/products");
}
