import { ProductCatalog } from "@/components/storefront/product-catalog";

type HomePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedSearchParams = await searchParams;

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-2 py-4 sm:px-4 lg:px-6 lg:py-6">
      <div className="mb-8 space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          The Best Of Marketplace Products
        </h1>
        <p className="text-s text-muted-foreground dark:text-slate-300">
          Dive into our marketplace. Tweak the filters to track down the best deals.
        </p>
      </div>
      <ProductCatalog searchParams={resolvedSearchParams} />
    </main>
  );
}
