"use client";

import { useActionState, useState, type ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ACCEPTED_IMAGE_ACCEPT_ATTR, MAX_IMAGE_MB } from "@/lib/product-images";
import { EU_CURRENCY_OPTIONS } from "@/types/currency";
import { PRODUCT_CATEGORY_OPTIONS } from "@/types/product";
import { editProduct, EditProductState } from "./action";

export function EditProductForm({ product }: { product: any }) {
  const updateProductWithId = editProduct.bind(null, product.id);

  const [state, formAction, isPending] = useActionState<
    EditProductState | null,
    FormData
  >(updateProductWithId, null);

  // 🚀 YENİ: Eski resimleri ekranda tutmak ve silebilmek için State (Hafıza) oluşturuyoruz
  const [existingImages, setExistingImages] = useState<string[]>(product.imageUrls || []);

  // Çarpı (X) butonuna basıldığında resmi listeden çıkaran fonksiyon
  const handleRemoveImage = (urlToRemove: string) => {
    setExistingImages((prev) => prev.filter((url) => url !== urlToRemove));
  };

  const defaultValues = state?.values ?? {
    name: product.name,
    description: product.description,
    price: (product.priceCents / 100).toString(),
    currency: product.currency,
    category: product.category,
    stock: product.stock.toString(),
    isActive: product.isActive,
  };

  return (
    <form action={formAction} className="space-y-8">
      {state?.message && (
        <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.message}
        </div>
      )}

      {/* 🚀 YENİ: Arka plana silinmeyen "Kalan Eski Resimleri" gizlice gönderiyoruz */}
      {existingImages.map((url, index) => (
        <input key={index} type="hidden" name="existingImages" value={url} />
      ))}

      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Basic details</h2>
        </div>

        <div className="grid gap-4">
          <FormField id="name" label="Name">
            <Input id="name" name="name" defaultValue={defaultValues.name} required />
          </FormField>

          <FormField id="description" label="Description">
            <Textarea id="description" name="description" defaultValue={defaultValues.description} required />
          </FormField>

          <FormField id="category" label="Category">
            <select
              id="category"
              name="category"
              defaultValue={defaultValues.category}
              className="h-9 w-full rounded-lg border border-input bg-input/30 px-3 text-sm outline-none"
              required
            >
              {PRODUCT_CATEGORY_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </FormField>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Pricing & inventory</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <FormField id="price" label="Price" className="sm:col-span-1">
            <Input id="price" name="price" type="text" inputMode="decimal" defaultValue={defaultValues.price} required />
          </FormField>

          <FormField id="currency" label="Currency" className="sm:col-span-1">
            <select
              id="currency"
              name="currency"
              defaultValue={defaultValues.currency}
              className="h-9 w-full rounded-lg border border-input bg-input/30 px-3 text-sm outline-none"
              required
            >
              {EU_CURRENCY_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </FormField>

          <FormField id="stock" label="Stock" className="sm:col-span-1">
            <Input id="stock" name="stock" type="number" min={0} defaultValue={defaultValues.stock} required />
          </FormField>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Images</h2>
          <p className="text-sm text-muted-foreground">
            Mevcut resimleri çarpı (X) butonuna basarak silebilirsiniz.
          </p>
        </div>

        {/* 🚀 YENİ: Eski Resimlerin Ekranda Listelenmesi ve X Butonu */}
        {existingImages.length > 0 && (
          <div className="flex flex-wrap gap-4 mb-4 border rounded-lg p-4 bg-muted/20">
            {existingImages.map((url, index) => (
              <div key={index} className="relative w-24 h-24 border rounded-md overflow-hidden group">
                <img src={url} alt={`Product ${index}`} className="object-cover w-full h-full" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(url)}
                  className="absolute top-1 right-1 bg-destructive text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-80 hover:opacity-100 transition-opacity shadow-sm"
                  title="Resmi Sil"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <FormField id="images" label="Upload Additional Images (Optional)">
          <Input id="images" name="images" type="file" accept={ACCEPTED_IMAGE_ACCEPT_ATTR} multiple />
        </FormField>
      </section>

      <section className="space-y-4">
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={defaultValues.isActive}
            className="size-4 rounded border border-input accent-primary"
          />
          <span>Product is active and visible in the store</span>
        </label>
      </section>

      <div className="flex items-center gap-3 border-t border-border pt-6">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Updating product..." : "Update product"}
        </Button>
        <Button asChild variant="outline" disabled={isPending}>
          <Link href="/admin/products">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}

function FormField({ id, label, className, children }: { id: string; label: string; className?: string; children: ReactNode }) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}