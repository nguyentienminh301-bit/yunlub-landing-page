import type { Metadata } from "next";
import "../globals.css"; 
import StoreHeader from "./StoreHeader"; // Import phần thanh điều hướng của Store

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
    /* 🎯 1. KHUNG BAO NGOÀI CÙNG: Đảm bảo nền luôn đen và chiếm hết chiều cao màn hình */
    <div className="bg-black min-h-screen text-white antialiased selection:bg-white selection:text-black">
      
      {/* 🎯 2. KHUNG GIỚI HẠN ĐỘ RỘNG: Thu gọn giao diện về giữa (Tối đa 1600px), giống hệt lúc trước */}
      <div className="w-full max-w-[1600px] mx-auto p-4 md:p-8 relative overflow-x-hidden min-h-screen flex flex-col justify-between">
        
        <div>
          {/* 🧭 NAVIGATION TRÊN CÙNG BÊN PHẢI (SEARCH, CART, CHECKOUT) */}
          <StoreHeader />

          {/* NỘI DUNG CHÍNH CỦA TRANG CỬA HÀNG & TRANG CHI TIẾT SẢN PHẨM */}
          <main>
            {children}
          </main>
        </div>

        {/* 📜 FOOTER CONCEPT ĐẶC TRƯNG CỦA CỬA HÀNG */}
        <footer className="mt-24 pt-8 border-t border-zinc-900 text-center text-[10px] text-zinc-600 tracking-[0.5em] uppercase font-mono global-footer">
          © 2026 YUNLUB GALLERY • ALL RIGHTS RESERVED • DROP NO.1
        </footer>

      </div>

    </div>
  );
}