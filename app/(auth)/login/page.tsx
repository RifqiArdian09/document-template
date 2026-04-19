import { login, signup } from './actions'

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-50/50 p-4 font-sans">
      <div className="w-full max-w-md bg-white p-10 rounded-[40px] shadow-2xl shadow-zinc-200/50 border border-zinc-100 animate-in fade-in zoom-in-95 duration-700">
        <div className="mb-10 text-center">
          <div className="size-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-zinc-900/10 transition-transform hover:scale-110">
             <div className="size-8 border-4 border-white border-t-transparent rounded-full animate-pulse" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900">DocuForge</h1>
          <p className="text-zinc-500 mt-2 font-medium">Masuk ke akun Anda</p>
        </div>
        
        <form className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest pl-1" htmlFor="email">Alamat Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-6 py-4 bg-zinc-50 border-none rounded-2xl focus:ring-2 focus:ring-zinc-900/10 outline-none transition-all font-medium text-zinc-900 placeholder:text-zinc-300"
              placeholder="nama@perusahaan.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest pl-1" htmlFor="password">Kata Sandi</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-6 py-4 bg-zinc-50 border-none rounded-2xl focus:ring-2 focus:ring-zinc-900/10 outline-none transition-all font-medium text-zinc-900 placeholder:text-zinc-300"
              placeholder="••••••••"
            />
          </div>
          
          <div className="pt-4 flex flex-col gap-4">
            <button
              formAction={login}
              className="w-full h-14 bg-zinc-900 hover:bg-zinc-800 text-white font-black rounded-full shadow-xl shadow-zinc-900/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex justify-center items-center text-base"
            >
              Masuk
            </button>
            <button
              formAction={signup}
              className="w-full h-14 bg-white hover:bg-zinc-50 text-zinc-900 border-2 border-zinc-100 font-black rounded-full transition-all hover:scale-[1.02] active:scale-[0.98] flex justify-center items-center text-base"
            >
              Daftar Baru
            </button>
          </div>
        </form>
        
        <p className="mt-8 text-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
           &copy; 2026 DocuForge System
        </p>
      </div>
    </div>
  )
}
