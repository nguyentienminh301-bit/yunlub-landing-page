'use client'

import React from 'react'
import { useCart } from '../CartProvider'
import { motion } from 'framer-motion'

export default function StoreHeader() {
  const { setIsOpenCart, isMounted, totalCartCount } = useCart()

  return (
    // 🎯 ĐÃ THAY ĐỔI: Thêm pt-4 để căn chỉnh chữ CART/CHECKOUT vừa vặn trên mobile khi bỏ padding của layout
    <div className="w-full flex justify-end space-x-4 md:space-x-6 text-[10px] md:text-[11px] font-mono tracking-widest text-zinc-500 pt-4 md:pt-0 mb-6 md:mb-8 uppercase relative z-20">
      <motion.button 
        whileHover={{ scale: 1.05, color: '#fff' }}
        whileTap={{ scale: 0.95 }}
        className="transition-colors duration-200 hidden sm:block"
      >
        SEARCH
      </motion.button>
      
      <motion.button 
        onClick={() => setIsOpenCart(true)} 
        whileHover={{ scale: 1.05, color: '#fff' }}
        whileTap={{ scale: 0.95 }}
        className={`transition-colors duration-200 ${
          isMounted && totalCartCount > 0 
            ? 'text-white font-bold underline decoration-white underline-offset-4' 
            : ''
        }`}
      >
        CART ({isMounted ? totalCartCount : 0})
      </motion.button>
      
      <motion.a 
        href="/checkout" 
        whileHover={{ scale: 1.05, color: '#fff' }}
        whileTap={{ scale: 0.95 }}
        className="transition-colors duration-200"
      >
        CHECKOUT
      </motion.a>
    </div>
  )
}