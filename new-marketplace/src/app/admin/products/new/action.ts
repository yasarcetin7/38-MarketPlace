"use server";

import {
  createProductDataSchema,
  createProductImagesSchema,
} from "@/lib/validation";
import { createProduct as createProductRecord } from "@/lib/products";
import { Currency } from "@/types/currency";
import { ProductCategory } from "@/types/product";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { put } from "@vercel/blob";
import { stripe } from "@/lib/stripe";

export type CreateProductFormValues = {
  name: string;
  description: string;
  price: string;
  currency: Currency;
  category: ProductCategory;
  stock: string;
  isActive: boolean;
};

export type CreateProductFieldErrors = Partial<
  Record<keyof CreateProductFormValues | "images", string>
>;

export type CreateProductState = {
  success?: boolean;
  message: string;
  values?: CreateProductFormValues;
  fieldErrors?: CreateProductFieldErrors;
};

function parseFormValues(formData: FormData): CreateProductFormValues {
  return {
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
    price: String(formData.get("price") ?? ""),
    currency: String(formData.get("currency") ?? "") as Currency,
    category: String(formData.get("category") ?? "") as ProductCategory,
    stock: String(formData.get("stock") ?? ""),
    isActive: formData.get("isActive") === "on",
  };
}

function flattenFieldErrors(
  fieldErrors: Record<string, string[] | undefined>,
): CreateProductFieldErrors {
  return Object.fromEntries(
    Object.entries(fieldErrors).map(([key, messages]) => [
      key,
      messages?.[0] ?? "",
    ]),
  ) as CreateProductFieldErrors;
}

export async function createProduct(
  _prevState: CreateProductState | null,
  formData: FormData,
): Promise<CreateProductState | null> {
  const values = parseFormValues(formData);

  const parsed = createProductDataSchema.safeParse(values);
  if (!parsed.success) {
    console.log("FORM DOĞRULAMA HATASI:", parsed.error.flatten().fieldErrors); // BUNU EKLE
    return {
      success: false,
      message: "Please fix the errors below.",
      values,
      fieldErrors: flattenFieldErrors(parsed.error.flatten().fieldErrors),
    };
  }

  const images = formData
    .getAll("images")
    .filter((entry): entry is File => entry instanceof File);

  const imagesParsed = createProductImagesSchema.safeParse(images);
  if (!imagesParsed.success) {
    return {
      success: false,
      message: "Please fix the errors below.",
      values,
      fieldErrors: {
        images: imagesParsed.error.issues[0]?.message ?? "Invalid images",
      },
    };
  }

  const imageUrls = await Promise.all(
    imagesParsed.data.map(async (imageFile) => {
      const blob = await put(imageFile.name, imageFile, {
        access: "public",
        addRandomSuffix: true,
      });

      return blob.url;
    }),
  );
  console.log(imagesParsed.data);

  let productId: string;
  try {
    const stripeProduct = await stripe.products.create({
      name: parsed.data.name,
      description: parsed.data.description,
      images: imageUrls.length > 0 ? imageUrls : undefined,
      active: parsed.data.isActive,
    });

    const stripePrice = await stripe.prices.create({
      product: stripeProduct.id,
      unit_amount: parsed.data.priceCents,
      currency: parsed.data.currency.toLowerCase(),
    });

    await stripe.products.update(stripeProduct.id, {
      default_price: stripePrice.id,
    });

    const result = await createProductRecord(
      parsed.data,
      imageUrls,
      stripeProduct.id,
      stripePrice.id,
    );

    productId = result.id;
  } catch (error) {
    console.error("RECOVERY ERROR:", error);
    return {
      success: false,
      message:
        "Could not create the product in Stripe or DB. Please try again.",
      values,
    };
  }

  revalidatePath("/admin/products");
  revalidatePath("/");
  redirect(`/admin/products/new?created=${productId}`);
}
