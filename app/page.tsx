'use client'
import { createClient } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Home() {
  const [timeLeft, setTimeLeft] = useState({ days: 5, hours: 0, minutes: 0, seconds: 0 })

  // --- THÊM STATE CHO FORM ---
  const [igHandle, setIgHandle] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, msg: string }>({ type: null, msg: '' })

  useEffect(() => {
    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() + 5)

    const timer = setInterval(() => {
      const now = new Date().getTime()
      const distance = targetDate.getTime() - now

      if (distance < 0) {
        clearInterval(timer)
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // --- HÀM XỬ LÝ LƯU DỮ LIỆU ---
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!igHandle) return

    setLoading(true)
    setStatus({ type: null, msg: '' })

    const { error } = await supabase
      .from('early_access') // Bro nhớ tạo table 'early_access' trên Supabase nhé
      .insert([{ ig_handle: igHandle }])

    if (error) {
      console.error("Lỗi Supabase:", error.message); // Xem chi tiết ở F12 Console
      setStatus({ type: 'error', msg: `Lỗi: ${error.message}` });
    } else {
      setStatus({ type: 'success', msg: 'Đã lưu! Chờ thông báo từ Yunlub nhé.' });
      setIgHandle('')
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen text-white flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">

      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-10" />

      <div className="flex flex-col items-center justify-center text-center space-y-12 z-20 w-full">

        {/* 1. ĐỒNG HỒ ĐẾM NGƯỢC */}
        <div className="flex justify-center gap-6 md:gap-12 text-white drop-shadow-2xl">
          {/* Giữ nguyên code timer của bạn */}
          <div className="flex flex-col">
            <span className="text-5xl md:text-8xl font-black italic tracking-tighter leading-none">
              {timeLeft.days < 10 ? `0${timeLeft.days}` : timeLeft.days}
            </span>
            <span className="text-[10px] md:text-xs tracking-[0.4em] uppercase text-zinc-400 mt-2">Days</span>
          </div>
          <div className="flex flex-col">
            <span className="text-5xl md:text-8xl font-black italic tracking-tighter leading-none">
              {timeLeft.hours < 10 ? `0${timeLeft.hours}` : timeLeft.hours}
            </span>
            <span className="text-[10px] md:text-xs tracking-[0.4em] uppercase text-zinc-400 mt-2">Hours</span>
          </div>
          <div className="flex flex-col">
            <span className="text-5xl md:text-8xl font-black italic tracking-tighter leading-none">
              {timeLeft.minutes < 10 ? `0${timeLeft.minutes}` : timeLeft.minutes}
            </span>
            <span className="text-[10px] md:text-xs tracking-[0.4em] uppercase text-zinc-400 mt-2">Mins</span>
          </div>
          <div className="flex flex-col">
            <span className="text-5xl md:text-8xl font-black italic tracking-tighter leading-none">
              {timeLeft.seconds < 10 ? `0${timeLeft.seconds}` : timeLeft.seconds}
            </span>
            <span className="text-[10px] md:text-xs tracking-[0.4em] uppercase text-zinc-400 mt-2">Secs</span>
          </div>
        </div>

        {/* 2. LOGO */}
        <div className="py-4 group">
          <img
            src="/logo.svg"
            alt="Logo"
            className="h-48 md:h-[350px] w-auto invert opacity-95 group-hover:scale-105 transition-transform duration-1000 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          />
        </div>

        {/* --- 2.5 PHẦN NHẬP IG STYLE CORTEIZ --- */}
        <div className="w-full max-w-md px-4">
          <form
            onSubmit={handleRegister}
            className="flex border-2 border-white p-1 bg-black/20 backdrop-blur-md"
          >
            <input
              type="text"
              placeholder="IG_USERNAME"
              value={igHandle}
              onChange={(e) => setIgHandle(e.target.value)}
              disabled={loading}
              className="bg-transparent flex-grow text-white px-4 py-3 focus:outline-none placeholder:text-zinc-600 font-mono text-sm uppercase tracking-[0.2em]"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-white text-black text-xs font-black italic px-10 py-3 hover:bg-zinc-300 transition-all uppercase tracking-tighter active:scale-95"
            >
              {loading ? '...' : 'JOIN'}
            </button>
          </form>

          {/* Tin nhắn trạng thái dưới khung */}
          {status.msg && (
            <p className={`mt-3 text-[9px] tracking-[0.3em] uppercase font-bold ${status.type === 'success' ? 'text-green-500' : 'text-red-500'
              }`}>
              {status.msg}
            </p>
          )}

          {/* Text trang trí nhỏ dưới cùng để tăng độ "vibe" */}
          <p className="mt-6 text-[8px] text-zinc-500 tracking-[0.5em] uppercase font-mono">
            * _early_access_portal_v1.0
          </p>
        </div>

        {/* 3. INSTAGRAM LINK */}
        <div className="pt-6 border-t border-white/10 w-full max-w-xs md:max-w-md">
          <p className="text-[10px] tracking-[0.6em] uppercase font-bold text-zinc-500 mb-4">Official</p>
          <a
            href="https://www.instagram.com/yunlubgallery/"
            target="_blank"
            className="text-1xl md:text-3xl font-black italic hover:text-white transition-all uppercase tracking-tighter block"
          >
            @yunlubgallery
          </a>
        </div>

        <p className="text-[9px] text-zinc-600 tracking-[1.2em] uppercase pt-12">
          Limited Access • No Restocks
        </p>
      </div>
    </main>
  )
}