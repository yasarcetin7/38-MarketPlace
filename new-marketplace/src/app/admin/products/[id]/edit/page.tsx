import { notFound } from "next/navigation";
import { getProductById } from "@/lib/products";
import { EditProductForm } from "./edit-product-form";

type EditProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-10">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Edit product
        </h1>
        <p className="text-sm text-muted-foreground">
          Update the details for <strong>{product.name}</strong>.
        </p>
      </div>

      
      <EditProductForm product={product} />
      
    </main>
  );
}