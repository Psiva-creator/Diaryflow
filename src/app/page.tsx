'use client'
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import {
  Droplets, Users, Milk, CreditCard, BarChart3, Package,
  ShoppingCart, Bell, CheckCircle, Star, ArrowRight, Phone,
  Mail, MapPin, ChevronRight, Shield, Zap, Globe
} from 'lucide-react'

const FEATURES = [
  { icon: Milk,        title: 'Milk Collection',   desc: 'Track morning & evening collections with fat %, Water %, and automatic rate calculation.',     color: 'blue'   },
  { icon: Users,       title: 'Farmer Management', desc: 'Complete farmer profiles, supply history, payment tracking, and instant search.',         color: 'green'  },
  { icon: CreditCard,  title: 'Smart Payments',    desc: 'Automated payment calculation, pending alerts, invoice generation, and monthly reports.', color: 'purple' },
  { icon: BarChart3,   title: 'Rich Analytics',    desc: 'Interactive charts for daily/weekly/monthly performance. Export to PDF & Excel.',         color: 'orange' },
  { icon: Package,     title: 'Inventory & Tanks', desc: 'Monitor storage tanks, cooling units, temperature, and product stock in real time.',     color: 'red'    },
  { icon: ShoppingCart,title: 'Customer Hub',      desc: 'Manage retail & bulk customers, delivery tracking, subscriptions, and order history.',    color: 'teal'   },
]

const STATS = [
  { value: '2,400+', label: 'Farmers Managed'  },
  { value: '98%',    label: 'Uptime'            },
  { value: '₹12Cr+', label: 'Payments Processed'},
  { value: '340+',   label: 'Dairies Using Us'  },
]

const TESTIMONIALS = [
  {
    name:    'Ramesh Patel',
    role:    'Dairy Owner, Anand',
    quote:   'DairyFlow cut our manual paperwork by 80%. Payment processing that used to take 3 days now happens automatically.',
    rating:  5,
    avatar:  'RP',
  },
  {
    name:    'Sunita Verma',
    role:    'Manager, Verma Dairy Co-op',
    quote:   'The milk collection module with fat & Water % tracking is exceptional. Our farmers trust the numbers completely.',
    rating:  5,
    avatar:  'SV',
  },
  {
    name:    'Anil Sharma',
    role:    'Owner, Sharma Milk Center',
    quote:   'The analytics dashboard gives me a real-time view of my dairy business. I can spot trends and act immediately.',
    rating:  5,
    avatar:  'AS',
  },
]

interface FadeInProps {
  children: React.ReactNode
  delay?: number
  className?: string
}

function FadeIn({ children, delay = 0, className = '' }: FadeInProps) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

const colorMap: Record<string, { bg: string, icon: string }> = {
  blue:   { bg: 'bg-blue-50 dark:bg-blue-950/30',   icon: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'   },
  green:  { bg: 'bg-green-50 dark:bg-green-950/30', icon: 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-950/30',icon:'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400'},
  orange: { bg: 'bg-orange-50 dark:bg-orange-950/30',icon:'bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400'},
  red:    { bg: 'bg-red-50 dark:bg-red-950/30',     icon: 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400'         },
  teal:   { bg: 'bg-teal-50 dark:bg-teal-950/30',   icon: 'bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400'    },
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-md">
              <Droplets className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">DairyFlow</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-400">
            <a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Features</a>
            <a href="#stats"    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">About</a>
            <a href="#testimonials" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Testimonials</a>
            <a href="#contact"  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contact</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-secondary text-sm py-2 px-4">Sign In</Link>
            <Link href="/dashboard" className="btn-primary text-sm py-2 px-4">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden gradient-hero text-white py-24 md:py-36">
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-sky-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 border border-white/20 rounded-full text-sm font-medium mb-6">
              <Zap className="w-3.5 h-3.5 text-yellow-300" />
              Modern Dairy Management Platform
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6"
          >
            Manage Your Dairy
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-emerald-300 mt-1">
              The Smart Way
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="text-lg text-blue-100 max-w-2xl mx-auto mb-10"
          >
            All-in-one platform for milk collection, farmer management, payments, inventory, and analytics.
            Built for modern dairy businesses of all sizes.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <Link href="/dashboard" className="btn-primary px-8 py-3.5 text-base shadow-xl shadow-blue-900/40">
              Launch Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#features" className="flex items-center gap-2 px-8 py-3.5 rounded-xl border border-white/30 text-sm font-semibold hover:bg-white/10 transition-colors">
              Learn More <ChevronRight className="w-4 h-4" />
            </a>
          </motion.div>

          {/* Trust pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
            className="flex flex-wrap justify-center gap-4 mt-12 text-sm"
          >
            {['No credit card required', 'Free 30-day trial', 'Cancel anytime'].map(t => (
              <span key={t} className="flex items-center gap-1.5 text-blue-200">
                <CheckCircle className="w-4 h-4 text-emerald-400" /> {t}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────────────────── */}
      <section id="stats" className="py-16 bg-gradient-to-r from-blue-600 to-sky-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            {STATS.map((s, i) => (
              <FadeIn key={s.label} delay={i * 0.1}>
                <p className="text-4xl font-extrabold">{s.value}</p>
                <p className="text-blue-100 text-sm mt-1">{s.label}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Features</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-4">Everything Your Dairy Needs</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              From milk collection to payment processing — manage every aspect of your dairy operation in one place.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => {
              const c = colorMap[f.color]
              return (
                <FadeIn key={f.title} delay={i * 0.08}>
                  <div className={`rounded-2xl p-6 ${c.bg} card-hover h-full`}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${c.icon} mb-4`}>
                      <f.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white">{f.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                  </div>
                </FadeIn>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ──────────────────────────────────────────────────── */}
      <section className="py-24 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <FadeIn>
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Why DairyFlow</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-6">Built for Real Dairy Operations</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                DairyFlow is designed by dairy experts for the unique challenges of milk collection businesses.
                From small family dairies to large co-operatives — we scale with you.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Shield, title: 'Secure & Reliable',    desc: 'Bank-grade encryption. 99.8% uptime SLA.'        },
                  { icon: Zap,    title: 'Lightning Fast',        desc: 'Real-time data updates. Instant calculations.'  },
                  { icon: Globe,  title: 'Works Everywhere',      desc: 'Responsive on mobile, tablet, and desktop.'     },
                ].map(item => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{item.title}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>

            {/* Visual card mock */}
            <FadeIn delay={0.2}>
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-600 to-sky-500 rounded-3xl p-6 shadow-2xl text-white">
                  <p className="font-bold text-lg mb-4">Today&apos;s Overview</p>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Milk Collected', value: '847 L' },
                      { label: 'Farmers',         value: '24'    },
                      { label: 'Revenue',         value: '₹32,180'},
                      { label: 'Pending Pay',    value: '₹8,200' },
                    ].map(item => (
                      <div key={item.label} className="bg-white/15 rounded-2xl p-4">
                        <p className="text-2xl font-extrabold">{item.value}</p>
                        <p className="text-sm text-blue-100 mt-0.5">{item.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 bg-white/15 rounded-2xl p-4">
                    <p className="text-sm text-blue-100 mb-2">Collection Trend</p>
                    <div className="flex items-end gap-1.5 h-10">
                      {[60, 80, 55, 90, 70, 95, 85].map((h, i) => (
                        <div key={i} className="flex-1 bg-white/30 rounded-sm" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  </div>
                </div>
                {/* Floating badge */}
                <div className="absolute -bottom-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-xl font-semibold text-sm shadow-lg flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> 12% more than yesterday
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────────────────────── */}
      <section id="testimonials" className="py-24 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Testimonials</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-3">Trusted by Dairy Owners</h2>
          </FadeIn>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <FadeIn key={t.name} delay={i * 0.1}>
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 card-hover h-full">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">&quot;{t.quote}&quot;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-900 dark:text-white">{t.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{t.role}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact ────────────────────────────────────────────────────────── */}
      <section id="contact" className="py-24 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16">
            <FadeIn>
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Contact</span>
              <h2 className="text-3xl font-bold mt-3 mb-6">Get In Touch</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-8">
                Ready to transform your dairy operations? Talk to our team and get started in minutes.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Phone, text: '+91 98765 43210' },
                  { icon: Mail,  text: 'hello@dairyflow.in' },
                  { icon: MapPin,text: 'Anand, Gujarat – Milk Capital of India' },
                ].map(item => (
                  <div key={item.text} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-slate-700 dark:text-slate-300 text-sm">{item.text}</span>
                  </div>
                ))}
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <form className="space-y-4" onSubmit={e => e.preventDefault()}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">Name</label>
                    <input id="contact-name" type="text" placeholder="Your name" className="input-field" required />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">Phone</label>
                    <input id="contact-phone" type="tel" placeholder="98765 43210" className="input-field" required />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">Email</label>
                  <input id="contact-email" type="email" placeholder="you@example.com" className="input-field" required />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">Message</label>
                  <textarea id="contact-message" rows={4} placeholder="Tell us about your dairy..." className="input-field resize-none" required />
                </div>
                <button type="submit" className="btn-primary w-full justify-center py-3">
                  Send Message <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────────────────────── */}
      <section className="py-20 gradient-hero text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Start Managing Smarter Today</h2>
            <p className="text-blue-200 mb-8">Join 340+ dairies already using DairyFlow to streamline operations.</p>
            <Link href="/dashboard" className="btn-primary px-10 py-4 text-base shadow-xl shadow-blue-900/50">
              Launch Free Trial <ArrowRight className="w-5 h-5" />
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center">
                <Droplets className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white">DairyFlow</span>
            </div>
            <p className="text-sm">© 2025 DairyFlow. All rights reserved. Made with ❤️ for dairy businesses.</p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <Link href="/login" className="hover:text-white transition-colors">Login</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
