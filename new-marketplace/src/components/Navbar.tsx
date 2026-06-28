"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Auth0SessionUser, isAdmin } from "@/lib/auth0";
import { ModeToggle } from "@/components/ModeToggle";

export function Navbar({ user }: { user: Auth0SessionUser | null }) {
  const userIsAdmin = isAdmin(user);
  const pathname = usePathname();
  const isForbiddenPage = pathname === "/forbidden";

  return (
    <div className="flex w-full items-center justify-between p-5 border-b bg-white dark:bg-black">
      <div className="flex items-center gap-6 m-1">
        <Link href="/" className="text-xl font-bold tracking-tighter m-1">
          MARKETPLACE
        </Link>

        {!isForbiddenPage && (
          <NavigationMenu>
            <NavigationMenuList>
              
              {/* NORMAL KULLANICI LİNKLERİ (Admin değilse görür) */}
              {!userIsAdmin && (
                <>
                  <NavigationMenuItem>
                    <Button
                      asChild
                      variant="secondary"
                      className={navigationMenuTriggerStyle()}
                    >
                      <Link href="/products">PRODUCTS</Link>
                    </Button>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <Button
                      asChild
                      variant="secondary"
                      className={navigationMenuTriggerStyle()}
                    >
                      <Link href="/categories">CATEGORİES</Link>
                    </Button>
                  </NavigationMenuItem>

                  {/* SADECE GİRİŞ YAPMIŞ NORMAL KULLANICILAR GÖRÜR */}
                  {user && (
                    <>
                      <NavigationMenuItem>
                        <Button
                          asChild
                          variant="secondary"
                          className={navigationMenuTriggerStyle()}
                        >
                          <Link href="/settings">USER SETTİNGS</Link>
                        </Button>
                      </NavigationMenuItem>

                      <NavigationMenuItem>
                        <Button
                          asChild
                          variant="secondary"
                          className={navigationMenuTriggerStyle()}
                        >
                          <Link href="/myorders">MY ORDERS</Link>
                        </Button>
                      </NavigationMenuItem>
                    </>
                  )}
                </>
              )}

              {/* SADECE ADMİNLERİN GÖRDÜĞÜ LİNKLER */}
              {userIsAdmin && (
                <>
                  <NavigationMenuItem>
                    <Button
                      asChild
                      variant="secondary"
                      className={navigationMenuTriggerStyle()}
                    >
                      <Link href="/admin/products">PRODUCT SETTİNGS</Link>
                    </Button>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <Button
                      asChild
                      variant="secondary"
                      className={navigationMenuTriggerStyle()}
                    >
                      <Link href="/admin/categories">CATEGORİES SETTİNGS</Link>
                    </Button>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <Button
                      asChild
                      variant="secondary"
                      className={navigationMenuTriggerStyle()}
                    >
                      <Link href="/admin/users">USERS SETTİNGS</Link>
                    </Button>
                  </NavigationMenuItem>
                </>
              )}
              
            </NavigationMenuList>
          </NavigationMenu>
        )}
      </div>

      <div className="flex items-center gap-4">
        <ModeToggle />
        
        {/* Kullanıcı YOKSA (Ziyaretçi) */}
        {!user && (
          <a
            href="/auth/login"
            className={cn(buttonVariants({ variant: "success" }))}
          >
            SİGN İN
          </a>
        )}

        {/* Kullanıcı VARSA (Giriş Yapmış) */}
        {user && (
          <div className="flex items-center gap-4">
            <img
              src={user.picture || ""}
              alt="Profile Picture"
              className="w-8 h-8 rounded-full border"
            />
            <a
              href="/auth/logout"
              className={cn(buttonVariants({ variant: "destructive" }))}
            >
              SİGN OUT
            </a>
          </div>
        )}
      </div>
    </div>
  );
}