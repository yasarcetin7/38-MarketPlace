"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CartMenu } from "@/components/storefront/card-menu";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
// 🚀 DİKKAT: Sadece "type" olarak import ediyoruz, auth0'ı çalıştırmıyoruz!
import type { Auth0SessionUser } from "@/lib/auth0"; 
import { ModeToggle } from "@/components/ModeToggle";

// 🚀 DİKKAT: isAdmin'i artık layout'tan prop olarak alıyoruz
export function Navbar({ user, isAdmin }: { user: Auth0SessionUser | null, isAdmin: boolean }) {
  const userIsAdmin = isAdmin; // Layout'tan gelen bilgi
  const pathname = usePathname();
  const isForbiddenPage = pathname === "/forbidden";

  const displayName = user?.name ?? user?.email ?? "User";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="flex w-full items-center justify-between p-4 px-9">
        <div className="flex items-center gap-11">
        <Link href="/" className="flex items-center gap-3 text-xl font-bold tracking-tighter hover:opacity-80 transition-opacity">
    
    <Image 
      src="/logo.png" 
      alt="Marketplace Logo" 
      width={199} 
      height={166} 
      className="rounded-sm object-contain" 
    />
    
  </Link>

          {!isForbiddenPage && (
            <NavigationMenu>
              <NavigationMenuList>
                
                {/* NORMAL KULLANICI LİNKLERİ */}
                {!userIsAdmin && (
                  <>
                    <NavigationMenuItem>
                      <Button asChild variant="ghost" className={navigationMenuTriggerStyle()}>
                        <Link href="/products">PRODUCTS</Link>
                      </Button>
                    </NavigationMenuItem>

                    <NavigationMenuItem>
                      <Button asChild variant="ghost" className={navigationMenuTriggerStyle()}>
                        <Link href="/categories">CATEGORIES</Link>
                      </Button>
                    </NavigationMenuItem>
                  </>
                )}

                {/* ADMİN LİNKLERİ */}
                {userIsAdmin && (
                  <>
                    <NavigationMenuItem>
                      <Button asChild variant="ghost" className={navigationMenuTriggerStyle()}>
                        <Link href="/admin/products">PRODUCT SETTINGS</Link>
                      </Button>
                    </NavigationMenuItem>

                    <NavigationMenuItem>
                      <Button asChild variant="ghost" className={navigationMenuTriggerStyle()}>
                        <Link href="/admin/categories">CATEGORIES SETTINGS</Link>
                      </Button>
                    </NavigationMenuItem>

                    <NavigationMenuItem>
                      <Button asChild variant="ghost" className={navigationMenuTriggerStyle()}>
                        <Link href="/admin/users">USERS SETTINGS</Link>
                      </Button>
                    </NavigationMenuItem>
                  </>
                )}
                
              </NavigationMenuList>
            </NavigationMenu>
          )}
</div>
        {/* SAĞ KISIM: KARANLIK MOD VE KULLANICI PROFİLİ */}
        <div className="flex items-center gap-4">
          <CartMenu userName={(user ? (user.given_name || user.name) : undefined) as string | undefined} />
          <ModeToggle />
          
          {!user ? (
            <a
              href="/auth/login"
              className={cn(buttonVariants({ variant: "default" }))}
            >
              SIGN IN
            </a>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full border">
                  <Avatar className="h-9 w-9">
                    {user.picture ? (
                      <AvatarImage src={user.picture} alt={displayName} />
                    ) : null}
                    <AvatarFallback className="dark:text-white">{initials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {!userIsAdmin && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="cursor-pointer w-full">User Settings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/myorders" className="cursor-pointer w-full">My Orders</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                
                <DropdownMenuItem asChild>
                  <a href="/auth/logout" className="text-destructive cursor-pointer w-full">
                    Sign Out
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}