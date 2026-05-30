'use client'

import React, { createContext, useContext, useState } from 'react'
import { supabase } from '../../lib/supabase'

export interface CartItem {
    id: string
    name: string
    price: string
    priceNumber: number
    image: string
    size: string
    quantity: number
}

interface CartContextType {
    cartItems: CartItem[]
    addToCart: (item: CartItem) => void
    removeItem: (indexToRemove: number) => void
    clearCart: () => void
    isOpenCart: boolean
    setIsOpenCart: (open: boolean) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const useCart = () => {
    const context = useContext(CartContext)
    if (!context) throw new Error('useCart must be used within a CartProvider')
    return context
}

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cartItems, setCartItems] = useState<CartItem[]>([])
    const [isOpenCart, setIsOpenCart] = useState(false)
    const [customerInfo, setCustomerInfo] = useState({ fullName: '', phone: '', address: '', note: '' })
    
    // State quản lý việc hiển thị Modal thành công custom
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [lastOrderTotal, setLastOrderTotal] = useState(0)

    const totalCartCount = cartItems.reduce((total, item) => total + item.quantity, 0)
    const totalCartPrice = cartItems.reduce((total, item) => total + (item.priceNumber * item.quantity), 0)

    const addToCart = (newItem: CartItem) => {
        setCartItems(prevItems => {
            const existingIndex = prevItems.findIndex(
                item => item.id === newItem.id && item.size === newItem.size
            )
            if (existingIndex > -1) {
                const updated = [...prevItems]
                updated[existingIndex].quantity += newItem.quantity
                return updated
            }
            return [...prevItems, newItem]
        })
        setIsOpenCart(true)
    }

    const removeItem = (indexToRemove: number) => {
        setCartItems(prev => prev.filter((_, index) => index !== indexToRemove))
    }

    const clearCart = () => {
        setCartItems([])
        setCustomerInfo({ fullName: '', phone: '', address: '', note: '' })
    }

    const handleConfirmOrder = async (e: React.FormEvent) => {
        e.preventDefault()
        if (cartItems.length === 0) return

        try {
            const orderPayload = {
                full_name: (customerInfo.fullName || '').trim().toUpperCase(),
                phone: (customerInfo.phone || '').trim(),
                address: (customerInfo.address || '').trim().toUpperCase(),
                note: (customerInfo.note || '').trim().toUpperCase(),
                items: cartItems, 
                total_amount: totalCartPrice
            }

            const { error } = await supabase.from('orders').insert([orderPayload])
            if (error) throw error

            // Lưu lại tổng tiền để hiển thị lên Modal trước khi xóa giỏ
            setLastOrderTotal(totalCartPrice)
            // Tắt giỏ hàng trượt và kích hoạt Modal thành công siêu đẹp
            setIsOpenCart(false)
            setShowSuccessModal(true)
            
            clearCart()
        } catch (error) {
            console.error(error)
            alert('Có lỗi xảy ra khi đặt hàng.')
        }
    }

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeItem, clearCart, isOpenCart, setIsOpenCart }}>
            <div className="p-4 md:p-8 max-w-[1600px] mx-auto relative overflow-x-hidden">
                
                {/* 🧭 NAVIGATION TRÊN CÙNG */}
                <div className="w-full flex justify-end space-x-6 text-[10px] font-mono tracking-widest text-zinc-500 mb-8 uppercase">
                    <button className="hover:text-white transition-colors">SEARCH</button>
                    <button 
                        onClick={() => setIsOpenCart(true)} 
                        className={`transition-colors ${totalCartCount > 0 ? 'text-white font-bold underline decoration-white underline-offset-4' : 'hover:text-white'}`}
                    >
                        CART ({totalCartCount})
                    </button>
                    <button onClick={() => setIsOpenCart(true)} className="hover:text-white transition-colors">CHECKOUT</button>
                </div>

                {children}

                {/* ==================== 🛒 GIAO DIỆN GIỎ HÀNG TRƯỢT ==================== */}
                {isOpenCart && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex justify-end">
                        <div className="flex-1" onClick={() => setIsOpenCart(false)}></div>
                        <div className="w-full max-w-md bg-zinc-950 border-l border-white/10 h-full flex flex-col justify-between p-6 overflow-y-auto selection:bg-white selection:text-black">
                            <div>
                                <div className="flex items-center justify-between pb-4 border-b border-zinc-900 mb-6">
                                    <h2 className="text-xs font-mono tracking-[0.2em] text-white uppercase">[ YOUR CART — {totalCartCount} ITEMS ]</h2>
                                    <button onClick={() => setIsOpenCart(false)} className="text-zinc-500 hover:text-white font-mono text-[10px] tracking-widest uppercase">[ CLOSE ]</button>
                                </div>

                                {cartItems.length > 0 ? (
                                    <div className="flex flex-col space-y-4 mb-8">
                                        {cartItems.map((item, index) => (
                                            <div key={`${item.id}-${item.size}-${index}`} className="flex items-start gap-4 bg-black/40 p-3 border border-zinc-900">
                                                <div className="w-16 aspect-[4/5] border border-zinc-800 shrink-0 overflow-hidden">
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0 flex flex-col space-y-1">
                                                    <h4 className="text-[10px] font-black italic tracking-wider text-white truncate">{item.name}</h4>
                                                    <p className="text-[9px] font-mono text-zinc-400">SIZE: <span className="text-white font-bold">{item.size}</span></p>
                                                    <p className="text-[9px] font-mono text-zinc-400">QTY: <span className="text-white">{item.quantity}</span></p>
                                                    <p className="text-[10px] font-mono text-zinc-300">{(item.priceNumber * item.quantity).toLocaleString()} VND</p>
                                                </div>
                                                <button onClick={() => removeItem(index)} className="text-zinc-600 hover:text-red-400 font-mono text-[9px] uppercase tracking-tighter">[ REMOVE ]</button>
                                            </div>
                                        ))}
                                        <div className="pt-4 border-t border-zinc-900 flex justify-between items-center text-xs font-mono">
                                            <span className="text-zinc-500 uppercase tracking-widest">SUBTOTAL:</span>
                                            <span className="text-white font-bold">VND {totalCartPrice.toLocaleString()}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-12 text-center border border-dashed border-zinc-900 mb-8">
                                        <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">[ CART IS EMPTY ]</p>
                                    </div>
                                )}

                                {cartItems.length > 0 && (
                                    <form onSubmit={handleConfirmOrder} className="border-t border-zinc-900 pt-6 flex flex-col space-y-4">
                                        <h3 className="text-[9px] font-mono tracking-[0.2em] text-zinc-400 uppercase mb-2">// SHIPPING DETAILS</h3>
                                        <div className="flex flex-col space-y-1">
                                            <label className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest">FULL NAME *</label>
                                            <input type="text" required value={customerInfo.fullName} onChange={e => setCustomerInfo(p => ({...p, fullName: e.target.value}))} placeholder="NGUYEN VAN A" className="bg-black border border-zinc-800 p-2 text-xs font-mono text-white placeholder-zinc-700 uppercase focus:outline-none focus:border-white transition-colors" />
                                        </div>
                                        <div className="flex flex-col space-y-1">
                                            <label className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest">PHONE NUMBER *</label>
                                            <input type="text" required value={customerInfo.phone} onChange={e => setCustomerInfo(p => ({...p, phone: e.target.value}))} placeholder="0901234567" className="bg-black border border-zinc-800 p-2 text-xs font-mono text-white placeholder-zinc-700 focus:outline-none focus:border-white transition-colors" />
                                        </div>
                                        <div className="flex flex-col space-y-1">
                                            <label className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest">SHIPPING ADDRESS *</label>
                                            <input type="text" required value={customerInfo.address} onChange={e => setCustomerInfo(p => ({...p, address: e.target.value}))} placeholder="SO 1 LY TU TRONG, QUAN 1, HCMC" className="bg-black border border-zinc-800 p-2 text-xs font-mono text-white placeholder-zinc-700 uppercase focus:outline-none focus:border-white transition-colors" />
                                        </div>
                                        <div className="flex flex-col space-y-1">
                                            <label className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest">ORDER NOTE (OPTIONAL)</label>
                                            <textarea rows={2} value={customerInfo.note} onChange={e => setCustomerInfo(p => ({...p, note: e.target.value}))} placeholder="GIAO GIO HANH CHINH..." className="bg-black border border-zinc-800 p-2 text-xs font-mono text-white placeholder-zinc-700 uppercase focus:outline-none focus:border-white transition-colors resize-none" />
                                        </div>
                                        <button type="submit" className="w-full bg-white text-black py-4 mt-4 text-[11px] font-black italic tracking-widest uppercase hover:bg-zinc-200 transition-colors">
                                            CONFIRM ORDER (VND {totalCartPrice.toLocaleString()})
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ==================== ✅ MODAL THÀNH CÔNG CUSTOM (STREETWEAR VIBE) ==================== */}
                {showSuccessModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
                        <div className="w-full max-w-md bg-zinc-950 border border-emerald-500/30 p-8 text-center relative shadow-[0_0_50px_rgba(16,185,129,0.15)]">
                            
                            {/* Icon check xanh lá tỏa sáng */}
                            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"/>
                                </svg>
                            </div>

                            {/* Tiêu đề */}
                            <h3 className="text-sm font-mono tracking-[0.3em] text-emerald-400 uppercase mb-2">// ORDER PLACED SUCCESSFULLY</h3>
                            <p className="text-[11px] font-black italic tracking-widest uppercase text-zinc-300 mb-6">
                                ĐƠN HÀNG ĐÃ ĐƯỢC GHI NHẬN TẠI YUNLUB GALLERY!
                            </p>

                            {/* Khung chi tiết tiền */}
                            <div className="bg-black/60 border border-zinc-900 p-4 mb-8 font-mono text-left space-y-2">
                                <div className="flex justify-between text-[10px]">
                                    <span className="text-zinc-500 uppercase tracking-wider">STATUS:</span>
                                    <span className="text-emerald-400 font-bold uppercase tracking-wider">[ PENDING / PAID ]</span>
                                </div>
                                <div className="flex justify-between text-[10px] pt-2 border-t border-zinc-900/60">
                                    <span className="text-zinc-500 uppercase tracking-wider">TOTAL AMOUNT:</span>
                                    <span className="text-white font-bold">VND {lastOrderTotal.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Nút đóng đóng khung thép */}
                            <button
                                onClick={() => setShowSuccessModal(false)}
                                className="w-full bg-emerald-500 text-black py-3 text-[11px] font-black italic tracking-widest uppercase hover:bg-emerald-400 transition-colors shadow-[0_4px_20px_rgba(16,185,129,0.3)]"
                            >
                                CONTINUE SHOPPING
                            </button>
                        </div>
                    </div>
                )}

                <footer className="mt-24 pt-8 border-t border-zinc-900 text-center text-[10px] text-zinc-600 tracking-[0.5em] uppercase font-mono">
                    © 2026 YUNLUB GALLERY • ALL RIGHTS RESERVED • DROP NO.1
                </footer>
            </div>
        </CartContext.Provider>
    )
}