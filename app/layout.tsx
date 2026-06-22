import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "./CartProvider"; // Bọc giỏ hàng cho toàn bộ trang (bao gồm /checkout)
import CartDrawer from "./CartDrawer"; // Thanh ngăn kéo giỏ hàng hiển thị toàn trang
import { Analytics } from "@vercel/analytics/react"; // 📈 Thêm Vercel Analytics vào đây

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Yunlub Gallery",
  description: "Launching soon",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* 🛒 Cung cấp Context giỏ hàng cho cả Store và Checkout */}
        <CartProvider>
          {children}
          <CartDrawer />
          
          {/* 📈 Đo lường traffic tự động cho toàn bộ trang web */}
          <Analytics />
        </CartProvider>
      </body>
    </html>
  );
}