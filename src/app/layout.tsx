import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar"; // Yolunu kendi klasörüne göre kontrol et
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { getSessionUser, isAdmin } from "@/lib/auth0"; // 🚀 isAdmin'i buraya ekledik

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "My Marketplace",
  description: "A professional marketplace platform",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  // 🚀 Kullanıcıyı ve Admin olup olmadığını BURADA (Güvenli Sunucuda) kontrol ediyoruz
  const user = await getSessionUser();
  const userIsAdmin = isAdmin(user);

  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        inter.variable,
      )}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col font-sans"
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* 🚀 userIsAdmin bilgisini de Navbar'a gönderiyoruz */}
          <Navbar user={user} isAdmin={userIsAdmin} />

          <main className="flex-1">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}