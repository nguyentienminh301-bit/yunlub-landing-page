'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import { useCart } from '../../CartProvider'
import { motion, AnimatePresence } from 'framer-motion'

interface ProductFromSupabase {
    id: number
    price: number
    image_url: string
    description: string
    category: string
}

export default function ProductDetailPage() {
    const params = useParams()
    const rawId = Array.isArray(params?.id) ? params.id[0] : params?.id

    const { addToCart } = useCart()

    const [product, setProduct] = useState<ProductFromSupabase | null>(null)
    const [selectedSize, setSelectedSize] = useState('M')
    const [quantity, setQuantity] = useState(1)
    const [isLoading, setIsLoading] = useState(true)

    // --- State xử lý Voucher ---
    const [voucherCode, setVoucherCode] = useState('')
    const [voucherLoading, setVoucherLoading] = useState(false)
    const [voucherMessage, setVoucherMessage] = useState<{ type: 'success' | 'error' | null; text: string }>({ type: null, text: '' })
    const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discount: number; voucherId: string } | null>(null)

    // --- State ẩn/hiện Size Chart ---
    const [isOpenSizeChart, setIsOpenSizeChart] = useState(false)

    useEffect(() => {
        if (!rawId) return

        const fetchProductDetail = async () => {
            try {
                setIsLoading(true)
                const productId = Number(rawId)

                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .eq('id', productId)
                    .single()

                if (error) {
                    console.error("❌ Lỗi từ Supabase:", error.message, error.details)
                    throw error
                }

                if (data) {
                    setProduct(data)
                }
            } catch (err) {
                console.error('Lỗi khi tải chi tiết sản phẩm:', err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchProductDetail()
    }, [rawId])

    const handleApplyVoucher = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!voucherCode.trim() || voucherLoading || !product) return

        setVoucherLoading(true)
        setVoucherMessage({ type: null, text: '' })

        try {
            const inputCode = voucherCode.trim().toUpperCase()

            const { data: voucher, error } = await supabase
                .from('vouchers')
                .select('*')
                .eq('code', inputCode)
                .maybeSingle()

            if (error) throw error

            if (!voucher) {
                setVoucherMessage({ type: 'error', text: '[ VOUCHER KHÔNG TỒN TẠI ]' })
                return
            }

            if (voucher.is_used) {
                setVoucherMessage({ type: 'error', text: '[ VOUCHER ĐÃ ĐƯỢC SỬ DỤNG TRƯỚC ĐÓ ]' })
                return
            }

            setAppliedVoucher({
                code: inputCode,
                discount: voucher.discount_percent,
                voucherId: voucher.id,
            })
            setVoucherMessage({
                type: 'success',
                text: `[ ĐÃ ÁP DỤNG MÃ GIẢM GIÁ ${voucher.discount_percent}% — NHẤN ADD TO CART ĐỂ XÁC NHẬN ]`
            })

        } catch (err) {
            console.error('Lỗi hệ thống voucher:', err)
            setVoucherMessage({ type: 'error', text: '[ LỖI KẾT NỐI — VUI LÒNG THỬ LẠI ]' })
        } finally {
            setVoucherLoading(false)
        }
    }

    const safePrice = product?.price || 0
    const displayedPrice = appliedVoucher
        ? safePrice - (safePrice * appliedVoucher.discount / 100)
        : safePrice

    const handleLocalAddToCart = async () => {
        if (!product) return

        if (appliedVoucher) {
            const { error: updateError } = await supabase
                .from('vouchers')
                .update({ is_used: true })
                .eq('id', appliedVoucher.voucherId)

            if (updateError) {
                console.error("❌ Lỗi khi cập nhật voucher:", updateError.message)
                setVoucherMessage({ type: 'error', text: '[ LỖI XÁC NHẬN VOUCHER — VUI LÒNG THỬ LẠI ]' })
                return
            }
        }

        addToCart({
            id: String(product.id),
            name: (product.description || 'PRODUCT').toUpperCase(),
            price: `VND ${displayedPrice.toLocaleString()}`,
            priceNumber: displayedPrice,
            image: product.image_url || '',
            size: selectedSize,
            quantity: quantity,
        })

        setVoucherMessage({
            type: 'success',
            text: appliedVoucher
                ? `[ 🎉 THÀNH CÔNG — ĐÃ THÊM VÀO GIỎ HÀNG VỚI MỨC GIẢM ${appliedVoucher.discount}% ]`
                : '[ 🎉 THÀNH CÔNG — ĐÃ THÊM SẢN PHẨM VÀO GIỎ HÀNG ]'
        })

        setAppliedVoucher(null)
        setVoucherCode('')
    }

    if (isLoading) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full min-h-screen pt-32 pb-12 flex flex-col items-center justify-center font-mono text-[10px] tracking-widest text-zinc-600 animate-pulse"
            >
                [ LOADING PRODUCT DETAILS... ]
            </motion.div>
        )
    }

    if (!product) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full min-h-screen pt-32 pb-12 flex flex-col items-center justify-center space-y-4"
            >
                <p className="font-mono text-[10px] tracking-widest text-zinc-500">[ PRODUCT NOT FOUND ]</p>
                <Link href="/store" className="text-xs font-black italic underline tracking-widest text-white">BACK TO STORE</Link>
            </motion.div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full min-h-screen pt-32 pb-24 px-4 md:px-8 selection:bg-white selection:text-black overflow-x-hidden"
        >
            {/* 🧭 NÚT QUAY LẠI */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="mb-12 md:mb-16"
            >
                <Link
                    href="/store"
                    className="group inline-flex items-center space-x-2 text-[11px] font-mono tracking-[0.25em] text-zinc-300 hover:text-white transition-colors duration-300 uppercase"
                >
                    <span className="text-zinc-500 group-hover:text-white transition-colors duration-300 font-bold">+</span>
                    <span className="relative pb-1">
                        RETURN TO GALLERY
                        <span className="absolute left-0 bottom-0 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full"></span>
                    </span>
                </Link>
            </motion.div>

            {/* KHUNG LƯỚI SẢN PHẨM */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center max-w-6xl mx-auto"
            >
                {/* 👕 HÌNH ẢNH SẢN PHẨM */}
                <div className="w-full aspect-square max-w-[90%] mx-auto bg-transparent flex flex-col items-center justify-center relative overflow-hidden">
                    <motion.img
                        whileHover={{ scale: 1.04 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        src={product.image_url || ''}
                        alt={product.description || 'Product Image'}
                        className="w-full h-full object-contain pt-4 px-4 pb-0 filter drop-shadow-[0_0_35px_rgba(236,72,153,0.55)]"
                    />
                </div>

                {/* 📋 THÔNG TIN CHI TIẾT SẢN PHẨM */}
                <div className="flex flex-col space-y-8">
                    <div className="space-y-2">
                        <span className="text-[9px] font-mono tracking-[0.4em] text-zinc-600 block uppercase">
                            // CATEGORY: {product.category || 'UNKNOWN'}
                        </span>
                        <h1 className="text-2xl md:text-3xl font-black italic tracking-widest uppercase text-white leading-tight">
                            {product.description || 'UNTITLED PRODUCT'}
                        </h1>
                        <div className="flex items-center space-x-3 font-mono">
                            {appliedVoucher ? (
                                <>
                                    <p className="text-lg text-white font-bold">VND {displayedPrice.toLocaleString()}</p>
                                    <p className="text-xs text-zinc-600 line-through">VND {safePrice.toLocaleString()}</p>
                                </>
                            ) : (
                                <p className="text-lg text-white">VND {safePrice.toLocaleString()}</p>
                            )}
                        </div>
                    </div>

                    {/* 📏 CHỌN KÍCH CỠ & SIZE CHART */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center max-w-xs">
                            <label className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase block">SELECT SIZE:</label>
                            <button 
                                type="button"
                                onClick={() => setIsOpenSizeChart(true)}
                                className="px-3 py-1 border border-zinc-800 text-[10px] font-mono font-bold tracking-widest text-zinc-400 bg-black hover:bg-white hover:text-black hover:border-white transition-all duration-200 focus:outline-none uppercase"
                            >
                                SIZE CHART
                            </button>
                        </div>
                        <div className="grid grid-cols-4 gap-2 max-w-xs">
                            {['M', 'L', 'XL', 'XXL'].map((size) => (
                                <button
                                    key={size}
                                    type="button"
                                    onClick={() => setSelectedSize(size)}
                                    className={`py-2.5 border text-[11px] font-mono transition-colors ${selectedSize === size
                                        ? 'bg-white text-black border-white font-bold'
                                        : 'bg-black text-white border-zinc-800 hover:border-zinc-500'
                                        }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ⚡ PHẦN CHI TIẾT & BẢO QUẢN SẢN PHẨM ĐƯỢC THÊM VÀO ĐÂY ⚡ */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-sm pt-4 border-t border-zinc-900 font-mono text-[10px] tracking-wider text-zinc-400 leading-relaxed">
                        {/* Khối Chi tiết */}
                        <div className="space-y-2">
                            <p className="text-white font-bold text-[9px] tracking-widest uppercase">// PRODUCT DETAILS</p>
                            <ul className="space-y-1 list-none pl-0">
                                <li className="flex items-start"><span className="text-zinc-600 mr-1.5">•</span> VẢI MESH HAI LỚP DÀY DẶN.</li>
                                <li className="flex items-start"><span className="text-zinc-600 mr-1.5">•</span> KẾT CẤU LƯỚI THOÁNG KHÍ.</li>
                                <li className="flex items-start"><span className="text-zinc-600 mr-1.5">•</span> TÚI HAI BÊN SÂU VÀ TIỆN DỤNG.</li>
                            </ul>
                        </div>

                        {/* Khối Bảo quản */}
                        <div className="space-y-2">
                            <p className="text-white font-bold text-[9px] tracking-widest uppercase">// CARE INSTRUCTIONS</p>
                            <ul className="space-y-1 list-none pl-0">
                                <li className="flex items-start"><span className="text-zinc-600 mr-1.5">•</span> GIẠT LẠNH.</li>
                                <li className="flex items-start"><span className="text-zinc-600 mr-1.5">•</span> KHÔNG TẨY.</li>
                                <li className="flex items-start"><span className="text-zinc-600 mr-1.5">•</span> PHƠI TỰ NHIÊN.</li>
                            </ul>
                        </div>
                    </div>

                    {/* 🔢 SỐ LƯỢNG MUA */}
                    <div className="space-y-3 pt-2 border-t border-zinc-900">
                        <label className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase block">QUANTITY:</label>
                        <div className="flex items-center border border-zinc-800 w-32 bg-black">
                            <button
                                type="button"
                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                className="w-10 py-2 text-xs font-mono text-zinc-400 hover:text-white border-r border-zinc-900 focus:outline-none"
                            >
                                -
                            </button>
                            <span className="flex-1 text-center font-mono text-xs text-white">{quantity}</span>
                            <button
                                type="button"
                                onClick={() => setQuantity(q => q + 1)}
                                className="w-10 py-2 text-xs font-mono text-zinc-400 hover:text-white border-l border-zinc-900 focus:outline-none"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* 🎫 Ô NHẬP VOUCHER */}
                    <div className="space-y-3 max-w-sm pt-2 border-t border-zinc-900">
                        <label className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase block">// PROMO CODE:</label>
                        <form onSubmit={handleApplyVoucher} className="flex border border-zinc-800 h-11 bg-zinc-950">
                            <input
                                type="text"
                                placeholder="ENTER VOUCHER"
                                value={voucherCode}
                                disabled={!!appliedVoucher}
                                onChange={(e) => setVoucherCode(e.target.value)}
                                className="flex-1 bg-transparent px-3 text-xs font-mono focus:outline-none tracking-widest text-white placeholder-zinc-700"
                            />
                            <button
                                type="submit"
                                disabled={voucherLoading || !!appliedVoucher}
                                className="bg-white text-black text-[10px] font-mono font-bold px-5 uppercase hover:bg-zinc-200 transition-colors focus:outline-none disabled:opacity-50"
                            >
                                {voucherLoading ? '...' : 'APPLY'}
                            </button>
                        </form>

                        <AnimatePresence mode="wait">
                            {voucherMessage.text && (
                                <motion.p
                                    key={voucherMessage.text}
                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                    animate={{ opacity: 1, height: 'auto', marginTop: 6 }}
                                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className={`text-[9px] font-mono tracking-wider uppercase font-bold overflow-hidden ${voucherMessage.type === 'success' ? 'text-green-500' : 'text-red-500'}`}
                                >
                                    {voucherMessage.text}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* 🛒 NÚT ĐẶT HÀNG */}
                    <div>
                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            onClick={handleLocalAddToCart}
                            className="w-full max-w-sm bg-white text-black py-4 text-[11px] font-black italic tracking-widest uppercase hover:bg-zinc-200 transition-colors duration-300 mt-2"
                        >
                            ADD TO CART {appliedVoucher && `(VND ${(displayedPrice * quantity).toLocaleString()})`}
                        </motion.button>
                    </div>
                </div>
            </motion.div>

            {/* 💻 POPUP MODAL SIZE CHART */}
            <AnimatePresence>
                {isOpenSizeChart && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpenSizeChart(false)}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 selection:bg-white selection:text-black"
                    >
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", duration: 0.5 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-zinc-950 border border-zinc-800 w-full max-w-2xl p-6 md:p-8 space-y-6 relative text-white font-mono text-xs tracking-wider"
                        >
                            {/* Nút Close */}
                            <button 
                                onClick={() => setIsOpenSizeChart(false)}
                                className="absolute top-4 right-4 text-zinc-500 hover:text-white font-bold text-sm focus:outline-none"
                            >
                                [ X ]
                            </button>

                            <div className="border-b border-zinc-900 pb-2">
                                <h3 className="text-sm font-black tracking-[0.2em] uppercase">// PRODUCT SIZE SPECIFICATIONS</h3>
                            </div>

                            {/* Grid chứa 2 bảng thông số */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Bảng 1: Kích thước sản phẩm */}
                                <div className="space-y-2">
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase">// CLOTHING MEASUREMENTS (cm)</p>
                                    <div className="border border-zinc-900 overflow-hidden">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-zinc-900 bg-zinc-900/40 text-[10px] text-zinc-400">
                                                    <th className="p-2 font-bold">SIZE</th>
                                                    <th className="p-2 font-bold">WIDTH</th>
                                                    <th className="p-2 font-bold">LENGTH</th>
                                                    <th className="p-2 font-bold">BOTTOM</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="border-b border-zinc-900 hover:bg-zinc-900/20">
                                                    <td className="p-2 font-bold text-white">M</td>
                                                    <td className="p-2 text-zinc-300">33 - 50</td>
                                                    <td className="p-2 text-zinc-300">46</td>
                                                    <td className="p-2 text-zinc-300">31</td>
                                                </tr>
                                                <tr className="border-b border-zinc-900 hover:bg-zinc-900/20">
                                                    <td className="p-2 font-bold text-white">L</td>
                                                    <td className="p-2 text-zinc-300">35 - 52</td>
                                                    <td className="p-2 text-zinc-300">48</td>
                                                    <td className="p-2 text-zinc-300">33</td>
                                                </tr>
                                                <tr className="border-b border-zinc-900 hover:bg-zinc-900/20">
                                                    <td className="p-2 font-bold text-white">XL</td>
                                                    <td className="p-2 text-zinc-300">37 - 54</td>
                                                    <td className="p-2 text-zinc-300">50</td>
                                                    <td className="p-2 text-zinc-300">35</td>
                                                </tr>
                                                <tr className="hover:bg-zinc-900/20">
                                                    <td className="p-2 font-bold text-white">XXL</td>
                                                    <td className="p-2 text-zinc-300">39 - 56</td>
                                                    <td className="p-2 text-zinc-300">52</td>
                                                    <td className="p-2 text-zinc-300">37</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Bảng 2: Gợi ý theo Chiều cao/Cân nặng */}
                                <div className="space-y-2">
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase">// BODY RECOMMENDATIONS</p>
                                    <div className="border border-zinc-900 overflow-hidden">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-zinc-900 bg-zinc-900/40 text-[10px] text-zinc-400">
                                                    <th className="p-2 font-bold">SIZE</th>
                                                    <th className="p-2 font-bold">HEIGHT (cm)</th>
                                                    <th className="p-2 font-bold">WEIGHT (kg)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="border-b border-zinc-900 hover:bg-zinc-900/20">
                                                    <td className="p-2 font-bold text-white">M</td>
                                                    <td className="p-2 text-zinc-300">163 - 169</td>
                                                    <td className="p-2 text-zinc-300">55 - 64</td>
                                                </tr>
                                                <tr className="border-b border-zinc-900 hover:bg-zinc-900/20">
                                                    <td className="p-2 font-bold text-white">L</td>
                                                    <td className="p-2 text-zinc-300">170 - 176</td>
                                                    <td className="p-2 text-zinc-300">65 - 74</td>
                                                </tr>
                                                <tr className="border-b border-zinc-900 hover:bg-zinc-900/20">
                                                    <td className="p-2 font-bold text-white">XL</td>
                                                    <td className="p-2 text-zinc-300">177 - 183</td>
                                                    <td className="p-2 text-zinc-300">75 - 84</td>
                                                </tr>
                                                <tr className="hover:bg-zinc-900/20">
                                                    <td className="p-2 font-bold text-white">XXL</td>
                                                    <td className="p-2 text-zinc-300">184 - 190</td>
                                                    <td className="p-2 text-zinc-300">85 - 95</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Khối Minh Họa Vẽ lại chiếc quần bằng SVG thuần */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-zinc-900">
                                <div className="w-32 h-32 flex-shrink-0 bg-zinc-900/30 p-2 border border-zinc-900 rounded">
                                    <svg viewBox="0 0 100 100" className="w-full h-full stroke-zinc-500 fill-none stroke-1">
                                        {/* Cạp quần */}
                                        <path d="M 25,25 Q 50,28 75,25 L 72,32 Q 50,35 28,32 Z" className="stroke-zinc-400" />
                                        {/* Thân quần & Ống quần */}
                                        <path d="M 25,25 L 15,80 L 45,85 L 50,60 L 55,85 L 85,80 L 75,25" />
                                        {/* Đường chỉ trang trí nhẹ */}
                                        <path d="M 15,80 Q 30,82 45,85 M 55,85 Q 70,82 85,80" className="stroke-zinc-600 stroke-dashed" />
                                        {/* Label Text chỉ hướng mô phỏng */}
                                        <text x="50" y="21" textAnchor="middle" className="fill-zinc-500 text-[6px] font-sans">WIDTH</text>
                                        <text x="86" y="55" textAnchor="middle" className="fill-zinc-500 text-[6px] font-sans" transform="rotate(78, 86, 55)">LENGTH</text>
                                        <text x="30" y="93" textAnchor="middle" className="fill-zinc-500 text-[6px] font-sans">BOTTOM</text>
                                        {/* Mũi tên định hướng nhỏ */}
                                        <path d="M 25,15 L 75,15 M 25,15 L 29,12 M 25,15 L 29,18 M 75,15 L 71,12 M 75,15 L 71,18" className="stroke-zinc-600" />
                                    </svg>
                                </div>
                                <div className="flex-1 text-[10px] text-zinc-500 space-y-1">
                                    <p className="text-zinc-400 font-bold">* NOTE:</p>
                                    <p>Bảng size mang tính chất tham khảo dựa trên form dáng tiêu chuẩn.</p>
                                    <p>Vui lòng liên hệ trực tiếp với shop để được hỗ trợ tư vấn số đo chính xác nhất theo trạng thái cơ thể của bạn.</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}