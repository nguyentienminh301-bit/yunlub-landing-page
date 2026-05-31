'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

// Thu gọn danh mục theo đúng yêu cầu của bạn
const CATEGORIES = [
    'All', 'Shorts', 'T-Shirts', 'Combos', 'Tops / Jerseys', 'Bottoms'
]

interface ProductFromSupabase {
    id: number
    price: number
    image_url: string
    description: string
    category: string
}

export default function StorePage() {
    const [activeCategory, setActiveCategory] = useState('All')
    const [productsList, setProductsList] = useState<ProductFromSupabase[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setIsLoading(true)
                const { data, error } = await supabase.from('products').select('*')
                if (error) throw error
                if (data) setProductsList(data)
            } catch (error) {
                console.error('Lỗi khi tải sản phẩm từ Supabase:', error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchProducts()
    }, [])

    const filteredProducts = productsList.filter(product => {
        const active = activeCategory.toLowerCase();

        // 1. Nếu chọn 'All' -> hiện tất cả
        if (active === 'all') return true;

        // Chuẩn hóa tên danh mục của sản phẩm từ DB
        const productCat = product.category?.toLowerCase().replace(/\s+/g, '') || '';

        // 2. Logic đặc biệt cho "Bottoms"
        // Nếu người dùng chọn Bottoms, nó sẽ trả về true cho cả 'bottoms' và 'shorts'
        if (active === 'bottoms') {
            return ['bottoms', 'shorts'].includes(productCat);
        }

        // 3. Các danh mục khác (T-Shirts, Tops/Jerseys,...) vẫn lọc bình thường
        return productCat === active.replace(/\s+/g, '');
    });

    return (
        <div className="flex flex-col md:flex-row gap-12 items-start">

            {/* SIDEBAR DANH MỤC & MENU CHÂN (CORTEIZ STYLE) */}
            <aside className="w-full md:w-56 flex flex-col justify-between shrink-0 md:sticky md:top-8 md:h-[calc(100vh-100px)]">
                <div className="flex flex-col space-y-8">

                    {/* LOGO BRAND - ĐÃ ĐƯỢC PHÓNG TO */}
                    <div
                        onClick={() => setActiveCategory('All')}
                        className="w-24 h-24 md:w-32 md:h-32 flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
                    >
                        <img
                            src="/logo%20copy.svg"
                            alt="Yunlub Gallery Logo"
                            className="w-full h-full object-contain"
                        />
                    </div>

                    {/* MENU DANH MỤC THU GỌN */}
                    <nav className="flex flex-col space-y-3.5 text-[13px] md:text-[14px] font-black italic tracking-widest">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`text-left uppercase transition-colors block ${activeCategory.toLowerCase() === cat.toLowerCase()
                                    ? 'text-white underline underline-offset-4'
                                    : 'text-zinc-500 hover:text-white'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* ==================== FOOTER MENU SUB (CORTEIZ STYLE) ==================== */}
                <div className="flex flex-col space-y-3 pt-12 md:pt-0 pb-4 border-t border-zinc-900/40 md:border-t-0">
                    {/* Icon Instagram */}
                    <a href="https://www.instagram.com/yunlubgallery/" target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-white transition-colors w-fit block mb-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                        </svg>
                    </a>

                    {/* Các link sub chữ nhỏ thanh mảnh */}
                    <a href="#" className="text-[10px] font-mono tracking-[0.2em] text-zinc-500 hover:text-white transition-colors uppercase block">ARCHIVE</a>
                    <a href="#" className="text-[10px] font-mono tracking-[0.2em] text-zinc-500 hover:text-white transition-colors uppercase block">NEWSLETTER</a>
                    <a href="#" className="text-[10px] font-mono tracking-[0.2em] text-zinc-500 hover:text-white transition-colors uppercase block">SHIPPING POLICY</a>
                    <a href="#" className="text-[10px] font-mono tracking-[0.2em] text-zinc-500 hover:text-white transition-colors uppercase block">TERMS OF SERVICE</a>
                </div>
            </aside>

            {/* GRID DANH SÁCH SẢN PHẨM */}
            <section className="flex-1 w-full min-h-[300px]">
                {isLoading ? (
                    <div className="w-full h-64 flex items-center justify-center">
                        <span className="text-[10px] font-mono tracking-widest text-zinc-600 animate-pulse">[ LOADING PRODUCTS... ]</span>
                    </div>
                ) : filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
                        {filteredProducts.map((product) => (
                            <Link href={`/store/${product.id}`} key={product.id} className="flex flex-col space-y-0 group cursor-pointer">

                                <div className="w-full aspect-square max-w-[85%] mx-auto bg-transparent flex items-center justify-center relative overflow-hidden">
                                    <img
                                        src={product.image_url}
                                        alt={product.description}
                                        /* Đã thêm mix-blend-screen để khử vệt đen và sửa lỗi drop-shadow bao quanh khung vuông */
                                        className="w-full h-full object-contain pt-4 px-4 pb-0 transition-all duration-500 ease-out filter drop-shadow-[0_0_25px_rgba(236,72,153,0.55)] group-hover:scale-[1.04] mix-blend-screen"
                                    />
                                </div>

                                {/* KHU VỰC CHỮ ĐƯỢC ÉP LÊN SÁT MÉP QUẦN */}
                                <div className="flex flex-col space-y-0.5 text-center text-[10px] font-black italic tracking-widest uppercase px-2 mt-1">
                                    <h2 className="text-white leading-tight group-hover:underline">{product.description}</h2>
                                    <div className="font-mono not-italic text-zinc-400 text-[10px]">
                                        <span>VND {product.price?.toLocaleString()}</span>
                                    </div>
                                </div>

                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="w-full h-64 flex items-center justify-center border border-zinc-900/50 bg-zinc-950/20">
                        <span className="text-[10px] font-mono tracking-[0.3em] text-zinc-600 uppercase">[ NO PRODUCTS IN THIS CATEGORY ]</span>
                    </div>
                )}
            </section>
        </div>
    )
}