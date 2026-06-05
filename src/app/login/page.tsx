'use client'
import { useState, useActionState } from 'react'
import { motion } from 'framer-motion'
import { Droplets, Eye, EyeOff, Lock, Mail, ArrowRight, Shield } from 'lucide-react'
import { Toaster } from 'react-hot-toast'
import { login, type LoginState } from '@/app/actions/auth'

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(login, undefined)
  const [showPw, setShowPw] = useState(false)
  const [tab, setTab] = useState('admin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const autofill = (role: string) => {
    if (role === 'admin') {
      setEmail('admin@dairy.com')
      setPassword('admin123')
    } else {
      setEmail('staff@dairy.com')
      setPassword('staff123')
    }
    setTab(role)
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
        {/* Background blobs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-sky-400/10 rounded-full blur-3xl" />

        <div className="w-full max-w-md relative">
          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl"
          >
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-xl">
                <Droplets className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">DairyFlow</h1>
              <p className="text-blue-300 text-sm mt-1">Sign in to your account</p>
            </div>

            {/* Role tabs */}
            <div className="flex gap-1 bg-white/5 rounded-xl p-1 mb-6">
              {['admin', 'staff'].map(r => (
                <button
                  key={r}
                  id={`login-tab-${r}`}
                  type="button"
                  onClick={() => autofill(r)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${tab===r?'bg-white/15 text-white shadow':'text-blue-300 hover:text-white'}`}
                >
                  {r} Login
                </button>
              ))}
            </div>

            {/* Error message */}
            {state?.error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm text-center">
                {state.error}
              </div>
            )}

            <form action={formAction} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-blue-200 block mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="admin@dairy.com"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white/8 border border-white/15 rounded-xl text-white placeholder:text-blue-400/60 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-blue-200">Password</label>
                  <a href="#" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Forgot password?</a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                  <input
                    id="login-password"
                    name="password"
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-12 py-3 bg-white/8 border border-white/15 rounded-xl text-white placeholder:text-blue-400/60 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                  />
                  <button type="button" onClick={() => setShowPw(p=>!p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-200 transition-colors">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                id="login-submit-btn"
                type="submit"
                disabled={pending}
                className="btn-primary w-full justify-center py-3 text-base mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {pending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Sign In <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </button>
            </form>

            {/* Demo hint */}
            <div className="mt-6 p-3 bg-white/5 border border-white/10 rounded-xl">
              <div className="flex items-center gap-2 mb-1.5 text-xs text-blue-300 font-semibold">
                <Shield className="w-3.5 h-3.5" /> Demo Credentials
              </div>
              <p className="text-xs text-blue-400">Admin: admin@dairy.com / admin123</p>
              <p className="text-xs text-blue-400">Staff: staff@dairy.com / staff123</p>
            </div>
          </motion.div>

          <p className="text-center text-xs text-blue-400/60 mt-6">
            By signing in, you agree to our{' '}
            <a href="#" className="text-blue-400 hover:underline">Terms of Service</a>
          </p>
        </div>
      </div>
    </>
  )
}
