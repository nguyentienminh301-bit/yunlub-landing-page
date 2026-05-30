'use client'
import { createClient } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// 🧭 THỜI GIAN ĐÍCH ĐẾM NGƯỢC
const TARGET_DATE = new Date('2026-05-30T21:00:00')

export default function Home() {
  const router = useRouter()
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [isMounted, setIsMounted] = useState(false)
  const [isLocked, setIsLocked] = useState(false) // false: Đếm ngược/Đăng ký IG, true: Hết giờ -> Hiện Pass Gate

  // Form Đăng ký IG (Trước khi mở bán)
  const [igHandle, setIgHandle] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; msg: string }>({ type: null, msg: '' })

  // Form Mật khẩu độc quyền (Khi đã hết giờ - Tone Đen Trắng)
  const [password, setPassword] = useState('')
  const [passError, setPassError] = useState('')
  const [checkingPass, setCheckingPass] = useState(false)

  // 🛠️ QUẢN LÝ VÒNG ĐỜI ĐẾM NGƯỢC
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const distance = TARGET_DATE.getTime() - now

      if (distance <= 0) {
        setIsLocked(true) // Hết giờ -> Chuyển sang form Password Đen Trắng
        return { days: 0, hours: 0, minutes: 0, seconds: 0 }
      }
      return {
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      }
    }

    const initialTime = calculateTimeLeft()
    setTimeLeft(initialTime)
    setIsMounted(true)

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // 📝 HÀM LƯU INSTAGRAM
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!igHandle) return

    setLoading(true)
    setStatus({ type: null, msg: '' })

    const formattedHandle = igHandle.trim().toLowerCase()

    const { error } = await supabase
      .from('early_access')
      .insert([{ ig_handle: formattedHandle }])

    if (error) {
      if (error.code === '23505') {
        setStatus({ type: 'error', msg: 'Tên Instagram này đã đăng ký danh sách chờ trước đó!' })
      } else {
        setStatus({ type: 'error', msg: 'Có lỗi xảy ra khi kết nối. Vui lòng thử lại.' })
      }
    } else {
      setStatus({ type: 'success', msg: 'Đã lưu! Chờ thông báo từ Yunlub nhé.' })
      setIgHandle('')
    }
    setLoading(false)
  }

  // 🔑 HÀM CHECK MẬT KHẨU ĐỘC QUYỀN TỪ SUPABASE
  const handleSubmitAccess = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password) return

    setCheckingPass(true)
    setPassError('')

    try {
      const enteredCode = password.trim()

      const { data, error } = await supabase
        .from('early_access')
        .select('id')
        .eq('access_code', enteredCode)
        .maybeSingle()

      if (error) throw error

      if (data) {
        router.push('/store')
      } else {
        setPassError('[ ACCESS DENIED — INVALID CODE ]')
        setPassword('')
      }
    } catch (error) {
      console.error('Lỗi kiểm tra mật khẩu:', error)
      setPassError('[ CONNECTION ERROR — TRY AGAIN ]')
    } finally {
      setCheckingPass(false)
    }
  }

  return (
    <main className="min-h-screen text-white flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden select-none selection:bg-white selection:text-black">
      {/* Background */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px] z-10" />

      <div className="flex flex-col items-center justify-center text-center space-y-12 z-20 w-full">
        
        {/* 1. ĐỒNG HỒ ĐẾM NGƯỢC */}
        {!isLocked && (
          <div className="flex justify-center gap-6 md:gap-12 text-white drop-shadow-2xl animate-fade-in">
            <div className="flex flex-col">
              <span className="text-5xl md:text-8xl font-black italic tracking-tighter leading-none">
                {!isMounted ? '--' : (timeLeft.days < 10 ? `0${timeLeft.days}` : timeLeft.days)}
              </span>
              <span className="text-[10px] md:text-xs tracking-[0.4em] uppercase text-zinc-400 mt-2">Days</span>
            </div>
            <div className="flex flex-col">
              <span className="text-5xl md:text-8xl font-black italic tracking-tighter leading-none">
                {!isMounted ? '--' : (timeLeft.hours < 10 ? `0${timeLeft.hours}` : timeLeft.hours)}
              </span>
              <span className="text-[10px] md:text-xs tracking-[0.4em] uppercase text-zinc-400 mt-2">Hours</span>
            </div>
            <div className="flex flex-col">
              <span className="text-5xl md:text-8xl font-black italic tracking-tighter leading-none">
                {!isMounted ? '--' : (timeLeft.minutes < 10 ? `0${timeLeft.minutes}` : timeLeft.minutes)}
              </span>
              <span className="text-[10px] md:text-xs tracking-[0.4em] uppercase text-zinc-400 mt-2">Mins</span>
            </div>
            <div className="flex flex-col">
              <span className="text-5xl md:text-8xl font-black italic tracking-tighter leading-none text-zinc-400">
                {!isMounted ? '--' : (timeLeft.seconds < 10 ? `0${timeLeft.seconds}` : timeLeft.seconds)}
              </span>
              <span className="text-[10px] md:text-xs tracking-[0.4em] uppercase text-zinc-400 mt-2">Secs</span>
            </div>
          </div>
        )}

        {/* 2. KHU VỰC LOGO SIÊU NỔI BẬT (ĐÃ NÂNG CẤP HIỆU ỨNG TỎA SÁNG CỰC ĐẠI - ULTRA GLOW EFFECT) */}
        <div className="py-4 group">
          <img
            src="/logo.svg"
            alt="Logo"
            className="h-44 md:h-[280px] w-auto invert opacity-100 group-hover:scale-105 transition-all duration-700 filter drop-shadow-[0_0_20px_rgba(255,255,255,0.7)] drop-shadow-[0_0_45px_rgba(255,255,255,0.45)] drop-shadow-[0_0_90px_rgba(255,255,255,0.25)]"
          />
        </div>

        {/* 3. KHU VỰC FORM TƯƠNG TÁC ĐỘNG */}
        <div className="w-full max-w-md px-4">
          
          {!isLocked ? (
            /* [TRẠNG THÁI CÒN GIỜ]: Form Đăng ký IG */
            <div className="animate-fade-in">
              <form onSubmit={handleRegister} className="flex border-2 border-white p-1 bg-black/20 backdrop-blur-md">
                <input
                  type="text"
                  placeholder="IG_USERNAME"
                  value={igHandle}
                  onChange={(e) => setIgHandle(e.target.value)}
                  disabled={loading}
                  className="bg-black text-white p-4 flex-1 min-w-0 outline-none placeholder:text-zinc-600 text-sm tracking-widest font-normal"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-white text-black px-8 py-4 text-xs font-black italic hover:bg-zinc-200 transition-all"
                >
                  {loading ? '...' : 'JOIN'}
                </button>
              </form>

              {status.msg && (
                <p className={`mt-3 text-[9px] tracking-[0.3em] uppercase font-bold ${status.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                  {status.msg}
                </p>
              )}

              <p className="mt-6 text-[10px] text-zinc-400 tracking-[0.5em] uppercase font-mono">
                * _BE_THE_DAY_ONE_ *
              </p>
            </div>
          ) : (
            
            /* [TRẠNG THÁI HẾT GIỜ]: Cổng Mật Khẩu Đen - Trắng Quét Code Supabase */
            <div className="w-full flex flex-col items-center space-y-6 animate-fade-in">
              
              <form onSubmit={handleSubmitAccess} className="w-full flex items-center h-12 overflow-hidden border border-zinc-800 bg-zinc-950 focus-within:border-zinc-500 transition-colors">
                
                <div className="flex-1 h-full flex items-center px-4">
                  <input 
                    type="password"
                    required
                    value={password}
                    disabled={checkingPass}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if(passError) setPassError('')
                    }}
                    placeholder="Password"
                    className="w-full bg-transparent font-mono text-xs text-white placeholder-zinc-600 focus:outline-none tracking-[0.2em]"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={checkingPass}
                  className="w-28 md:w-32 h-full bg-white hover:bg-zinc-200 text-black text-[10px] font-mono font-bold tracking-[0.2em] uppercase transition-colors focus:outline-none flex items-center justify-center"
                >
                  {checkingPass ? '...' : 'SUBMIT'}
                </button>
              </form>

              {/* 🔒 KHU VỰC THÀNH PHẦN ĐÃ ĐƯỢC THÊM LẠI: ICON Ổ KHÓA & EXCLUSIVE ACCESS CHUẨN MOCKUP */}
              <div className="flex flex-col items-center space-y-2 select-none">
                <div className="flex items-center space-x-2 text-[9px] font-mono tracking-[0.25em] text-zinc-500 uppercase">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="10" 
                    height="10" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="opacity-60"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <span>Exclusive Access</span>
                </div>
                
                {/* Thông báo lỗi từ database (nếu gõ sai) sẽ xuất hiện gọn gàng bên dưới */}
                {passError && (
                  <p className="text-[9px] font-mono tracking-widest text-red-500 font-bold uppercase mt-1">
                    {passError}
                  </p>
                )}
              </div>
            </div>
          )}

        </div>

        {/* 4. CHÂN TRANG INSTAGRAM LINK & FOOTER (CHỈ HIỂN THỊ KHI CHƯA KHÓA WEB, HẾT GIỜ SẼ ẨN TOÀN BỘ) */}
        {!isLocked && (
          <>
            <div className="pt-6 border-t border-white/10 w-full max-w-xs md:max-w-md">
              <p className="text-[10px] tracking-[0.6em] uppercase font-bold text-zinc-600 mb-4">Official</p>
              <a
                href="https://www.instagram.com/yunlubgallery/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-1xl md:text-3xl font-black italic hover:text-zinc-400 transition-all uppercase tracking-tighter block"
              >
                @yunlubgallery
              </a>
            </div>

            <p className="text-[9px] text-zinc-500 tracking-[1.2em] uppercase pt-12">
              Limited Access • No Restocks
            </p>
          </>
        )}
      </div>
    </main>
  )
}