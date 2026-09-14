import type { Product as PrismaProduct } from "@/generated/prisma";
import { stripe } from "@/lib/stripe";
import { parseStorefrontFiltersFromSearchParams } from "@/lib/validation";
import type { CreateProductData } from "@/lib/validation/product";
import { prisma } from "@/lib/prisma";
import { Currency, isCurrency } from "@/types/currency";

import {
  isProductCategory,
  isProductSort,
  ProductSort,
  type ProductCategory,
} from "@/types/product";

export type Product = {
  stripePriceId: string;
  stripeProductId: string;
  id: string;
  name: string;
  description: string;
  priceCents: number;
  currency: Currency;
  category: ProductCategory;
  stock: number;
  imageUrls: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type GetStorefrontProductsFilters = {
  category?: ProductCategory | "all";
  sort?: ProductSort;
};

function toProduct(record: PrismaProduct): Product {
  if (!isCurrency(record.currency)) {
    throw new Error(`Unsupported currency: ${record.currency}`);
  }
  if (!isProductCategory(record.category)) {
    throw new Error(`Unsupported category: ${record.category}`);
  }

  return {
    id: record.id,
    name: record.name,
    description: record.description,
    priceCents: record.priceCents,
    currency: record.currency,
    category: record.category,
    stock: record.stock,
    imageUrls: record.imageUrls,
    isActive: record.isActive,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    stripePriceId: record.stripePriceId || "",
    stripeProductId: record.stripeProductId || "",
  };
}

export async function getStorefrontProducts(
  filters: GetStorefrontProductsFilters = {},
): Promise<Product[]> {
  try {
    const { category, sort } = filters;

    let prismaOrderBy: any = { createdAt: "desc" };

    if (sort === ProductSort.NAME_ASC) {
      prismaOrderBy = { name: "asc" };
    } else if (sort === ProductSort.NAME_DESC) {
      prismaOrderBy = { name: "desc" };
    } else if (sort === ProductSort.PRICE_ASC) {
      prismaOrderBy = { priceCents: "asc" };
    } else if (sort === ProductSort.PRICE_DESC) {
      prismaOrderBy = { priceCents: "desc" };
    }

    const categoryFilter =
      category && category !== "all" ? { category: category } : {};

    const records = await prisma.product.findMany({
      where: {
        isActive: true,
        ...categoryFilter,
      },
      orderBy: prismaOrderBy,
    });
    return records.map(toProduct);
  } catch (error) {
    console.error("An error occured when fetching all products from DB", error);
    return [];
  }
}

export async function getAllProducts(): Promise<Product[]> {
  try {
    // There were 2 problems:
    // 1. enum in prisma has EUR, USD, TRY and we have EUR, GBP, TRY in our code
    // 2. we need to check that the currency and category values are compatible with our TS enums so toProduct() function does that
    const records = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    // The line below is the same as
    // return records.map((record) => toProduct(record));
    return records.map(toProduct);
  } catch (error) {
    console.error("An error occured when fetching all products from DB", error);
    return [];
  }
}

export async function getProductById(id: string) {
  return await prisma.product.findUnique({
    where: { id },
  });
}

export async function createProduct(
  data: CreateProductData,
  imageUrls: string[],
  stripeProductId: string,
  stripePriceId: string,
): Promise<Product> {
  const record = await prisma.product.create({
    data: {
      ...data,
      imageUrls,
      stripeProductId: stripeProductId,
      stripePriceId: stripePriceId,
    },
  });
  return toProduct(record);
}

export function parseStorefrontFilters(
  searchParams: Record<string, string | string[] | undefined>,
): { categoryValue: ProductCategory | "all"; sortValue: ProductSort } {
  const rawCategory = searchParams.category;
  const categoryValue =
    typeof rawCategory === "string" && isProductCategory(rawCategory)
      ? rawCategory
      : "all";

  const rawSort = searchParams.sort;

  const sortValue =
    typeof rawSort === "string" && isProductSort(rawSort)
      ? (rawSort as ProductSort)
      : ProductSort.NAME_ASC;

  return { categoryValue, sortValue };
}

export async function deleteProductById(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    throw new Error("Silinecek ürün bulunamadı.");
  }
  if (product.stripeProductId) {
    try {
      await stripe.products.update(product.stripeProductId, {
        active: false,
      });

      if (product.stripePriceId) {
        await stripe.prices.update(product.stripePriceId, {
          active: false,
        });
      }
      console.log("Stripe'ta ürün ve fiyat başarıyla arşivlendi!");
    } catch (stripeError) {
      console.error("Stripe arşivleme sırasında hata:", stripeError);
    }
  }

  await prisma.product.delete({
    where: { id },
  });

  return product;
}
