'use client'
import { useState, useActionState } from 'react'
import { motion } from 'framer-motion'
import { Droplets, Eye, EyeOff, Lock, Mail, ArrowRight, User, ArrowLeft } from 'lucide-react'
import { Toaster } from 'react-hot-toast'
import Link from 'next/link'
import { register, type RegisterState } from '@/app/actions/register'

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState<RegisterState, FormData>(register, undefined)
  const [showPw, setShowPw] = useState(false)

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
              <h1 className="text-2xl font-bold text-white">Create Account</h1>
              <p className="text-blue-300 text-sm mt-1">Join DairyFlow to get started</p>
            </div>

            {/* Error message */}
            {state?.error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm text-center">
                {state.error}
              </div>
            )}

            <form action={formAction} className="space-y-4">
              {/* Name */}
              <div>
                <label className="text-sm font-medium text-blue-200 block mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                  <input
                    id="register-name"
                    name="name"
                    type="text"
                    placeholder="Enter your name"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white/8 border border-white/15 rounded-xl text-white placeholder:text-blue-400/60 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-sm font-medium text-blue-200 block mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                  <input
                    id="register-email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white/8 border border-white/15 rounded-xl text-white placeholder:text-blue-400/60 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-sm font-medium text-blue-200 block mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                  <input
                    id="register-password"
                    name="password"
                    type={showPw ? 'text' : 'password'}
                    placeholder="Min. 6 characters"
                    required
                    minLength={6}
                    className="w-full pl-10 pr-12 py-3 bg-white/8 border border-white/15 rounded-xl text-white placeholder:text-blue-400/60 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                  />
                  <button type="button" onClick={() => setShowPw(p=>!p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-200 transition-colors">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                id="register-submit-btn"
                type="submit"
                disabled={pending}
                className="btn-primary w-full justify-center py-3 text-base mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {pending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Create Account <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </button>
            </form>

            {/* Sign in link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-blue-300">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-400 hover:text-blue-200 font-semibold transition-colors inline-flex items-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" /> Sign In
                </Link>
              </p>
            </div>
          </motion.div>

          <p className="text-center text-xs text-blue-400/60 mt-6">
            By creating an account, you agree to our{' '}
            <a href="#" className="text-blue-400 hover:underline">Terms of Service</a>
          </p>
        </div>
      </div>
    </>
  )
}
