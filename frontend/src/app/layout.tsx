import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { FlowProvider } from '@/components/providers/FlowProvider'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FlowFit - Gamified Fitness with Crypto Rewards',
  description: 'The first verifiable fitness protocol on Flow that rewards users with tokens and NFTs for completing VRF-generated workout challenges.',
  keywords: ['fitness', 'blockchain', 'flow', 'gamification', 'crypto', 'rewards', 'NFT', 'VRF'],
  authors: [{ name: 'FlowFit Team' }],
  openGraph: {
    title: 'FlowFit - Gamified Fitness with Crypto Rewards',
    description: 'Earn tokens and NFTs for completing workout challenges. Built on Flow blockchain.',
    url: 'https://flowfit.io',
    siteName: 'FlowFit',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FlowFit - Gamified Fitness',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FlowFit - Gamified Fitness with Crypto Rewards',
    description: 'Earn tokens and NFTs for completing workout challenges. Built on Flow blockchain.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <FlowProvider>
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {children}
          </div>
          <Toaster 
            position="top-right"
            toastOptions={{
              style: {
                background: '#1e293b',
                color: '#f1f5f9',
                border: '1px solid #334155',
              },
              success: {
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#f1f5f9',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#f1f5f9',
                },
              },
            }}
          />
        </FlowProvider>
      </body>
    </html>
  )
} 