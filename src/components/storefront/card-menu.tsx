"use client";
import { CheckoutButton } from "./checkout-button";
import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { useCart } from "@/components/storefront/card-provider"; // Yolun doğru olduğundan emin ol
type CartMenuProps = {
  userName?: string | null; // Kullanıcı giriş yapmamış olabilir, o yüzden opsiyonel (?) yaptık
};
export function CartMenu({ userName }: CartMenuProps) {
  // 🚀 Hafızadaki (Context) verileri çekiyoruz
  const { items, removeItem, cartTotal, addItem, decrementItem } = useCart();

  // Sepetteki toplam ürün sayısını hesaplıyoruz
  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

  // Kuruş (Cents) cinsinden gelen toplam fiyatı normale çeviriyoruz
  const formattedTotal = (cartTotal / 100).toFixed(2);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {cartItemCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center rounded-full p-0 text-xs"
            >
              {cartItemCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
<SheetContent className="flex w-full flex-col sm:max-w-lg p-3">
      <SheetHeader>
          <SheetTitle>
            {userName ? `${userName}'s Cart` : "My Cart"} 
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto mt-6 flex flex-col gap-6 pr-4">
          {/* Eğer sepet boşsa kullanıcıya mesaj göster */}
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
              <ShoppingCart className="h-12 w-12 opacity-20" />
              <p>Your shopping cart is currently empty :\</p>
            </div>
          ) : (
            /* Sepet doluysa ürünleri listele */
            items.map((item) => (
              <div key={item.id} className="flex items-center space-x-4">
                <div className="relative h-16 w-16 overflow-hidden rounded border bg-muted flex items-center justify-center">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="object-cover h-full w-full " />
                  ) : (
                    <span className="text-xs text-muted-foreground ">Picture</span>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-1 text-sm">
                  <span className="font-semibold line-clamp-1">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => decrementItem(item.id)}
                      disabled={item.quantity <= 1} // Miktar 1 ise eksi butonu pasif olur
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-4 text-center text-sm font-medium">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => addItem(item)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className="font-medium">
                    {((item.priceCents * item.quantity) / 100).toFixed(2)} {item.currency}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={() => removeItem(item.id)} // 🚀 SİLME İŞLEMİ BURADA ÇALIŞIYOR
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ALT KISIM: TOPLAM VE ÖDEME BUTONU */}
        {items.length > 0 && (
          <div className="pt-4 border-t mt-auto">
            <div className="flex items-center justify-between">
              
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Total Price</span>
                <span className="text-lg font-semibold">
                  {formattedTotal} {items[0]?.currency}
                </span>
              </div>
              
              {/* Sağ Taraf: Checkout Butonu */}
              <SheetFooter>
                {/* 🚀 DEĞİŞİKLİK BURADA: isLoggedIn bilgisini butona aktarıyoruz */}
                <CheckoutButton items={items} isLoggedIn={!!userName} />
              </SheetFooter>
            </div>
          </div>
        )}
      
      </SheetContent>
    </Sheet>
  );
}