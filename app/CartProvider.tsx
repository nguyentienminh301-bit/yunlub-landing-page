'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

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
    totalCartPrice: number
    totalCartCount: number
    addToCart: (item: CartItem) => void
    removeItem: (indexToRemove: number) => void
    updateQuantity: (index: number, newQty: number) => void
    clearCart: () => void
    isOpenCart: boolean
    setIsOpenCart: (open: boolean) => void
    isMounted: boolean
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
    const [isMounted, setIsMounted] = useState(false)

    // 💾 TẢI GIỎ HÀNG TỪ LOCALSTORAGE KHI TRANG KHỞI CHẠY
    useEffect(() => {
        const savedCart = localStorage.getItem('yunlub_cart')
        if (savedCart) {
            try {
                setCartItems(JSON.parse(savedCart))
            } catch (e) {
                console.error("Lỗi đọc giỏ hàng:", e)
            }
        }
        setIsMounted(true)
    }, [])

    // 💾 TỰ ĐỘNG LƯU GIỎ HÀNG MỖI KHI CÓ THAY ĐỔI
    useEffect(() => {
        if (isMounted) {
            localStorage.setItem('yunlub_cart', JSON.stringify(cartItems))
        }
    }, [cartItems, isMounted])

    const totalCartCount = cartItems.reduce((total, item) => total + item.quantity, 0)
    const totalCartPrice = cartItems.reduce((total, item) => total + (item.priceNumber * item.quantity), 0)

    const addToCart = (newItem: CartItem) => {
        setCartItems(prevItems => {
            // Kiểm tra xem sản phẩm đã có trong giỏ chưa (trùng id và size)
            const isExists = prevItems.find(
                item => item.id === newItem.id && item.size === newItem.size
            )

            if (isExists) {
                // Nếu đã tồn tại, ta chỉ tăng thêm 1 đơn vị
                return prevItems.map(item =>
                    (item.id === newItem.id && item.size === newItem.size)
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            }

            // Nếu chưa tồn tại, thêm mới vào giỏ
            return [...prevItems, newItem]
        })
        setIsOpenCart(true)
    }

    const removeItem = (indexToRemove: number) => {
        setCartItems(prev => prev.filter((_, index) => index !== indexToRemove))
    }

    const updateQuantity = (indexToUpdate: number, newQty: number) => {
        if (newQty <= 0) {
            removeItem(indexToUpdate)
            return
        }
        setCartItems(prev => prev.map((item, idx) =>
            idx === indexToUpdate ? { ...item, quantity: newQty } : item
        ))
    }

    const clearCart = () => {
        setCartItems([])
    }

    return (
        <CartContext.Provider value={{
            cartItems,
            totalCartPrice,
            totalCartCount,
            addToCart,
            removeItem,
            updateQuantity,
            clearCart,
            isOpenCart,
            setIsOpenCart,
            isMounted
        }}>
            {children}
        </CartContext.Provider>
    )
}