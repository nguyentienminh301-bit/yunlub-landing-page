'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import { useCart } from '../CartProvider' // Import kho hàng chung

interface ProductFromSupabase {
    id: number
    price: number
    image_url: string
    description: string
    category: string
}

export default function ProductDetailPage() {
    const { id } = useParams()
    const { addToCart } = useCart() // Gọi hàm thêm vào giỏ chung từ Layout bọc ngoài
    
    const [product, setProduct] = useState<ProductFromSupabase | null>(null)
    const [selectedSize, setSelectedSize] = useState('M')
    const [quantity, setQuantity] = useState(1)
    const [isLoading, setIsLoading] = useState(true)

    // --- State xử lý hệ thống Voucher độc quyền ---
    const [voucherCode, setVoucherCode] = useState('')
    const [voucherLoading, setVoucherLoading] = useState(false)
    const [voucherMessage, setVoucherMessage] = useState<{ type: 'success' | 'error' | null; text: string }>({ type: null, text: '' })
    const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discount: number } | null>(null)

    useEffect(() => {
        if (!id) return
        const fetchProductDetail = async () => {
            try {
                setIsLoading(true)
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .eq('id', id)
                    .single()
                
                if (error) throw error
                if (data) setProduct(data)
            } catch (err) {
                console.error('Lỗi khi tải chi tiết sản phẩm:', err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchProductDetail()
    }, [id])

    // 🎫 HÀM KIỂM TRA VÀ ÁP DỤNG VOUCHER GIẢM GIÁ
    const handleApplyVoucher = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!voucherCode.trim() || voucherLoading || !product) return

        setVoucherLoading(true)
        setVoucherMessage({ type: null, text: '' })

        try {
            const inputCode = voucherCode.trim().toUpperCase() // Tự động viết hoa để đối chiếu chính xác

            // Thực hiện quét tìm mã Voucher trên bảng dữ liệu của Supabase
            const { data: voucher, error } = await supabase
                .from('vouchers')
                .select('*')
                .eq('code', inputCode)
                .maybeSingle()

            if (error) throw error

            // 1. Kiểm tra mã tồn tại
            if (!voucher) {
                setVoucherMessage({ type: 'error', text: '[ VOUCHER KHÔNG TỒN TẠI ]' })
                return
            }

            // 2. Kiểm tra trạng thái đã sử dụng (Chặn dùng lại lần 2)
            if (voucher.is_used) {
                setVoucherMessage({ type: 'error', text: '[ VOUCHER ĐÃ ĐƯỢC SỬ DỤNG TRƯỚC ĐÓ ]' })
                return
            }

            // 3. Khớp thành công -> Lưu thông tin giảm giá vào State hiển thị công khai
            setAppliedVoucher({ code: inputCode, discount: voucher.discount_percent })
            setVoucherMessage({ type: 'success', text: `[ ĐÀ SỬ DỤNG MÃ GIẢM GIÁ ${voucher.discount_percent}% ]` })

        } catch (err) {
            console.error('Lỗi hệ thống voucher:', err)
            setVoucherMessage({ type: 'error', text: '[ LỖI KẾT NỐI — VUI LÒNG THỬ LẠI ]' })
        } finally {
            setVoucherLoading(false)
        }
    }

    // 🛒 HÀM THÊM VÀO GIỎ HÀNG VÀ UPDATE TRẠNG THÁI VOUCHER LÊN SUPABASE
    const handleLocalAddToCart = async () => {
        if (!product) return

        // Tính toán lại giá trị cuối cùng dựa trên việc có voucher hay không
        const finalPrice = appliedVoucher 
            ? product.price - (product.price * appliedVoucher.discount / 100)
            : product.price

        // 🔏 Nếu có dùng voucher thành công -> Tiến hành khóa mã này lại trên Database ngay lập tức
        if (appliedVoucher) {
            try {
                const { error } = await supabase
                    .from('vouchers')
                    .update({ is_used: true }) // Đổi trạng thái từ false sang true
                    .eq('code', appliedVoucher.code)

                if (error) throw error
            } catch (err) {
                console.error('Lỗi khi cập nhật trạng thái voucher:', err)
                // Đưa thông báo lỗi đồng bộ lên giao diện thay vì gọi alert lỗi
                setVoucherMessage({ type: 'error', text: '[ LỖI KẾT NỐI — CHƯA THỂ ÁP DỤNG VOUCHER ]' })
                return
            }
        }

        // Đẩy thông tin sản phẩm (kèm giá đã giảm nếu có) lên giỏ hàng chung
        addToCart({
            id: String(product.id),
            name: (product.description || 'PRODUCT').toUpperCase(),
            price: `VND ${finalPrice.toLocaleString()}`,
            priceNumber: finalPrice,
            image: product.image_url,
            size: selectedSize,
            quantity: quantity
        })

        // 🔥 ĐỒNG BỘ HIỂN THỊ TRẠNG THÁI THÀNH CÔNG LÊN GIAO DIỆN (Xóa bỏ hoàn toàn alert)
        setVoucherMessage({
            type: 'success',
            text: appliedVoucher
                ? `[ 🎉 THÀNH CÔNG — ĐÃ THÊM VÀO GIỎ HÀNG VỚI MỨC GIẢM ${appliedVoucher.discount}% ]`
                : '[ 🎉 THÀNH CÔNG — ĐÃ THÊM SẢN PHẨM VÀO GIỎ HÀNG ]'
        })

        // Reset lại ô nhập để chuẩn bị cho lượt nhập khác (nếu cần) nhưng vẫn giữ dòng text thành công hiển thị
        setAppliedVoucher(null)
        setVoucherCode('')
    }

    if (isLoading) {
        return (
            <div className="w-full h-96 flex items-center justify-center font-mono text-[10px] tracking-widest text-zinc-600 animate-pulse">
                [ LOADING PRODUCT DETAILS... ]
            </div>
        )
    }

    if (!product) {
        return (
            <div className="w-full h-96 flex flex-col items-center justify-center space-y-4">
                <p className="font-mono text-[10px] tracking-widest text-zinc-500">[ PRODUCT NOT FOUND ]</p>
                <Link href="/store" className="text-xs font-black italic underline tracking-widest text-white">BACK TO STORE</Link>
            </div>
        )
    }

    // Giá hiển thị động trên màn hình giao diện
    const displayedPrice = appliedVoucher
        ? product.price - (product.price * appliedVoucher.discount / 100)
        : product.price

    return (
        <div className="w-full pt-4 selection:bg-white selection:text-black">
            
            {/* 🧭 NÚT QUAY LẠI TRANG CHỦ STORE */}
            <div className="mb-12 md:mb-16">
                <Link 
                    href="/store" 
                    className="group inline-flex items-center space-x-2 text-[11px] font-mono tracking-[0.25em] text-zinc-300 hover:text-white transition-colors duration-300 uppercase"
                >
                    <span className="text-zinc-500 group-hover:text-white transition-colors duration-300 font-bold">
                        +
                    </span>
                    <span className="relative pb-1">
                        RETURN TO GALLERY
                        <span className="absolute left-0 bottom-0 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full"></span>
                    </span>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
                
                {/* 👕 HÌNH ẢNH SẢN PHẨM CÓ EFFECT PINK GLOW */}
                <div className="w-full aspect-square max-w-[90%] mx-auto bg-transparent flex flex-col items-center justify-center relative overflow-hidden">
                    <img 
                        src={product.image_url} 
                        alt={product.description} 
                        className="w-full h-full object-contain pt-4 px-4 pb-0 filter drop-shadow-[0_0_35px_rgba(236,72,153,0.55)] group-hover:scale-[1.04] transition-all duration-500 ease-out"
                    />
                </div>

                {/* 📋 THÔNG TIN CHI TIẾT SẢN PHẨM */}
                <div className="flex flex-col space-y-8">
                    <div className="space-y-2">
                        <span className="text-[9px] font-mono tracking-[0.4em] text-zinc-600 block uppercase">// CATEGORY: {product.category}</span>
                        <h1 className="text-2xl md:text-3xl font-black italic tracking-widest uppercase text-white leading-tight">
                            {product.description}
                        </h1>
                        <div className="flex items-center space-x-3 font-mono">
                            {appliedVoucher ? (
                                <>
                                    <p className="text-lg text-white font-bold">VND {displayedPrice.toLocaleString()}</p>
                                    <p className="text-xs text-zinc-600 line-through">VND {product.price.toLocaleString()}</p>
                                </>
                            ) : (
                                <p className="text-lg text-zinc-400">VND {product.price?.toLocaleString()}</p>
                            )}
                        </div>
                    </div>

                    {/* 📏 CHỌN KÍCH CỠ */}
                    <div className="space-y-3">
                        <label className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase block">SELECT SIZE:</label>
                        <div className="grid grid-cols-4 gap-2 max-w-xs">
                            {['S', 'M', 'L', 'XL'].map((size) => (
                                <button
                                    key={size}
                                    type="button"
                                    onClick={() => setSelectedSize(size)}
                                    className={`py-2.5 border text-[11px] font-mono transition-colors ${
                                        selectedSize === size
                                            ? 'bg-white text-black border-white font-bold'
                                            : 'bg-black text-white border-zinc-800 hover:border-zinc-500'
                                    }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 🔢 SỐ LƯỢNG MUA */}
                    <div className="space-y-3">
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

                    {/* 🎫 Ô NHẬP VOUCHER ĐỘC QUYỀN */}
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
                                className="bg-white text-black text-[10px] font-mono font-bold px-5 uppercase hover:bg-zinc-200 transition-colors focus:outline-none"
                            >
                                {voucherLoading ? '...' : 'APPLY'}
                            </button>
                        </form>

                        {/* HIỂN THỊ DÒNG THÔNG BÁO CHỮ MÀU XANH / ĐỎ ĐỒNG BỘ */}
                        {voucherMessage.text && (
                            <p className={`text-[9px] font-mono tracking-wider uppercase font-bold mt-1.5 ${
                                voucherMessage.type === 'success' ? 'text-green-500' : 'text-red-500'
                            }`}>
                                {voucherMessage.text}
                            </p>
                        )}
                    </div>

                    {/* 🛒 NÚT ĐẶT HÀNG */}
                    <button
                        type="button"
                        onClick={handleLocalAddToCart}
                        className="w-full max-w-sm bg-white text-black py-4 text-[11px] font-black italic tracking-widest uppercase hover:bg-zinc-200 transition-colors duration-300"
                    >
                        ADD TO CART {appliedVoucher && `(VND ${(displayedPrice * quantity).toLocaleString()})`}
                    </button>
                </div>

            </div>
        </div>
    )
}