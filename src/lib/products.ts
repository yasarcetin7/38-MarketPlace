import type { Product as PrismaProduct } from "@/generated/prisma";

import { parseStorefrontFiltersFromSearchParams } from "@/lib/validation";
import type { CreateProductData } from "@/lib/validation/product";
import { prisma } from "@/lib/prisma";
import { Currency, isCurrency } from "@/types/currency";
import {
  isProductCategory,
  type ProductCategory,
  type ProductSort,
} from "@/types/product";

export type Product = {
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
  };
}

export async function getStorefrontProducts(
  _filters: GetStorefrontProductsFilters = {},
): Promise<Product[]> {
  try {
    const records = await prisma.product.findMany({
      where: {
        isActive: true,
      },
      orderBy: { createdAt: "desc" },
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
): Promise<Product> {
  const record = await prisma.product.create({
    data: {
      ...data,
      imageUrls,
    },
  });
  return toProduct(record);
}

export function parseStorefrontFilters(
  searchParams: Record<string, string | string[] | undefined>,
): { categoryValue: ProductCategory | "all"; sortValue: ProductSort } {
  const { category, sort } =
    parseStorefrontFiltersFromSearchParams(searchParams);

  return { categoryValue: category, sortValue: sort };
}

export async function deleteProductById(id: string) {
  // 1. Önce ürünü buluyoruz (Çünkü Vercel'deki resim linklerini öğrenmemiz lazım)
  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    throw new Error("Silinecek ürün bulunamadı.");
  }

  // 2. Ürünü MongoDB'den kalıcı olarak siliyoruz
  await prisma.product.delete({
    where: { id },
  });

  // 3. Bulduğumuz eski ürünü geri gönderiyoruz ki Vercel'den de fotoğraflarını silebilelim
  return product;
}