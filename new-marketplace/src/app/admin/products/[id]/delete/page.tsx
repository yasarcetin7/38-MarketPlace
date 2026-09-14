import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getProductById } from "@/lib/products";
// 🚀 1. YENİ: Arka planda yazdığımız silme işlemini çağırıyoruz
import { deleteProduct } from "./action";

type DeleteProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function DeleteProductPage({
  params,
}: DeleteProductPageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  // 🚀 2. YENİ: Silme işlemini bu ürünün ID'sine kilitliyoruz
  const deleteAction = deleteProduct.bind(null, id);

  return (
    <main className="space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Delete product
        </h1>
        <p className="text-sm text-muted-foreground">{product.name}</p>
      </div>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive">Confirm deletion</CardTitle>
          {/* 🚀 3. YENİ: Geçici yazıyı sildik, gerçek bir uyarı ekledik */}
          <CardDescription>
            Are you sure you want to delete this product? All product data and images will be permanently removed from the database and Vercel Blob. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* 🚀 4. YENİ: Butonları bir form içine aldık ve action'a bağladık */}
          <form action={deleteAction} className="flex gap-3">
            <Button variant="destructive" type="submit">
              Delete product
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/products">Cancel</Link>
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}