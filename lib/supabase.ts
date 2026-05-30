import { createClient } from '@supabase/supabase-js'

// Thay chuỗi URL và ANON KEY thật của dự án bạn vào đây
const supabaseUrl = 'https://fwmigsfmzmrfxomlrpnm.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3bWlnc2Ztem1yZnhvbWxycG5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NDE3MDAsImV4cCI6MjA5MTMxNzcwMH0.ikUQ4MTUVf4CUY5HGcgpM53qU98XuU46_i6AxbwtBI4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)