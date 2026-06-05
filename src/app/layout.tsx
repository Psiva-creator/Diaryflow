import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'DairyFlow – Dairy Management Platform',
  description: 'Modern, professional dairy management system for milk collection, farmer management, payments, analytics and more.',
  keywords: 'dairy management, milk collection, farmer management, dairy software',
  openGraph: {
    title: 'DairyFlow – Dairy Management Platform',
    description: 'Modern dairy management system for milk dairy businesses.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 500,
            },
          }}
        />
      </body>
    </html>
  )
}
