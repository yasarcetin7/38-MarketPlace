"use client"; 

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button"; // 🚀 2. DEĞİŞİKLİK: Kendi Butonumuzu ekledik
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Currency, formatPrice } from "@/types/currency";
import { formatCategoryLabel, type ProductCategory } from "@/types/product";
import { useCart } from "@/components/storefront/card-provider";

type ProductCardProps = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  currency: string;
  category: ProductCategory;
  imageUrl?: string;
  stripePriceId: string;
  stripeProductId?: string; // Hata vermemesi için opsiyonel (?) yaptık
};

export function ProductCard({
  id, // 🚀 3. DEĞİŞİKLİK: ID'yi içeri aldık (Sepet için çok önemli!)
  name,
  description,
  priceCents,
  currency,
  category,
  imageUrl,
  stripePriceId,
  stripeProductId = "",
}: ProductCardProps) {
  const priceLabel = formatPrice(priceCents, currency as Currency);
  
  // 🚀 4. DEĞİŞİKLİK: Sepet hafızasını çağırıyoruz
  const { addItem } = useCart(); 

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-4/3 bg-muted">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No image
          </div>
        )}
      </div>
      <CardHeader className="gap-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-1 text-base">{name}</CardTitle>
          <Badge variant="secondary">{formatCategoryLabel(category)}</Badge>
        </div>
        <CardDescription className="line-clamp-2">{description}</CardDescription>
      </CardHeader>
      <CardFooter className="border-t border-border pt-4 flex justify-between">
        <p className="text-lg font-semibold text-foreground">{priceLabel}</p>
        
        <Button 
          onClick={() => {
            addItem({
              id,
              name,
              priceCents,
              currency,
              imageUrl,
              stripePriceId,
              stripeProductId,
            });
          }}
        >
          Add To Cart
        </Button>
        
      </CardFooter>
    </Card>
  );
}