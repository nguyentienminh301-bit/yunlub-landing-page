'use client'

import React, { useState, useEffect } from 'react'
import { useCart } from '../CartProvider' // Hãy điều chỉnh đường dẫn chuẩn đến file CartProvider của bạn
import { supabase } from '../../lib/supabase'

export default function CheckoutPage() {
    const { cartItems, totalCartPrice, clearCart } = useCart()
    const [isMounted, setIsMounted] = useState(false)
    const [loading, setLoading] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    
    // State form thông tin
    const [info, setInfo] = useState({ fullName: '', phone: '', address: '', note: '' })
    // State chọn phương thức thanh toán ('COD' hoặc 'BANK')
    const [paymentMethod, setPaymentMethod] = useState<'COD' | 'BANK'>('COD')

    // Thông tin tài khoản các thành viên trong team của bạn
    const teamBankAccounts = [
        { owner: 'NGUYEN VAN A', bank: 'MB BANK (NGÂN HÀNG QUÂN ĐỘI)', number: '123456789999' },
        { owner: 'TRAN THI B', bank: 'VIETCOMBANK', number: '0011002233445' }
    ]

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) return null

    // Tính toán tổng tiền giỏ hàng từ context
    const currentTotal = cartItems.reduce((total, item) => total + (item.priceNumber * item.quantity), 0)

    const handleSubmitOrder = async (e: React.FormEvent) => {
        e.preventDefault()
        if (cartItems.length === 0) {
            alert('Giỏ hàng của bạn đang trống!')
            return
        }

        setLoading(true)
        try {
            const orderPayload = {
                full_name: (info.fullName || '').trim().toUpperCase(),
                phone: (info.phone || '').trim(),
                address: (info.address || '').trim().toUpperCase(),
                note: (info.note || '').trim().toUpperCase(),
                items: cartItems, 
                total_amount: currentTotal,
                payment_method: paymentMethod, // Đẩy phương thức thanh toán lên database
                status: paymentMethod === 'COD' ? 'PENDING_COD' : 'PENDING_TRANSFER'
            }

            const { error } = await supabase.from('orders').insert([orderPayload])
            if (error) throw error

            setShowSuccess(true)
            clearCart()
        } catch (error) {
            console.error(error)
            alert('Có lỗi xảy ra trong quá trình xử lý đơn hàng.')
        } finally {
            setLoading(false)
        }
    }

    if (showSuccess) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 selection:bg-white selection:text-black">
                <div className="w-full max-w-md bg-zinc-950 border border-emerald-500/30 p-8 text-center shadow-[0_0_50px_rgba(16,185,129,0.1)]">
                    <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                    </div>
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
                            <span className="text-white font-bold">VND {currentTotal.toLocaleString()}</span>
                        </div>
                    </div>
                    <button onClick={() => window.location.href = '/'} className="w-full bg-emerald-500 text-black py-3 text-[11px] font-black italic tracking-widest uppercase hover:bg-emerald-400 transition-colors">
                        CONTINUE SHOPPING
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-12 font-mono uppercase tracking-widest text-[11px] selection:bg-white selection:text-black">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 pt-8">
                
                {/* 📝 CỘT TRÁI: FORM THÔNG TIN & PHƯƠNG THỨC THANH TOÁN */}
                <div className="lg:col-span-7 space-y-8">
                    <div className="border-b border-zinc-900 pb-4">
                        <h1 className="text-sm font-black tracking-[0.2em]">// CHECKOUT INFOMATION</h1>
                    </div>

                    <form id="main-checkout-form" onSubmit={handleSubmitOrder} className="space-y-4">
                        <div className="flex flex-col space-y-1">
                            <label className="text-[9px] text-zinc-500 tracking-widest">FULL NAME *</label>
                            <input type="text" required value={info.fullName} onChange={e => setInfo(p => ({...p, fullName: e.target.value}))} placeholder="NGUYEN VAN A" className="bg-zinc-950 border border-zinc-900 p-3 text-xs text-white uppercase focus:outline-none focus:border-zinc-500 transition-colors" />
                        </div>
                        <div className="flex flex-col space-y-1">
                            <label className="text-[9px] text-zinc-500 tracking-widest">PHONE NUMBER *</label>
                            <input type="text" required value={info.phone} onChange={e => setInfo(p => ({...p, phone: e.target.value}))} placeholder="0901234567" className="bg-zinc-950 border border-zinc-900 p-3 text-xs text-white focus:outline-none focus:border-zinc-500 transition-colors" />
                        </div>
                        <div className="flex flex-col space-y-1">
                            <label className="text-[9px] text-zinc-500 tracking-widest">SHIPPING ADDRESS *</label>
                            <input type="text" required value={info.address} onChange={e => setInfo(p => ({...p, address: e.target.value}))} placeholder="SO 1 LY TU TRONG, QUAN 1, HCMC" className="bg-zinc-950 border border-zinc-900 p-3 text-xs text-white uppercase focus:outline-none focus:border-zinc-500 transition-colors" />
                        </div>
                        <div className="flex flex-col space-y-1">
                            <label className="text-[9px] text-zinc-500 tracking-widest">ORDER NOTE (OPTIONAL)</label>
                            <textarea rows={3} value={info.note} onChange={e => setInfo(p => ({...p, note: e.target.value}))} placeholder="GIAO GIO HANH CHINH..." className="bg-zinc-950 border border-zinc-900 p-3 text-xs text-white uppercase focus:outline-none focus:border-zinc-500 transition-colors resize-none" />
                        </div>

                        {/* ==================== 💳 CHỌN PHƯƠNG THỨC THANH TOÁN ==================== */}
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
                                    <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${paymentMethod === 'COD' ? 'border-white bg-white' : 'border-zinc-700'}`}></div>
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
                                    <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${paymentMethod === 'BANK' ? 'border-white bg-white' : 'border-zinc-700'}`}></div>
                                </div>
                            </div>
                        </div>

                        {/* ==================== ĐOẠN HIỂN THỊ SỐ TÀI KHOẢN KHI CHỌN BANK ==================== */}
                        {paymentMethod === 'BANK' && (
                            <div className="p-4 bg-zinc-950 border border-zinc-900 space-y-4 animate-fade-in text-[10px]">
                                <p className="text-zinc-400 leading-relaxed font-sans normal-case text-xs">
                                    Vui lòng chuyển khoản chính xác số tiền vào một trong các tài khoản cá nhân của thành viên đội ngũ <span className="text-white font-mono uppercase">YUNLUB GALLERY</span> bên dưới:
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                    {teamBankAccounts.map((account, i) => (
                                        <div key={i} className="bg-black p-3 border border-zinc-900 space-y-1 select-all hover:border-zinc-700 transition-colors">
                                            <p className="text-zinc-500 tracking-wider text-[9px]">{account.bank}</p>
                                            <p className="text-white font-black font-mono text-xs">{account.number}</p>
                                            <p className="text-zinc-400 font-mono">CTK: {account.owner}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t border-zinc-900/60 pt-3">
                                    <p className="text-zinc-400 font-sans text-xs normal-case">
                                        Nội dung chuyển khoản (Cú pháp bắt buộc): <br/>
                                        <span className="font-mono bg-white text-black px-2 py-0.5 font-bold uppercase select-all inline-block mt-1">
                                            YUNLUB {info.phone ? info.phone.trim() : 'SỐ ĐIỆN THOẠI CỦA BẠN'}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                {/* 🛒 CỘT PHẢI: TÓM TẮT ĐƠN HÀNG (ORDER SUMMARY) */}
                <div className="lg:col-span-5">
                    <div className="bg-zinc-950 border border-zinc-900 p-6 sticky top-6 space-y-6">
                        <div className="border-b border-zinc-900 pb-3">
                            <h2 className="text-xs font-black tracking-widest">// YOUR ORDER</h2>
                        </div>

                        {/* Vùng lặp danh sách item thu nhỏ */}
                        <div className="max-h-[260px] overflow-y-auto space-y-3 pr-2 scrollbar-none">
                            {cartItems.length > 0 ? (
                                cartItems.map((item, index) => (
                                    <div key={index} className="flex gap-4 items-center justify-between bg-black/40 p-2 border border-zinc-900/60">
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
                                    </div>
                                ))
                            ) : (
                                <p className="text-zinc-600 text-center py-4">[ NO ITEMS IN CART ]</p>
                            )}
                        </div>

                        {/* Tổng kết tiền */}
                        <div className="border-t border-zinc-900 pt-4 space-y-2">
                            <div className="flex justify-between text-zinc-500 text-[10px]">
                                <span>SHIPPING:</span>
                                <span className="text-white font-bold">FREE SHIPPING</span>
                            </div>
                            <div className="flex justify-between items-center text-xs border-t border-zinc-900 pt-3">
                                <span className="text-zinc-400">TOTAL AMOUNT:</span>
                                <span className="text-white font-black text-sm">VND {currentTotal.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Nút bấm Đặt hàng kích hoạt Form chính */}
                        <button
                            type="submit"
                            form="main-checkout-form"
                            disabled={loading || cartItems.length === 0}
                            className={`w-full py-4 font-black italic tracking-widest text-[11px] uppercase transition-colors ${loading ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-white text-black hover:bg-zinc-200'}`}
                        >
                            {loading ? 'PROCESSING...' : 'PLACE ORDER'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}