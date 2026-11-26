'use client'

import React from 'react'
import { useCart } from '../CartProvider'
import { motion } from 'framer-motion'

export default function StoreHeader() {
  const { setIsOpenCart, isMounted, totalCartCount } = useCart()

  return (
    // 🎯 HEADER TRONG SUỐT TRÊN DESKTOP:
    // Trên mobile: w-full flex justify-end pt-4 mb-6 relative
    // Trên desktop: bg-transparent absolute top-8 right-8 z-30 mb-0 w-auto
    <div className="hidden md:flex w-full justify-end space-x-4 md:space-x-6 text-[10px] md:text-[11px] font-mono tracking-widest text-zinc-500 pt-4 md:pt-0 mb-6 md:mb-0 md:absolute md:top-[13px] md:right-8 md:w-auto bg-transparent relative z-30 uppercase">
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