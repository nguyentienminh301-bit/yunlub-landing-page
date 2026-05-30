'use client'

import React from 'react'
import { useCart } from '../CartProvider' // Lùi 1 cấp ra thư mục app/ để lấy useCart

export default function StoreHeader() {
  const { setIsOpenCart, isMounted, totalCartCount } = useCart()

  return (
    <div className="w-full flex justify-end space-x-6 text-[10px] font-mono tracking-widest text-zinc-500 mb-8 uppercase relative z-20">
      <button className="hover:text-white transition-colors">SEARCH</button>
      
      <button 
        onClick={() => setIsOpenCart(true)} 
        className={`transition-colors ${isMounted && totalCartCount > 0 ? 'text-white font-bold underline decoration-white underline-offset-4' : 'hover:text-white'}`}
      >
        CART ({isMounted ? totalCartCount : 0})
      </button>
      
      <a href="/checkout" className="hover:text-white transition-colors">
        CHECKOUT
      </a>
    </div>
  )
}