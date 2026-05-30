import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from './CartProvider';
import CartDrawer from './CartDrawer'; // Tách phần giao diện giỏ hàng trượt ra component riêng

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Yunlub Gallery',
  description: 'Early Access Portal',
  icons: {
    icon: '/logo.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-black text-white selection:bg-white selection:text-black">
        <CartProvider>
          {/* Toàn bộ nội dung các trang con (Store, Product,...) */}
          {children}
          
          {/* 🛒 GIAO DIỆN GIỎ HÀNG TRƯỢT POP-UP (Hiển thị phủ lên trên khi isOpenCart = true) */}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}