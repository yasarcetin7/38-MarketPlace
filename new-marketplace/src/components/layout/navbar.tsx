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
import type { Auth0SessionUser } from "@/lib/auth0-utils";
import { ModeToggle } from "@/components/ModeToggle";

export function Navbar({
  user,
  isAdmin,
}: {
  user: Auth0SessionUser | null;
  isAdmin: boolean;
}) {
  const userIsAdmin = isAdmin;
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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur overflow-hidden">
      <div className="flex w-full items-center justify-between p-2 px-2 sm:p-4 sm:px-9">
        <div className="flex items-center gap-2 lg:gap-11">
          
          {/* (Mobile Menu) */}
          {!isForbiddenPage && (
            <div className="md:hidden shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Open mobile menu">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="4" x2="20" y1="12" y2="12"/>
                      <line x1="4" x2="20" y1="6" y2="6"/>
                      <line x1="4" x2="20" y1="18" y2="18"/>
                    </svg>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/" className="cursor-pointer w-full">Products</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/categories" className="cursor-pointer w-full">Categories</Link>
                  </DropdownMenuItem>
                  {userIsAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin/products" className="cursor-pointer w-full">Product Settings</Link>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
          
          {/* LOGO */}
          <Link
            href="/"
            className="flex items-center gap-3 text-xl font-bold tracking-tighter hover:opacity-80 transition-opacity shrink-0"
          >
            <Image
              src="/logo.png"
              alt="Marketplace Logo"
              width={199}
              height={166}
              className="shrink-0 w-26 sm:w-40 lg:w-[199px] h-auto rounded-sm object-contain"
            />
          </Link>

          {/* DESKTOP MENU (Hidden on mobile: hidden, visible at md size: md:block) */}
          {!isForbiddenPage && (
            <div className="hidden md:block">
              <NavigationMenu>
                <NavigationMenuList className="gap-1 sm:gap-2">
                  <NavigationMenuItem>
                    <Button
                      asChild
                      variant="ghost"
                      className={cn(
                        navigationMenuTriggerStyle(),
                        "h-8 px-2 text-[10px] sm:h-10 sm:px-4 sm:text-sm",
                      )}
                    >
                      <Link href="/">HOME PAGE</Link>
                    </Button>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <Button
                      asChild
                      variant="ghost"
                      className={cn(
                        navigationMenuTriggerStyle(),
                        "h-8 px-2 text-[10px] sm:h-10 sm:px-4 sm:text-sm",
                      )}
                    >
                      <Link href="/categories">CATEGORIES</Link>
                    </Button>
                  </NavigationMenuItem>

                  {userIsAdmin && (
                    <NavigationMenuItem>
                      <Button
                        asChild
                        variant="ghost"
                        className={navigationMenuTriggerStyle()}
                      >
                        <Link href="/admin/products">PRODUCT SETTINGS</Link>
                      </Button>
                    </NavigationMenuItem>
                  )}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          )}
        </div>

        {/* (User, Cart, Dark Mode) */}
        <div className="flex items-center gap-4 shrink-0">
          <CartMenu
            userName={
              (user ? user.given_name || user.name : undefined) as
                | string
                | undefined
            }
          />

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
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full border shrink-0"
                  aria-label="User menu"
                >
                  <Avatar className="h-9 w-9">
                    {user.picture ? (
                      <AvatarImage src={user.picture} alt={displayName} />
                    ) : null}
                    <AvatarFallback className="dark:text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {displayName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer w-full">
                    {userIsAdmin ? "Admin Settings" : "User Settings"}
                  </Link>
                </DropdownMenuItem>

                {!userIsAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/my-orders" className="cursor-pointer w-full">
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                )}

                {userIsAdmin && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/admin/orders"
                        className="cursor-pointer w-full"
                      >
                        Manage Orders
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link
                        href="/admin/users"
                        className="cursor-pointer w-full"
                      >
                        Manage Users
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a
                    href="/auth/logout"
                    className="text-destructive cursor-pointer w-full"
                  >
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