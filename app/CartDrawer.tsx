'use client'

import React from 'react'
import { useCart } from './CartProvider'
import { useRouter, usePathname } from 'next/navigation'

export default function CartDrawer() {
    const router = useRouter()
    const pathname = usePathname()
    const { cartItems, totalCartPrice, totalCartCount, removeItem, updateQuantity, isOpenCart, setIsOpenCart, isMounted } = useCart()

    // ⛔ Nếu đang ở trang checkout, tuyệt đối không render Pop-up giỏ hàng này
    if (pathname === '/checkout' || !isOpenCart) return null

    return (
        <div className="fixed inset-0 z-50 flex justify-end animate-fade-in">
            {/* Lớp nền mờ */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-xs transition-opacity" onClick={() => setIsOpenCart(false)}></div>
            
            {/* Khung nội dung giỏ hàng */}
            <div className="w-full max-w-md bg-zinc-950 border-l border-white/10 h-full flex flex-col justify-between p-6 relative z-10 shadow-2xl">
                
                {/* TOP HEADER */}
                <div className="flex items-center justify-between pb-4 border-b border-zinc-900 mb-6">
                    <h2 className="text-xs font-mono tracking-[0.2em] text-white uppercase">
                        {`[ YOUR CART — ${isMounted ? totalCartCount : 0} ITEMS ]`}
                    </h2>
                    <button 
                        onClick={() => setIsOpenCart(false)} 
                        className="text-zinc-500 hover:text-white font-mono text-[10px] tracking-widest uppercase"
                    >
                        [ CLOSE ]
                    </button>
                </div>

                {/* THÂN GIỎ HÀNG (SCROLLABLE DYNAMIC REGION) */}
                <div className="flex-1 overflow-y-auto pr-1 space-y-6 scrollbar-none">
                    {isMounted && cartItems.length > 0 ? (
                        <div className="flex flex-col space-y-4">
                            {cartItems.map((item, index) => (
                                <div key={`${item.id}-${item.size}-${index}`} className="flex items-start gap-4 bg-black/40 p-3 border border-zinc-900">
                                    <div className="w-16 aspect-[4/5] border border-zinc-800 shrink-0 overflow-hidden bg-zinc-900/40">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover filter brightness-95" />
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col space-y-1">
                                        <h4 className="text-[10px] font-black italic tracking-wider text-white truncate uppercase">{item.name}</h4>
                                        <p className="text-[9px] font-mono text-zinc-400">SIZE: <span className="text-white font-bold">{item.size}</span></p>
                                        
                                        <div className="flex items-center space-x-2 mt-1">
                                            <span className="text-[9px] font-mono text-zinc-500">QTY:</span>
                                            <div className="flex items-center border border-zinc-800 bg-black">
                                                <button type="button" onClick={() => updateQuantity(index, item.quantity - 1)} className="px-2 py-0.5 text-zinc-500 hover:text-white font-mono text-[10px]">-</button>
                                                <span className="px-1 text-[9px] font-mono text-white min-w-[12px] text-center">{item.quantity}</span>
                                                <button type="button" onClick={() => updateQuantity(index, item.quantity + 1)} className="px-2 py-0.5 text-zinc-500 hover:text-white font-mono text-[10px]">+</button>
                                            </div>
                                        </div>
                                        <p className="text-[10px] font-mono text-zinc-300 pt-1">{(item.priceNumber * item.quantity).toLocaleString()} VND</p>
                                    </div>
                                    <button onClick={() => removeItem(index)} className="text-zinc-600 hover:text-red-400 font-mono text-[9px] uppercase tracking-tighter">[ REMOVE ]</button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center border border-dashed border-zinc-900">
                            <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">[ CART IS EMPTY ]</p>
                        </div>
                    )}
                </div>

                {/* BOTTOM CONTROL FOOTER */}
                {isMounted && cartItems.length > 0 && (
                    <div className="pt-4 border-t border-zinc-900 mt-4 bg-zinc-950 space-y-4">
                        <div className="flex justify-between items-center text-xs font-mono">
                            <span className="text-zinc-500 uppercase tracking-widest">SUBTOTAL:</span>
                            <span className="text-white font-bold">VND {totalCartPrice.toLocaleString()}</span>
                        </div>

                        <button 
                            type="button"
                            onClick={() => {
                                setIsOpenCart(false);
                                router.push('/checkout');
                            }}
                            className="w-full bg-white text-black py-4 text-[11px] font-black italic tracking-widest uppercase hover:bg-zinc-200 transition-colors text-center block"
                        >
                            PROCEED TO CHECKOUT
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}