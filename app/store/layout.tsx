import type { Metadata } from "next";
import "../globals.css"; 
import StoreHeader from "./StoreHeader";

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
      
      {/* 🎯 ĐÃ THAY ĐỔI: p-4 -> pt-0 px-4 pb-4 để cho phép các phần tử chạm sát trần trên mobile */}
      <div className="w-full max-w-[1600px] mx-auto pt-0 px-4 pb-4 md:p-8 relative overflow-x-hidden min-h-screen flex flex-col justify-between">
        
        <div>
          <StoreHeader />

          <main>
            {children}
          </main>
        </div>

        <footer className="mt-24 pt-8 border-t border-zinc-900 text-center text-[10px] text-zinc-600 tracking-[0.5em] uppercase font-mono global-footer">
          © 2026 YUNLUB GALLERY • ALL RIGHTS RESERVED • DROP NO.1
        </footer>

      </div>

    </div>
  );
}