import type { Metadata } from "next";
import "../globals.css"; // Giữ nguyên import CSS kích hoạt Tailwind của bạn
import { CartProvider } from "./CartProvider"; // Bọc logic giỏ hàng tách biệt

export const metadata: Metadata = {
  title: "YUNLUB GALLERY • STORE",
  description: "Official Drop Portal",
};

export default function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-black min-h-screen text-white antialiased selection:bg-white selection:text-black">
      {/* Bọc CartProvider bao quanh nội dung để các trang con dùng chung giỏ hàng */}
      <CartProvider>
        {children}
      </CartProvider>
    </div>
  );
}