'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '@/context/AppContext'
import { Settings, Droplets, IndianRupee, Users, Bell, Shield, Save } from 'lucide-react'
import toast from 'react-hot-toast'

const TAB_ICONS: Record<string, any> = {
  dairy:    Droplets,
  pricing:  IndianRupee,
  users:    Users,
  notifications: Bell,
  security: Shield,
}

export default function SettingsPage() {
  const { theme, toggleTheme, useSNF, setUseSNF, user } = useApp()
  const [activeTab, setActiveTab] = useState('dairy')
  const [dairySettings, setDairy] = useState<Record<string, string>>({
    name: 'Sunshine Dairy Pvt Ltd',
    address: '123 Milk Road, Anand, Gujarat 388001',
    phone: '+91 98765 43210',
    email: 'info@sunshinedairy.in',
    gst: '24ABCDE1234F1Z5',
    upi: 'sunshine@upi',
  })
  const [pricing, setPricing] = useState<Record<string, number>>({
    baseRate: 38,
    maxWater: 10.0,
    minFat: 3.0,
  })

  const tabs = [
    { key:'dairy',         label:'Dairy Profile'   },
    { key:'pricing',       label:'Pricing Rules'   },
    { key:'users',         label:'User Management' },
    { key:'notifications', label:'Notifications'   },
    { key:'security',      label:'Security'        },
  ]

  const handleSave = () => toast.success('Settings saved successfully!')

  return (
    <div className="animate-fade-in space-y-6">
      <div className="page-header">
        <h1 className="flex items-center gap-2"><Settings className="w-6 h-6 text-blue-600" /> Settings</h1>
        <p>Configure your dairy platform settings</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar tabs */}
        <div className="md:w-48 flex-shrink-0">
          <div className="section-card p-2 space-y-0.5">
            {tabs.map(t => {
              const Icon = TAB_ICONS[t.key]
              return (
                <button
                  key={t.key}
                  id={`settings-tab-${t.key}`}
                  onClick={() => setActiveTab(t.key)}
                  className={`sidebar-item w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-left ${activeTab===t.key?'active':''}`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {t.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <motion.div key={activeTab} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="section-card">
            {activeTab === 'dairy' && (
              <div className="space-y-5">
                <h2 className="font-bold text-[var(--color-text)]">Dairy Profile</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label:'Dairy Name',  key:'name',    type:'text'  },
                    { label:'Phone',       key:'phone',   type:'tel'   },
                    { label:'Email',       key:'email',   type:'email' },
                    { label:'GST Number',  key:'gst',     type:'text'  },
                    { label:'UPI ID',      key:'upi',     type:'text'  },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="text-sm font-medium text-[var(--color-muted)] block mb-1.5">{f.label}</label>
                      <input id={`dairy-${f.key}`} type={f.type} value={dairySettings[f.key]} onChange={e=>setDairy({...dairySettings,[f.key]:e.target.value})} className="input-field" />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="text-sm font-medium text-[var(--color-muted)] block mb-1.5">Address</label>
                  <textarea id="dairy-address" rows={2} value={dairySettings.address} onChange={e=>setDairy({...dairySettings,address:e.target.value})} className="input-field resize-none" />
                </div>

                {user.role === 'admin' && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mt-6">
                    <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-1">Dairy Invite Code</h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                      Share this code with your staff members when they create an account to link them to your dairy.
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="px-4 py-2 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-700 rounded-lg font-mono font-bold text-blue-600 dark:text-blue-400 select-all">
                        {user.dairyCode || 'DEMO123'}
                      </code>
                    </div>
                  </div>
                )}

                <button onClick={handleSave} className="btn-primary mt-4"><Save className="w-4 h-4" /> Save Changes</button>
              </div>
            )}

            {activeTab === 'pricing' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
                  <div>
                    <h3 className="font-bold text-blue-900 dark:text-blue-100">SNF (Solid Not Fat) Logic</h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300">Enable 2D rate table (Fat vs SNF) or use Fat-only rates.</p>
                  </div>
                  <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm border border-blue-200 dark:border-blue-700">
                    <button 
                      onClick={() => setUseSNF(false)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${!useSNF ? 'bg-blue-600 text-white shadow-md' : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'}`}
                    >
                      OFF
                    </button>
                    <button 
                      onClick={() => setUseSNF(true)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${useSNF ? 'bg-blue-600 text-white shadow-md' : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'}`}
                    >
                      ON
                    </button>
                  </div>
                </div>

                <div className="space-y-5">
                  <h2 className="font-bold text-[var(--color-text)]">Pricing Rules</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label:'Base Rate (₹/L)',    key:'baseRate',    step:0.5 },
                      { label:'Max Water % Accepted',key:'maxWater',    step:0.5 },
                      { label:'Min Fat % Accepted',  key:'minFat',      step:0.1 },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="text-sm font-medium text-[var(--color-muted)] block mb-1.5">{f.label}</label>
                        <input id={`pricing-${f.key}`} type="number" step={f.step} value={pricing[f.key]} onChange={e=>setPricing({...pricing,[f.key]:+e.target.value})} className="input-field" />
                      </div>
                    ))}
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-sm">
                    <p className="font-semibold text-blue-700 dark:text-blue-300 mb-1">Example Calculation ({useSNF ? 'Fat + SNF Table' : 'Fat Only'})</p>
                    <p className="text-blue-600 dark:text-blue-400">
                      {useSNF 
                        ? `(Base from Table for Fat/SNF) × (1 - 10% Water) = ₹${(pricing.baseRate * 0.9).toFixed(2)}/L`
                        : `Base ₹${pricing.baseRate} × (1 - 10% Water) = ₹${(pricing.baseRate * 0.9).toFixed(2)}/L`
                      }
                    </p>
                  </div>
                  <button onClick={handleSave} className="btn-primary"><Save className="w-4 h-4" /> Save Pricing</button>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-5">
                <h2 className="font-bold text-[var(--color-text)]">User Management</h2>
                <div className="table-container">
                  <table>
                    <thead><tr><th>Name</th><th>Role</th><th>Status</th><th>Last Login</th></tr></thead>
                    <tbody>
                      {[
                        { name:'Admin User', role:'admin', status:'active', last:'Today 9:12 AM' },
                        { name:'Ram Singh',  role:'staff', status:'active', last:'Today 8:45 AM' },
                        { name:'Priya D.',   role:'staff', status:'inactive',last:'2 days ago'   },
                      ].map(u => (
                        <tr key={u.name}>
                          <td className="font-medium text-[var(--color-text)]">{u.name}</td>
                          <td><span className={u.role==='admin'?'badge-blue':'badge-warning'}>{u.role}</span></td>
                          <td><span className={u.status==='active'?'badge-success':'badge-danger'}>{u.status}</span></td>
                          <td className="text-[var(--color-muted)] text-xs">{u.last}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button className="btn-primary"><Users className="w-4 h-4" /> Add Staff User</button>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-5">
                <h2 className="font-bold text-[var(--color-text)]">Notification Settings</h2>
                <div className="space-y-4">
                  {[
                    { label:'Payment reminders',        desc:'Alert when payments are pending for more than 7 days' },
                    { label:'Evening collection alert', desc:'Remind if evening entries not recorded by 8 PM'      },
                    { label:'Low tank level alert',     desc:'Notify when tank falls below 20% capacity'           },
                    { label:'Daily summary email',      desc:'Receive daily operations summary via email'          },
                  ].map((item, i) => (
                    <div key={item.label} className="flex items-start justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <div>
                        <p className="font-medium text-sm text-[var(--color-text)]">{item.label}</p>
                        <p className="text-xs text-[var(--color-muted)] mt-0.5">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                        <input id={`notif-toggle-${i}`} type="checkbox" defaultChecked={i<2} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                      </label>
                    </div>
                  ))}
                </div>
                <button onClick={handleSave} className="btn-primary"><Save className="w-4 h-4" /> Save Preferences</button>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-5">
                <h2 className="font-bold text-[var(--color-text)]">Security Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-[var(--color-muted)] block mb-1.5">Current Password</label>
                    <input id="current-password" type="password" className="input-field" placeholder="••••••••" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[var(--color-muted)] block mb-1.5">New Password</label>
                    <input id="new-password" type="password" className="input-field" placeholder="••••••••" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[var(--color-muted)] block mb-1.5">Confirm Password</label>
                    <input id="confirm-password" type="password" className="input-field" placeholder="••••••••" />
                  </div>
                </div>
                {/* Appearance */}
                <div className="pt-4 border-t border-[var(--color-border)]">
                  <h3 className="font-semibold text-sm text-[var(--color-text)] mb-3">Appearance</h3>
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <div>
                      <p className="font-medium text-sm text-[var(--color-text)]">Dark Mode</p>
                      <p className="text-xs text-[var(--color-muted)]">Toggle between light and dark theme</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input id="dark-mode-toggle" type="checkbox" checked={theme==='dark'} onChange={toggleTheme} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-300 dark:bg-slate-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                    </label>
                  </div>
                </div>
                <button onClick={handleSave} className="btn-primary"><Save className="w-4 h-4" /> Save Security</button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
