'use client'

import React, { useState, useEffect } from 'react'
import { useCart } from '../CartProvider'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion' // Thêm import này

export default function CheckoutPage() {
    const router = useRouter()
    const { cartItems, totalCartPrice, clearCart } = useCart()
    const [isMounted, setIsMounted] = useState(false)
    const [loading, setLoading] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    
    const [bankAccounts, setBankAccounts] = useState<any[]>([]);
    const [orderFinalTotal, setOrderFinalTotal] = useState(0);

    const [info, setInfo] = useState({ fullName: '', phone: '', address: '', note: '' })
    const [paymentMethod, setPaymentMethod] = useState<'COD' | 'BANK'>('COD')

    const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
        show: false,
        message: '',
        type: 'success'
    })

    useEffect(() => {
        const fetchBankAccounts = async () => {
            const { data, error } = await supabase
                .from('bank_accounts')
                .select('*');

            if (data) setBankAccounts(data);
            if (error) console.error("Không thể tải thông tin ngân hàng:", error);
        };
        fetchBankAccounts();
        setIsMounted(true);
    }, []);

    const showNotification = (message: string, type: 'success' | 'error') => {
        setToast({ show: true, message, type })
    }

    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => {
                setToast(prev => ({ ...prev, show: false }))
            }, 4000)
            return () => clearTimeout(timer)
        }
    }, [toast.show])

    if (!isMounted) return null

    const currentTotal = cartItems.reduce((total, item) => total + (item.priceNumber * item.quantity), 0)

    const handleSubmitOrder = async (e: React.FormEvent) => {
        e.preventDefault()
        if (cartItems.length === 0) {
            showNotification('GIỎ HÀNG CỦA BẠN ĐANG TRỐNG!', 'error')
            return
        }

        setLoading(true)
        try {
            const orderPayload = {
                full_name: (info.fullName || '').trim().toUpperCase(),
                phone: (info.phone || '').trim(),
                address: (info.address || '').trim().toUpperCase(),
                note: (info.note || '').trim().toUpperCase(),
                total_amount: currentTotal,
                payment_method: paymentMethod, 
                status: paymentMethod === 'COD' ? 'PENDING_COD' : 'PENDING_TRANSFER',
                items: cartItems,
                created_at: new Date().toISOString()
            }

            const { data, error } = await supabase
                .from('orders')
                .insert([orderPayload])
                .select() 

            if (error) {
                console.error("Supabase Error:", error)
                throw error
            }

            setOrderFinalTotal(currentTotal);
            setShowSuccess(true)
            clearCart()
            
        } catch (error) {
            console.error("Lỗi khi xử lý đơn hàng:", error)
            showNotification('CÓ LỖI XẢY RA. VUI LÒNG THỬ LẠI!', 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-12 font-mono uppercase tracking-widest text-[11px] selection:bg-white selection:text-black relative overflow-x-hidden">
            <AnimatePresence mode="wait">
                {/* ==================== SCREEN 1: MÀN HÌNH ĐẶT HÀNG THÀNH CÔNG ==================== */}
                {showSuccess ? (
                    <motion.div 
                        key="success-screen"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="fixed inset-0 z-40 bg-black flex items-center justify-center p-4"
                    >
                        <div className="w-full max-w-md bg-zinc-950 border border-emerald-500/30 p-8 text-center shadow-[0_0_50px_rgba(16,185,129,0.08)]">
                            <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto mb-6 relative"
                            >
                                <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-emerald-500/20 opacity-75"></span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </motion.div>
                            <h3 className="text-sm font-mono tracking-[0.3em] text-emerald-400 uppercase mb-2">// ORDER SUCCESSFUL</h3>
                            <p className="text-[11px] font-black italic tracking-widest text-zinc-300 mb-6 uppercase">
                                CẢM ƠN BẠN ĐÃ ĐẶT HÀNG TẠI YUNLUB GALLERY!
                            </p>
                            <div className="bg-black border border-zinc-900 p-4 mb-6 font-mono text-left space-y-2 text-[10px]">
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">METHOD:</span>
                                    <span className="text-white font-bold">{paymentMethod === 'COD' ? 'COD (TIỀN MẶT)' : 'CHUYỂN KHOẢN TEAM'}</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-zinc-900">
                                    <span className="text-zinc-500">TOTAL:</span>
                                    <span className="text-white font-bold">VND {orderFinalTotal.toLocaleString()}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => router.push('/store')}
                                className="w-full bg-emerald-500 text-black py-3 text-[11px] font-black italic tracking-widest uppercase hover:bg-emerald-400 transition-colors"
                            >
                                CONTINUE SHOPPING
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    /* ==================== SCREEN 2: GIAO DIỆN FORM CHECKOUT CHÍNH ==================== */
                    <motion.div 
                        key="checkout-screen"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                    >
                        {/* NÚT BACK TO STORE TOP-LEFT */}
                        <div className="max-w-6xl mx-auto text-[10px] tracking-widest text-zinc-500 uppercase mb-4">
                            <button onClick={() => router.push('/store')} className="hover:text-white transition-colors">
                                [ ← BACK TO STORE ]
                            </button>
                        </div>

                        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 pt-4">
                            {/* 📝 CỘT TRÁI: FORM THÔNG TIN & PHƯƠNG THỨC THANH TOÁN */}
                            <div className="lg:col-span-7 space-y-8">
                                <div className="border-b border-zinc-900 pb-4">
                                    <h1 className="text-sm font-black tracking-[0.2em]">// CHECKOUT INFORMATION</h1>
                                </div>

                                <form id="main-checkout-form" onSubmit={handleSubmitOrder} className="space-y-4">
                                    {/* Các input fields giữ nguyên */}
                                    <div className="flex flex-col space-y-2">
                                        <label className="text-[9px] text-zinc-500 tracking-widest">FULL NAME *</label>
                                        <input type="text" required value={info.fullName} onChange={e => setInfo(p => ({ ...p, fullName: e.target.value }))} placeholder="NGUYEN VAN A" className="bg-zinc-950 border border-zinc-900 p-3 text-xs text-white uppercase focus:outline-none focus:border-zinc-500 transition-colors" />
                                    </div>
                                    <div className="flex flex-col space-y-2">
                                        <label className="text-[9px] text-zinc-500 tracking-widest">PHONE NUMBER *</label>
                                        <input type="text" required value={info.phone} onChange={e => setInfo(p => ({ ...p, phone: e.target.value }))} placeholder="0901234567" className="bg-zinc-950 border border-zinc-900 p-3 text-xs text-white focus:outline-none focus:border-zinc-500 transition-colors" />
                                    </div>
                                    <div className="flex flex-col space-y-2">
                                        <label className="text-[9px] text-zinc-500 tracking-widest">SHIPPING ADDRESS *</label>
                                        <input type="text" required value={info.address} onChange={e => setInfo(p => ({ ...p, address: e.target.value }))} placeholder="SO 1 LY TU TRONG, QUAN 1, HCMC" className="bg-zinc-950 border border-zinc-900 p-3 text-xs text-white uppercase focus:outline-none focus:border-zinc-500 transition-colors" />
                                    </div>
                                    <div className="flex flex-col space-y-2">
                                        <label className="text-[9px] text-zinc-500 tracking-widest">ORDER NOTE (OPTIONAL)</label>
                                        <textarea rows={3} value={info.note} onChange={e => setInfo(p => ({ ...p, note: e.target.value }))} placeholder="GIAO GIO HANH CHINH..." className="bg-zinc-950 border border-zinc-900 p-3 text-xs text-white uppercase focus:outline-none focus:border-zinc-500 transition-colors resize-none" />
                                    </div>

                                    {/* CHỌN PHƯƠNG THỨC THANH TOÁN */}
                                    <div className="pt-6 space-y-3">
                                        <h3 className="text-[9px] text-zinc-400 tracking-[0.2em]">// SELECT PAYMENT METHOD</h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Option 1: COD */}
                                            <div
                                                onClick={() => setPaymentMethod('COD')}
                                                className={`p-4 border cursor-pointer transition-all flex items-center justify-between ${paymentMethod === 'COD' ? 'border-white bg-zinc-900/40' : 'border-zinc-900 bg-black hover:border-zinc-700'}`}
                                            >
                                                <div>
                                                    <p className="text-white font-black italic">CASH ON DELIVERY</p>
                                                    <p className="text-[9px] text-zinc-500 lowercase normal-case">Thanh toán bằng tiền mặt khi nhận đồ</p>
                                                </div>
                                                <div className={`w-3 h-3 rounded-full border flex items-center justify-center transition-colors duration-300 ${paymentMethod === 'COD' ? 'border-white bg-white' : 'border-zinc-700'}`}></div>
                                            </div>

                                            {/* Option 2: Bank Transfer */}
                                            <div
                                                onClick={() => setPaymentMethod('BANK')}
                                                className={`p-4 border cursor-pointer transition-all flex items-center justify-between ${paymentMethod === 'BANK' ? 'border-white bg-zinc-900/40' : 'border-zinc-900 bg-black hover:border-zinc-700'}`}
                                            >
                                                <div>
                                                    <p className="text-white font-black italic">BANK TRANSFER</p>
                                                    <p className="text-[9px] text-zinc-500 lowercase normal-case">Chuyển khoản qua tài khoản team</p>
                                                </div>
                                                <div className={`w-3 h-3 rounded-full border flex items-center justify-center transition-colors duration-300 ${paymentMethod === 'BANK' ? 'border-white bg-white' : 'border-zinc-700'}`}></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ĐOẠN HIỂN THỊ SỐ TÀI KHOẢN (Đã thêm animation trượt) */}
                                    <AnimatePresence>
                                        {paymentMethod === 'BANK' && (
                                            <motion.div 
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                                className="overflow-hidden"
                                            >
                                                <div className="p-4 bg-zinc-950 border border-zinc-900 space-y-4 mt-4 text-[10px]">
                                                    <p className="text-zinc-400 leading-relaxed font-sans normal-case text-xs">
                                                        Vui lòng quét mã QR hoặc chuyển khoản chính xác số tiền vào tài khoản bên dưới:
                                                    </p>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                                        {bankAccounts.map((account, i) => (
                                                            <div key={i} className="bg-black p-3 border border-zinc-900 space-y-3 hover:border-zinc-700 transition-colors">
                                                                <div className="bg-white p-2 w-full aspect-square">
                                                                    <img
                                                                        src={`https://img.vietqr.io/image/${account.bank_code}-${account.account_number}-compact2.png?amount=${currentTotal}&addInfo=YUNLUB ${info.phone || 'DONHANG'}&accountName=${encodeURIComponent(account.account_owner)}`}
                                                                        alt="QR Payment"
                                                                        className="w-full h-full object-contain"
                                                                    />
                                                                </div>

                                                                <div className="space-y-1">
                                                                    <p className="text-zinc-500 tracking-wider text-[9px]">{account.bank_name}</p>
                                                                    <p className="text-white font-black font-mono text-xs">{account.account_number}</p>
                                                                    <p className="text-zinc-400 font-mono">CTK: {account.account_owner}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="border-t border-zinc-900/60 pt-3">
                                                        <p className="text-zinc-400 font-sans text-xs normal-case">
                                                            Nội dung chuyển khoản (Tự động điền): <br />
                                                            <span className="font-mono bg-white text-black px-2 py-0.5 font-bold uppercase inline-block mt-1">
                                                                YUNLUB {info.phone ? info.phone.trim() : 'SĐT CỦA BẠN'}
                                                            </span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </form>
                            </div>

                            {/* 🛒 CỘT PHẢI: TÓM TẮT ĐƠN HÀNG */}
                            <div className="lg:col-span-5">
                                <div className="bg-zinc-950 border border-zinc-900 p-6 sticky top-6 space-y-6">
                                    <div className="border-b border-zinc-900 pb-3">
                                        <h2 className="text-xs font-black tracking-widest">// YOUR ORDER</h2>
                                    </div>

                                    {/* Danh sách sản phẩm thu nhỏ (Đã thêm stagger animation) */}
                                    <div className="max-h-[260px] overflow-y-auto space-y-3 pr-2 scrollbar-none overflow-x-hidden">
                                        <AnimatePresence>
                                            {cartItems.length > 0 ? (
                                                cartItems.map((item, index) => (
                                                    <motion.div 
                                                        key={`${item.name}-${item.size}-${index}`}
                                                        initial={{ opacity: 0, x: 20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, scale: 0.9 }}
                                                        transition={{ delay: index * 0.1, duration: 0.3 }}
                                                        className="flex gap-4 items-center justify-between bg-black/40 p-2 border border-zinc-900/60"
                                                    >
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className="w-12 h-14 bg-zinc-900 shrink-0 border border-zinc-800 overflow-hidden">
                                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-white font-bold text-[10px] truncate uppercase">{item.name}</p>
                                                                <p className="text-[9px] text-zinc-500">SIZE: {item.size} × {item.quantity}</p>
                                                            </div>
                                                        </div>
                                                        <p className="text-white text-[10px] text-right shrink-0">{(item.priceNumber * item.quantity).toLocaleString()} VND</p>
                                                    </motion.div>
                                                ))
                                            ) : (
                                                <motion.p 
                                                    initial={{ opacity: 0 }} 
                                                    animate={{ opacity: 1 }} 
                                                    className="text-zinc-600 text-center py-4"
                                                >
                                                    [ NO ITEMS IN CART ]
                                                </motion.p>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <div className="border-t border-zinc-900 pt-4 space-y-2">
                                        <div className="flex justify-between text-zinc-500 text-[10px]">
                                            <span>SHIPPING:</span>
                                            <span className="text-emerald-500 font-bold tracking-widest">FREE SHIPPING</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs border-t border-zinc-900 pt-3">
                                            <span className="text-zinc-400">TOTAL AMOUNT:</span>
                                            <span className="text-white font-black text-sm">VND {currentTotal.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        form="main-checkout-form"
                                        disabled={loading || cartItems.length === 0}
                                        className={`w-full py-4 font-black italic tracking-widest text-[11px] uppercase transition-colors relative overflow-hidden group ${loading ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-white text-black hover:bg-zinc-200'}`}
                                    >
                                        <span className="relative z-10">{loading ? 'PROCESSING...' : 'PLACE ORDER'}</span>
                                        {/* Hiệu ứng trượt nền nhỏ cho nút button */}
                                        {!loading && <div className="absolute inset-0 bg-emerald-400 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 -z-0"></div>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Custom Toast Notification (Giữ nguyên) */}
            {toast.show && (
                <div className="fixed bottom-6 right-6 z-50 animate-slide-in-right">
                   {/* ... Code Toast của bạn giữ nguyên ... */}
                </div>
            )}
        </div>
    )
}