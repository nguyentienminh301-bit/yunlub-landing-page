'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { motion, AnimatePresence, Variants } from 'framer-motion' // Thêm import framer-motion


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

// Cấu hình animation cho Grid Container (chứa các sản phẩm)
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1 
        }
    }
}

// Cấu hình animation cho từng sản phẩm
const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
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
            className="flex flex-col md:flex-row gap-12 items-start"
        >
            {/* SIDEBAR DANH MỤC & MENU CHÂN */}
            <motion.aside 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full md:w-56 flex flex-col justify-between shrink-0 md:sticky md:top-8 md:h-[calc(100vh-100px)] z-10"
            >
                <div className="flex flex-col space-y-8">
                    {/* LOGO BRAND */}
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
                    <nav className="flex flex-col space-y-3.5 text-[13px] md:text-[14px] font-black italic tracking-widest relative">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`text-left uppercase transition-colors block relative ${
                                    activeCategory.toLowerCase() === cat.toLowerCase()
                                        ? 'text-white'
                                        : 'text-zinc-500 hover:text-white'
                                }`}
                            >
                                {cat}
                                {/* Hiệu ứng gạch dưới mượt mà khi active */}
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

                {/* FOOTER MENU SUB */}
                <div className="flex flex-col space-y-3 pt-12 md:pt-0 pb-4 border-t border-zinc-900/40 md:border-t-0">
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

            {/* GRID DANH SÁCH SẢN PHẨM */}
            <section className="flex-1 w-full min-h-[300px]">
                {isLoading ? (
                    /* SKELETON LOADING UI ĐẸP MẮT THAY VÌ CHỈ CÓ TEXT */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
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
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8"
                    >
                        <AnimatePresence mode="popLayout">
                            {filteredProducts.map((product) => (
                                <motion.div 
                                    layout // layout prop giúp di chuyển vị trí mượt mà khi đổi category
                                    key={product.id}
                                    variants={itemVariants}
                                    initial="hidden"
                                    animate="show"
                                    exit="exit"
                                >
                                    <Link href={`/store/${product.id}`} className="flex flex-col space-y-0 group cursor-pointer block">
                                        <div className="w-full aspect-square max-w-[85%] mx-auto bg-transparent flex items-center justify-center relative overflow-hidden">
                                            <img
                                                src={product.image_url}
                                                alt={product.description}
                                                className="w-full h-full object-contain pt-4 px-4 pb-0 transition-all duration-500 ease-out filter drop-shadow-[0_0_25px_rgba(236,72,153,0.55)] group-hover:scale-[1.04] mix-blend-screen"
                                            />
                                        </div>

                                        <div className="flex flex-col space-y-0.5 text-center text-[10px] font-black italic tracking-widest uppercase px-2 mt-1">
                                            <h2 className="text-white leading-tight group-hover:underline">{product.description}</h2>
                                            <div className="font-mono not-italic text-zinc-400 text-[10px]">
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
                        <span className="text-[10px] font-mono tracking-[0.3em] text-zinc-600 uppercase">[ NO PRODUCTS IN THIS CATEGORY ]</span>
                    </motion.div>
                )}
            </section>
        </motion.div>
    )
}