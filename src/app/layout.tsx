import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google"
import "./globals.css";
import { cn } from "@/lib/utils"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import AuthProvider from "@/components/AuthProvider"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "LINK Translations | Professional Language Services Since 1995",
  description: "LINK Translations offers certified translation and interpretation services in over 150 languages. A tradition of excellence since 1995.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased flex flex-col",
          fontSans.variable
        )}
      >
        <AuthProvider>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
