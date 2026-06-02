'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { motion, AnimatePresence, Variants } from 'framer-motion'

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

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
}

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
}

export default function StorePage() {
    const [activeCategory, setActiveCategory] = useState('All')
    const [productsList, setProductsList] = useState<ProductFromSupabase[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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
        if (active === 'all') return true;
        const productCat = product.category?.toLowerCase().replace(/\s+/g, '') || '';
        if (active === 'bottoms') {
            return ['bottoms', 'shorts'].includes(productCat);
        }
        return productCat === active.replace(/\s+/g, '');
    });

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ duration: 0.5 }}
            className="flex flex-col w-full min-h-screen justify-between"
        >
            {/* =========================================
                1. MOBILE TOP BAR
            ========================================= */}
            <div className="md:hidden w-full mb-6 shrink-0">
                
                {/* Nút Hamburger Menu */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="absolute top-5 left-4 text-zinc-400 hover:text-white transition flex flex-col justify-center items-start w-10 h-10 space-y-1.5 z-30"
                >
                    <span className={`block w-6 h-0.5 bg-current transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                    <span className={`block w-6 h-0.5 bg-current transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
                    <span className={`block w-6 h-0.5 bg-current transition-transform duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                </button>

                {/* LOGO BRAND MOBILE */}
                <div
                    onClick={() => { setActiveCategory('All'); setIsMobileMenuOpen(false); }}
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 flex items-center justify-center cursor-pointer z-20"
                >
                    <img
                        src="/logo%20copy.svg"
                        alt="Yunlub Gallery Logo"
                        className="w-full h-full object-contain"
                    />
                </div>

                <div className="h-20 w-full"></div>

                {/* Danh mục Dropdown */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.nav
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="absolute top-20 left-0 w-full overflow-hidden flex flex-col items-center space-y-4 pt-6 pb-6 text-[13px] font-black italic tracking-widest bg-black z-20 border-b border-zinc-900/50"
                        >
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={`mobile-${cat}`}
                                    onClick={() => {
                                        setActiveCategory(cat)
                                        setIsMobileMenuOpen(false)
                                    }}
                                    className={`uppercase transition-colors ${
                                        activeCategory.toLowerCase() === cat.toLowerCase()
                                            ? 'text-white underline underline-offset-4'
                                            : 'text-zinc-500'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </motion.nav>
                    )}
                </AnimatePresence>
            </div>

            {/* =========================================
                2. MAIN LAYOUT (Sidebar PC & Lưới Sản Phẩm)
            ========================================= */}
            <div className="flex flex-col md:flex-row gap-12 items-start w-full flex-1">
                
                {/* SIDEBAR DANH MỤC (Chỉ hiện trên PC) */}
                <motion.aside 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="hidden md:flex w-56 flex-col justify-between shrink-0 sticky top-8 h-[calc(100vh-100px)] z-10"
                >
                    <div className="flex flex-col space-y-8">
                        <div
                            onClick={() => setActiveCategory('All')}
                            className="w-24 h-24 flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
                        >
                            <img src="/logo%20copy.svg" alt="Yunlub Gallery Logo" className="w-full h-full object-contain" />
                        </div>

                        <nav className="flex flex-col space-y-3.5 text-[14px] font-black italic tracking-widest relative">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={`desktop-${cat}`}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`text-left uppercase transition-colors block relative ${
                                        activeCategory.toLowerCase() === cat.toLowerCase() ? 'text-white' : 'text-zinc-500 hover:text-white'
                                    }`}
                                >
                                    {cat}
                                    {activeCategory.toLowerCase() === cat.toLowerCase() && (
                                        <motion.div
                                            layoutId="activeCategory"
                                            className="absolute -bottom-1 left-0 right-0 h-[2px] bg-white"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* FOOTER MENU SUB (Bản PC) */}
                    <div className="flex flex-col space-y-2.5 pb-4">
                        <a href="https://www.instagram.com/yunlubgallery/" target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-white transition-colors w-fit block mb-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                            </svg>
                        </a>
                        <a href="#" className="text-[10px] font-mono tracking-[0.2em] text-zinc-500 hover:text-white transition-colors uppercase block">ARCHIVE</a>
                        <a href="#" className="text-[10px] font-mono tracking-[0.2em] text-zinc-500 hover:text-white transition-colors uppercase block">NEWSLETTER</a>
                        <a href="#" className="text-[10px] font-mono tracking-[0.2em] text-zinc-500 hover:text-white transition-colors uppercase block">SHIPPING POLICY</a>
                        <a href="#" className="text-[10px] font-mono tracking-[0.2em] text-zinc-500 hover:text-white transition-colors uppercase block">TERMS OF SERVICE</a>
                    </div>
                </motion.aside>

                {/* GRID SẢN PHẨM */}
                <section className="flex-1 w-full">
                    {isLoading ? (
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 md:gap-x-6 gap-y-8">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="flex flex-col space-y-3 animate-pulse">
                                    <div className="w-full aspect-square max-w-[85%] mx-auto bg-zinc-900/50 rounded-sm"></div>
                                    <div className="flex flex-col items-center space-y-2 mt-2">
                                        <div className="h-3 w-3/4 bg-zinc-900/80 rounded"></div>
                                        <div className="h-2 w-1/2 bg-zinc-900/50 rounded"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredProducts.length > 0 ? (
                        <motion.div 
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 md:gap-x-6 gap-y-10 md:gap-y-8"
                        >
                            <AnimatePresence mode="popLayout">
                                {filteredProducts.map((product) => (
                                    <motion.div 
                                        layout
                                        key={product.id}
                                        variants={itemVariants}
                                        initial="hidden"
                                        animate="show"
                                        exit="exit"
                                    >
                                        <Link href={`/store/${product.id}`} className="flex flex-col space-y-0 group cursor-pointer block">
                                            <div className="w-full aspect-square max-w-[95%] md:max-w-[85%] mx-auto bg-transparent flex items-center justify-center relative overflow-hidden">
                                                <img
                                                    src={product.image_url}
                                                    alt={product.description}
                                                    className="w-full h-full object-contain pt-4 px-4 pb-0 transition-all duration-500 ease-out filter drop-shadow-[0_0_25px_rgba(236,72,153,0.55)] group-hover:scale-[1.04] mix-blend-screen"
                                                />
                                            </div>

                                            <div className="flex flex-col space-y-1 text-center text-[10px] md:text-[11px] font-black italic tracking-widest uppercase px-1 md:px-2 mt-2">
                                                <h2 className="text-white leading-tight group-hover:underline">{product.description}</h2>
                                                <div className="font-mono not-italic text-zinc-400 text-[9px] md:text-[10px]">
                                                    <span>VND {product.price?.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="w-full h-64 flex items-center justify-center border border-zinc-900/50 bg-zinc-950/20"
                        >
                            <span className="text-[10px] font-mono tracking-[0.3em] text-zinc-600 uppercase text-center px-4">[ NO PRODUCTS IN THIS CATEGORY ]</span>
                        </motion.div>
                    )}
                </section>
            </div>

            {/* =========================================
                3. MOBILE FOOTER LINKS (Đã tinh chỉnh khoảng cách gọn hơn)
            ========================================= */}
            {/* GIẢM mt-8 -> mt-4 để kéo sát lên phía trên một chút nếu danh sách dài */}
            <div className="md:hidden w-full shrink-0 mt-4">
                {/* GIẢM mb-3 -> mb-2 để kéo chữ sát thanh ngang hơn */}
                <div className="w-full border-t border-zinc-900/60 mb-2"></div>

                {/* GIẢM space-y-2 -> space-y-1.5 để các dòng chữ khít nhau hơn; pb-6 -> pb-4 để đáy đỡ trống sâu */}
                <div className="w-full flex flex-col items-start space-y-1.5 pb-4 px-2 text-left">
                    {/* Icon Instagram */}
                    <a href="https://www.instagram.com/yunlubgallery/" target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-white transition-colors w-fit block mb-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                        </svg>
                    </a>
                    
                    {/* Các link menu */}
                    <a href="#" className="text-[10px] font-mono tracking-[0.2em] text-zinc-500 hover:text-white transition-colors uppercase block">ARCHIVE</a>
                    <a href="#" className="text-[10px] font-mono tracking-[0.2em] text-zinc-500 hover:text-white transition-colors uppercase block">NEWSLETTER</a>
                    <a href="#" className="text-[10px] font-mono tracking-[0.2em] text-zinc-500 hover:text-white transition-colors uppercase block">SHIPPING POLICY</a>
                    <a href="#" className="text-[10px] font-mono tracking-[0.2em] text-zinc-500 hover:text-white transition-colors uppercase block">TERMS OF SERVICE</a>
                </div>
            </div>

        </motion.div>
    )
}